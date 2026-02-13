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

    // Fetch diamond map, WebSocket stats, and DB diamonds in parallel
    const [diamondMap, wsStats, dbDiamonds] = await Promise.all([
      fetchDiamondMap(apiKey),
      fetchLiveStats(uniqueId, apiKey),
      fetchAccumulatedDiamonds(adminClient, user.id),
    ]);

    // Calculate diamonds from WebSocket gift events using the diamond map
    const stats = { ...wsStats } as Record<string, unknown>;
    const wsGifts = (stats._gift_events as Array<{ name: string; count: number }>) || [];
    let wsDiamonds = 0;
    for (const gift of wsGifts) {
      const value = diamondMap[gift.name] || 0;
      wsDiamonds += value * gift.count;
    }
    delete stats._gift_events;

    // Use the highest diamond count from all sources
    const finalDiamonds = Math.max(wsDiamonds, dbDiamonds, Number(stats.diamond_count) || 0);
    stats.diamond_count = finalDiamonds;

    console.log(`Diamond sources: WS=${wsDiamonds}, DB=${dbDiamonds}, final=${finalDiamonds}`);

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

/** Fetch gift name → diamond value map from EulerStream API */
async function fetchDiamondMap(apiKey: string): Promise<Record<string, number>> {
  try {
    const res = await fetch(
      "https://tiktok.eulerstream.com/webcast/gift_info?client=ttlive-other",
      { headers: { "x-api-key": apiKey } }
    );
    if (!res.ok) {
      console.error(`gift_info API error: ${res.status}`);
      return {};
    }
    const json = await res.json();
    const gifts = json.data || [];
    const map: Record<string, number> = {};
    for (const gift of gifts) {
      if (gift.name && gift.diamond !== undefined) {
        map[gift.name.toLowerCase()] = Number(gift.diamond);
      }
    }
    console.log(`Loaded ${Object.keys(map).length} gift diamond values`);
    return map;
  } catch (e) {
    console.error("Failed to fetch diamond map:", e);
    return {};
  }
}

/** Query events_log for gift events and sum diamonds using total_diamonds field */
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
      // Prefer total_diamonds (pre-calculated by bridge v2.1)
      const total = Number(payload.total_diamonds || 0);
      if (total > 0) {
        totalDiamonds += total;
      } else {
        // Fallback: diamond_count × repeat_count
        const diamondCount = Number(payload.diamond_count || payload.diamondCount || 0);
        const repeatCount = Number(payload.repeat_count || payload.repeatCount || 1);
        totalDiamonds += diamondCount * repeatCount;
      }
    }

    console.log(`DB diamonds: ${totalDiamonds} from ${giftEvents.length} gift events`);
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
        resolve(collected.is_live ? { ...collected, _gift_events: giftEvents } : { is_live: false, username: uniqueId, _gift_events: [] });
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

    // Collect gift events for diamond calculation with the lookup map
    const giftEvents: Array<{ name: string; count: number }> = [];

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
            console.log(`MSG type: ${msgType}`);
          }

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
            collected.follower_count = Number(ri.followerCount || collected.follower_count) || 0;

            if (ri.liveRoomStats) {
              const s = ri.liveRoomStats;
              if (s.totalUser) collected.viewer_count = Number(s.totalUser);
              if (s.likeCount) collected.like_count = Number(s.likeCount);
              if (s.shareCount) collected.share_count = Number(s.shareCount);
            }

            console.log(`roomInfo: viewers=${collected.viewer_count}, likes=${collected.like_count}`);
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

          // Collect gift events — diamond calculation happens after with the lookup map
          if (msgType === "WebcastGiftMessage") {
            const giftName = (data.giftName || data.gift_name || "unknown").toLowerCase();
            const repeatCount = Number(data.repeatCount || data.repeat_count || 1);
            giftEvents.push({ name: giftName, count: repeatCount });
            console.log(`Gift captured: ${giftName} x${repeatCount}`);
          }

          if (data.viewerCount !== undefined && collected.viewer_count === 0) {
            collected.is_live = true;
            collected.viewer_count = Number(data.viewerCount);
          }
        }

        if (collected.is_live && !resolveTimer) {
          resolveTimer = setTimeout(() => {
            if (!resolved) {
              resolved = true;
              clearTimeout(timeout);
              try { ws.close(); } catch (_) { /* ignore */ }
              console.log(`Final WS: viewers=${collected.viewer_count}, likes=${collected.like_count}, gifts=${giftEvents.length}`);
              resolve({ ...collected, _gift_events: giftEvents });
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
        resolve({ is_live: false, username: uniqueId, _gift_events: [] });
      }
    };

    ws.onclose = () => {
      clearTimeout(timeout);
      if (resolveTimer) clearTimeout(resolveTimer);
      if (!resolved) {
        resolved = true;
        resolve(collected.is_live ? { ...collected, _gift_events: giftEvents } : { is_live: false, username: uniqueId, _gift_events: [] });
      }
    };
  });
}
