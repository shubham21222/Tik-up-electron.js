import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SPOTIFY_API = "https://api.spotify.com/v1";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/** Get a valid Spotify access token, refreshing if expired */
async function getSpotifyToken(userId: string): Promise<string | null> {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const SPOTIFY_CLIENT_ID = Deno.env.get("SPOTIFY_CLIENT_ID")!;
  const SPOTIFY_CLIENT_SECRET = Deno.env.get("SPOTIFY_CLIENT_SECRET")!;

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { data: conn } = await admin
    .from("spotify_connections")
    .select("access_token, refresh_token, token_expires_at")
    .eq("user_id", userId)
    .single();

  if (!conn) return null;

  // Check if token is expired (with 60s buffer)
  const expiresAt = new Date(conn.token_expires_at).getTime();
  if (Date.now() < expiresAt - 60_000) return conn.access_token;

  // Refresh token
  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: conn.refresh_token,
    }),
  });

  if (!res.ok) {
    console.error("Token refresh failed:", await res.text());
    return null;
  }

  const tokens = await res.json();
  const newExpiry = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  await admin
    .from("spotify_connections")
    .update({
      access_token: tokens.access_token,
      token_expires_at: newExpiry,
      ...(tokens.refresh_token ? { refresh_token: tokens.refresh_token } : {}),
    })
    .eq("user_id", userId);

  return tokens.access_token;
}

/** Make a Spotify API request with auto-retry on 401 */
async function spotifyFetch(
  userId: string,
  path: string,
  method = "GET",
  body?: unknown
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const token = await getSpotifyToken(userId);
  if (!token) return { ok: false, status: 401, data: { error: "No Spotify connection or token expired" } };

  const opts: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${SPOTIFY_API}${path}`, opts);

  // For 204 (no content) responses
  if (res.status === 204) return { ok: true, status: 204, data: null };

  const data = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: claims, error: claimsErr } = await supabase.auth.getClaims(authHeader.replace("Bearer ", ""));
  if (claimsErr || !claims?.claims) return json({ error: "Unauthorized" }, 401);

  const userId = claims.claims.sub as string;
  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  try {
    // ─── Now Playing ───
    if (action === "now-playing") {
      const result = await spotifyFetch(userId, "/me/player");
      if (!result.ok && result.status === 401) return json({ error: "Spotify token expired" }, 401);
      return json(result.data || { is_playing: false });
    }

    // ─── Search tracks ───
    if (action === "search") {
      const body = await req.json();
      const query = body.query;
      if (!query || typeof query !== "string" || query.length < 2)
        return json({ error: "Query too short" }, 400);

      const safeQuery = encodeURIComponent(query.slice(0, 100));
      const result = await spotifyFetch(userId, `/search?q=${safeQuery}&type=track&limit=10`);
      if (!result.ok) return json({ error: "Search failed" }, result.status);

      const tracks = (result.data as any)?.tracks?.items?.map((t: any) => ({
        uri: t.uri,
        name: t.name,
        artist: t.artists?.map((a: any) => a.name).join(", "),
        album: t.album?.name,
        image: t.album?.images?.[1]?.url || t.album?.images?.[0]?.url,
        explicit: t.explicit,
        duration_ms: t.duration_ms,
      })) || [];

      return json({ tracks });
    }

    // ─── Add to queue ───
    if (action === "queue") {
      const body = await req.json();
      const { track_uri, requester_username, coins_spent, is_priority } = body;

      if (!track_uri) return json({ error: "Missing track_uri" }, 400);

      const result = await spotifyFetch(userId, `/me/player/queue?uri=${encodeURIComponent(track_uri)}`, "POST");
      if (!result.ok) {
        if (result.status === 404) return json({ error: "No active Spotify device found. Open Spotify first!" }, 404);
        return json({ error: "Failed to add to queue", details: result.data }, result.status);
      }

      // Log the request
      const admin = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      // Get track info
      const trackId = track_uri.split(":").pop();
      const trackResult = await spotifyFetch(userId, `/tracks/${trackId}`);
      const trackData = trackResult.data as any;

      await admin.from("song_requests").insert({
        user_id: userId,
        requester_username: requester_username || "Viewer",
        track_uri,
        track_name: trackData?.name || "Unknown",
        track_artist: trackData?.artists?.map((a: any) => a.name).join(", ") || "Unknown",
        track_image_url: trackData?.album?.images?.[1]?.url || null,
        coins_spent: coins_spent || 0,
        is_priority: is_priority || false,
        status: "queued",
      });

      return json({ success: true, track: trackData?.name });
    }

    // ─── Skip ───
    if (action === "skip") {
      const result = await spotifyFetch(userId, "/me/player/next", "POST");
      if (!result.ok && result.status === 404)
        return json({ error: "No active Spotify device" }, 404);
      return json({ success: result.ok });
    }

    // ─── Pause ───
    if (action === "pause") {
      const result = await spotifyFetch(userId, "/me/player/pause", "PUT");
      return json({ success: result.ok || result.status === 403 }); // 403 = already paused
    }

    // ─── Resume ───
    if (action === "resume") {
      const result = await spotifyFetch(userId, "/me/player/play", "PUT");
      return json({ success: result.ok || result.status === 403 }); // 403 = already playing
    }

    // ─── Volume ───
    if (action === "volume") {
      const body = await req.json();
      const vol = Math.max(0, Math.min(100, Number(body.volume) || 50));
      const result = await spotifyFetch(userId, `/me/player/volume?volume_percent=${vol}`, "PUT");
      return json({ success: result.ok });
    }

    // ─── Devices ───
    if (action === "devices") {
      const result = await spotifyFetch(userId, "/me/player/devices");
      if (!result.ok) return json({ error: "Failed to get devices" }, result.status);
      return json(result.data);
    }

    // ─── Queue list ───
    if (action === "queue-list") {
      const result = await spotifyFetch(userId, "/me/player/queue");
      if (!result.ok) return json({ error: "Failed to get queue" }, result.status);
      
      const data = result.data as any;
      const queue = (data?.queue || []).slice(0, 20).map((t: any) => ({
        uri: t.uri,
        name: t.name,
        artist: t.artists?.map((a: any) => a.name).join(", "),
        image: t.album?.images?.[2]?.url || t.album?.images?.[0]?.url,
        duration_ms: t.duration_ms,
      }));

      return json({
        currently_playing: data?.currently_playing ? {
          uri: data.currently_playing.uri,
          name: data.currently_playing.name,
          artist: data.currently_playing.artists?.map((a: any) => a.name).join(", "),
          image: data.currently_playing.album?.images?.[1]?.url,
          duration_ms: data.currently_playing.duration_ms,
        } : null,
        queue,
      });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (err) {
    console.error("Spotify API error:", err);
    return json({ error: "Internal error" }, 500);
  }
});
