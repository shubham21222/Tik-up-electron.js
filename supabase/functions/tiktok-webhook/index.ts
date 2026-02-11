import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
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

    // Look up the user by TikTok username
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("tiktok_username", tiktok_username)
      .eq("tiktok_connected", true)
      .maybeSingle();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: "No connected user found for this username" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = profile.user_id;

    // Get user's active overlay widgets to broadcast events
    const { data: widgets } = await supabase
      .from("overlay_widgets")
      .select("public_token, widget_type")
      .eq("user_id", userId)
      .eq("is_active", true);

    // Process each event
    for (const event of events) {
      // Log the event
      await supabase.from("events_log").insert({
        user_id: userId,
        event_type: event.type,
        payload: event.data,
      });

      // Broadcast to relevant overlay channels
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
    }

    return new Response(JSON.stringify({ success: true, processed: events.length }), {
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
      if (widgetType === "gift_alert") {
        return { event: "new_alert", payload: event.data };
      }
      break;
    case "like":
      if (widgetType === "like_alert" || widgetType === "like_counter") {
        return { event: "like_update", payload: event.data };
      }
      break;
    case "follow":
      if (widgetType === "follow_alert" || widgetType === "follower_goal") {
        return { event: widgetType === "follow_alert" ? "new_alert" : "follower_update", payload: event.data };
      }
      break;
    case "share":
      if (widgetType === "share_alert") {
        return { event: "new_alert", payload: event.data };
      }
      break;
    case "chat":
      if (widgetType === "chat_box") {
        return { event: "new_message", payload: event.data };
      }
      break;
    case "viewer_count":
      if (widgetType === "viewer_count") {
        return { event: "viewer_update", payload: event.data };
      }
      break;
  }
  return null;
}
