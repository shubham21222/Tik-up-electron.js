const { TikTokLiveConnection, WebcastEvent } = require("tiktok-live-connector");
const { createClient } = require("@supabase/supabase-js");

// ── Configuration ──────────────────────────────────────────────
const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  "https://jrgjveefowmxyocbggmf.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const WEBHOOK_URL =
  process.env.WEBHOOK_URL ||
  `${SUPABASE_URL}/functions/v1/tiktok-webhook`;
const EULER_API_KEY = process.env.TIKTOK_DATA_API_KEY;
const EULER_ACCOUNT_ID = process.env.EULER_ACCOUNT_ID;
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS) || 30_000;

if (!SUPABASE_SERVICE_KEY) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY env variable is required");
  process.exit(1);
}

if (!EULER_API_KEY) {
  console.error("❌ TIKTOK_DATA_API_KEY env variable is required");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── Diamond lookup map: gift name → diamond value ──────────────
let diamondMap = {};

async function fetchDiamondMap() {
  try {
    const res = await fetch(
      "https://tiktok.eulerstream.com/webcast/gift_info?client=ttlive-other",
      { headers: { "x-api-key": EULER_API_KEY } }
    );
    if (!res.ok) {
      console.error(`❌ gift_info API error: ${res.status}`);
      return;
    }
    const json = await res.json();
    const gifts = json.data || [];
    diamondMap = {};
    for (const gift of gifts) {
      if (gift.name && gift.diamond !== undefined) {
        diamondMap[gift.name.toLowerCase()] = Number(gift.diamond);
      }
    }
    console.log(`💎 Loaded ${Object.keys(diamondMap).length} gift diamond values`);
  } catch (err) {
    console.error("❌ Failed to fetch diamond map:", err.message);
  }
}

// ── EulerStream Alerts: auto-create alerts for "creator went live" ──
// Maps tiktok_username → { alertId, targetId }
const alertRegistry = new Map();

async function ensureCreatorAlert(username, connection) {
  if (!EULER_ACCOUNT_ID || alertRegistry.has(username)) return;

  try {
    // Use the bundled SDK from tiktok-live-connector via connection.signer
    const signer = connection.signer;
    if (!signer || !signer.alertsApi) {
      console.log(`  ⚠️ [${username}] signer.alertsApi not available, skipping alert creation`);
      return;
    }

    // Create alert for this creator
    const alertRes = await signer.alertsApi.createAlert(
      EULER_ACCOUNT_ID,
      { unique_id: username.trim() },
      { params: { read_only: true } }
    );

    const alertId = alertRes?.alert?.id;
    if (!alertId) {
      console.log(`  ⚠️ [${username}] Alert creation returned no ID`);
      return;
    }

    // Create webhook target pointing to our tiktok-webhook
    const targetRes = await signer.alertTargetsApi.createAlertTarget(
      EULER_ACCOUNT_ID,
      alertId,
      {
        url: WEBHOOK_URL,
        metadata: { source: "tikup-bridge", username },
      }
    );

    const targetId = targetRes?.target?.id;
    alertRegistry.set(username, { alertId, targetId });
    console.log(`  🔔 [${username}] EulerStream alert #${alertId} created with webhook target`);
  } catch (err) {
    // Alert may already exist (409) — that's fine
    if (err.message?.includes("409") || err.message?.includes("already exists")) {
      console.log(`  🔔 [${username}] Alert already exists`);
      alertRegistry.set(username, { alertId: "existing", targetId: "existing" });
    } else {
      console.error(`  ⚠️ [${username}] Failed to create alert:`, err.message);
    }
  }
}

async function cleanupCreatorAlert(username) {
  if (!EULER_ACCOUNT_ID) return;
  const entry = alertRegistry.get(username);
  if (!entry || entry.alertId === "existing") {
    alertRegistry.delete(username);
    return;
  }

  try {
    // We'd need a signer instance to delete — skip cleanup for now
    // Alerts persist and auto-fire, which is fine
    alertRegistry.delete(username);
  } catch (err) {
    console.error(`  ⚠️ [${username}] Failed to cleanup alert:`, err.message);
  }
}

// ── Active connections map: tiktok_username → { connection, buffer, timer }
const connections = new Map();

// ── Event buffer & flush per user ──────────────────────────────
const FLUSH_INTERVAL_MS = 500;

function createUserConnection(username) {
  if (connections.has(username)) return;

  console.log(`🔄 Connecting to @${username}...`);

  const tiktok = new TikTokLiveConnection(username, {
    enableExtendedGiftInfo: true,
    apiKey: EULER_API_KEY,
  });

  const state = {
    connection: tiktok,
    buffer: [],
    timer: null,
  };

  connections.set(username, state);

  function queueEvent(type, eventUsername, data) {
    state.buffer.push({ type, username: eventUsername, data });
    if (!state.timer) {
      state.timer = setTimeout(() => flushEvents(username), FLUSH_INTERVAL_MS);
    }
  }

  // ── Event Handlers ───────────────────────────────────────────
  tiktok.on(WebcastEvent.GIFT, (data) => {
    const giftName = (data.giftName || "").toLowerCase();
    const repeatCount = data.repeatCount || 1;
    const diamondValue = diamondMap[giftName] || data.diamondCount || 0;
    const totalDiamonds = diamondValue * repeatCount;

    console.log(`  🎁 [${username}] ${data.uniqueId} sent ${repeatCount}x ${data.giftName} (${totalDiamonds} 💎)`);
    queueEvent("gift", data.uniqueId, {
      gift_name: data.giftName,
      gift_id: data.giftId,
      repeat_count: repeatCount,
      diamond_count: diamondValue,
      total_diamonds: totalDiamonds,
      repeat_end: data.repeatEnd,
      avatar: data.user?.profilePictureUrl || data.profilePictureUrl || data.user?.avatar_url || null,
    });
  });

  tiktok.on(WebcastEvent.LIKE, (data) => {
    console.log(`  ❤️ [${username}] ${data.uniqueId} x${data.likeCount}`);
    queueEvent("like", data.uniqueId, {
      like_count: data.likeCount,
      total_likes: data.totalLikeCount,
      avatar: data.user?.profilePictureUrl || data.profilePictureUrl || null,
    });
  });

  tiktok.on(WebcastEvent.FOLLOW, (data) => {
    const followUser = data.user?.uniqueId || data.uniqueId;
    console.log(`  ➕ [${username}] ${followUser}`);
    queueEvent("follow", followUser, {
      avatar: data.user?.profilePictureUrl || data.profilePictureUrl,
    });
  });

  tiktok.on(WebcastEvent.SHARE, (data) => {
    console.log(`  🔗 [${username}] ${data.uniqueId}`);
    queueEvent("share", data.uniqueId, {
      avatar: data.user?.profilePictureUrl || data.profilePictureUrl || null,
    });
  });

  tiktok.on(WebcastEvent.CHAT, (data) => {
    console.log(`  💬 [${username}] ${data.uniqueId}: ${data.comment}`);
    queueEvent("chat", data.uniqueId, {
      message: data.comment,
      avatar: data.user?.profilePictureUrl || data.profilePictureUrl || null,
    });
  });

  tiktok.on(WebcastEvent.VIEWERS, (data) => {
    console.log(`  👁 [${username}] Viewers: ${data.viewers}`);
    queueEvent("viewer_count", username, {
      viewer_count: data.viewers,
    });
  });

  tiktok.on(WebcastEvent.SUBSCRIBE, (data) => {
    console.log(`  ⭐ [${username}] ${data.uniqueId}`);
    queueEvent("subscribe", data.uniqueId, {
      avatar: data.user?.profilePictureUrl || data.profilePictureUrl || null,
    });
  });

  tiktok.on(WebcastEvent.DISCONNECTED, () => {
    console.log(`🔴 [${username}] Disconnected from LIVE`);
    flushEvents(username);
    connections.delete(username);
  });

  tiktok.on(WebcastEvent.ERROR, (err) => {
    console.error(`⚠️ [${username}] Stream error:`, err.message);
  });

  // ── Connect ──────────────────────────────────────────────────
  tiktok
    .connect()
    .then((roomState) => {
      console.log(`🟢 Connected to @${username} — Room ${roomState.roomId}, ${roomState.viewerCount} viewers`);
      // Create EulerStream alert for instant live detection
      ensureCreatorAlert(username, tiktok);
    })
    .catch((err) => {
      console.error(`❌ [${username}] Connection failed: ${err.message}`);
      if (err.message.includes("not found") || err.message.includes("offline")) {
        console.log(`   ↳ @${username} is not currently LIVE — will retry on next poll`);
        // Still create alert so we get notified when they go live
        ensureCreatorAlert(username, tiktok);
      }
      connections.delete(username);
    });
}

async function flushEvents(username) {
  const state = connections.get(username);
  if (!state) return;

  state.timer = null;
  if (state.buffer.length === 0) return;

  const events = state.buffer.splice(0, state.buffer.length);

  try {
    const webhookSecret = process.env.EULER_ALERT_WEB_KEY || process.env.WEBHOOK_SECRET || "";
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(webhookSecret ? { "x-webhook-secret": webhookSecret } : {}),
        ...(serviceKey ? { "Authorization": `Bearer ${serviceKey}` } : {}),
      },
      body: JSON.stringify({
        tiktok_username: username,
        events,
      }),
    });

    if (!res.ok) {
      console.error(`  ✗ [${username}] Webhook error ${res.status}:`, await res.text());
    } else {
      console.log(`  ✓ [${username}] Sent ${events.length} event(s)`);
    }
  } catch (err) {
    console.error(`  ✗ [${username}] Failed to send:`, err.message);
  }
}

// ── Poll for connected usernames ───────────────────────────────
async function pollUsernames() {
  try {
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("tiktok_username")
      .eq("tiktok_connected", true)
      .not("tiktok_username", "is", null);

    if (error) {
      console.error("❌ Failed to fetch profiles:", error.message);
      return;
    }

    const activeUsernames = new Set(
      (profiles || []).map((p) => p.tiktok_username.toLowerCase())
    );

    for (const username of activeUsernames) {
      if (!connections.has(username)) {
        createUserConnection(username);
      }
    }

    for (const username of connections.keys()) {
      if (!activeUsernames.has(username)) {
        console.log(`🔌 [${username}] User disconnected — closing`);
        const state = connections.get(username);
        state.connection.disconnect();
        cleanupCreatorAlert(username);
        connections.delete(username);
      }
    }

    console.log(
      `📊 Active: ${connections.size} connection(s) | Tracked: ${activeUsernames.size} username(s) | Alerts: ${alertRegistry.size}`
    );
  } catch (err) {
    console.error("❌ Poll error:", err.message);
  }
}

// ── Startup ────────────────────────────────────────────────────
async function main() {
  console.log(`\n🚀 TikUp Bridge v2.2`);
  console.log(`   EulerStream API key: ${EULER_API_KEY.slice(0, 8)}...`);
  console.log(`   Webhook: ${WEBHOOK_URL}`);
  console.log(`   EulerStream Alerts: ${EULER_ACCOUNT_ID ? "ENABLED" : "DISABLED (set EULER_ACCOUNT_ID to enable)"}`);
  console.log(`   Polling every ${POLL_INTERVAL_MS / 1000}s for new users\n`);

  // Load diamond values before connecting
  await fetchDiamondMap();

  // Refresh diamond map every hour
  setInterval(fetchDiamondMap, 60 * 60 * 1000);

  // Initial poll, then repeat
  pollUsernames();
  setInterval(pollUsernames, POLL_INTERVAL_MS);
}

main();

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down...");
  for (const [username, state] of connections) {
    await flushEvents(username);
    state.connection.disconnect();
    console.log(`  ✗ Disconnected @${username}`);
  }
  process.exit(0);
});