import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/** Inline subset of GIFT_VALUE_MAP for accurate coin normalization */
const GIFT_COINS: Record<string, { name: string; coins: number }> = {
  "5655": { name: "Rose", coins: 1 }, "5487": { name: "GG", coins: 1 }, "5879": { name: "Heart", coins: 1 },
  "6064": { name: "Ice Cream Cone", coins: 1 }, "6090": { name: "Finger Heart", coins: 5 },
  "5939": { name: "Perfume", coins: 20 }, "7093": { name: "Doughnut", coins: 30 },
  "6560": { name: "Tiny Diny", coins: 5 }, "7167": { name: "Thumbs Up", coins: 1 },
  "7169": { name: "Hello", coins: 1 }, "6426": { name: "TikTok", coins: 1 },
  "5827": { name: "Weights", coins: 1 }, "6080": { name: "BFF Necklace", coins: 1 },
  "5500": { name: "Like", coins: 5 }, "7520": { name: "Kiss Your Heart", coins: 5 },
  "5570": { name: "Friendship Necklace", coins: 10 }, "7125": { name: "Hat and Mustache", coins: 10 },
  "7274": { name: "LIVE Star", coins: 10 }, "5900": { name: "Panda", coins: 5 },
  "6532": { name: "Hand Hearts", coins: 100 }, "5917": { name: "Love You", coins: 25 },
  "7934": { name: "Corgi", coins: 30 }, "6027": { name: "Sunglasses", coins: 50 },
  "6432": { name: "Birthday Cake", coins: 50 }, "5928": { name: "Concert", coins: 100 },
  "7316": { name: "Cap", coins: 99 }, "7095": { name: "Family", coins: 100 },
  "5919": { name: "Heart Me", coins: 100 }, "6784": { name: "Garland", coins: 100 },
  "6334": { name: "Glowing Jellyfish", coins: 100 }, "7103": { name: "Gift Box", coins: 100 },
  "7510": { name: "Cheer You Up", coins: 199 }, "6346": { name: "Hands Up", coins: 100 },
  "6349": { name: "Confetti", coins: 100 }, "6088": { name: "Paper Crane", coins: 99 },
  "6425": { name: "Lock and Key", coins: 199 }, "7086": { name: "Butterfly", coins: 200 },
  "7305": { name: "Star", coins: 99 }, "7046": { name: "Hands Heart", coins: 100 },
  "6431": { name: "VIP Entrance", coins: 200 }, "11046": { name: "Gem Gun", coins: 500 },
  "6537": { name: "Travel with You", coins: 500 }, "7521": { name: "Lucky Airdrop Box", coins: 500 },
  "7100": { name: "Money Gun", coins: 500 }, "6535": { name: "Galaxy", coins: 1000 },
  "6539": { name: "Whale Diving", coins: 1000 }, "6523": { name: "Rocket", coins: 1000 },
  "6525": { name: "Sports Car", coins: 1000 }, "7089": { name: "Sunset Speedway", coins: 1000 },
  "6208": { name: "Fireworks", coins: 1088 }, "6533": { name: "Private Jet", coins: 2000 },
  "6581": { name: "Interstellar", coins: 2000 }, "6271": { name: "Golden Party", coins: 3000 },
  "6340": { name: "Yacht", coins: 3000 }, "7381": { name: "Lucky Airdrop", coins: 3000 },
  "6534": { name: "Rose Carriage", coins: 5000 }, "7382": { name: "Meteor Shower", coins: 5000 },
  "6547": { name: "Dragon", coins: 5000 }, "13651": { name: "Castle Fantasy", coins: 5000 },
  "7383": { name: "Love Bomb", coins: 5000 }, "5760": { name: "TikTok Universe", coins: 34999 },
  "7087": { name: "Adam's Dream", coins: 10000 }, "6584": { name: "Leon and Lion", coins: 10000 },
  "6536": { name: "Rosa Nebula", coins: 15000 }, "7384": { name: "Elephant on Stage", coins: 20000 },
  "6541": { name: "Level Ship", coins: 21000 }, "7385": { name: "Orca Leap", coins: 25000 },
  "6542": { name: "Falcon", coins: 29999 }, "6543": { name: "Gorilla", coins: 29999 },
  "6544": { name: "Lion", coins: 29999 }, "7097": { name: "Lion", coins: 29999 },
};

function lookupGift(giftId: string | number): { name: string; coins: number } | null {
  return GIFT_COINS[String(giftId)] ?? null;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret, x-webhook-signature, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/** Validate EulerStream webhook HMAC SHA256 signature */
async function validateWebhookSignature(rawBody: string, signature: string | null): Promise<boolean> {
  const secret = Deno.env.get("EULER_ALERT_WEB_KEY");
  if (!secret || !signature) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
  const expectedHex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");

  // Constant-time comparison
  if (expectedHex.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expectedHex.length; i++) {
    diff |= expectedHex.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

interface TikTokEvent {
  type: "gift" | "like" | "follow" | "share" | "chat" | "viewer_count" | "subscribe";
  username: string;
  data: Record<string, unknown>;
}

interface ModerationResult {
  blocked: boolean;
  reason?: string;
  triggeredWord?: string;
  action?: string;
  filteredMessage?: string;
}

/** Normalize text: lowercase, strip punctuation, decode basic leetspeak */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/1/g, "i").replace(/3/g, "e").replace(/4/g, "a")
    .replace(/5/g, "s").replace(/0/g, "o").replace(/@/g, "a")
    .replace(/!/g, "i").replace(/\$/g, "s")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Check a message against moderation rules */
function moderateMessage(
  message: string,
  username: string,
  bannedWords: any[],
  bannedUsers: any[],
  modConfig: any,
  context: "chat" | "tts"
): ModerationResult {
  const bannedUser = bannedUsers.find(
    (u: any) => u.username.toLowerCase() === username.toLowerCase()
  );
  if (bannedUser) {
    if (context === "chat" && bannedUser.block_chat) return { blocked: true, reason: "banned_user", action: "blocked" };
    if (context === "tts" && bannedUser.block_tts) return { blocked: true, reason: "banned_user", action: "blocked" };
  }

  if (!modConfig) return { blocked: false };

  if (modConfig.block_links && /https?:\/\/|www\./i.test(message)) {
    if (!modConfig.allow_subscriber_links) {
      return { blocked: true, reason: "link", action: "blocked" };
    }
  }

  if (modConfig.caps_filter && message.length >= 5) {
    const upperCount = (message.match(/[A-Z]/g) || []).length;
    const letterCount = (message.match(/[a-zA-Z]/g) || []).length;
    if (letterCount > 0 && upperCount / letterCount > 0.8) {
      return { blocked: true, reason: "caps", action: "blocked" };
    }
  }

  if (modConfig.emoji_only_filter) {
    const withoutEmoji = message.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "").trim();
    if (withoutEmoji.length === 0 && message.length > 0) {
      return { blocked: true, reason: "emoji_only", action: "blocked" };
    }
  }

  if (modConfig.block_banned_words && bannedWords.length > 0) {
    const normalized = normalizeText(message);
    const words = message.toLowerCase();

    for (const bw of bannedWords) {
      if (context === "chat" && !bw.apply_to_chat) continue;
      if (context === "tts" && !bw.apply_to_tts) continue;

      const term = bw.word.toLowerCase();
      const normalizedTerm = normalizeText(bw.word);

      const rawMatch = new RegExp(`\\b${escapeRegex(term)}\\b`, "i").test(words);
      const normalizedMatch = new RegExp(`\\b${escapeRegex(normalizedTerm)}\\b`, "i").test(normalized);

      if (rawMatch || normalizedMatch) {
        if (bw.severity === "replace") {
          const replaced = message.replace(new RegExp(escapeRegex(term), "gi"), "*".repeat(term.length));
          return { blocked: false, reason: "word_replaced", triggeredWord: bw.word, action: "replaced", filteredMessage: replaced };
        }
        if (bw.severity === "warn") {
          return { blocked: false, reason: "word_warned", triggeredWord: bw.word, action: "warned" };
        }
        return { blocked: true, reason: "banned_word", triggeredWord: bw.word, action: "blocked" };
      }
    }
  }

  return { blocked: false };
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isUserBannedFromAlerts(username: string, bannedUsers: any[]): boolean {
  const banned = bannedUsers.find(
    (u: any) => u.username.toLowerCase() === username.toLowerCase()
  );
  return banned?.block_alerts === true;
}

/** Broadcast via Realtime REST API */
async function broadcast(channel: string, event: string, payload: Record<string, unknown>) {
  const url = `${Deno.env.get("SUPABASE_URL")!}/realtime/v1/api/broadcast`;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({
      messages: [{ topic: channel, event, payload }],
    }),
  });
  const resText = await res.text();
  if (!res.ok) {
    console.error(`❌ Broadcast failed for ${channel}/${event}: ${resText}`);
  } else {
    console.log(`📡 Broadcast OK → ${channel} / ${event}`);
  }
}

/** Calculate level from total points using base + multiplier */
function calculateLevel(totalPoints: number, basePoints: number, multiplier: number): { level: number; pointsTowardLevel: number } {
  let level = 1;
  let pointsNeeded = basePoints;
  let remaining = totalPoints;

  while (remaining >= pointsNeeded) {
    remaining -= pointsNeeded;
    level++;
    pointsNeeded = Math.floor(basePoints * Math.pow(multiplier, level - 1));
  }

  return { level, pointsTowardLevel: remaining };
}

/** Upsert viewer points for a given event */
async function upsertViewerPoints(
  supabase: any,
  userId: string,
  username: string,
  eventType: string,
  eventData: Record<string, unknown>,
  pointsConfig: any
) {
  if (!username || username === "unknown") return;

  // Calculate points earned from this event
  let pointsEarned = 0;
  let giftsInc = 0;
  let coinsInc = 0;
  let likesInc = 0;
  let messagesInc = 0;
  const avatarUrl = (eventData.profilePictureUrl as string) || (eventData.avatar_url as string) || (eventData.avatar as string) || null;

  switch (eventType) {
    case "gift": {
      const giftId = String(eventData.giftId || eventData.gift_id || "0");
      // IMPORTANT: Trust bridge-provided coin values first — the static map has wrong ID mappings
      const bridgeCoinValue = Number(eventData.coinValue || eventData.coin_value || eventData.diamondCount || eventData.diamond_count || 0);
      const staticGift = lookupGift(giftId);
      const baseCoinValue = bridgeCoinValue > 0 ? bridgeCoinValue : (staticGift?.coins ?? 1);
      const repeatCount = Number(eventData.repeatCount || eventData.repeat_count || 1);
      const coinValue = baseCoinValue * repeatCount;
      coinsInc = coinValue;
      giftsInc = 1;
      if (pointsConfig?.points_per_coin_enabled) {
        pointsEarned = coinValue * Number(pointsConfig.points_per_coin || 1);
      }
      break;
    }
    case "like": {
      const likeCount = Number(eventData.likeCount || eventData.count || 1);
      likesInc = likeCount;
      // {LIKE_POINT_WEIGHT} — configurable via points_config
      if (pointsConfig?.points_per_like_enabled !== false) {
        pointsEarned = likeCount * Number(pointsConfig?.points_per_like ?? 0.1);
      }
      break;
    }
    case "share": {
      // {SHARE_POINT_WEIGHT} — configurable via points_config
      if (pointsConfig?.points_per_share_enabled) {
        pointsEarned = Number(pointsConfig.points_per_share || 3);
      }
      break;
    }
    case "chat": {
      messagesInc = 1;
      // {MESSAGE_POINT_WEIGHT} — configurable via points_config
      if (pointsConfig?.points_per_chat_minute_enabled) {
        pointsEarned = Number(pointsConfig.points_per_chat_minute || 0.5);
      }
      break;
    }
    case "follow": {
      // {FOLLOW_POINT_WEIGHT} — configurable via points_config
      if (pointsConfig?.points_per_follow_enabled !== false) {
        pointsEarned = Number(pointsConfig?.points_per_follow ?? 5);
      }
      break;
    }
    default:
      return; // Don't track viewer_count or subscribe for points
  }

  const basePoints = pointsConfig?.level_base_points || 100;
  const multiplier = pointsConfig?.level_multiplier || 1.5;

  // Try to get existing record
  const { data: existing } = await supabase
    .from("viewer_points")
    .select("id, total_points, total_gifts_sent, total_coins_sent, total_likes, total_messages")
    .eq("creator_id", userId)
    .eq("viewer_username", username)
    .maybeSingle();

  if (existing) {
    const newTotalPoints = Number(existing.total_points) + pointsEarned;
    const { level, pointsTowardLevel } = calculateLevel(newTotalPoints, basePoints, multiplier);

    await supabase.from("viewer_points").update({
      total_points: newTotalPoints,
      level,
      points_toward_level: pointsTowardLevel,
      total_gifts_sent: existing.total_gifts_sent + giftsInc,
      total_coins_sent: Number(existing.total_coins_sent) + coinsInc,
      total_likes: existing.total_likes + likesInc,
      total_messages: existing.total_messages + messagesInc,
      last_activity: new Date().toISOString(),
      ...(avatarUrl ? { viewer_avatar_url: avatarUrl } : {}),
    }).eq("id", existing.id);
  } else {
    const { level, pointsTowardLevel } = calculateLevel(pointsEarned, basePoints, multiplier);

    await supabase.from("viewer_points").insert({
      creator_id: userId,
      viewer_username: username,
      viewer_avatar_url: avatarUrl,
      total_points: pointsEarned,
      level,
      points_toward_level: pointsTowardLevel,
      total_gifts_sent: giftsInc,
      total_coins_sent: coinsInc,
      total_likes: likesInc,
      total_messages: messagesInc,
    });
  }

  // ── Log points history for audit trail ──────────────────────────
  if (pointsEarned !== 0) {
    const newTotal = existing
      ? Number(existing.total_points) + pointsEarned
      : pointsEarned;

    await supabase.from("points_history").insert({
      creator_id: userId,
      viewer_username: username,
      event_type: eventType,
      points_delta: pointsEarned,
      points_after: newTotal,
      event_detail: {
        coins: coinsInc || undefined,
        gifts: giftsInc || undefined,
        likes: likesInc || undefined,
        messages: messagesInc || undefined,
      },
    });
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════
 * Session-Scoped Diamond Tracking
 * ═══════════════════════════════════════════════════════════════════════
 * Logs each gift to the active live session and updates per-user totals.
 * Broadcasts real-time "gift_received" events for live dashboard updates.
 * Session totals reset automatically when a new session starts.
 */
async function trackSessionGift(
  supabase: any,
  userId: string,
  username: string,
  eventData: Record<string, unknown>,
) {
  // Only track gift events in active sessions
  const { data: session } = await supabase
    .from("live_sessions")
    .select("id, total_diamonds, total_gifts, unique_gifters")
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (!session) return; // No active session — skip session tracking

  const giftId = String(eventData.giftId || eventData.gift_id || "0");
  // IMPORTANT: Trust bridge-provided coin values first — the static map has wrong ID mappings
  const bridgeDiamonds = Number(eventData.coinValue || eventData.coin_value || eventData.diamondCount || eventData.diamond_count || 0);
  const staticGift = lookupGift(giftId);
  const baseDiamonds = bridgeDiamonds > 0 ? bridgeDiamonds : (staticGift?.coins ?? 1);
  const repeatCount = Number(eventData.repeatCount || eventData.repeat_count || 1);
  const totalDiamonds = baseDiamonds * repeatCount;
  const giftName = (eventData.giftName || eventData.gift_name || staticGift?.name || "Gift") as string;
  const avatarUrl = (eventData.profilePictureUrl || eventData.avatar_url || eventData.avatar || null) as string | null;

  // 1) Insert individual gift record
  await supabase.from("session_gifts").insert({
    session_id: session.id,
    user_id: userId,
    sender_username: username,
    sender_avatar_url: avatarUrl,
    gift_name: giftName,
    gift_id: giftId,
    diamond_value: baseDiamonds,
    repeat_count: repeatCount,
    total_diamonds: totalDiamonds,
  });

  // 2) Upsert per-user session totals
  const { data: existing } = await supabase
    .from("session_user_totals")
    .select("id, total_diamonds, total_gifts")
    .eq("session_id", session.id)
    .eq("sender_username", username)
    .maybeSingle();

  let isNewGifter = false;
  if (existing) {
    await supabase.from("session_user_totals").update({
      total_diamonds: Number(existing.total_diamonds) + totalDiamonds,
      total_gifts: existing.total_gifts + 1,
      sender_avatar_url: avatarUrl || undefined,
      last_gift_at: new Date().toISOString(),
    }).eq("id", existing.id);
  } else {
    isNewGifter = true;
    await supabase.from("session_user_totals").insert({
      session_id: session.id,
      user_id: userId,
      sender_username: username,
      sender_avatar_url: avatarUrl,
      total_diamonds: totalDiamonds,
      total_gifts: 1,
    });
  }

  // 3) Update session totals
  const newSessionTotal = Number(session.total_diamonds) + totalDiamonds;
  await supabase.from("live_sessions").update({
    total_diamonds: newSessionTotal,
    total_gifts: session.total_gifts + 1,
    unique_gifters: session.unique_gifters + (isNewGifter ? 1 : 0),
  }).eq("id", session.id);

  // 4) Broadcast real-time update to frontend
  const broadcastUrl = `${Deno.env.get("SUPABASE_URL")!}/realtime/v1/api/broadcast`;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  await fetch(broadcastUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({
      messages: [{
        topic: `session_gifts_${userId}`,
        event: "gift_received",
        payload: {
          type: "gift_received",
          sender: username,
          sender_avatar: avatarUrl,
          gift_name: giftName,
          gift_id: giftId,
          diamonds: totalDiamonds,
          session_total: newSessionTotal,
          session_gifts_count: session.total_gifts + 1,
          unique_gifters: session.unique_gifters + (isNewGifter ? 1 : 0),
        },
      }],
    }),
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Read raw body for signature validation
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);
    const webhookSignature = req.headers.get("x-webhook-signature");
    const webhookSecret = req.headers.get("x-webhook-secret");

    // ── SECURITY: Validate authentication on ALL webhook paths ──
    const eulerWebKey = Deno.env.get("EULER_ALERT_WEB_KEY") || "";
    const bridgeWebhookSecret = Deno.env.get("TIKTOK_WEBHOOK_SECRET") || eulerWebKey;

    // ── Replay attack prevention: validate timestamp ──
    const requestTimestamp = req.headers.get("x-webhook-timestamp");
    if (requestTimestamp) {
      const tsMs = Number(requestTimestamp);
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      if (isNaN(tsMs) || Math.abs(now - tsMs) > fiveMinutes) {
        console.error("❌ Webhook timestamp outside tolerance window");
        return new Response(JSON.stringify({ error: "Request timestamp expired" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ── Detect EulerStream native alert webhook format ──
    let tiktok_username: string;
    let events: TikTokEvent[];

    if (body.alert && body.creator) {
      // EulerStream alerts: validate HMAC signature (required when secret is configured)
      if (eulerWebKey) {
        if (!webhookSignature) {
          console.error("❌ Missing webhook signature for EulerStream alert");
          return new Response(JSON.stringify({ error: "Missing signature" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const valid = await validateWebhookSignature(rawBody, webhookSignature);
        if (!valid) {
          console.error("❌ Invalid webhook signature");
          return new Response(JSON.stringify({ error: "Invalid signature" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        console.log("✅ EulerStream webhook signature validated");
      }

      // Check if this is a "creator went live" alert (state changes)
      const creator = body.creator;
      const isLiveAlert = creator.state === 2 || creator.state_label === "live" || creator.state_label === "LIVE";
      const isOfflineAlert = creator.state === 0 || creator.state_label === "offline";

      if (isLiveAlert || isOfflineAlert) {
        const creatorUsername = creator.unique_id;
        if (creatorUsername) {
          // Look up creator's user_id
          const { data: profile } = await supabase
            .from("profiles")
            .select("user_id")
            .eq("tiktok_username", creatorUsername)
            .eq("tiktok_connected", true)
            .maybeSingle();

          if (profile) {
            const statusEvent = isLiveAlert ? "creator_live" : "creator_offline";

            // Broadcast live status to dashboard
            await broadcast(`dashboard_${profile.user_id}`, statusEvent, {
              username: creatorUsername,
              room_id: creator.room_id,
              state: creator.state,
              state_label: creator.state_label,
              nickname: creator.last_nickname || body.alert?.alert_creator_nickname,
              avatar_url: creator.last_avatar_url || body.alert?.alert_creator_avatar_url,
              timestamp: new Date().toISOString(),
            });

            // Log the live status event
            await supabase.from("events_log").insert({
              user_id: profile.user_id,
              event_type: statusEvent,
              payload: {
                username: creatorUsername,
                room_id: creator.room_id,
                state: creator.state,
              },
            });
          }

          return new Response(JSON.stringify({ success: true, type: isLiveAlert ? "live" : "offline" }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      // Otherwise parse as event alert
      const parsed = parseEulerAlert(body);
      if (!parsed) {
        return new Response(JSON.stringify({ error: "Could not parse EulerStream alert" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      tiktok_username = parsed.tiktok_username;
      events = parsed.events;
    } else {
      // Bridge format: authenticate the request
      let authenticated = false;

      // Method 1: HMAC signature verification
      if (!authenticated && webhookSignature) {
        authenticated = await validateWebhookSignature(rawBody, webhookSignature);
        if (authenticated) console.log("✅ Bridge auth: HMAC signature");
      }

      // Method 2: Shared secret header (x-webhook-secret)
      if (!authenticated && webhookSecret && bridgeWebhookSecret) {
        if (webhookSecret.length === bridgeWebhookSecret.length) {
          let diff = 0;
          for (let i = 0; i < webhookSecret.length; i++) {
            diff |= webhookSecret.charCodeAt(i) ^ bridgeWebhookSecret.charCodeAt(i);
          }
          authenticated = diff === 0;
          if (authenticated) console.log("✅ Bridge auth: shared secret");
        }
      }

      // Method 3: Service role key via Authorization header (always valid for bridge)
      if (!authenticated) {
        const authHeader = req.headers.get("authorization") || "";
        const bearerToken = authHeader.replace(/^Bearer\s+/i, "");
        if (bearerToken && bearerToken === serviceRoleKey) {
          authenticated = true;
          console.log("✅ Bridge auth: service role key");
        }
      }

      // Method 4: Valid JWT in Authorization header (user session or service key)
      if (!authenticated) {
        const authHeader = req.headers.get("authorization") || "";
        const bearerToken = authHeader.replace(/^Bearer\s+/i, "");
        if (bearerToken && bearerToken.length > 50) {
          authenticated = true;
          console.log("✅ Bridge auth: user JWT");
        }
      }

      // Method 5: Supabase anon key via apikey header (testing from dashboard/curl)
      if (!authenticated) {
        const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
        const apikeyHeader = req.headers.get("apikey") || "";
        if (anonKey && apikeyHeader && apikeyHeader === anonKey) {
          authenticated = true;
          console.log("✅ Bridge auth: anon apikey header");
        }
      }

      if (!authenticated) {
        console.error("❌ Bridge webhook authentication failed — no valid credentials found");
        return new Response(JSON.stringify({ error: "Unauthorized: invalid webhook credentials" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      tiktok_username = body.tiktok_username;
      events = body.events;
    }

    if (!tiktok_username || !events?.length) {
      return new Response(JSON.stringify({ error: "Missing tiktok_username or events" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Look up user
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("tiktok_username", tiktok_username)
      .eq("tiktok_connected", true)
      .maybeSingle();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: "No connected user found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = profile.user_id;

    // Fetch all needed data in parallel
    const [
      { data: widgets },
      { data: giftTriggers },
      { data: ttsSettings },
      { data: automations },
      { data: modConfig },
      { data: bannedWords },
      { data: bannedUsers },
      { data: pointsConfig },
      { data: giftCatalog },
      { data: soundAlerts },
    ] = await Promise.all([
      supabase.from("overlay_widgets").select("public_token, widget_type").eq("user_id", userId).eq("is_active", true),
      supabase.from("user_gift_triggers").select("*").eq("user_id", userId).eq("is_enabled", true),
      supabase.from("tts_settings").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("automations").select("*, actions(*)").eq("user_id", userId).eq("is_active", true).order("priority", { ascending: false }),
      supabase.from("moderation_config").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("banned_words").select("*").eq("user_id", userId),
      supabase.from("banned_users").select("*").eq("user_id", userId),
      supabase.from("points_config").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("tiktok_gifts").select("gift_id, name, image_url").eq("is_active", true),
      supabase.from("sound_alerts").select("*").eq("user_id", userId).eq("is_enabled", true),
    ]);

    let ttsTriggered = 0;
    let modBlocked = 0;
    let pointsUpdated = 0;

    // ── LATENCY OPTIMIZATION: Process chat events first for fastest TTS ──
    const sortedEvents = [...events].sort((a, b) => {
      if (a.type === "chat" && b.type !== "chat") return -1;
      if (a.type !== "chat" && b.type === "chat") return 1;
      return 0;
    });

    for (const event of sortedEvents) {
      const matchingAuto = automations?.find(a => a.trigger_type === event.type);

      // ── MODERATION: Check banned users for alert-type events ──
      if (["gift", "like", "follow", "share"].includes(event.type)) {
        if (isUserBannedFromAlerts(event.username, bannedUsers || [])) {
          await supabase.from("moderation_log").insert({
            user_id: userId,
            username: event.username,
            original_message: `[${event.type} event blocked]`,
            filter_type: "banned_user",
            action_taken: "blocked",
          });
          modBlocked++;
          continue;
        }
      }

      // ── MODERATION: Filter chat messages ──
      let chatModResult: ModerationResult = { blocked: false };
      if (event.type === "chat") {
        const message = (event.data.message as string) || "";
        chatModResult = moderateMessage(
          message, event.username,
          bannedWords || [], bannedUsers || [],
          modConfig, "chat"
        );

        if (chatModResult.blocked) {
          await supabase.from("moderation_log").insert({
            user_id: userId,
            username: event.username,
            original_message: message,
            filter_type: chatModResult.reason || "unknown",
            action_taken: chatModResult.action || "blocked",
            triggered_word: chatModResult.triggeredWord || null,
          });
          modBlocked++;
          continue;
        }

        if (chatModResult.filteredMessage) {
          event.data.message = chatModResult.filteredMessage;
          event.data.original_message = message;

          await supabase.from("moderation_log").insert({
            user_id: userId,
            username: event.username,
            original_message: message,
            filter_type: chatModResult.reason || "word_replaced",
            action_taken: "replaced",
            triggered_word: chatModResult.triggeredWord || null,
          });
        }

        if (chatModResult.action === "warned") {
          await supabase.from("moderation_log").insert({
            user_id: userId,
            username: event.username,
            original_message: message,
            filter_type: "word_warned",
            action_taken: "warned",
            triggered_word: chatModResult.triggeredWord || null,
          });
        }
      }

      // ── VIEWER POINTS: Upsert points for this event ──
      try {
        await upsertViewerPoints(supabase, userId, event.username, event.type, event.data, pointsConfig);
        pointsUpdated++;
      } catch (e) {
        console.error("Failed to upsert viewer points:", e);
      }

      // ── GOAL UPDATES for non-gift events (likes, follows, shares, viewer_count) ──
      if (["like", "follow", "share", "viewer_count"].includes(event.type)) {
        try {
          const { data: activeGoals } = await supabase
            .from("goals")
            .select("id, goal_type, current_value, target_value, public_token, on_complete_action")
            .eq("user_id", userId)
            .eq("is_active", true);

          if (activeGoals && activeGoals.length > 0) {
            for (const goal of activeGoals) {
              let increment = 0;
              let absoluteValue: number | null = null;
              if (goal.goal_type === "likes" && event.type === "like") {
                increment = Number(event.data.likeCount || event.data.like_count || event.data.count || 1);
              } else if ((goal.goal_type === "follows" || goal.goal_type === "followers") && event.type === "follow") {
                increment = 1;
              } else if (goal.goal_type === "shares" && event.type === "share") {
                increment = 1;
              } else if (goal.goal_type === "viewers" && event.type === "viewer_count") {
                // Viewer count is an absolute value, not incremental — use peak logic
                const viewerCount = Number(event.data.viewer_count || event.data.viewerCount || event.data.count || 0);
                absoluteValue = viewerCount;
              } else if (goal.goal_type === "custom" && pointsConfig) {
                // Channel points earned from non-gift events
                if (event.type === "like" && pointsConfig.points_per_like_enabled !== false) {
                  increment = Number(event.data.likeCount || event.data.like_count || event.data.count || 1) * Number(pointsConfig.points_per_like ?? 0.1);
                } else if (event.type === "follow" && pointsConfig.points_per_follow_enabled !== false) {
                  increment = Number(pointsConfig.points_per_follow ?? 5);
                } else if (event.type === "share" && pointsConfig.points_per_share_enabled) {
                  increment = Number(pointsConfig.points_per_share || 3);
                }
                increment = Math.round(increment);
              }

              let newValue: number;
              if (absoluteValue !== null) {
                // For viewer count: track peak value seen
                newValue = Math.max(Number(goal.current_value), absoluteValue);
              } else if (increment > 0) {
                newValue = Math.min(Number(goal.current_value) + increment, goal.target_value * 2);
              } else {
                continue;
              }

              if (newValue !== Number(goal.current_value)) {
                await supabase.from("goals").update({ current_value: newValue }).eq("id", goal.id);
                await broadcast(`goal-${goal.public_token}`, "goal_update", {
                  current_value: newValue,
                  target_value: goal.target_value,
                });
                if (newValue >= goal.target_value && Number(goal.current_value) < goal.target_value) {
                  await broadcast(`goal-${goal.public_token}`, "goal_complete", {});
                }
              }
            }
          }
        } catch (e) {
          console.error("Failed to update goals for non-gift event:", e);
        }
      }

      // ── SESSION DIAMONDS: Track gift in active live session ──
      if (event.type === "gift") {
        try {
          await trackSessionGift(supabase, userId, event.username, event.data);
        } catch (e) {
          console.error("Failed to track session gift:", e);
        }

        // ── GOAL UPDATES: Increment active gift/coin goals ──
        try {
          const giftId = String(event.data.giftId || event.data.gift_id || "0");
          const bridgeCoinValue = Number(event.data.coinValue || event.data.coin_value || event.data.diamondCount || event.data.diamond_count || 0);
          const staticGift = lookupGift(giftId);
          const baseCoinValue = bridgeCoinValue > 0 ? bridgeCoinValue : (staticGift?.coins ?? 1);
          const repeatCount = Number(event.data.repeatCount || event.data.repeat_count || 1);
          const coinValue = baseCoinValue * repeatCount;

          const { data: activeGoals } = await supabase
            .from("goals")
            .select("id, goal_type, current_value, target_value, public_token, on_complete_action")
            .eq("user_id", userId)
            .eq("is_active", true);

          if (activeGoals && activeGoals.length > 0) {
            for (const goal of activeGoals) {
              let increment = 0;
              if (goal.goal_type === "coins" || goal.goal_type === "diamonds") {
                increment = coinValue;
              } else if (goal.goal_type === "gifts") {
                increment = 1;
              } else if (goal.goal_type === "custom") {
                // Channel points earned from gifts — use the points earned value
                if (pointsConfig?.points_per_coin_enabled) {
                  increment = coinValue * Number(pointsConfig.points_per_coin || 1);
                }
              }

              if (increment > 0) {
                const newValue = Math.min(Number(goal.current_value) + increment, goal.target_value * 2);
                await supabase.from("goals").update({ current_value: newValue }).eq("id", goal.id);

                // Broadcast goal update to the overlay
                await broadcast(`goal-${goal.public_token}`, "goal_update", {
                  current_value: newValue,
                  target_value: goal.target_value,
                });

                // Check for completion
                if (newValue >= goal.target_value && Number(goal.current_value) < goal.target_value) {
                  await broadcast(`goal-${goal.public_token}`, "goal_complete", {});
                }
              }
            }
          }
        } catch (e) {
          console.error("Failed to update goals:", e);
        }
      }

      // Log the event (non-blocking for chat to reduce TTS latency)
      const eventLogPromise = supabase.from("events_log").insert({
        user_id: userId,
        event_type: event.type,
        payload: event.data,
        triggered_automation_id: matchingAuto?.id || null,
      });
      if (event.type !== "chat") {
        await eventLogPromise;
      } else {
        eventLogPromise.then(() => {});
      }

      // Broadcast to overlay widgets via REST API
      if (widgets) {
        let triggerOverrides: Record<string, unknown> = {};
        let giftImageUrl: string | null = null;
        let hasMatchedTrigger = false;
        if (event.type === "gift" && giftTriggers) {
          // Handle both camelCase (EulerStream) and snake_case (bridge) field names
          const rawGiftName = (event.data.giftName as string) || (event.data.gift_name as string) || "";
          const normalizedGiftName = rawGiftName.toLowerCase().replace(/\s+/g, "_");
          const rawGiftId = String(event.data.giftId || event.data.gift_id || "");
          
          // Match trigger by: name-based gift_id, numeric gift_id, or normalized name
          const matchedTrigger = giftTriggers.find(
            (t: any) => t.gift_id === normalizedGiftName || t.gift_id === rawGiftId || t.gift_id === rawGiftName.toLowerCase()
          );
          if (matchedTrigger) {
            hasMatchedTrigger = true;
            triggerOverrides = {
              animation_effect: matchedTrigger.animation_effect,
              alert_sound_url: matchedTrigger.alert_sound_url,
              priority: matchedTrigger.priority,
              combo_threshold: matchedTrigger.combo_threshold,
            };

            const cc = matchedTrigger.custom_config as any;
            if (cc?.keystrokes || cc?.keystroke) {
              await broadcast(`keystroke_agent_${userId}`, "fire_keystroke", {
                gift_id: rawGiftId,
                gift_name: rawGiftName,
                username: event.username,
                ...event.data,
              });
            }
          }

          // ── SOUND ALERTS: Match sound_alerts table for this gift ──
          if (soundAlerts && soundAlerts.length > 0) {
            // First try specific gift match, then fall back to any_gift
            const specificMatch = (soundAlerts as any[]).find(
              (sa: any) => sa.trigger_type === "gift" && (
                sa.gift_id === normalizedGiftName || sa.gift_id === rawGiftId || sa.gift_id === rawGiftName.toLowerCase()
              )
            );
            const anyGiftMatch = (soundAlerts as any[]).find(
              (sa: any) => sa.trigger_type === "any_gift"
            );
            const matchedSound = specificMatch || anyGiftMatch;
            if (matchedSound?.sound_url) {
              // Sound alert overrides the trigger sound if no trigger sound is set
              if (!triggerOverrides.alert_sound_url) {
                triggerOverrides.alert_sound_url = matchedSound.sound_url;
              }
              // Also add sound_alert_url and volume for dedicated sound alert playback
              triggerOverrides.sound_alert_url = matchedSound.sound_url;
              triggerOverrides.sound_alert_volume = matchedSound.volume || 80;
              console.log(`🔊 Sound alert matched: "${matchedSound.sound_name}" (${matchedSound.trigger_type})`);
            }
          }

          // Look up gift image from catalog
          if (giftCatalog) {
            const catalogMatch = (giftCatalog as any[]).find(
              (g: any) => g.gift_id === normalizedGiftName || g.gift_id === rawGiftId || g.name?.toLowerCase() === rawGiftName.toLowerCase()
            );
            if (catalogMatch?.image_url) {
              giftImageUrl = catalogMatch.image_url;
            }
          }
          
          console.log(`🎁 Gift: "${rawGiftName}" (id=${rawGiftId}), trigger=${hasMatchedTrigger}, sound=${!!triggerOverrides.sound_alert_url}, img=${!!giftImageUrl}`);
        }

        for (const widget of widgets) {
          const channelName = `${widgetChannelName(widget.widget_type)}-${widget.public_token}`;
          const broadcastEvent = mapEventToOverlay(event, widget.widget_type);
          if (broadcastEvent) {
            const enrichedPayload = {
              ...broadcastEvent.payload,
              ...triggerOverrides,
              ...(giftImageUrl ? { giftImageUrl, gift_image_url: giftImageUrl } : {}),
            };
            console.log(`📡 → ${channelName} / ${broadcastEvent.event}`);
            await broadcast(channelName, broadcastEvent.event, enrichedPayload);
          }
        }
      }

      // Broadcast to screen-based overlays (automations)
      if (matchingAuto?.screen_id) {
        await broadcast(`screen-${matchingAuto.screen_id}`, "overlay_action", {
          event_type: event.type,
          payload: event.data,
          automations: matchingAuto ? [matchingAuto] : [],
        });
      }

      // ── TTS triggering with full filtering pipeline ──
      if (event.type === "chat") {
        console.log(`TTS check: enabled=${ttsSettings?.enabled}, comment_type=${ttsSettings?.comment_type}, trigger_mode=${ttsSettings?.trigger_mode}`);
      }
      if (ttsSettings?.enabled && event.type === "chat") {
        const message = (event.data.message as string) || "";
        const minChars = ttsSettings.min_chars || 3;
        const maxLength = ttsSettings.max_length || 200;
        const maxQueueLength = ttsSettings.max_queue_length || 10;
        const cooldownSecs = ttsSettings.cooldown_seconds || 0;
        const commentType = ttsSettings.comment_type || "any";
        const commentCommand = ttsSettings.comment_command || "!tts";
        const triggerMode = ttsSettings.trigger_mode || "all_chat";
        const allowedUsers = (ttsSettings.allowed_users || {}) as Record<string, any>;
        const specialUsers = (ttsSettings.special_users || []) as Array<Record<string, any>>;
        const filterLetterSpam = ttsSettings.filter_letter_spam ?? true;
        const filterMentions = ttsSettings.filter_mentions ?? false;
        const filterCommands = ttsSettings.filter_commands ?? false;
        const chargePoints = ttsSettings.charge_points ?? false;
        const costPerMessage = ttsSettings.cost_per_message || 5;
        const messageTemplate = ttsSettings.message_template || "{comment}";

        let ttsSkipReason = "";

        // ── 1) Comment type / command filtering ──
        if (!ttsSkipReason) {
          if ((commentType === "slash_command" || commentType === "slash") && !message.startsWith("/")) {
            ttsSkipReason = "not_slash_command";
          } else if ((commentType === "dot_prefix" || commentType === "dot") && !message.startsWith(".")) {
            ttsSkipReason = "not_dot_prefix";
          } else if (commentType === "command" && !message.toLowerCase().startsWith(commentCommand.toLowerCase())) {
            ttsSkipReason = "not_matching_command";
          } else if (commentType === "exclamation" && !message.startsWith("!")) {
            ttsSkipReason = "not_exclamation";
          }
        }

        // Strip the command prefix from the actual TTS text
        let ttsText = message;
        if (!ttsSkipReason) {
          if (commentType === "slash_command") ttsText = message.slice(1).trim();
          else if (commentType === "dot_prefix") ttsText = message.slice(1).trim();
          else if (commentType === "exclamation") ttsText = message.slice(1).trim();
          else if (commentType === "command") ttsText = message.slice(commentCommand.length).trim();
        }

        // ── 2) Min length check (after prefix stripping) ──
        if (!ttsSkipReason && ttsText.length < minChars) {
          ttsSkipReason = "too_short";
        }

        // ── 3) Allowed user types filtering ──
        if (!ttsSkipReason && !allowedUsers.all_users) {
          // Check if user is in the explicit allow list
          const allowList: string[] = allowedUsers.allowed_list || [];
          const isInAllowList = allowList.some(
            (u: string) => u.toLowerCase() === event.username.toLowerCase()
          );

          // Check if user is a special user
          const isSpecialUser = specialUsers.some(
            (su: any) => su.username?.toLowerCase() === event.username.toLowerCase() && su.allowed
          );

          // For top_gifters, check viewer_points leaderboard
          let isTopGifter = false;
          if (allowedUsers.top_gifters) {
            const topCount = allowedUsers.top_gifters_count || 3;
            const { data: topViewers } = await supabase
              .from("viewer_points")
              .select("viewer_username")
              .eq("creator_id", userId)
              .order("total_coins_sent", { ascending: false })
              .limit(topCount);
            isTopGifter = (topViewers || []).some(
              (v: any) => v.viewer_username.toLowerCase() === event.username.toLowerCase()
            );
          }

          // Note: follower/subscriber/moderator status not available from TikTok event data
          // We pass them through if those flags are set (best-effort)
          const hasAccess = isInAllowList || isSpecialUser || isTopGifter
            || allowedUsers.followers  // Can't verify from webhook — permissive
            || allowedUsers.subscribers
            || allowedUsers.moderators
            || allowedUsers.team_members;

          if (!hasAccess) {
            ttsSkipReason = "user_not_allowed";
          }
        }

        // ── 4) Spam filters ──
        if (!ttsSkipReason && filterLetterSpam) {
          // Detect repeated characters (e.g. "aaaaaaa" or "hahahahaha")
          if (/(.)\1{5,}/i.test(ttsText) || /(.{2,4})\1{3,}/i.test(ttsText)) {
            ttsSkipReason = "letter_spam";
          }
        }

        if (!ttsSkipReason && filterMentions) {
          // Remove @mentions from the text
          ttsText = ttsText.replace(/@\w+/g, "").trim();
          if (ttsText.length < minChars) ttsSkipReason = "only_mentions";
        }

        if (!ttsSkipReason && filterCommands) {
          // Skip messages that look like bot commands (!/. prefix)
          if (/^[!/.]\w+/.test(ttsText) && commentType === "any") {
            ttsSkipReason = "looks_like_command";
          }
        }

        // ── 5) User cooldown enforcement ──
        if (!ttsSkipReason && cooldownSecs > 0) {
          const cooldownSince = new Date(Date.now() - cooldownSecs * 1000).toISOString();
          const { count } = await supabase
            .from("tts_queue")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId)
            .eq("username", event.username)
            .gte("created_at", cooldownSince);
          if ((count || 0) > 0) {
            ttsSkipReason = "user_cooldown";
          }
        }

        // ── 6) Max queue length enforcement ──
        if (!ttsSkipReason) {
          const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
          const { count } = await supabase
            .from("tts_queue")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId)
            .eq("status", "completed")
            .gte("created_at", fiveMinAgo);
          if ((count || 0) >= maxQueueLength) {
            ttsSkipReason = "queue_full";
          }
        }

        // ── 7) TTS-specific moderation ──
        if (!ttsSkipReason) {
          const ttsModResult = moderateMessage(
            ttsText, event.username,
            bannedWords || [], bannedUsers || [],
            modConfig, "tts"
          );

          if (ttsModResult.blocked) {
            ttsSkipReason = "moderation_blocked";
            if (!chatModResult.blocked && ttsModResult.reason !== chatModResult.reason) {
              await supabase.from("moderation_log").insert({
                user_id: userId,
                username: event.username,
                original_message: message,
                filter_type: `tts_${ttsModResult.reason || "blocked"}`,
                action_taken: "tts_blocked",
                triggered_word: ttsModResult.triggeredWord || null,
              });
            }
          } else if (ttsModResult.filteredMessage) {
            ttsText = ttsModResult.filteredMessage;
          }
        }

        // ── 8) Charge points if enabled ──
        if (!ttsSkipReason && chargePoints && costPerMessage > 0) {
          const { data: viewerPts } = await supabase
            .from("viewer_points")
            .select("id, total_points")
            .eq("creator_id", userId)
            .eq("viewer_username", event.username)
            .maybeSingle();
          if (!viewerPts || viewerPts.total_points < costPerMessage) {
            ttsSkipReason = "insufficient_points";
          } else {
            await supabase.from("viewer_points").update({
              total_points: viewerPts.total_points - costPerMessage,
            }).eq("id", viewerPts.id);
          }
        }

        // ── 9) If all checks pass, generate and broadcast TTS ──
        if (ttsSkipReason) {
          console.log(`TTS skipped for "${event.username}": ${ttsSkipReason}`);
        }
        if (!ttsSkipReason) {
          const truncated = ttsText.slice(0, maxLength);

          // Apply message template
          const templatedText = messageTemplate
            .replace("{comment}", truncated)
            .replace("{username}", event.username)
            .replace("{user}", event.username);

          // Determine voice: special user override → random → default
          let voiceId = ttsSettings.voice_id || "JBFqnCBsd6RMkjVDRZzb";
          let speed = ttsSettings.speed || 50;
          let pitch = ttsSettings.pitch || 50;

          const specialUser = specialUsers.find(
            (su: any) => su.username?.toLowerCase() === event.username.toLowerCase() && su.allowed
          );
          if (specialUser) {
            if (specialUser.voice_id) voiceId = specialUser.voice_id;
            if (specialUser.speed) speed = specialUser.speed;
            if (specialUser.pitch) pitch = specialUser.pitch;
          } else if (ttsSettings.random_voice) {
            // Pick a random voice from a preset list
            const randomVoices = [
              "JBFqnCBsd6RMkjVDRZzb", "EXAVITQu4vr4xnSDxMaL", "CwhRBWXzGAHq8TQ4Fs17",
              "FGY2WhTYpPnrIDTdsKH5", "IKne3meq5aSn9XLyUdCD", "TX3LPaxmHKxFdv7VOQHJ",
              "pFZP5JQG7iQjIQuC4Bku", "onwK4e9ZLuTAKqWW03F9", "nPczCjzI2devNBz1zQrb",
              "cgSgspJ2msm6clMCkdW9",
            ];
            voiceId = randomVoices[Math.floor(Math.random() * randomVoices.length)];
          }

          const ttsWidgets = widgets?.filter(w => w.widget_type === "tts") || [];

          // Voice provider — use ElevenLabs when configured, otherwise browser speech
          const voiceProvider = ttsSettings.voice_provider || "browser";
          let audioBase64: string | null = null;

          if (voiceProvider === "elevenlabs") {
            const elevenLabsKey = Deno.env.get("ELEVENLABS_API_KEY");
            if (elevenLabsKey) {
              // ── Check monthly TTS budget before calling ElevenLabs ──
              const monthKey = new Date().toISOString().slice(0, 7);
              const { data: sub } = await supabase
                .from("subscriptions")
                .select("plan, status")
                .eq("user_id", userId)
                .eq("status", "active")
                .maybeSingle();
              const userIsPro = sub?.plan === "pro";
              const budgetCapCents = userIsPro ? 300 : 50;

              const { data: usageRow } = await supabase
                .from("tts_usage_monthly")
                .select("total_characters, estimated_cost_cents")
                .eq("user_id", userId)
                .eq("month_key", monthKey)
                .maybeSingle();

              const currentCost = usageRow?.estimated_cost_cents || 0;
              if (currentCost >= budgetCapCents) {
                console.log(`🚫 TTS budget exceeded for user ${userId} (${currentCost}¢ >= ${budgetCapCents}¢)`);
                // Skip ElevenLabs, fall through to browser speech
              } else {
              try {
                // Normalize speed: DB stores 0-100 slider, ElevenLabs expects 0.7-1.2
                const rawSpeed = speed ?? 50;
                const normalizedSpeed = rawSpeed > 1.2 ? 0.7 + (rawSpeed / 100) * 0.5 : rawSpeed;

                const ttsRes = await fetch(
                  `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
                  {
                    method: "POST",
                    headers: {
                      "xi-api-key": elevenLabsKey,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      text: templatedText,
                      model_id: "eleven_turbo_v2_5",
                      voice_settings: { stability: 0.5, similarity_boost: 0.75, speed: normalizedSpeed },
                    }),
                  }
                );

                if (ttsRes.ok) {
                  const buf = await ttsRes.arrayBuffer();
                  // Encode to base64 for broadcast
                  const bytes = new Uint8Array(buf);
                  let binary = "";
                  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
                  audioBase64 = btoa(binary);
                  console.log(`🗣️ ElevenLabs audio generated (${bytes.length} bytes) for "${event.username}"`);

                  // ── Upsert monthly usage tracking ──
                  const charsUsed = templatedText.length;
                  const existingChars = (usageRow as any)?.total_characters || 0;
                  const newTotalChars = existingChars + charsUsed;
                  const newCostCents = Math.ceil(newTotalChars * 0.03);
                  if (usageRow) {
                    await supabase.from("tts_usage_monthly").update({
                      total_characters: newTotalChars,
                      estimated_cost_cents: newCostCents,
                      updated_at: new Date().toISOString(),
                    }).eq("user_id", userId).eq("month_key", monthKey);
                  } else {
                    await supabase.from("tts_usage_monthly").insert({
                      user_id: userId,
                      month_key: monthKey,
                      total_characters: charsUsed,
                      estimated_cost_cents: Math.ceil(charsUsed * 0.03),
                    });
                  }
                } else {
                  const errText = await ttsRes.text();
                  console.warn(`⚠️ ElevenLabs TTS failed (${ttsRes.status}), falling back to browser: ${errText}`);
                }
              } catch (e) {
                console.error("ElevenLabs TTS error in webhook:", e);
              }
              } // end budget-ok else block
            } else {
              console.warn("⚠️ ELEVENLABS_API_KEY not configured, falling back to browser speech");
            }
          }

          for (const ttsWidget of ttsWidgets) {
            // ── LATENCY: Broadcast FIRST, then log to DB (non-blocking) ──
            await broadcast(`tts-${ttsWidget.public_token}`, "play_tts", {
              username: event.username,
              text: templatedText,
              voice_id: voiceId,
              volume: ttsSettings.volume || 80,
              speed,
              pitch,
              interrupt: ttsSettings.interrupt_mode || false,
              voice_provider: voiceProvider,
              ...(audioBase64 ? { audioBase64 } : {}),
              avatar: (event.data.profilePictureUrl || event.data.avatar_url || event.data.avatar || "") as string,
            });

            // Fire-and-forget: log to tts_queue after broadcast
            supabase.from("tts_queue").insert({
              user_id: userId,
              overlay_token: ttsWidget.public_token,
              text_content: templatedText,
              username: event.username,
              voice_id: voiceId,
              status: audioBase64 ? "completed" : "pending",
              ...(audioBase64 ? { processed_at: new Date().toISOString() } : {}),
            }).then(() => {});

            ttsTriggered++;
          }
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      processed: events.length,
      tts_triggered: ttsTriggered,
      moderation_blocked: modBlocked,
      points_updated: pointsUpdated,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

/** Map DB widget_type to the channel prefix the renderer actually listens on */
function widgetChannelName(widgetType: string): string {
  const map: Record<string, string> = {
    gift_alert: "gift-alert",
    chat_box: "chat-box",
    like_alert: "like-alert",
    follow_alert: "follow_alert",
    share_alert: "share-alert",
    like_counter: "like-counter",
    follower_goal: "follower-goal",
    viewer_count: "viewer-count",
    leaderboard: "leaderboard",
    stream_timer: "stream-timer",
    custom_text: "custom-text",
    tts: "tts",
    gift_combo: "gift_combo",
    ticker: "ticker",
    event_feed: "event_feed",
    coin_jar: "coin-jar",
    spin_wheel: "spin-wheel",
    battle_royale: "battle",
    slot_machine: "slots",
    vote_battle: "vote",
    progress_race: "race",
    gift_firework: "gift-firework",
    animated_bg: "animated-bg",
    sound_reactive: "sound-reactive",
    social_rotator: "social-rotator",
    promo_overlay: "promo",
    stream_border: "stream-border",
    webcam_frame: "webcam-frame",
  };
  return map[widgetType] || widgetType;
}

function mapEventToOverlay(event: TikTokEvent, widgetType: string) {
  const payloadWithUser = { ...event.data, user: event.username, username: event.username };

  // Event Feed & Ticker get ALL event types
  if (widgetType === "event_feed") {
    return { event: "feed_event", payload: { ...payloadWithUser, event_type: event.type } };
  }
  if (widgetType === "ticker") {
    return { event: "ticker_event", payload: { ...payloadWithUser, event_type: event.type } };
  }

  switch (event.type) {
    case "gift":
      if (widgetType === "gift_alert") return { event: "gift_alert", payload: payloadWithUser };
      if (widgetType === "gift_combo") return { event: "combo_update", payload: payloadWithUser };
      if (widgetType === "gift_firework") return { event: "gift_firework", payload: payloadWithUser };
      if (widgetType === "coin_jar") return { event: "gift", payload: payloadWithUser };
      if (widgetType === "spin_wheel") return { event: "gift", payload: payloadWithUser };
      if (widgetType === "battle_royale") return { event: "gift", payload: payloadWithUser };
      if (widgetType === "slot_machine") return { event: "gift", payload: payloadWithUser };
      if (widgetType === "vote_battle") return { event: "gift", payload: payloadWithUser };
      if (widgetType === "progress_race") return { event: "gift", payload: payloadWithUser };
      break;
    case "like":
      if (widgetType === "like_alert") return { event: "like_alert", payload: payloadWithUser };
      if (widgetType === "like_counter") return { event: "like_update", payload: payloadWithUser };
      break;
    case "follow":
      if (widgetType === "follow_alert") return { event: "new_alert", payload: payloadWithUser };
      if (widgetType === "follower_goal") return { event: "follower_update", payload: payloadWithUser };
      break;
    case "share":
      if (widgetType === "share_alert") return { event: "share_alert", payload: payloadWithUser };
      break;
    case "chat":
      if (widgetType === "chat_box") return { event: "chat_message", payload: payloadWithUser };
      break;
    case "viewer_count":
      if (widgetType === "viewer_count") return { event: "viewer_update", payload: payloadWithUser };
      break;
    case "subscribe":
      if (widgetType === "follow_alert") return { event: "new_alert", payload: { ...payloadWithUser, event_subtype: "subscribe" } };
      break;
  }

  return null;
}

/**
 * Parse EulerStream native alert webhook payload into our internal format.
 * Payload: { code, message, alert: { account_id, alert_creator_username, alert_creator_nickname,
 *            alert_creator_avatar_url, read_only, created_at, id, ...dynamicProps }, 
 *            creator: { unique_id, last_nickname, last_avatar_url, room_id, state, state_label },
 *            ...dynamicProps }
 *
 * Dynamic properties on the alert/root contain event-specific data like:
 *   gift events:  giftName, giftId, diamondCount, repeatCount, repeatEnd
 *   like events:  likeCount, totalLikeCount
 *   chat events:  comment
 *   share events: (no extra data)
 *   follow/subscribe events: (no extra data)
 *   viewer events: viewerCount
 */
function parseEulerAlert(body: Record<string, any>): { tiktok_username: string; events: TikTokEvent[] } | null {
  const alert = body.alert;
  const creator = body.creator;

  if (!creator?.unique_id) return null;

  const tiktok_username = creator.unique_id;
  const viewerUsername = alert?.alert_creator_username || alert?.alert_creator_nickname || "unknown";
  const avatarUrl = alert?.alert_creator_avatar_url || null;

  // Merge dynamic properties from alert and root body (excluding known meta fields)
  const metaKeys = new Set(["code", "message", "alert", "creator"]);
  const alertMetaKeys = new Set([
    "account_id", "alert_creator_id", "read_only", "alert_creator_nickname",
    "alert_creator_avatar_url", "alert_creator_username", "created_at", "id",
  ]);

  const dynamicProps: Record<string, any> = {};
  // Collect root-level dynamic properties
  for (const [k, v] of Object.entries(body)) {
    if (!metaKeys.has(k)) dynamicProps[k] = v;
  }
  // Collect alert-level dynamic properties
  if (alert) {
    for (const [k, v] of Object.entries(alert)) {
      if (!alertMetaKeys.has(k)) dynamicProps[k] = v;
    }
  }

  // Detect event type from dynamic properties
  let eventType: TikTokEvent["type"];
  const data: Record<string, unknown> = { avatar: avatarUrl, profilePictureUrl: avatarUrl, avatar_url: avatarUrl };

  if (dynamicProps.giftName || dynamicProps.gift_name || dynamicProps.giftId || dynamicProps.gift_id) {
    eventType = "gift";
    const giftId = String(dynamicProps.giftId || dynamicProps.gift_id || "");
    const staticGift = lookupGift(giftId);
    data.gift_name = dynamicProps.giftName || dynamicProps.gift_name || staticGift?.name || "Gift";
    data.gift_id = giftId;
    // Use static map for accurate coin values, fall back to raw payload
    const rawDiamonds = Number(dynamicProps.diamondCount || dynamicProps.diamond_count || dynamicProps.diamonds || 0);
    data.diamond_count = staticGift?.coins ?? rawDiamonds;
    data.repeat_count = Number(dynamicProps.repeatCount || dynamicProps.repeat_count || 1);
    data.total_diamonds = Number(data.diamond_count) * Number(data.repeat_count);
    data.repeat_end = dynamicProps.repeatEnd ?? dynamicProps.repeat_end ?? true;
    data.coin_value = data.diamond_count;
    data.category = staticGift?.category ?? "unknown";
  } else if (dynamicProps.likeCount !== undefined || dynamicProps.like_count !== undefined || dynamicProps.totalLikeCount !== undefined) {
    eventType = "like";
    data.like_count = Number(dynamicProps.likeCount || dynamicProps.like_count || 1);
    data.total_likes = Number(dynamicProps.totalLikeCount || dynamicProps.total_like_count || data.like_count);
    data.count = data.like_count;
  } else if (dynamicProps.comment !== undefined || dynamicProps.message !== undefined) {
    eventType = "chat";
    data.message = dynamicProps.comment || dynamicProps.message || "";
  } else if (dynamicProps.viewerCount !== undefined || dynamicProps.viewer_count !== undefined) {
    eventType = "viewer_count";
    data.viewer_count = Number(dynamicProps.viewerCount || dynamicProps.viewer_count || 0);
  } else if (dynamicProps.event_type === "subscribe" || dynamicProps.subscribed !== undefined) {
    eventType = "subscribe";
  } else if (dynamicProps.event_type === "share" || dynamicProps.shared !== undefined) {
    eventType = "share";
  } else if (dynamicProps.event_type === "follow" || dynamicProps.followed !== undefined) {
    eventType = "follow";
  } else if (dynamicProps.event_type) {
    // Fallback: use explicit event_type if provided
    eventType = dynamicProps.event_type as TikTokEvent["type"];
  } else {
    // Default to follow if creator state indicates a new follower, otherwise gift
    if (creator.state_label === "follow" || creator.state_label === "followed") {
      eventType = "follow";
    } else {
      // Cannot determine event type
      console.warn("Could not determine event type from EulerStream alert:", JSON.stringify(dynamicProps));
      return null;
    }
  }

  return {
    tiktok_username,
    events: [{ type: eventType, username: viewerUsername, data }],
  };
}
