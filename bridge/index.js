const { WebcastPushConnection, SignConfig } = require("tiktok-live-connector");
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
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS) || 30_000; // check for new users every 30s

if (!SUPABASE_SERVICE_KEY) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY env variable is required");
  process.exit(1);
}

if (!EULER_API_KEY) {
  console.error("❌ TIKTOK_DATA_API_KEY env variable is required");
  process.exit(1);
}

// Configure EulerStream API key for signed WebSocket connections
SignConfig.apiKey = EULER_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── Active connections map: tiktok_username → { connection, buffer, timer }
const connections = new Map();

// ── Event buffer & flush per user ──────────────────────────────
const FLUSH_INTERVAL_MS = 500;

function createUserConnection(username) {
  if (connections.has(username)) return; // already connected

  console.log(`🔄 Connecting to @${username}...`);

  const tiktok = new WebcastPushConnection(username, {
    enableExtendedGiftInfo: true,
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
  tiktok.on("gift", (data) => {
    console.log(`  🎁 [${username}] ${data.uniqueId} sent ${data.repeatCount}x ${data.giftName}`);
    queueEvent("gift", data.uniqueId, {
      gift_name: data.giftName,
      gift_id: data.giftId,
      repeat_count: data.repeatCount,
      diamond_count: data.diamondCount,
      repeat_end: data.repeatEnd,
      avatar: data.profilePictureUrl,
    });
  });

  tiktok.on("like", (data) => {
    console.log(`  ❤️ [${username}] ${data.uniqueId} x${data.likeCount}`);
    queueEvent("like", data.uniqueId, {
      like_count: data.likeCount,
      total_likes: data.totalLikeCount,
      avatar: data.profilePictureUrl,
    });
  });

  tiktok.on("follow", (data) => {
    console.log(`  ➕ [${username}] ${data.uniqueId}`);
    queueEvent("follow", data.uniqueId, {
      avatar: data.profilePictureUrl,
    });
  });

  tiktok.on("share", (data) => {
    console.log(`  🔗 [${username}] ${data.uniqueId}`);
    queueEvent("share", data.uniqueId, {
      avatar: data.profilePictureUrl,
    });
  });

  tiktok.on("chat", (data) => {
    console.log(`  💬 [${username}] ${data.uniqueId}: ${data.comment}`);
    queueEvent("chat", data.uniqueId, {
      message: data.comment,
      avatar: data.profilePictureUrl,
    });
  });

  tiktok.on("roomUser", (data) => {
    console.log(`  👁 [${username}] Viewers: ${data.viewerCount}`);
    queueEvent("viewer_count", username, {
      viewer_count: data.viewerCount,
    });
  });

  tiktok.on("subscribe", (data) => {
    console.log(`  ⭐ [${username}] ${data.uniqueId}`);
    queueEvent("subscribe", data.uniqueId, {
      avatar: data.profilePictureUrl,
    });
  });

  tiktok.on("disconnected", () => {
    console.log(`🔴 [${username}] Disconnected from LIVE`);
    flushEvents(username);
    connections.delete(username);
  });

  tiktok.on("error", (err) => {
    console.error(`⚠️ [${username}] Stream error:`, err.message);
  });

  // ── Connect ──────────────────────────────────────────────────
  tiktok
    .connect()
    .then((roomState) => {
      console.log(`🟢 Connected to @${username} — Room ${roomState.roomId}, ${roomState.viewerCount} viewers`);
    })
    .catch((err) => {
      console.error(`❌ [${username}] Connection failed: ${err.message}`);
      if (err.message.includes("not found") || err.message.includes("offline")) {
        console.log(`   ↳ @${username} is not currently LIVE — will retry on next poll`);
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
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

    // Connect to new usernames
    for (const username of activeUsernames) {
      if (!connections.has(username)) {
        createUserConnection(username);
      }
    }

    // Disconnect removed usernames
    for (const username of connections.keys()) {
      if (!activeUsernames.has(username)) {
        console.log(`🔌 [${username}] User disconnected — closing`);
        const state = connections.get(username);
        state.connection.disconnect();
        connections.delete(username);
      }
    }

    console.log(
      `📊 Active: ${connections.size} connection(s) | Tracked: ${activeUsernames.size} username(s)`
    );
  } catch (err) {
    console.error("❌ Poll error:", err.message);
  }
}

// ── Startup ────────────────────────────────────────────────────
console.log(`\n🚀 TikUp Bridge v2.0`);
console.log(`   EulerStream API key: ${EULER_API_KEY.slice(0, 8)}...`);
console.log(`   Webhook: ${WEBHOOK_URL}`);
console.log(`   Polling every ${POLL_INTERVAL_MS / 1000}s for new users\n`);

// Initial poll, then repeat
pollUsernames();
setInterval(pollUsernames, POLL_INTERVAL_MS);

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
