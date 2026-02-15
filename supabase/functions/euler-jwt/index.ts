import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const EULER_BASE = "https://tiktok.eulerstream.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("TIKTOK_DATA_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "TikTok Data API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Authenticate user
    const authHeader = req.headers.get("authorization") || "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user's TikTok username
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: profile } = await adminClient
      .from("profiles")
      .select("tiktok_username, tiktok_connected")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile?.tiktok_username || !profile?.tiktok_connected) {
      return new Response(
        JSON.stringify({ error: "TikTok not connected" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const uniqueId = profile.tiktok_username;

    // Step 1: Get account info to find account ID
    const accountRes = await fetch(`${EULER_BASE}/accounts/retrieve`, {
      headers: { "x-api-key": apiKey },
    });

    if (!accountRes.ok) {
      console.error(`Account retrieve failed: ${accountRes.status}`);
      // Fallback: return wsUrl with apiKey for backend proxy approach
      return new Response(
        JSON.stringify({
          uniqueId,
          wsUrl: `wss://ws.eulerstream.com?uniqueId=${encodeURIComponent(uniqueId)}&apiKey=${encodeURIComponent(apiKey)}`,
          mode: "direct",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const accountData = await accountRes.json();
    const accountId = accountData.account?.id;

    if (!accountId) {
      console.error("No account ID found in response:", JSON.stringify(accountData));
      return new Response(
        JSON.stringify({
          uniqueId,
          wsUrl: `wss://ws.eulerstream.com?uniqueId=${encodeURIComponent(uniqueId)}&apiKey=${encodeURIComponent(apiKey)}`,
          mode: "direct",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Create JWT for this user's TikTok connection
    const jwtRes = await fetch(`${EULER_BASE}/authentication/${accountId}/jwt`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        expireAfter: 300, // 5 minutes
        websockets: {
          allowedCreators: [uniqueId],
          maxWebSockets: 1,
        },
      }),
    });

    if (!jwtRes.ok) {
      const errText = await jwtRes.text();
      console.error(`JWT creation failed: ${jwtRes.status} ${errText}`);
      // Fallback to direct API key mode
      return new Response(
        JSON.stringify({
          uniqueId,
          wsUrl: `wss://ws.eulerstream.com?uniqueId=${encodeURIComponent(uniqueId)}&apiKey=${encodeURIComponent(apiKey)}`,
          mode: "direct",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const jwtData = await jwtRes.json();
    const token = jwtData.token;

    if (!token) {
      console.error("No token in JWT response:", JSON.stringify(jwtData));
      return new Response(
        JSON.stringify({
          uniqueId,
          wsUrl: `wss://ws.eulerstream.com?uniqueId=${encodeURIComponent(uniqueId)}&apiKey=${encodeURIComponent(apiKey)}`,
          mode: "direct",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        uniqueId,
        wsUrl: `wss://ws.eulerstream.com?uniqueId=${encodeURIComponent(uniqueId)}&jwtKey=${encodeURIComponent(token)}`,
        mode: "jwt",
        expiresIn: 300,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("euler-jwt error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create connection token" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
