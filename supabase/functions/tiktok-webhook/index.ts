import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    console.error(`Broadcast failed for ${channel}: ${resText}`);
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
  const avatarUrl = (eventData.profilePictureUrl as string) || (eventData.avatar_url as string) || null;

  switch (eventType) {
    case "gift": {
      const coinValue = Number(eventData.diamondCount || eventData.coinValue || eventData.coin_value || 1);
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
      // Likes don't have a dedicated points rule in points_config, give 0.1 per like
      pointsEarned = likeCount * 0.1;
      break;
    }
    case "share": {
      if (pointsConfig?.points_per_share_enabled) {
        pointsEarned = Number(pointsConfig.points_per_share || 3);
      }
      break;
    }
    case "chat": {
      messagesInc = 1;
      if (pointsConfig?.points_per_chat_minute_enabled) {
        pointsEarned = Number(pointsConfig.points_per_chat_minute || 0.5);
      }
      break;
    }
    case "follow": {
      // Follow gives a flat bonus
      pointsEarned = 5;
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

    // ── Detect EulerStream native alert webhook format ──
    let tiktok_username: string;
    let events: TikTokEvent[];

    if (body.alert && body.creator) {
      // Validate HMAC signature if present
      if (webhookSignature) {
        const valid = await validateWebhookSignature(rawBody, webhookSignature);
        if (!valid) {
          console.error("❌ Invalid webhook signature");
          return new Response(JSON.stringify({ error: "Invalid signature" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        console.log("✅ Webhook signature validated");
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
            console.log(`📡 ${statusEvent} for @${creatorUsername}`);

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
      console.log(`📡 EulerStream alert received for @${tiktok_username}: ${events.map(e => e.type).join(", ")}`);
    } else {
      // Bridge format: { tiktok_username, events: [...] }
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
    ] = await Promise.all([
      supabase.from("overlay_widgets").select("public_token, widget_type").eq("user_id", userId).eq("is_active", true),
      supabase.from("user_gift_triggers").select("*").eq("user_id", userId).eq("is_enabled", true),
      supabase.from("tts_settings").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("automations").select("*, actions(*)").eq("user_id", userId).eq("is_active", true).order("priority", { ascending: false }),
      supabase.from("moderation_config").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("banned_words").select("*").eq("user_id", userId),
      supabase.from("banned_users").select("*").eq("user_id", userId),
      supabase.from("points_config").select("*").eq("user_id", userId).maybeSingle(),
    ]);

    let ttsTriggered = 0;
    let modBlocked = 0;
    let pointsUpdated = 0;

    for (const event of events) {
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

      // Log the event
      await supabase.from("events_log").insert({
        user_id: userId,
        event_type: event.type,
        payload: event.data,
        triggered_automation_id: matchingAuto?.id || null,
      });

      // Broadcast to overlay widgets via REST API
      if (widgets) {
        let triggerOverrides: Record<string, unknown> = {};
        if (event.type === "gift" && giftTriggers) {
          const giftName = ((event.data.giftName as string) || "").toLowerCase().replace(/\s+/g, "_");
          const giftId = (event.data.giftId as string) || giftName;
          const matchedTrigger = giftTriggers.find(
            (t: any) => t.gift_id === giftId || t.gift_id === giftName
          );
          if (matchedTrigger) {
            triggerOverrides = {
              animation_effect: matchedTrigger.animation_effect,
              alert_sound_url: matchedTrigger.alert_sound_url,
              priority: matchedTrigger.priority,
              combo_threshold: matchedTrigger.combo_threshold,
            };

            const cc = matchedTrigger.custom_config as any;
            if (cc?.keystrokes || cc?.keystroke) {
              await broadcast(`keystroke_agent_${userId}`, "fire_keystroke", {
                gift_id: giftId,
                gift_name: event.data.giftName,
                username: event.username,
                ...event.data,
              });
            }
          }
        }

        for (const widget of widgets) {
          const channelName = `${widgetChannelName(widget.widget_type)}-${widget.public_token}`;
          const broadcastEvent = mapEventToOverlay(event, widget.widget_type);
          if (broadcastEvent) {
            const enrichedPayload = { ...broadcastEvent.payload, ...triggerOverrides };
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

      // ── TTS triggering with moderation ──
      if (ttsSettings?.enabled && event.type === "chat") {
        const message = (event.data.message as string) || "";
        const minChars = ttsSettings.min_chars || 3;
        const maxLength = ttsSettings.max_length || 200;

        if (message.length >= minChars) {
          const ttsModResult = moderateMessage(
            message, event.username,
            bannedWords || [], bannedUsers || [],
            modConfig, "tts"
          );

          if (!ttsModResult.blocked) {
            const textForTts = ttsModResult.filteredMessage || message;
            const truncated = textForTts.slice(0, maxLength);
            const ttsWidgets = widgets?.filter(w => w.widget_type === "tts") || [];

            for (const ttsWidget of ttsWidgets) {
              await supabase.from("tts_queue").insert({
                user_id: userId,
                overlay_token: ttsWidget.public_token,
                text_content: truncated,
                username: event.username,
                voice_id: ttsSettings.voice_id || "default",
                status: "completed",
                processed_at: new Date().toISOString(),
              });

              await broadcast(`tts-${ttsWidget.public_token}`, "play_tts", {
                username: event.username,
                text: truncated,
                volume: ttsSettings.volume || 80,
                speed: ttsSettings.speed || 50,
                pitch: ttsSettings.pitch || 50,
                interrupt: ttsSettings.interrupt_mode || false,
              });

              ttsTriggered++;
            }
          } else {
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
  const data: Record<string, unknown> = { avatar: avatarUrl };

  if (dynamicProps.giftName || dynamicProps.gift_name || dynamicProps.giftId || dynamicProps.gift_id) {
    eventType = "gift";
    data.gift_name = dynamicProps.giftName || dynamicProps.gift_name || "Gift";
    data.gift_id = dynamicProps.giftId || dynamicProps.gift_id || "";
    data.diamond_count = Number(dynamicProps.diamondCount || dynamicProps.diamond_count || dynamicProps.diamonds || 0);
    data.repeat_count = Number(dynamicProps.repeatCount || dynamicProps.repeat_count || 1);
    data.total_diamonds = Number(data.diamond_count) * Number(data.repeat_count);
    data.repeat_end = dynamicProps.repeatEnd ?? dynamicProps.repeat_end ?? true;
    data.coin_value = data.diamond_count;
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
