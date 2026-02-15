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
    const apiKey = Deno.env.get("TIKTOK_DATA_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "TikTok API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Auth: get user from token
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

    // Parse query params
    const url = new URL(req.url);
    const region = url.searchParams.get("region") || "GB";
    const rankType = url.searchParams.get("rank_type") || "DAILY_RANK";

    const apiUrl = `https://tiktok.eulerstream.com/webcast/rankings?region=${encodeURIComponent(region)}&rank_type=${encodeURIComponent(rankType)}&apiKey=${encodeURIComponent(apiKey)}`;

    const cookieHeader = Deno.env.get("TIKTOK_COOKIE_HEADER");
    const headers: Record<string, string> = {};
    if (cookieHeader) {
      headers["x-cookie-header"] = cookieHeader;
    }

    const response = await fetch(apiUrl, { headers });

    if (!response.ok) {
      const text = await response.text();
      console.error("Rankings API error:", response.status, text);
      return new Response(
        JSON.stringify({ error: `Rankings API returned ${response.status}`, ranks: [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    // Extract ranks from the response structure
    const ranks = data?.response?.ranks || [];
    const simplified = ranks.slice(0, 20).map((r: any) => ({
      rank: r.rank,
      diamonds: r.diamonds,
      diamonds_description: r.diamonds_description,
      nickname: r.user?.nickname || "Unknown",
      unique_id: r.user?.unique_id || "",
      avatar: r.user?.avatar_thumb?.[0] || "",
    }));

    return new Response(
      JSON.stringify({
        ranks: simplified,
        rank_type: rankType,
        region,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Rankings error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch rankings", ranks: [] }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
