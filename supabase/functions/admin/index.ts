import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify caller is admin using their JWT
    const authHeader = req.headers.get("Authorization") || "";
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    // Check admin role using service role client
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) throw new Error("Forbidden: admin role required");

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // --- GET ACTIONS ---
    if (req.method === "GET") {
      if (action === "users") {
        // Get all profiles with subscription info
        const { data: profiles } = await adminClient.from("profiles").select("*").order("created_at", { ascending: false });
        const { data: subs } = await adminClient.from("subscriptions").select("*");
        const { data: overlayCount } = await adminClient.from("overlay_widgets").select("user_id");
        
        const subsMap: Record<string, any> = {};
        (subs || []).forEach((s: any) => { subsMap[s.user_id] = s; });
        
        const countMap: Record<string, number> = {};
        (overlayCount || []).forEach((o: any) => { countMap[o.user_id] = (countMap[o.user_id] || 0) + 1; });

        const users = (profiles || []).map((p: any) => ({
          ...p,
          subscription: subsMap[p.user_id] || null,
          overlay_count: countMap[p.user_id] || 0,
        }));

        return new Response(JSON.stringify({ users }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "analytics") {
        const { count: totalUsers } = await adminClient.from("profiles").select("*", { count: "exact", head: true });
        const { count: totalOverlays } = await adminClient.from("overlay_widgets").select("*", { count: "exact", head: true });
        const { count: totalScreens } = await adminClient.from("screens").select("*", { count: "exact", head: true });
        const { count: proUsers } = await adminClient.from("subscriptions").select("*", { count: "exact", head: true }).eq("plan", "pro");
        const { count: totalGoals } = await adminClient.from("goals").select("*", { count: "exact", head: true });
        const { count: totalEvents } = await adminClient.from("events_log").select("*", { count: "exact", head: true });

        // Recent signups (last 7 days)
        const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
        const { count: recentSignups } = await adminClient.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", weekAgo);

        return new Response(JSON.stringify({
          total_users: totalUsers || 0,
          total_overlays: totalOverlays || 0,
          total_screens: totalScreens || 0,
          pro_users: proUsers || 0,
          total_goals: totalGoals || 0,
          total_events: totalEvents || 0,
          recent_signups: recentSignups || 0,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (action === "logs") {
        const limit = parseInt(url.searchParams.get("limit") || "50");
        const { data: events } = await adminClient.from("events_log").select("*").order("created_at", { ascending: false }).limit(limit);
        return new Response(JSON.stringify({ events: events || [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // --- POST ACTIONS ---
    if (req.method === "POST") {
      const body = await req.json();

      if (action === "update_plan") {
        const { user_id, plan } = body;
        if (!user_id || !plan) throw new Error("Missing user_id or plan");

        // Upsert subscription
        const { error } = await adminClient.from("subscriptions").upsert(
          { user_id, plan, status: "active" },
          { onConflict: "user_id" }
        );
        if (error) throw error;

        // Also update profile plan_type
        await adminClient.from("profiles").update({ plan_type: plan }).eq("user_id", user_id);

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "set_role") {
        const { user_id, role } = body;
        if (!user_id || !role) throw new Error("Missing user_id or role");

        const { error } = await adminClient.from("user_roles").upsert(
          { user_id, role },
          { onConflict: "user_id,role" }
        );
        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "remove_role") {
        const { user_id, role } = body;
        if (!user_id || !role) throw new Error("Missing user_id or role");

        await adminClient.from("user_roles").delete().eq("user_id", user_id).eq("role", role);

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = message.includes("Unauthorized") ? 401 : message.includes("Forbidden") ? 403 : 500;
    return new Response(JSON.stringify({ error: message }), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
