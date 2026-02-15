import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface DiscordEmbed {
  title: string;
  description: string;
  color: number;
  thumbnail?: { url: string };
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: { text: string };
  timestamp?: string;
}

const EVENT_ICONS: Record<string, string> = {
  go_live: "🔴",
  gift: "🎁",
  follow: "👤",
  milestone: "🏆",
};

function hexToDecimal(hex: string): number {
  return parseInt(hex.replace("#", ""), 16);
}

function buildEmbed(eventType: string, payload: Record<string, any>, color: string): DiscordEmbed {
  const c = hexToDecimal(color || "00E676");
  const icon = EVENT_ICONS[eventType] || "📢";

  switch (eventType) {
    case "go_live":
      return {
        title: `${icon} Stream is LIVE!`,
        description: payload.username
          ? `**${payload.username}** just went live on TikTok!`
          : "Your TikTok stream is now live!",
        color: c,
        fields: payload.room_id
          ? [{ name: "Room", value: payload.room_id, inline: true }]
          : [],
        timestamp: new Date().toISOString(),
      };

    case "gift":
      return {
        title: `${icon} Gift Received!`,
        description: `**${payload.sender || "Someone"}** sent **${payload.gift_name || "a gift"}**`,
        color: c,
        fields: [
          { name: "💎 Diamonds", value: String(payload.diamond_value || 0), inline: true },
          { name: "🔁 Count", value: String(payload.repeat_count || 1), inline: true },
          ...(payload.total_diamonds
            ? [{ name: "📊 Session Total", value: `${payload.total_diamonds} 💎`, inline: true }]
            : []),
        ],
        thumbnail: payload.gift_image ? { url: payload.gift_image } : undefined,
        timestamp: new Date().toISOString(),
      };

    case "follow":
      return {
        title: `${icon} New Follower!`,
        description: `**${payload.username || "Someone"}** just followed!`,
        color: c,
        fields: payload.total_followers
          ? [{ name: "Total Followers", value: String(payload.total_followers), inline: true }]
          : [],
        timestamp: new Date().toISOString(),
      };

    case "milestone":
      return {
        title: `${icon} Milestone Reached!`,
        description: payload.message || "A milestone was reached!",
        color: c,
        fields: [
          { name: "Type", value: payload.milestone_type || "Unknown", inline: true },
          { name: "Value", value: String(payload.value || 0), inline: true },
        ],
        timestamp: new Date().toISOString(),
      };

    default:
      return {
        title: `${icon} Event`,
        description: payload.message || "An event occurred.",
        color: c,
        timestamp: new Date().toISOString(),
      };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { user_id, event_type, payload } = await req.json();

    if (!user_id || !event_type) {
      return new Response(JSON.stringify({ error: "user_id and event_type required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch all enabled integrations for this user
    const { data: integrations, error } = await supabase
      .from("integrations")
      .select("*")
      .eq("user_id", user_id)
      .eq("is_enabled", true)
      .eq("provider", "discord");

    if (error) {
      console.error("DB error:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch integrations" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!integrations || integrations.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "No active Discord webhooks" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sent = 0;

    for (const integration of integrations) {
      // Check event type filters
      if (event_type === "go_live" && !integration.notify_go_live) continue;
      if (event_type === "gift" && !integration.notify_gifts) continue;
      if (event_type === "gift" && payload?.diamond_value < integration.notify_gift_min_coins) continue;
      if (event_type === "follow" && !integration.notify_follows) continue;
      if (event_type === "milestone" && !integration.notify_milestones) continue;

      if (!integration.webhook_url || !integration.webhook_url.startsWith("https://discord.com/api/webhooks/")) {
        continue;
      }

      const embed = buildEmbed(event_type, payload || {}, integration.embed_color);

      try {
        const res = await fetch(integration.webhook_url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "TikUp",
            avatar_url: "https://tik-pro-suite.lovable.app/favicon.ico",
            embeds: [embed],
          }),
        });

        if (res.ok) {
          sent++;
          // Update last triggered
          await supabase
            .from("integrations")
            .update({ last_triggered_at: new Date().toISOString() })
            .eq("id", integration.id);
        } else {
          console.error(`Discord webhook failed [${res.status}]:`, await res.text());
        }
      } catch (err) {
        console.error("Webhook send error:", err);
      }
    }

    return new Response(JSON.stringify({ sent, total: integrations.length }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Discord webhook function error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
