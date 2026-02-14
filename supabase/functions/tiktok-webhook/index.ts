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

/** Broadcast via Realtime REST API — reliably reaches WebSocket subscribers */
async function broadcast(channel: string, event: string, payload: Record<string, unknown>) {
  const url = `${Deno.env.get("SUPABASE_URL")!}/realtime/v1/api/broadcast`;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  // Try both topic formats to ensure delivery
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

    // Get overlay widgets
    const { data: widgets } = await supabase
      .from("overlay_widgets")
      .select("public_token, widget_type")
      .eq("user_id", userId)
      .eq("is_active", true);

    // Get user gift triggers
    const { data: giftTriggers } = await supabase
      .from("user_gift_triggers")
      .select("*")
      .eq("user_id", userId)
      .eq("is_enabled", true);

    // Get TTS settings
    const { data: ttsSettings } = await supabase
      .from("tts_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    // Get automations
    const { data: automations } = await supabase
      .from("automations")
      .select("*, actions(*)")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("priority", { ascending: false });

    let ttsTriggered = 0;

    for (const event of events) {
      const matchingAuto = automations?.find(a => a.trigger_type === event.type);

      // Log the event
      await supabase.from("events_log").insert({
        user_id: userId,
        event_type: event.type,
        payload: event.data,
        triggered_automation_id: matchingAuto?.id || null,
      });

      // Broadcast to overlay widgets via REST API
      if (widgets) {
        // Check if this gift event has a custom trigger config
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

            // Broadcast to keystroke agent channel if keystroke config exists
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

      // TTS triggering for chat events
      if (ttsSettings?.enabled && event.type === "chat") {
        const message = (event.data.message as string) || "";
        const minChars = ttsSettings.min_chars || 3;
        const maxLength = ttsSettings.max_length || 200;
        const blacklist: string[] = ttsSettings.blacklist_words || [];

        if (message.length >= minChars) {
          const lowerMsg = message.toLowerCase();
          const isBlocked = blacklist.some((w: string) => lowerMsg.includes(w.toLowerCase()));

          if (!isBlocked) {
            const truncated = message.slice(0, maxLength);
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
          }
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      processed: events.length,
      tts_triggered: ttsTriggered,
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
  // Ticker gets all event types
  if (widgetType === "ticker") return { event: "ticker_event", payload: { ...payloadWithUser, event_type: event.type } };
  return null;
}
