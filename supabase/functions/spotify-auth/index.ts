import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_ME_URL = "https://api.spotify.com/v1/me";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SPOTIFY_CLIENT_ID = Deno.env.get("SPOTIFY_CLIENT_ID");
  const SPOTIFY_CLIENT_SECRET = Deno.env.get("SPOTIFY_CLIENT_SECRET");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    return json({ error: "Spotify credentials not configured" }, 500);
  }

  const authHeader = req.headers.get("Authorization");
  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  // ─── Generate auth URL (no auth needed) ───
  if (action === "auth-url") {
    const body = await req.json().catch(() => ({}));
    const redirectUri = body.redirect_uri || "https://tikup.xyz/sounds";
    const scopes = [
      "user-read-playback-state",
      "user-modify-playback-state",
      "user-read-currently-playing",
    ].join(" ");

    // We pass the user's JWT in state so the callback can associate the tokens
    const state = authHeader?.replace("Bearer ", "") || "";

    const authUrl =
      `https://accounts.spotify.com/authorize?` +
      `client_id=${SPOTIFY_CLIENT_ID}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent(scopes)}` +
      `&state=${encodeURIComponent(state)}` +
      `&show_dialog=true`;

    return json({ url: authUrl });
  }

  // ─── Exchange code for tokens ───
  if (action === "callback") {
    const body = await req.json();
    const { code, redirect_uri, state } = body;

    if (!code) return json({ error: "Missing authorization code" }, 400);

    // Exchange code for tokens
    const tokenRes = await fetch(SPOTIFY_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirect_uri || "https://tikup.xyz/sounds",
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error("Spotify token exchange failed:", err);
      return json({ error: "Token exchange failed" }, 400);
    }

    const tokens = await tokenRes.json();
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    // Get Spotify profile
    const profileRes = await fetch(SPOTIFY_ME_URL, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = profileRes.ok ? await profileRes.json() : {};

    // Get user from state (JWT) or auth header
    const jwt = state || authHeader?.replace("Bearer ", "");
    if (!jwt) return json({ error: "No auth token provided" }, 401);

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });

    const { data: claims, error: claimsError } = await supabase.auth.getClaims(jwt);
    if (claimsError || !claims?.claims) return json({ error: "Invalid auth token" }, 401);

    const userId = claims.claims.sub;

    // Use service role to upsert tokens (bypasses RLS)
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { error: upsertError } = await adminClient
      .from("spotify_connections")
      .upsert(
        {
          user_id: userId,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expires_at: expiresAt,
          spotify_email: profile.email || null,
          spotify_display_name: profile.display_name || null,
          spotify_product: profile.product || null,
          is_active: true,
        },
        { onConflict: "user_id" }
      );

    if (upsertError) {
      console.error("Failed to save Spotify tokens:", upsertError);
      return json({ error: "Failed to save connection" }, 500);
    }

    // Also ensure music config exists
    await adminClient
      .from("spotify_music_config")
      .upsert({ user_id: userId }, { onConflict: "user_id", ignoreDuplicates: true });

    return json({
      success: true,
      spotify_email: profile.email,
      spotify_display_name: profile.display_name,
      spotify_product: profile.product,
    });
  }

  // ─── Disconnect ───
  if (action === "disconnect") {
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claims, error } = await supabase.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (error || !claims?.claims) return json({ error: "Unauthorized" }, 401);

    const { error: delError } = await supabase
      .from("spotify_connections")
      .delete()
      .eq("user_id", claims.claims.sub);

    if (delError) return json({ error: "Failed to disconnect" }, 500);
    return json({ success: true });
  }

  // ─── Status ───
  if (action === "status") {
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claims, error } = await supabase.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (error || !claims?.claims) return json({ error: "Unauthorized" }, 401);

    const { data: conn } = await supabase
      .from("spotify_connections")
      .select("spotify_email, spotify_display_name, spotify_product, is_active, token_expires_at")
      .eq("user_id", claims.claims.sub)
      .single();

    return json({ connected: !!conn, connection: conn || null });
  }

  // ─── Refresh token (internal helper) ───
  if (action === "refresh") {
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claims, error } = await supabase.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (error || !claims?.claims) return json({ error: "Unauthorized" }, 401);

    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { data: conn } = await adminClient
      .from("spotify_connections")
      .select("refresh_token")
      .eq("user_id", claims.claims.sub)
      .single();

    if (!conn) return json({ error: "No Spotify connection" }, 404);

    const tokenRes = await fetch(SPOTIFY_TOKEN_URL, {
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

    if (!tokenRes.ok) return json({ error: "Token refresh failed" }, 400);

    const tokens = await tokenRes.json();
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    await adminClient
      .from("spotify_connections")
      .update({
        access_token: tokens.access_token,
        token_expires_at: expiresAt,
        ...(tokens.refresh_token ? { refresh_token: tokens.refresh_token } : {}),
      })
      .eq("user_id", claims.claims.sub);

    return json({ success: true });
  }

  return json({ error: "Unknown action" }, 400);
});
