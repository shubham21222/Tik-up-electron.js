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
    const stats = await fetchLiveStats(uniqueId, apiKey);

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

async function fetchLiveStats(
  uniqueId: string,
  apiKey: string
): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    let resolved = false;

    // 8s max wait
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

          // Log first few message types for debugging
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

            // Various field name patterns for stats
            collected.viewer_count = Number(ri.totalViewers || ri.viewerCount || ri.viewer_count || ri.liveRoomStats?.totalUser || collected.viewer_count) || 0;
            collected.like_count = Number(ri.likeCount || ri.like_count || ri.totalLikes || ri.liveRoomStats?.likeCount || collected.like_count) || 0;
            collected.share_count = Number(ri.shareCount || ri.share_count || ri.totalShares || collected.share_count) || 0;
            collected.diamond_count = Number(ri.diamondCount || ri.diamond_count || ri.totalDiamonds || collected.diamond_count) || 0;
            collected.follower_count = Number(ri.followerCount || ri.follower_count || collected.follower_count) || 0;

            // Also check nested liveRoomStats
            if (ri.liveRoomStats) {
              const s = ri.liveRoomStats;
              if (s.totalUser) collected.viewer_count = Number(s.totalUser);
              if (s.likeCount) collected.like_count = Number(s.likeCount);
              if (s.shareCount) collected.share_count = Number(s.shareCount);
              if (s.diamondCount) collected.diamond_count = Number(s.diamondCount);
            }

            console.log(`roomInfo parsed: viewers=${collected.viewer_count}, likes=${collected.like_count}, shares=${collected.share_count}, diamonds=${collected.diamond_count}`);
            console.log(`roomInfo raw keys: ${JSON.stringify(Object.keys(ri).slice(0, 20))}`);
          }

          // tiktok.connect confirms live
          if (msgType === "tiktok.connect") {
            collected.is_live = true;
          }

          // WebcastRoomUserSeqMessage — viewer counts
          if (msgType === "WebcastRoomUserSeqMessage") {
            collected.is_live = true;
            if (data.viewerCount !== undefined) collected.viewer_count = Number(data.viewerCount);
            if (data.total !== undefined) collected.viewer_count = Number(data.total);
          }

          // Like messages
          if (msgType === "WebcastLikeMessage") {
            if (data.totalLikeCount !== undefined) collected.like_count = Number(data.totalLikeCount);
            if (data.likeCount !== undefined && !data.totalLikeCount) collected.like_count = Number(data.likeCount);
          }

          // Social/share messages
          if (msgType === "WebcastSocialMessage") {
            collected.share_count += 1;
          }

          // Gift messages — accumulate diamond value
          if (msgType === "WebcastGiftMessage") {
            const diamondValue = Number(data.diamondCount || data.diamond_count || 0);
            if (diamondValue > 0) collected.diamond_count += diamondValue;
          }

          // Member join (follow-like)
          if (msgType === "WebcastMemberMessage") {
            // Not exactly follower count, but indicates engagement
          }

          // Fallback: any data with viewerCount
          if (data.viewerCount !== undefined && collected.viewer_count === 0) {
            collected.is_live = true;
            collected.viewer_count = Number(data.viewerCount);
          }
        }

        // Once we have roomInfo, wait 3.5s more to accumulate live event messages
        if (collected.is_live && !resolveTimer) {
          resolveTimer = setTimeout(() => {
            if (!resolved) {
              resolved = true;
              clearTimeout(timeout);
              try { ws.close(); } catch (_) { /* ignore */ }
              console.log(`Final stats: viewers=${collected.viewer_count}, likes=${collected.like_count}, shares=${collected.share_count}, diamonds=${collected.diamond_count}`);
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
