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
      .select("tiktok_username, tiktok_connected, tiktok_connected_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile?.tiktok_username || !profile?.tiktok_connected) {
      return new Response(
        JSON.stringify({ error: "TikTok not connected", is_live: false }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const uniqueId = profile.tiktok_username;
    // Use connection timestamp to scope gift counting to the current session only
    const connectedAt = (profile as Record<string, unknown>).tiktok_connected_at as string | null;

    // Fetch WebSocket stats, DB coins, and session followers in parallel
    const [wsStats, dbCoins, dbFollowers] = await Promise.all([
      fetchLiveStats(uniqueId, apiKey),
      fetchAccumulatedCoins(adminClient, user.id, connectedAt),
      fetchSessionFollowers(adminClient, user.id, connectedAt),
    ]);

    const stats = { ...wsStats } as Record<string, unknown>;
    delete stats._gift_events;

    // Use DB accumulated coins as the gift/coin count
    const wsCoins = Number(stats.diamond_count) || 0;
    const finalCoins = Math.max(wsCoins, dbCoins);
    stats.diamond_count = finalCoins;

    // Follower count: use API total followers as main, session follows separate
    stats.session_followers = dbFollowers;

    console.log(`Coin sources: WS=${wsCoins}, DB=${dbCoins}, final=${finalCoins}, sessionFollowers=${dbFollowers}`);

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

/** Query events_log for gift events and sum coin values */
async function fetchAccumulatedCoins(
  adminClient: ReturnType<typeof createClient>,
  userId: string,
  connectedAt: string | null
): Promise<number> {
  try {
    // Only count gifts since the user connected this TikTok username (current session)
    const since = connectedAt || new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
    console.log(`Counting gifts since: ${since}`);
    const { data: giftEvents, error } = await adminClient
      .from("events_log")
      .select("payload")
      .eq("user_id", userId)
      .eq("event_type", "gift")
      .gte("created_at", since);

    if (error || !giftEvents) return 0;

    let totalCoins = 0;
    for (const event of giftEvents) {
      const payload = event.payload as Record<string, unknown> | null;
      if (!payload) continue;
      // total_coins is already pre-calculated (coinValue × repeatCount) in the webhook
      const totalCoinsField = Number(payload.total_coins || 0);
      if (totalCoinsField > 0) {
        totalCoins += totalCoinsField;
      } else {
        // Fallback: use coinValue or diamondCount directly (NOT multiplied by repeatCount again)
        const coins = Number(
          payload.coinValue || payload.coin_value ||
          payload.diamondCount || payload.diamond_count || 0
        );
        totalCoins += coins;
      }
    }

    console.log(`DB coins: ${totalCoins} from ${giftEvents.length} gift events`);
    return totalCoins;
  } catch (e) {
    console.error("Failed to fetch accumulated coins:", e);
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

            // Log full roomInfo keys to debug available fields
            console.log(`roomInfo keys: ${Object.keys(ri).join(', ')}`);
            if (ri.owner) console.log(`roomInfo.owner keys: ${Object.keys(ri.owner).join(', ')}`);

            if (ri.id) collected.room_id = String(ri.id);
            if (ri.title) collected.title = ri.title;
            if (ri.startTime) collected.start_time = Number(ri.startTime);
            collected.viewer_count = Number(ri.currentViewers || ri.viewerCount || collected.viewer_count) || 0;
            collected.like_count = Number(ri.likeCount || ri.totalLikes || collected.like_count) || 0;
            collected.share_count = Number(ri.shareCount || ri.totalShares || collected.share_count) || 0;
            // Try multiple field paths for follower count
            const ownerFollowers = ri.owner?.followerCount || ri.owner?.fan_count || ri.owner?.followCount || 0;
            collected.follower_count = Number(ri.followerCount || ri.fanCount || ri.fan_count || ownerFollowers || collected.follower_count) || 0;

            if (ri.liveRoomStats) {
              const s = ri.liveRoomStats;
              // Don't use totalUser for viewer count — it's cumulative, not current
              if (s.likeCount) collected.like_count = Number(s.likeCount);
              if (s.shareCount) collected.share_count = Number(s.shareCount);
            }

            console.log(`roomInfo: viewers=${collected.viewer_count}, likes=${collected.like_count}`);
          }

          if (msgType === "tiktok.connect") collected.is_live = true;

          if (msgType === "WebcastRoomUserSeqMessage") {
            collected.is_live = true;
            // Skip viewer count from this message — it's often inflated vs TikTok's real count
            // Rely on roomInfo.currentViewers instead
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

          // Only use viewerCount from roomInfo messages, not other message types
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

/** Count follow events from events_log for the current session */
async function fetchSessionFollowers(
  adminClient: ReturnType<typeof createClient>,
  userId: string,
  connectedAt: string | null
): Promise<number> {
  try {
    const since = connectedAt || new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
    const { count, error } = await adminClient
      .from("events_log")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("event_type", "follow")
      .gte("created_at", since);

    if (error) return 0;
    return count || 0;
  } catch (e) {
    console.error("Failed to fetch session followers:", e);
    return 0;
  }
}
