import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface TikTokEvent {
  type: "gift" | "like" | "follow" | "share" | "chat" | "viewer_count" | "subscribe";
  username: string;
  data: Record<string, unknown>;
}

interface ModerationResult {
  blocked: boolean;
  reason?: string;
  triggeredWord?: string;
  action?: string; // "blocked" | "replaced" | "warned"
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
  // 1. Check banned users
  const bannedUser = bannedUsers.find(
    (u: any) => u.username.toLowerCase() === username.toLowerCase()
  );
  if (bannedUser) {
    if (context === "chat" && bannedUser.block_chat) {
      return { blocked: true, reason: "banned_user", action: "blocked" };
    }
    if (context === "tts" && bannedUser.block_tts) {
      return { blocked: true, reason: "banned_user", action: "blocked" };
    }
  }

  if (!modConfig) return { blocked: false };

  // 2. Block links
  if (modConfig.block_links && /https?:\/\/|www\./i.test(message)) {
    if (modConfig.allow_subscriber_links) {
      // Can't verify subscriber status here, so allow through
    } else {
      return { blocked: true, reason: "link", action: "blocked" };
    }
  }

  // 3. Caps filter (>80% uppercase, min 5 chars)
  if (modConfig.caps_filter && message.length >= 5) {
    const upperCount = (message.match(/[A-Z]/g) || []).length;
    const letterCount = (message.match(/[a-zA-Z]/g) || []).length;
    if (letterCount > 0 && upperCount / letterCount > 0.8) {
      return { blocked: true, reason: "caps", action: "blocked" };
    }
  }

  // 4. Emoji-only filter
  if (modConfig.emoji_only_filter) {
    const withoutEmoji = message.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "").trim();
    if (withoutEmoji.length === 0 && message.length > 0) {
      return { blocked: true, reason: "emoji_only", action: "blocked" };
    }
  }

  // 5. Banned words check
  if (modConfig.block_banned_words && bannedWords.length > 0) {
    const normalized = normalizeText(message);
    const words = message.toLowerCase();

    for (const bw of bannedWords) {
      // Skip if word doesn't apply to this context
      if (context === "chat" && !bw.apply_to_chat) continue;
      if (context === "tts" && !bw.apply_to_tts) continue;

      const term = bw.word.toLowerCase();
      const normalizedTerm = normalizeText(bw.word);

      // Check both raw and normalized versions (word boundary aware)
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
        // Default: block
        return { blocked: true, reason: "banned_word", triggeredWord: bw.word, action: "blocked" };
      }
    }
  }

  return { blocked: false };
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Check if a user is banned from alerts */
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const { tiktok_username, events } = body as {
      tiktok_username: string;
      events: TikTokEvent[];
    };

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
    ] = await Promise.all([
      supabase.from("overlay_widgets").select("public_token, widget_type").eq("user_id", userId).eq("is_active", true),
      supabase.from("user_gift_triggers").select("*").eq("user_id", userId).eq("is_enabled", true),
      supabase.from("tts_settings").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("automations").select("*, actions(*)").eq("user_id", userId).eq("is_active", true).order("priority", { ascending: false }),
      supabase.from("moderation_config").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("banned_words").select("*").eq("user_id", userId),
      supabase.from("banned_users").select("*").eq("user_id", userId),
    ]);

    let ttsTriggered = 0;
    let modBlocked = 0;

    for (const event of events) {
      const matchingAuto = automations?.find(a => a.trigger_type === event.type);

      // ── MODERATION: Check banned users for alert-type events ──
      if (["gift", "like", "follow", "share"].includes(event.type)) {
        if (isUserBannedFromAlerts(event.username, bannedUsers || [])) {
          // Log the moderation hit
          await supabase.from("moderation_log").insert({
            user_id: userId,
            username: event.username,
            original_message: `[${event.type} event blocked]`,
            filter_type: "banned_user",
            action_taken: "blocked",
          });
          modBlocked++;
          continue; // Skip this event entirely
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
          // Log moderation hit
          await supabase.from("moderation_log").insert({
            user_id: userId,
            username: event.username,
            original_message: message,
            filter_type: chatModResult.reason || "unknown",
            action_taken: chatModResult.action || "blocked",
            triggered_word: chatModResult.triggeredWord || null,
          });
          modBlocked++;
          continue; // Don't process this chat event at all
        }

        // If message was replaced, update event data for downstream
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

        // If warned, log but still allow through
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
          const channelName = `${widget.widget_type}-${widget.public_token}`;
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
          // Run TTS-specific moderation (checks apply_to_tts flag)
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
            // Log TTS-specific block if not already logged by chat filter
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

function mapEventToOverlay(event: TikTokEvent, widgetType: string) {
  const payloadWithUser = { ...event.data, user: event.username };
  switch (event.type) {
    case "gift":
      if (widgetType === "gift_alert") return { event: "new_alert", payload: payloadWithUser };
      if (widgetType === "gift_combo") return { event: "combo_update", payload: payloadWithUser };
      break;
    case "like":
      if (widgetType === "like_alert" || widgetType === "like_counter")
        return { event: "like_update", payload: payloadWithUser };
      break;
    case "follow":
      if (widgetType === "follow_alert" || widgetType === "follower_goal")
        return { event: widgetType === "follow_alert" ? "new_alert" : "follower_update", payload: payloadWithUser };
      if (widgetType === "ticker") return { event: "ticker_event", payload: { ...payloadWithUser, event_type: "follow" } };
      break;
    case "share":
      if (widgetType === "share_alert") return { event: "new_alert", payload: payloadWithUser };
      if (widgetType === "ticker") return { event: "ticker_event", payload: { ...payloadWithUser, event_type: "share" } };
      break;
    case "chat":
      if (widgetType === "chat_box") return { event: "new_message", payload: payloadWithUser };
      break;
    case "viewer_count":
      if (widgetType === "viewer_count") return { event: "viewer_update", payload: payloadWithUser };
      break;
  }
  if (widgetType === "ticker") return { event: "ticker_event", payload: { ...payloadWithUser, event_type: event.type } };
  return null;
}
