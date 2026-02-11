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

    // Get TTS settings (available to all users)
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
      // Find matching automation
      const matchingAuto = automations?.find(a => a.trigger_type === event.type);

      // Log the event
      await supabase.from("events_log").insert({
        user_id: userId,
        event_type: event.type,
        payload: event.data,
        triggered_automation_id: matchingAuto?.id || null,
      });

      // Broadcast to overlay widgets
      if (widgets) {
        for (const widget of widgets) {
          const channelName = `${widget.widget_type}-${widget.public_token}`;
          const broadcastEvent = mapEventToOverlay(event, widget.widget_type);
          if (broadcastEvent) {
            await supabase.channel(channelName).send({
              type: "broadcast",
              event: broadcastEvent.event,
              payload: broadcastEvent.payload,
            });
          }
        }
      }

      // Broadcast to screen-based overlays (automations)
      if (matchingAuto?.screen_id) {
        await supabase.channel(`screen-${matchingAuto.screen_id}`).send({
          type: "broadcast",
          event: "overlay_action",
          payload: {
            event_type: event.type,
            payload: event.data,
            automations: matchingAuto ? [matchingAuto] : [],
          },
        });
      }

      // TTS triggering for chat events — browser-based (no ElevenLabs needed)
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

            // Find TTS overlay widgets
            const ttsWidgets = widgets?.filter(w => w.widget_type === "tts") || [];
            for (const ttsWidget of ttsWidgets) {
              // Log to queue
              await supabase.from("tts_queue").insert({
                user_id: userId,
                overlay_token: ttsWidget.public_token,
                text_content: truncated,
                username: event.username,
                voice_id: ttsSettings.voice_id || "default",
                status: "completed",
                processed_at: new Date().toISOString(),
              });

              // Broadcast text to TTS overlay (browser SpeechSynthesis handles audio)
              await supabase.channel(`tts-${ttsWidget.public_token}`).send({
                type: "broadcast",
                event: "play_tts",
                payload: {
                  username: event.username,
                  text: truncated,
                  volume: ttsSettings.volume || 80,
                  speed: ttsSettings.speed || 50,
                  pitch: ttsSettings.pitch || 50,
                  interrupt: ttsSettings.interrupt_mode || false,
                },
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
  switch (event.type) {
    case "gift":
      if (widgetType === "gift_alert") return { event: "new_alert", payload: event.data };
      break;
    case "like":
      if (widgetType === "like_alert" || widgetType === "like_counter")
        return { event: "like_update", payload: event.data };
      break;
    case "follow":
      if (widgetType === "follow_alert" || widgetType === "follower_goal")
        return { event: widgetType === "follow_alert" ? "new_alert" : "follower_update", payload: event.data };
      break;
    case "share":
      if (widgetType === "share_alert") return { event: "new_alert", payload: event.data };
      break;
    case "chat":
      if (widgetType === "chat_box") return { event: "new_message", payload: event.data };
      break;
    case "viewer_count":
      if (widgetType === "viewer_count") return { event: "viewer_update", payload: event.data };
      break;
  }
  return null;
}
