/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Live Session Diamond Tracking API
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Tracks diamonds earned during the CURRENT live stream session only.
 * Totals reset automatically when a new session starts.
 *
 * ENDPOINTS:
 *   POST /live-session-api?action=start     → Start a new live session
 *   POST /live-session-api?action=end       → End current session
 *   GET  /live-session-api?action=session    → Current session total + per-user breakdown
 *   GET  /live-session-api?action=users      → Per-user diamond leaderboard
 *   GET  /live-session-api?action=user&username=X → Single user detail
 *   GET  /live-session-api?action=stats      → Dashboard-style summary
 *
 * REALTIME:
 *   Gifts broadcast to channel `session_gifts_{user_id}` with event `gift_received`:
 *   {
 *     "type": "gift_received",
 *     "sender": "Username",
 *     "sender_avatar": "https://...",
 *     "gift_name": "Rose",
 *     "diamonds": 1,
 *     "session_total": 98765
 *   }
 *
 * SESSION LIFECYCLE:
 *   1. Session auto-starts on first gift if none active (or via POST ?action=start)
 *   2. Session ends via POST ?action=end or webhook "creator_offline" event
 *   3. All diamond counters reset to 0 for the new session
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── Auth ──────────────────────────────────────────────────────
    const authHeader = req.headers.get("authorization") || "";
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: authErr } = await sb.auth.getUser();
    if (authErr || !user) return json({ error: "Unauthorized" }, 401);

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "session";

    // ═══════════════════════════════════════════════════════════════
    // POST: Start a new live session
    // ═══════════════════════════════════════════════════════════════
    if (req.method === "POST" && action === "start") {
      // End any existing active sessions first
      await sb.from("live_sessions")
        .update({ is_active: false, ended_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("is_active", true);

      const body = await req.json().catch(() => ({}));

      const { data: session, error } = await sb.from("live_sessions").insert({
        user_id: user.id,
        room_id: body.room_id || null,
        is_active: true,
        total_diamonds: 0,
        total_gifts: 0,
        unique_gifters: 0,
      }).select().single();

      if (error) return json({ error: error.message }, 400);

      return json({
        session_id: session.id,
        started_at: session.started_at,
        message: "New live session started. Diamond counters reset to 0.",
      });
    }

    // ═══════════════════════════════════════════════════════════════
    // POST: End current session
    // ═══════════════════════════════════════════════════════════════
    if (req.method === "POST" && action === "end") {
      const { data: session } = await sb.from("live_sessions")
        .select("id, total_diamonds, total_gifts, unique_gifters, started_at")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (!session) return json({ error: "No active session" }, 404);

      await sb.from("live_sessions").update({
        is_active: false,
        ended_at: new Date().toISOString(),
      }).eq("id", session.id);

      return json({
        session_id: session.id,
        started_at: session.started_at,
        ended_at: new Date().toISOString(),
        total_diamonds: Number(session.total_diamonds),
        total_gifts: session.total_gifts,
        unique_gifters: session.unique_gifters,
        message: "Session ended.",
      });
    }

    // ═══════════════════════════════════════════════════════════════
    // GET /api/live/session — Current session total + per-user breakdown
    // ═══════════════════════════════════════════════════════════════
    if (req.method === "GET" && action === "session") {
      const { data: session } = await sb.from("live_sessions")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (!session) {
        return json({
          active: false,
          total_diamonds: 0,
          total_gifts: 0,
          unique_gifters: 0,
          users: [],
          message: "No active session. Start one with POST ?action=start",
        });
      }

      // Fetch per-user breakdown sorted by diamonds
      const { data: userTotals } = await sb.from("session_user_totals")
        .select("*")
        .eq("session_id", session.id)
        .order("total_diamonds", { ascending: false })
        .limit(100);

      return json({
        active: true,
        session_id: session.id,
        started_at: session.started_at,
        total_diamonds: Number(session.total_diamonds),
        total_gifts: session.total_gifts,
        unique_gifters: session.unique_gifters,
        users: (userTotals || []).map((u, i) => ({
          rank: i + 1,
          username: u.sender_username,
          avatar_url: u.sender_avatar_url,
          total_diamonds: Number(u.total_diamonds),
          total_gifts: u.total_gifts,
          last_gift_at: u.last_gift_at,
        })),
      });
    }

    // ═══════════════════════════════════════════════════════════════
    // GET /api/live/session/users — Per-user diamond leaderboard
    // ═══════════════════════════════════════════════════════════════
    if (req.method === "GET" && action === "users") {
      const { data: session } = await sb.from("live_sessions")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (!session) return json({ users: [], message: "No active session" });

      const limit = Math.min(Number(url.searchParams.get("limit") || 50), 200);
      const { data: users } = await sb.from("session_user_totals")
        .select("*")
        .eq("session_id", session.id)
        .order("total_diamonds", { ascending: false })
        .limit(limit);

      return json({
        session_id: session.id,
        users: (users || []).map((u, i) => ({
          rank: i + 1,
          username: u.sender_username,
          avatar_url: u.sender_avatar_url,
          total_diamonds: Number(u.total_diamonds),
          total_gifts: u.total_gifts,
          last_gift_at: u.last_gift_at,
        })),
      });
    }

    // ═══════════════════════════════════════════════════════════════
    // GET /api/live/session/{user} — Single user detail
    // ═══════════════════════════════════════════════════════════════
    if (req.method === "GET" && action === "user") {
      const username = url.searchParams.get("username");
      if (!username) return json({ error: "username param required" }, 400);

      const { data: session } = await sb.from("live_sessions")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (!session) return json({ error: "No active session" }, 404);

      // Get user totals
      const { data: userTotal } = await sb.from("session_user_totals")
        .select("*")
        .eq("session_id", session.id)
        .eq("sender_username", username)
        .maybeSingle();

      if (!userTotal) return json({ error: "User not found in session" }, 404);

      // Get individual gift history
      const { data: gifts } = await sb.from("session_gifts")
        .select("gift_name, gift_id, diamond_value, repeat_count, total_diamonds, created_at")
        .eq("session_id", session.id)
        .eq("sender_username", username)
        .order("created_at", { ascending: false })
        .limit(50);

      return json({
        username: userTotal.sender_username,
        avatar_url: userTotal.sender_avatar_url,
        total_diamonds: Number(userTotal.total_diamonds),
        total_gifts: userTotal.total_gifts,
        last_gift_at: userTotal.last_gift_at,
        gift_history: (gifts || []).map(g => ({
          gift_name: g.gift_name,
          gift_id: g.gift_id,
          diamonds: g.diamond_value,
          repeat_count: g.repeat_count,
          total_diamonds: g.total_diamonds,
          timestamp: g.created_at,
        })),
      });
    }

    // ═══════════════════════════════════════════════════════════════
    // GET /api/live/stats — Dashboard-style summary
    // Matches the UI format: { viewer_count, likes, followers, gifts }
    // ═══════════════════════════════════════════════════════════════
    if (req.method === "GET" && action === "stats") {
      const { data: session } = await sb.from("live_sessions")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      return json({
        viewer_count: 0, // populated by live WebSocket connection
        likes: 0,        // populated by live WebSocket connection
        followers: 0,    // populated by live WebSocket connection
        gifts: session ? Number(session.total_diamonds) : 0,
        session_active: !!session,
        session_id: session?.id || null,
        total_gifts_count: session?.total_gifts || 0,
        unique_gifters: session?.unique_gifters || 0,
      });
    }

    return json({ error: "Unknown action. Use: session, users, user, stats, start, end" }, 400);
  } catch (err) {
    console.error("live-session-api error:", err);
    return json({ error: err instanceof Error ? err.message : "Internal error" }, 500);
  }
});
