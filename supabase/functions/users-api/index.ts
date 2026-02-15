/**
 * ─── Users REST API ─────────────────────────────────────────────────────────
 *
 * Powers the dashboard with viewer engagement data from the viewer_points table.
 *
 * ENDPOINTS:
 *   GET  /users-api                        → List all viewers (paginated)
 *   GET  /users-api?id={viewer_id}         → Single viewer detail
 *   GET  /users-api?leaderboard=true       → Top viewers sorted by points
 *   PUT  /users-api?id={viewer_id}&reset=1 → Reset a viewer's points
 *
 * AUTH: All endpoints require a valid JWT. Data is scoped to the
 *       authenticated creator's viewers (creator_id = auth.uid()).
 *
 * EXAMPLE RESPONSE (single user):
 * {
 *   "username": "User123",
 *   "points_total": 987,
 *   "level": 5,
 *   "coins_sent": 400,
 *   "gifts": 12,
 *   "likes": 34,
 *   "messages": 56,
 *   "first_activity": "2026-02-15T13:00:00Z",
 *   "last_activity": "2026-02-15T15:20:00Z"
 * }
 *
 * SECRETS REQUIRED:
 *   {ENTERPRISE_API_KEY}  → SUPABASE_SERVICE_ROLE_KEY (auto-provisioned)
 *   {WEBHOOK_SECRET}      → EULER_ALERT_WEB_KEY (set in Cloud secrets)
 *   {EULER_ACCOUNT_ID}    → Embedded in EulerStream OAuth client config
 *
 * POINTS CALCULATION:
 *   - 1 coin gifted = points_per_coin (default 1) points
 *   - 1 message     = points_per_chat_minute (configurable in points_config)
 *   - 1 like        = 0.1 points (hardcoded, high-volume event)
 *   - 1 follow      = 5 points (flat bonus)
 *   - 1 share       = points_per_share (configurable in points_config)
 *   All weights are stored in the points_config table per creator.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/** Standard JSON response helper */
function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/** Map a raw viewer_points row to the public API shape */
function formatViewer(row: Record<string, unknown>, rank?: number) {
  return {
    id: row.id,
    username: row.viewer_username,
    avatar_url: row.viewer_avatar_url,
    points_total: Number(row.total_points),
    level: Number(row.level),
    points_toward_level: Number(row.points_toward_level),
    coins_sent: Number(row.total_coins_sent),
    gifts: Number(row.total_gifts_sent),
    likes: Number(row.total_likes),
    messages: Number(row.total_messages),
    first_activity: row.first_activity,
    last_activity: row.last_activity,
    ...(rank !== undefined ? { rank } : {}),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── Auth: require valid JWT ──────────────────────────────────────
    const authHeader = req.headers.get("authorization") || "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const sb = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await sb.auth.getUser();
    if (authErr || !user) {
      return json({ error: "Unauthorized" }, 401);
    }

    const url = new URL(req.url);
    const viewerId = url.searchParams.get("id");
    const isLeaderboard = url.searchParams.get("leaderboard") === "true";
    const isReset = url.searchParams.get("reset") === "1";
    const limit = Math.min(Number(url.searchParams.get("limit") || 100), 500);
    const offset = Number(url.searchParams.get("offset") || 0);
    const search = url.searchParams.get("search") || "";

    // ── PUT: Reset a viewer's points ────────────────────────────────
    if (req.method === "PUT" && viewerId && isReset) {
      const { error } = await sb
        .from("viewer_points")
        .update({
          total_points: 0,
          level: 1,
          points_toward_level: 0,
          total_gifts_sent: 0,
          total_coins_sent: 0,
          total_likes: 0,
          total_messages: 0,
        })
        .eq("id", viewerId)
        .eq("creator_id", user.id);

      if (error) return json({ error: error.message }, 400);
      return json({ success: true, message: "Points reset" });
    }

    // ── GET: Single viewer by ID ────────────────────────────────────
    if (req.method === "GET" && viewerId && !isLeaderboard) {
      const { data, error } = await sb
        .from("viewer_points")
        .select("*")
        .eq("id", viewerId)
        .eq("creator_id", user.id)
        .maybeSingle();

      if (error) return json({ error: error.message }, 400);
      if (!data) return json({ error: "Viewer not found" }, 404);
      return json(formatViewer(data));
    }

    // ── GET: Leaderboard (top viewers by points) ────────────────────
    if (req.method === "GET" && isLeaderboard) {
      const sortBy = url.searchParams.get("sort") || "total_points";
      const validSorts = ["total_points", "total_coins_sent", "total_gifts_sent", "total_likes", "total_messages", "level"];
      const col = validSorts.includes(sortBy) ? sortBy : "total_points";

      let query = sb
        .from("viewer_points")
        .select("*")
        .eq("creator_id", user.id)
        .order(col, { ascending: false })
        .range(offset, offset + limit - 1);

      if (search) {
        query = query.ilike("viewer_username", `%${search}%`);
      }

      const { data, error, count } = await query;
      if (error) return json({ error: error.message }, 400);

      const viewers = (data || []).map((row: Record<string, unknown>, i: number) =>
        formatViewer(row, offset + i + 1)
      );

      return json({
        leaderboard: viewers,
        pagination: { limit, offset, total: count ?? viewers.length },
      });
    }

    // ── GET: List all viewers (paginated) ───────────────────────────
    if (req.method === "GET") {
      const sortBy = url.searchParams.get("sort") || "last_activity";
      const sortAsc = url.searchParams.get("order") === "asc";

      let query = sb
        .from("viewer_points")
        .select("*", { count: "exact" })
        .eq("creator_id", user.id)
        .order(sortBy, { ascending: sortAsc })
        .range(offset, offset + limit - 1);

      if (search) {
        query = query.ilike("viewer_username", `%${search}%`);
      }

      const { data, error, count } = await query;
      if (error) return json({ error: error.message }, 400);

      return json({
        users: (data || []).map((row: Record<string, unknown>) => formatViewer(row)),
        pagination: { limit, offset, total: count ?? 0 },
      });
    }

    return json({ error: "Method not allowed" }, 405);
  } catch (err) {
    console.error("users-api error:", err);
    return json({ error: err instanceof Error ? err.message : "Internal error" }, 500);
  }
});
