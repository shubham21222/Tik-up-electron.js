import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const apiKey = Deno.env.get("TIKTOK_DATA_API_KEY");

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "TikTok Data API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authHeader = req.headers.get("authorization") || "";
    const supabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceKey);
    const { data: profile } = await adminClient
      .from("profiles")
      .select("tiktok_username, tiktok_connected")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile?.tiktok_username || !profile?.tiktok_connected) {
      return new Response(
        JSON.stringify({ error: "TikTok not connected", is_live: false }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const uniqueId = profile.tiktok_username;

    // Fetch WebSocket stats and DB-accumulated diamonds in parallel
    const [wsStats, dbDiamonds] = await Promise.all([
      fetchLiveStats(uniqueId, apiKey),
      fetchAccumulatedDiamonds(adminClient, user.id),
    ]);

    // Merge: use DB diamonds if WebSocket didn't capture any
    const stats = { ...wsStats } as Record<string, unknown>;
    if (dbDiamonds > 0 && (Number(stats.diamond_count) || 0) === 0) {
      stats.diamond_count = dbDiamonds;
    }
    // Always prefer DB diamonds if they're higher (more accurate over time)
    if (dbDiamonds > (Number(stats.diamond_count) || 0)) {
      stats.diamond_count = dbDiamonds;
    }

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Live stats error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch live stats", is_live: false }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * Query events_log for gift events and sum up diamond_count from payloads.
 * Only counts events from the last 12 hours (approximate stream session).
 */
async function fetchAccumulatedDiamonds(
  adminClient: ReturnType<typeof createClient>,
  userId: string
): Promise<number> {
  try {
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
    const { data: giftEvents, error } = await adminClient
      .from("events_log")
      .select("payload")
      .eq("user_id", userId)
      .eq("event_type", "gift")
      .gte("created_at", twelveHoursAgo);

    if (error || !giftEvents) return 0;

    let totalDiamonds = 0;
    for (const event of giftEvents) {
      const payload = event.payload as Record<string, unknown> | null;
      if (!payload) continue;
      const diamondCount = Number(payload.diamond_count || payload.diamondCount || 0);
      const repeatCount = Number(payload.repeat_count || payload.repeatCount || 1);
      // diamond_count from bridge is per-gift diamond value
      // For repeat gifts, multiply diamond value × repeat count
      if (diamondCount > 0) {
        totalDiamonds += diamondCount * repeatCount;
      }
    }

    console.log(`DB accumulated diamonds for user: ${totalDiamonds} from ${giftEvents.length} gift events`);
    return totalDiamonds;
  } catch (e) {
    console.error("Failed to fetch accumulated diamonds:", e);
    return 0;
  }
}

async function fetchLiveStats(
  uniqueId: string,
  apiKey: string
): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    let resolved = false;

    const timeout = setTimeout(() => {
      try { ws.close(); } catch (_) { /* ignore */ }
      if (!resolved) {
        resolved = true;
        resolve(collected.is_live ? collected : { is_live: false, username: uniqueId });
      }
    }, 8000);

    const wsUrl = `wss://ws.eulerstream.com?uniqueId=${encodeURIComponent(uniqueId)}&apiKey=${encodeURIComponent(apiKey)}`;
    const ws = new WebSocket(wsUrl);

    const collected = {
      is_live: false,
      username: uniqueId,
      viewer_count: 0,
      like_count: 0,
      share_count: 0,
      follower_count: 0,
      diamond_count: 0,
      room_id: "",
      title: "",
      start_time: 0,
    };

    let gotRoomInfo = false;
    let resolveTimer: ReturnType<typeof setTimeout> | null = null;

    ws.onopen = () => {
      console.log(`WebSocket connected for @${uniqueId}`);
    };

    ws.onmessage = (event) => {
      try {
        const raw = JSON.parse(typeof event.data === "string" ? event.data : "{}");
        const messages = raw.messages || [raw];

        for (const msg of messages) {
          const msgType = msg.type || msg.event || "";
          const data = msg.data || msg;

          if (!gotRoomInfo) {
            console.log(`MSG type: ${msgType}, keys: ${Object.keys(data).slice(0, 8).join(",")}`);
          }

          // roomInfo — first message from EulerStream WebSocket
          if (msgType === "roomInfo" || data.roomInfo) {
            const ri = data.roomInfo || data;
            gotRoomInfo = true;
            collected.is_live = true;

            if (ri.id) collected.room_id = String(ri.id);
            if (ri.title) collected.title = ri.title;
            if (ri.startTime) collected.start_time = Number(ri.startTime);

            collected.viewer_count = Number(ri.totalViewers || ri.viewerCount || ri.currentViewers || collected.viewer_count) || 0;
            collected.like_count = Number(ri.likeCount || ri.totalLikes || collected.like_count) || 0;
            collected.share_count = Number(ri.shareCount || ri.totalShares || collected.share_count) || 0;
            collected.diamond_count = Number(ri.diamondCount || ri.totalDiamonds || collected.diamond_count) || 0;
            collected.follower_count = Number(ri.followerCount || collected.follower_count) || 0;

            if (ri.liveRoomStats) {
              const s = ri.liveRoomStats;
              if (s.totalUser) collected.viewer_count = Number(s.totalUser);
              if (s.likeCount) collected.like_count = Number(s.likeCount);
              if (s.shareCount) collected.share_count = Number(s.shareCount);
              if (s.diamondCount) collected.diamond_count = Number(s.diamondCount);
            }

            console.log(`roomInfo: viewers=${collected.viewer_count}, likes=${collected.like_count}, diamonds=${collected.diamond_count}`);
          }

          if (msgType === "tiktok.connect") collected.is_live = true;

          if (msgType === "WebcastRoomUserSeqMessage") {
            collected.is_live = true;
            if (data.viewerCount !== undefined) collected.viewer_count = Number(data.viewerCount);
            if (data.total !== undefined) collected.viewer_count = Number(data.total);
          }

          if (msgType === "WebcastLikeMessage") {
            if (data.totalLikeCount !== undefined) collected.like_count = Number(data.totalLikeCount);
            else if (data.likeCount !== undefined) collected.like_count = Number(data.likeCount);
          }

          if (msgType === "WebcastSocialMessage") {
            collected.share_count += 1;
          }

          // Gift messages — accumulate diamond value × repeat count
          if (msgType === "WebcastGiftMessage") {
            const diamondValue = Number(data.diamondCount || data.diamond_count || 0);
            const repeatCount = Number(data.repeatCount || data.repeat_count || 1);
            if (diamondValue > 0) {
              collected.diamond_count += diamondValue * repeatCount;
              console.log(`Gift: ${data.giftName || 'unknown'} x${repeatCount} = ${diamondValue * repeatCount} diamonds`);
            }
          }

          if (data.viewerCount !== undefined && collected.viewer_count === 0) {
            collected.is_live = true;
            collected.viewer_count = Number(data.viewerCount);
          }
        }

        // Once live, wait 3.5s to accumulate event messages
        if (collected.is_live && !resolveTimer) {
          resolveTimer = setTimeout(() => {
            if (!resolved) {
              resolved = true;
              clearTimeout(timeout);
              try { ws.close(); } catch (_) { /* ignore */ }
              console.log(`Final WS stats: viewers=${collected.viewer_count}, likes=${collected.like_count}, diamonds=${collected.diamond_count}`);
              resolve(collected);
            }
          }, 3500);
        }
      } catch (e) {
        console.error("WS parse error:", e);
      }
    };

    ws.onerror = () => {
      clearTimeout(timeout);
      if (resolveTimer) clearTimeout(resolveTimer);
      if (!resolved) {
        resolved = true;
        resolve({ is_live: false, username: uniqueId });
      }
    };

    ws.onclose = () => {
      clearTimeout(timeout);
      if (resolveTimer) clearTimeout(resolveTimer);
      if (!resolved) {
        resolved = true;
        resolve(collected.is_live ? collected : { is_live: false, username: uniqueId });
      }
    };
  });
}
