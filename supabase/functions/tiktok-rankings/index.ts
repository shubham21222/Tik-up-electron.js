import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function parseRankingsFromHtml(html: string): any[] {
  const ranks: any[] = [];
  const seen = new Set<string>();

  // Match all list items with profile links, avatars, nicknames, and dollar amounts
  const itemRegex = /href="https:\/\/www\.tiknode\.com\/profile\/([^"]+)"[^>]*class="main-premium-list-item"[\s\S]*?<div class="main-premium-list-rank[^"]*">(\d+)\.<\/div>[\s\S]*?<img\s+src="([^"]*)"[^>]*>[\s\S]*?<div class="main-premium-list-username">\s*([\s\S]*?)\s*<\/div>[\s\S]*?<div class="main-premium-list-item-amount">\s*\$([\d,]+)/g;

  let match;
  while ((match = itemRegex.exec(html)) !== null) {
    const [, uniqueId, , avatar, nickname, dollars] = match;
    const uid = uniqueId.trim();
    if (seen.has(uid)) continue;
    seen.add(uid);
    const dollarsNum = parseInt(dollars.replace(/,/g, ""), 10);
    const estimatedDiamonds = dollarsNum * 200;
    ranks.push({
      rank: ranks.length + 1,
      unique_id: uid,
      avatar: avatar.trim(),
      nickname: nickname.trim(),
      diamonds: estimatedDiamonds,
      diamonds_description: `${estimatedDiamonds.toLocaleString()} 💎`,
    });
    if (ranks.length >= 20) break;
  }

  // Fallback: simpler pattern
  if (ranks.length === 0) {
    const simpleItemRegex = /href="https:\/\/www\.tiknode\.com\/profile\/([^"]+)"[\s\S]*?<img\s+src="([^"]*)"[^>]*alt="([^"]*)"[\s\S]*?class="main-premium-list-item-amount">\s*\$([\d,]+)/g;
    let simpleMatch;
    while ((simpleMatch = simpleItemRegex.exec(html)) !== null) {
      const [, uniqueId, avatar, nickname, dollars] = simpleMatch;
      const uid = uniqueId.trim();
      if (seen.has(uid)) continue;
      seen.add(uid);
      const dollarsNum = parseInt(dollars.replace(/,/g, ""), 10);
      const estimatedDiamonds = dollarsNum * 200;
      ranks.push({
        rank: ranks.length + 1,
        unique_id: uid,
        avatar: avatar.trim(),
        nickname: nickname.trim(),
        diamonds: estimatedDiamonds,
        diamonds_description: `${estimatedDiamonds.toLocaleString()} 💎`,
      });
      if (ranks.length >= 20) break;
    }
  }

  return ranks;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    console.log(`Parsed ${ranks.length} rankings from tiknode for region ${region}`);

    return new Response(
      JSON.stringify({
        ranks,
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
