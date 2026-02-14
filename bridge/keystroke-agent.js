/**
 * TikUp Keystroke Agent v1.0
 *
 * Desktop companion that listens for gift events via Supabase Realtime
 * and fires OS-level keystrokes when a matching trigger is found.
 *
 * Requirements:
 *   npm install @supabase/supabase-js robotjs
 *   (robotjs needs node-gyp + native build tools)
 *
 * Environment variables:
 *   SUPABASE_URL           – your Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY – service role key
 *   TIKUP_USER_ID          – the authenticated user's UUID
 *   ACTIVE_PROFILE_ID      – (optional) keystroke profile id to use
 *
 * Usage:
 *   TIKUP_USER_ID=xxx node keystroke-agent.js
 */

const { createClient } = require("@supabase/supabase-js");

let robot;
try {
  robot = require("robotjs");
} catch {
  console.error("❌ robotjs is required but not installed.");
  console.error("   Run: npm install robotjs");
  console.error("   (Requires Python & C++ build tools for node-gyp)");
  process.exit(1);
}

// ── Config ─────────────────────────────────────────────────────
const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  "https://jrgjveefowmxyocbggmf.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const USER_ID = process.env.TIKUP_USER_ID;
const ACTIVE_PROFILE = process.env.ACTIVE_PROFILE_ID || null;
const POLL_TRIGGERS_MS = 15_000; // refresh trigger config every 15s

if (!SUPABASE_SERVICE_KEY) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY env variable is required");
  process.exit(1);
}
if (!USER_ID) {
  console.error("❌ TIKUP_USER_ID env variable is required");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── State ──────────────────────────────────────────────────────
let triggerMap = {};        // gift_id → keystroke config
let activeProfileId = ACTIVE_PROFILE;
let widgetTokens = [];      // gift_alert widget tokens to subscribe to

// ── RobotJS key mapping ────────────────────────────────────────
const KEY_MAP = {
  SPACE: "space",
  ENTER: "enter",
  TAB: "tab",
  ESCAPE: "escape",
  BACKSPACE: "backspace",
  DELETE: "delete",
  UP: "up",
  DOWN: "down",
  LEFT: "left",
  RIGHT: "right",
  HOME: "home",
  END: "end",
  PAGEUP: "pageup",
  PAGEDOWN: "pagedown",
  F1: "f1", F2: "f2", F3: "f3", F4: "f4",
  F5: "f5", F6: "f6", F7: "f7", F8: "f8",
  F9: "f9", F10: "f10", F11: "f11", F12: "f12",
};

function mapKey(k) {
  if (!k) return null;
  const upper = k.toUpperCase();
  if (KEY_MAP[upper]) return KEY_MAP[upper];
  // Single character
  if (k.length === 1) return k.toLowerCase();
  return k.toLowerCase();
}

function mapModifiers(mods) {
  if (!mods || !Array.isArray(mods)) return [];
  return mods.map(m => {
    const upper = m.toUpperCase();
    if (upper === "CTRL" || upper === "CONTROL") return "control";
    if (upper === "SHIFT") return "shift";
    if (upper === "ALT") return "alt";
    if (upper === "META" || upper === "CMD" || upper === "COMMAND") return "command";
    return m.toLowerCase();
  });
}

// ── Fire keystroke ─────────────────────────────────────────────
function fireKeystroke(config) {
  const key = mapKey(config.key);
  if (!key) return;

  const modifiers = mapModifiers(config.modifiers);
  const displayKey = [...(config.modifiers || []), config.key].join(" + ");

  try {
    if (modifiers.length > 0) {
      robot.keyTap(key, modifiers);
    } else {
      robot.keyTap(key);
    }
    console.log(`  ⌨️  Fired: ${displayKey}${config.name ? ` (${config.name})` : ""}`);
  } catch (err) {
    console.error(`  ❌ Failed to fire ${displayKey}:`, err.message);
  }
}

// ── Load triggers from DB ──────────────────────────────────────
async function loadTriggers() {
  try {
    // Get user gift triggers
    const { data: triggers, error } = await supabase
      .from("user_gift_triggers")
      .select("gift_id, custom_config, is_enabled")
      .eq("user_id", USER_ID)
      .eq("is_enabled", true);

    if (error) {
      console.error("❌ Failed to load triggers:", error.message);
      return;
    }

    // Get active profile from keystroke_profiles widget if not set
    if (!activeProfileId) {
      const { data: widgets } = await supabase
        .from("overlay_widgets")
        .select("settings")
        .eq("user_id", USER_ID)
        .eq("widget_type", "keystroke_profiles")
        .maybeSingle();

      if (widgets?.settings?.profiles?.length > 0) {
        activeProfileId = widgets.settings.profiles[0].id;
        console.log(`📋 Auto-selected profile: ${widgets.settings.profiles[0].name} (${activeProfileId})`);
      }
    }

    // Build trigger map
    const newMap = {};
    let count = 0;
    for (const t of (triggers || [])) {
      const cc = t.custom_config || {};
      // Support both old format (cc.keystroke) and new profile format (cc.keystrokes[profileId])
      let ks = null;
      if (activeProfileId && cc.keystrokes?.[activeProfileId]?.key) {
        ks = cc.keystrokes[activeProfileId];
      } else if (cc.keystroke?.key) {
        ks = cc.keystroke; // legacy format
      }
      if (ks) {
        newMap[t.gift_id] = ks;
        count++;
      }
    }
    triggerMap = newMap;

    // Get gift_alert widget tokens for subscribing
    const { data: alertWidgets } = await supabase
      .from("overlay_widgets")
      .select("public_token")
      .eq("user_id", USER_ID)
      .eq("widget_type", "gift_alert")
      .eq("is_active", true);

    widgetTokens = (alertWidgets || []).map(w => w.public_token);

    console.log(`🔄 Loaded ${count} keystroke trigger(s) for profile ${activeProfileId || "default"}`);
  } catch (err) {
    console.error("❌ Error loading triggers:", err.message);
  }
}

// ── Handle incoming gift event ─────────────────────────────────
function handleGiftEvent(payload) {
  const giftName = (payload.gift_name || "").toLowerCase().replace(/\s+/g, "_");
  const giftId = payload.gift_id || giftName;
  const username = payload.user || payload.username || "Unknown";

  // Try matching by gift_id first, then by normalized name
  const config = triggerMap[giftId] || triggerMap[giftName];

  if (!config) return;

  console.log(`🎁 ${username} sent gift → triggering keystroke`);
  fireKeystroke(config);
}

// ── Subscribe to realtime events ───────────────────────────────
let activeChannels = [];

function subscribeToEvents() {
  // Clean up old subscriptions
  for (const ch of activeChannels) {
    supabase.removeChannel(ch);
  }
  activeChannels = [];

  if (widgetTokens.length === 0) {
    console.log("⚠️  No active gift_alert widgets found — waiting...");
    return;
  }

  for (const token of widgetTokens) {
    const channelName = `gift_alert-${token}`;
    const channel = supabase
      .channel(channelName)
      .on("broadcast", { event: "new_alert" }, ({ payload }) => {
        handleGiftEvent(payload);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(`📡 Subscribed to ${channelName}`);
        }
      });

    activeChannels.push(channel);
  }

  console.log(`📡 Listening on ${widgetTokens.length} gift_alert channel(s)`);
}

// ── Also listen to a dedicated keystroke channel ───────────────
function subscribeToKeystrokeChannel() {
  const channelName = `keystroke_agent_${USER_ID}`;
  const channel = supabase
    .channel(channelName)
    .on("broadcast", { event: "fire_keystroke" }, ({ payload }) => {
      console.log("⚡ Direct keystroke command received");
      if (payload.key) {
        fireKeystroke(payload);
      } else if (payload.gift_id) {
        handleGiftEvent(payload);
      }
    })
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log(`📡 Listening on direct channel: ${channelName}`);
      }
    });

  activeChannels.push(channel);
}

// ── Main ───────────────────────────────────────────────────────
async function main() {
  console.log(`\n⌨️  TikUp Keystroke Agent v1.0`);
  console.log(`   User: ${USER_ID}`);
  console.log(`   Profile: ${activeProfileId || "auto-detect"}`);
  console.log(`   Supabase: ${SUPABASE_URL}\n`);

  // Initial load
  await loadTriggers();
  subscribeToEvents();
  subscribeToKeystrokeChannel();

  // Periodically refresh trigger config
  setInterval(async () => {
    await loadTriggers();
    // Re-subscribe if widget tokens changed
    const currentTokens = widgetTokens.join(",");
    await loadTriggers();
    if (widgetTokens.join(",") !== currentTokens) {
      subscribeToEvents();
    }
  }, POLL_TRIGGERS_MS);

  console.log(`\n✅ Agent ready — waiting for gift events...\n`);
}

main();

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down keystroke agent...");
  for (const ch of activeChannels) {
    supabase.removeChannel(ch);
  }
  process.exit(0);
});
