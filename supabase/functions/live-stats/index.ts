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

    // Auth: get user from token
    const authHeader = req.headers.get("authorization") || "";
    const supabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user's tiktok username
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

    // Connect to EulerStream WebSocket briefly to get room info
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
    // 6s max wait — if no events arrive, user is not live
    const timeout = setTimeout(() => {
      try { ws.close(); } catch (_) { /* ignore */ }
      if (!resolved) {
        resolved = true;
        resolve({ is_live: false, username: uniqueId });
      }
    }, 6000);

    const wsUrl = `wss://ws.eulerstream.com?uniqueId=${encodeURIComponent(uniqueId)}&&apiKey=${encodeURIComponent(apiKey)}`;
    const ws = new WebSocket(wsUrl);

    let resolved = false;
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

    ws.onopen = () => {
      console.log(`WebSocket connected for @${uniqueId}`);
    };

    ws.onmessage = (event) => {
      try {
        const raw = JSON.parse(typeof event.data === "string" ? event.data : "{}");

        // Handle messages array format from EulerStream
        const messages = raw.messages || [raw];
        for (const msg of messages) {
          const msgType = msg.type || "";
          const data = msg.data || msg;

          // roomInfo contains all the stats we need
          if (msgType === "roomInfo" && data.roomInfo) {
            const ri = data.roomInfo;
            collected.is_live = ri.isLive === true || ri.status === 2;
            if (ri.id) collected.room_id = String(ri.id);
            if (ri.title) collected.title = ri.title;
            if (ri.startTime) collected.start_time = Number(ri.startTime);
            if (ri.totalViewers !== undefined) collected.viewer_count = Number(ri.totalViewers);
            if (ri.likeCount !== undefined) collected.like_count = Number(ri.likeCount);
            if (ri.shareCount !== undefined) collected.share_count = Number(ri.shareCount);
            if (ri.diamondCount !== undefined) collected.diamond_count = Number(ri.diamondCount);
          }

          // WebcastRoomUserSeqMessage has viewer & like counts
          if (msgType === "WebcastRoomUserSeqMessage") {
            collected.is_live = true;
            if (data.viewerCount !== undefined) collected.viewer_count = Number(data.viewerCount);
            if (data.total !== undefined) collected.viewer_count = Number(data.total);
          }

          // WebcastLikeMessage accumulates likes
          if (msgType === "WebcastLikeMessage" && data.totalLikeCount !== undefined) {
            collected.like_count = Number(data.totalLikeCount);
          }

          // tiktok.connect confirms we're connected to a live room
          if (msgType === "tiktok.connect") {
            collected.is_live = true;
          }

          // WebcastRoomUserSeqMessage has viewer count
          if (msgType === "WebcastRoomUserSeqMessage" && data.viewerCount !== undefined) {
            collected.is_live = true;
            collected.viewer_count = data.viewerCount;
          }

          // Fallback: check data directly
          if (data.viewerCount !== undefined && !collected.viewer_count) {
            collected.is_live = true;
            collected.viewer_count = data.viewerCount;
          }
        }

        // Once we have roomInfo, wait 1.5s more then resolve
        if (collected.is_live && !resolved) {
          resolved = true;
          setTimeout(() => {
            clearTimeout(timeout);
            try { ws.close(); } catch (_) { /* ignore */ }
            resolve(collected);
          }, 1500);
        }
      } catch (e) {
        console.error("WS parse error:", e);
      }
    };

    ws.onerror = () => {
      clearTimeout(timeout);
      if (!resolved) {
        resolved = true;
        resolve({ is_live: false, username: uniqueId });
      }
    };

    ws.onclose = () => {
      clearTimeout(timeout);
      if (!resolved) {
        resolved = true;
        resolve(collected.is_live ? collected : { is_live: false, username: uniqueId });
      }
    };
  });
}
