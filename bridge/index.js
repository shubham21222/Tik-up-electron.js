const { WebcastPushConnection } = require("tiktok-live-connector");

// ── Configuration ──────────────────────────────────────────────
const TIKTOK_USERNAME = process.env.TIKTOK_USERNAME || process.argv[2];
const WEBHOOK_URL =
  process.env.WEBHOOK_URL ||
  "https://jrgjveefowmxyocbggmf.supabase.co/functions/v1/tiktok-webhook";

if (!TIKTOK_USERNAME) {
  console.error("Usage: node index.js <tiktok_username>");
  console.error("  or set TIKTOK_USERNAME env variable");
  process.exit(1);
}

// ── Connect to TikTok LIVE ─────────────────────────────────────
const tiktok = new WebcastPushConnection(TIKTOK_USERNAME);

const eventBuffer = [];
let flushTimer = null;
const FLUSH_INTERVAL_MS = 500; // batch events every 500ms

function queueEvent(type, username, data) {
  eventBuffer.push({ type, username, data });
  if (!flushTimer) {
    flushTimer = setTimeout(flushEvents, FLUSH_INTERVAL_MS);
  }
}

async function flushEvents() {
  flushTimer = null;
  if (eventBuffer.length === 0) return;

  const events = eventBuffer.splice(0, eventBuffer.length);

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tiktok_username: TIKTOK_USERNAME,
        events,
      }),
    });

    if (!res.ok) {
      console.error(`Webhook error ${res.status}:`, await res.text());
    } else {
      console.log(`✓ Sent ${events.length} event(s)`);
    }
  } catch (err) {
    console.error("Failed to send events:", err.message);
  }
}

// ── Event Handlers ─────────────────────────────────────────────

tiktok.on("gift", (data) => {
  console.log(
    `🎁 Gift: ${data.uniqueId} sent ${data.repeatCount}x ${data.giftName}`
  );
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
  console.log(`❤️ Like: ${data.uniqueId} x${data.likeCount}`);
  queueEvent("like", data.uniqueId, {
    like_count: data.likeCount,
    total_likes: data.totalLikeCount,
    avatar: data.profilePictureUrl,
  });
});

tiktok.on("follow", (data) => {
  console.log(`➕ Follow: ${data.uniqueId}`);
  queueEvent("follow", data.uniqueId, {
    avatar: data.profilePictureUrl,
  });
});

tiktok.on("share", (data) => {
  console.log(`🔗 Share: ${data.uniqueId}`);
  queueEvent("share", data.uniqueId, {
    avatar: data.profilePictureUrl,
  });
});

tiktok.on("chat", (data) => {
  console.log(`💬 Chat: ${data.uniqueId}: ${data.comment}`);
  queueEvent("chat", data.uniqueId, {
    message: data.comment,
    avatar: data.profilePictureUrl,
  });
});

tiktok.on("roomUser", (data) => {
  console.log(`👁 Viewers: ${data.viewerCount}`);
  queueEvent("viewer_count", TIKTOK_USERNAME, {
    viewer_count: data.viewerCount,
  });
});

tiktok.on("subscribe", (data) => {
  console.log(`⭐ Subscribe: ${data.uniqueId}`);
  queueEvent("subscribe", data.uniqueId, {
    avatar: data.profilePictureUrl,
  });
});

// ── Connection ─────────────────────────────────────────────────

tiktok
  .connect()
  .then((state) => {
    console.log(`\n🟢 Connected to ${TIKTOK_USERNAME}'s LIVE`);
    console.log(`   Room ID: ${state.roomId}`);
    console.log(`   Viewers: ${state.viewerCount}\n`);
  })
  .catch((err) => {
    console.error("❌ Connection failed:", err.message);
    if (err.message.includes("not found")) {
      console.error("   Make sure the user is currently LIVE.");
    }
    process.exit(1);
  });

tiktok.on("disconnected", () => {
  console.log("🔴 Disconnected from LIVE stream");
  flushEvents(); // flush remaining events
});

tiktok.on("error", (err) => {
  console.error("Stream error:", err);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nShutting down...");
  await flushEvents();
  tiktok.disconnect();
  process.exit(0);
});
