/**
 * ─── Points Config & Leaderboard API ────────────────────────────────────────
 *
 * Manages the configurable points weights and provides leaderboard access.
 *
 * ENDPOINTS (via query params):
 *   GET  /points-api                              → Get points config
 *   PUT  /points-api                              → Update points config
 *   GET  /points-api?leaderboard=true             → Leaderboard sorted by points
 *   GET  /points-api?history=true&viewer={name}   → Points history for a viewer
 *   PUT  /points-api?reset_user={viewer_id}       → Reset a viewer's points
 *
 * POINTS CALCULATION FORMULA:
 *   total_points = (coins × {COIN_POINT_WEIGHT})
 *                + (messages × {MESSAGE_POINT_WEIGHT})
 *                + (likes × {LIKE_POINT_WEIGHT})
 *                + (follows × {FOLLOW_POINT_WEIGHT})
 *                + (shares × {SHARE_POINT_WEIGHT})
 *
 * CONFIG RESPONSE EXAMPLE:
 * {
 *   "coins": { "weight": 1, "enabled": true },
 *   "message": { "weight": 0.5, "enabled": false },
 *   "like": { "weight": 0.1, "enabled": true },
 *   "follow": { "weight": 5, "enabled": true },
 *   "share": { "weight": 3, "enabled": false },
 *   "level_base_points": 100,
 *   "level_multiplier": 1.5,
 *   "currency_name": "Points"
 * }
 *
 * LEADERBOARD RESPONSE EXAMPLE:
 * {
 *   "leaderboard": [
 *     { "rank": 1, "username": "TopFan", "points_total": 2450, "level": 8, ... },
 *     { "rank": 2, "username": "GiftKing", "points_total": 1800, "level": 6, ... }
 *   ]
 * }
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
    // ── Auth ─────────────────────────────────────────────────────────
    const authHeader = req.headers.get("authorization") || "";
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await sb.auth.getUser();
    if (authErr || !user) return json({ error: "Unauthorized" }, 401);

    const url = new URL(req.url);
    const isLeaderboard = url.searchParams.get("leaderboard") === "true";
    const isHistory = url.searchParams.get("history") === "true";
    const resetUserId = url.searchParams.get("reset_user");
    const viewer = url.searchParams.get("viewer") || "";

    // ── PUT: Reset a specific viewer's points ───────────────────────
    if (req.method === "PUT" && resetUserId) {
      // Service-role client for writing history
      const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

      const { data: existing } = await sb
        .from("viewer_points")
        .select("total_points, viewer_username")
        .eq("id", resetUserId)
        .eq("creator_id", user.id)
        .maybeSingle();

      if (!existing) return json({ error: "Viewer not found" }, 404);

      // Log the reset in history
      await admin.from("points_history").insert({
        creator_id: user.id,
        viewer_username: existing.viewer_username,
        event_type: "reset",
        points_delta: -Number(existing.total_points),
        points_after: 0,
        event_detail: { reason: "manual_reset" },
      });

      await sb.from("viewer_points").update({
        total_points: 0, level: 1, points_toward_level: 0,
        total_gifts_sent: 0, total_coins_sent: 0,
        total_likes: 0, total_messages: 0,
      }).eq("id", resetUserId).eq("creator_id", user.id);

      return json({ success: true, message: `Points reset for ${existing.viewer_username}` });
    }

    // ── PUT: Update points config ───────────────────────────────────
    if (req.method === "PUT") {
      const body = await req.json();

      const updates: Record<string, unknown> = {};
      if (body.coins?.weight !== undefined) updates.points_per_coin = body.coins.weight;
      if (body.coins?.enabled !== undefined) updates.points_per_coin_enabled = body.coins.enabled;
      if (body.message?.weight !== undefined) updates.points_per_chat_minute = body.message.weight;
      if (body.message?.enabled !== undefined) updates.points_per_chat_minute_enabled = body.message.enabled;
      if (body.like?.weight !== undefined) updates.points_per_like = body.like.weight;
      if (body.like?.enabled !== undefined) updates.points_per_like_enabled = body.like.enabled;
      if (body.follow?.weight !== undefined) updates.points_per_follow = body.follow.weight;
      if (body.follow?.enabled !== undefined) updates.points_per_follow_enabled = body.follow.enabled;
      if (body.share?.weight !== undefined) updates.points_per_share = body.share.weight;
      if (body.share?.enabled !== undefined) updates.points_per_share_enabled = body.share.enabled;
      if (body.level_base_points !== undefined) updates.level_base_points = body.level_base_points;
      if (body.level_multiplier !== undefined) updates.level_multiplier = body.level_multiplier;
      if (body.currency_name !== undefined) updates.currency_name = body.currency_name;
      if (body.subscriber_bonus_ratio !== undefined) updates.subscriber_bonus_ratio = body.subscriber_bonus_ratio;

      if (Object.keys(updates).length === 0) {
        return json({ error: "No valid fields to update" }, 400);
      }

      // Upsert: create if not exists
      const { data: existing } = await sb
        .from("points_config")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        const { error } = await sb.from("points_config").update(updates).eq("user_id", user.id);
        if (error) return json({ error: error.message }, 400);
      } else {
        const { error } = await sb.from("points_config").insert({ user_id: user.id, ...updates });
        if (error) return json({ error: error.message }, 400);
      }

      return json({ success: true, message: "Points config updated" });
    }

    // ── GET: Points history for a viewer ────────────────────────────
    if (req.method === "GET" && isHistory) {
      const limit = Math.min(Number(url.searchParams.get("limit") || 50), 200);
      let query = sb
        .from("points_history")
        .select("*")
        .eq("creator_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (viewer) {
        query = query.eq("viewer_username", viewer);
      }

      const { data, error } = await query;
      if (error) return json({ error: error.message }, 400);

      return json({
        history: (data || []).map((h: Record<string, unknown>) => ({
          id: h.id,
          viewer: h.viewer_username,
          event_type: h.event_type,
          points_delta: Number(h.points_delta),
          points_after: Number(h.points_after),
          detail: h.event_detail,
          timestamp: h.created_at,
        })),
      });
    }

    // ── GET: Leaderboard ────────────────────────────────────────────
    if (req.method === "GET" && isLeaderboard) {
      const limit = Math.min(Number(url.searchParams.get("limit") || 25), 100);
      const sort = url.searchParams.get("sort") || "total_points";
      const validSorts = ["total_points", "total_coins_sent", "total_gifts_sent", "total_likes", "total_messages", "level"];

      const { data, error } = await sb
        .from("viewer_points")
        .select("*")
        .eq("creator_id", user.id)
        .order(validSorts.includes(sort) ? sort : "total_points", { ascending: false })
        .limit(limit);

      if (error) return json({ error: error.message }, 400);

      return json({
        leaderboard: (data || []).map((row: Record<string, unknown>, i: number) => ({
          rank: i + 1,
          username: row.viewer_username,
          avatar_url: row.viewer_avatar_url,
          points_total: Number(row.total_points),
          level: Number(row.level),
          coins_sent: Number(row.total_coins_sent),
          gifts: Number(row.total_gifts_sent),
          likes: Number(row.total_likes),
          messages: Number(row.total_messages),
          first_activity: row.first_activity,
          last_activity: row.last_activity,
        })),
      });
    }

    // ── GET: Current points config ──────────────────────────────────
    if (req.method === "GET") {
      const { data } = await sb
        .from("points_config")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      // Return defaults if no config exists yet
      const config = data || {};

      return json({
        coins:   { weight: Number(config.points_per_coin ?? 1),           enabled: config.points_per_coin_enabled ?? true },
        message: { weight: Number(config.points_per_chat_minute ?? 0.5),  enabled: config.points_per_chat_minute_enabled ?? false },
        like:    { weight: Number(config.points_per_like ?? 0.1),         enabled: config.points_per_like_enabled ?? true },
        follow:  { weight: Number(config.points_per_follow ?? 5),         enabled: config.points_per_follow_enabled ?? true },
        share:   { weight: Number(config.points_per_share ?? 3),          enabled: config.points_per_share_enabled ?? false },
        level_base_points: Number(config.level_base_points ?? 100),
        level_multiplier: Number(config.level_multiplier ?? 1.5),
        currency_name: config.currency_name ?? "Points",
        subscriber_bonus_ratio: Number(config.subscriber_bonus_ratio ?? 0),
      });
    }

    return json({ error: "Method not allowed" }, 405);
  } catch (err) {
    console.error("points-api error:", err);
    return json({ error: err instanceof Error ? err.message : "Internal error" }, 500);
  }
});
