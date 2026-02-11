import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;

    const body = await req.json();
    const { screen_id, event_type, payload } = body;

    if (!event_type) {
      return new Response(JSON.stringify({ error: "event_type is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user's automations matching this event type
    const { data: automations } = await supabase
      .from("automations")
      .select("*, actions(*)")
      .eq("user_id", userId)
      .eq("trigger_type", event_type)
      .eq("is_active", true)
      .order("priority", { ascending: false });

    // Log the event
    const { data: eventLog } = await supabase.from("events_log").insert({
      user_id: userId,
      screen_id: screen_id || null,
      event_type,
      payload: payload || {},
      triggered_automation_id: automations?.[0]?.id || null,
    }).select().single();

    // If screen_id provided, broadcast to realtime
    if (screen_id) {
      // Broadcast via channel
      const channel = supabase.channel(`screen-${screen_id}`);
      await channel.send({
        type: "broadcast",
        event: "overlay_action",
        payload: {
          event_type,
          payload,
          automations: automations || [],
          event_id: eventLog?.id,
        },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        event_id: eventLog?.id,
        automations_triggered: automations?.length || 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
