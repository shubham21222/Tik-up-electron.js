import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function parseRankingsFromHtml(html: string): any[] {
  const ranks: any[] = [];

  // Match the "Last day" archive section items
  // Pattern: <a href="...tiknode.com/profile/USERNAME" class="main-premium-list-item">
  //   rank, avatar img, nickname, dollar amount
  const itemRegex = /<a\s+href="https:\/\/www\.tiknode\.com\/profile\/([^"]+)"\s+class="main-premium-list-item">\s*<div class="main-premium-list-item-info">\s*<div class="main-premium-list-rank[^"]*">(\d+)\.<\/div>\s*<div class="main-premium-list-avatar">\s*<img\s+src="([^"]*)"[^>]*>\s*<\/div>\s*<div class="main-premium-list-username">\s*([\s\S]*?)\s*<\/div>\s*<\/div>\s*<div class="main-premium-list-item-amount">\s*\$([\d,]+)\s*<\/div>/g;

  let match;
  while ((match = itemRegex.exec(html)) !== null) {
    const [, uniqueId, rankStr, avatar, nickname, dollars] = match;
    const dollarsNum = parseInt(dollars.replace(/,/g, ""), 10);
    const estimatedDiamonds = dollarsNum * 200; // ~$0.005 per diamond
    ranks.push({
      rank: parseInt(rankStr, 10),
      unique_id: uniqueId.trim(),
      avatar: avatar.trim(),
      nickname: nickname.trim(),
      dollars: dollars.replace(/,/g, ""),
      diamonds: estimatedDiamonds,
      diamonds_description: `${estimatedDiamonds.toLocaleString()} 💎`,
    });
  }

  // If regex didn't match (HTML structure varies), try a simpler approach
  if (ranks.length === 0) {
    // Fallback: find all list items in the archive section
    const archiveSection = html.split("main-premium-archive-list")[1] || "";
    const simpleItemRegex = /href="https:\/\/www\.tiknode\.com\/profile\/([^"]+)"[\s\S]*?<img\s+src="([^"]*)"[^>]*alt="([^"]*)"[\s\S]*?class="main-premium-list-item-amount">\s*\$([\d,]+)/g;
    
    let simpleMatch;
    let rank = 1;
    while ((simpleMatch = simpleItemRegex.exec(archiveSection)) !== null) {
      const [, uniqueId, avatar, nickname, dollars] = simpleMatch;
      const dollarsNum = parseInt(dollars.replace(/,/g, ""), 10);
      const estimatedDiamonds = dollarsNum * 200;
      ranks.push({
        rank: rank++,
        unique_id: uniqueId.trim(),
        avatar: avatar.trim(),
        nickname: nickname.trim(),
        dollars: dollars.replace(/,/g, ""),
        diamonds: estimatedDiamonds,
        diamonds_description: `${estimatedDiamonds.toLocaleString()} 💎`,
      });
    }
  }

  return ranks;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
    const region = url.searchParams.get("region") || "gb";

    const tiknodeUrl = `https://www.tiknode.com/country/${encodeURIComponent(region.toLowerCase())}`;
    console.log("Fetching tiknode rankings from:", tiknodeUrl);

    const response = await fetch(tiknodeUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });

    if (!response.ok) {
      console.error("Tiknode fetch error:", response.status);
      return new Response(
        JSON.stringify({ error: `Tiknode returned ${response.status}`, ranks: [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const html = await response.text();
    const ranks = parseRankingsFromHtml(html);

    console.log(`Parsed ${ranks.length} rankings from tiknode`);

    return new Response(
      JSON.stringify({
        ranks: ranks.slice(0, 20),
        region: region.toUpperCase(),
        source: "tiknode",
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
