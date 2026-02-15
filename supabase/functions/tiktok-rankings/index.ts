import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function parseDiamonds(text: string): number {
  const clean = text.trim();
  const match = clean.match(/([\d.]+)\s*(M|K)?/i);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  const suffix = (match[2] || "").toUpperCase();
  if (suffix === "M") return Math.round(num * 1_000_000);
  if (suffix === "K") return Math.round(num * 1_000);
  return Math.round(num);
}

function parseRankingsFromHtml(html: string): any[] {
  const ranks: any[] = [];
  const seen = new Set<string>();

  // Match the main ranklist-table-row entries (the full 20-entry table)
  // Each row: <a class="ranklist-table-row" href="...profile/UNIQUE_ID">
  //   rank number in <span>N</span>
  //   avatar <img src="..." alt="NICKNAME">
  //   username in <span class="ranklist-username">NAME</span>
  //   diamonds in <div class="ranklist-diamonds-wrapper"><span>VALUE</span>
  const rowRegex = /<a\s+class="ranklist-table-row"\s+href="https:\/\/www\.tiknode\.com\/profile\/([^"]+)">([\s\S]*?)<\/a>/g;

  let rowMatch;
  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const [, uniqueId, rowHtml] = rowMatch;
    const uid = uniqueId.trim();
    if (seen.has(uid)) continue;
    seen.add(uid);

    // Extract rank number
    const rankMatch = rowHtml.match(/<div class="ranklist-place-wrapper">\s*<span>(\d+)<\/span>/);
    const rank = rankMatch ? parseInt(rankMatch[1], 10) : ranks.length + 1;

    // Extract avatar URL
    const avatarMatch = rowHtml.match(/<div class="avatar-wrapper">\s*<img\s+src="([^"]+)"/);
    const avatar = avatarMatch ? avatarMatch[1].replace(/&amp;/g, "&") : "";

    // Extract username
    const usernameMatch = rowHtml.match(/<span class="ranklist-username">([\s\S]*?)<\/span>/);
    const nickname = usernameMatch ? usernameMatch[1].trim() : uid;

    // Extract diamonds text
    const diamondsMatch = rowHtml.match(/<div class="ranklist-diamonds-wrapper">\s*<span>([\s\S]*?)<\/span>/);
    const diamondsText = diamondsMatch ? diamondsMatch[1].trim() : "0";
    const diamonds = parseDiamonds(diamondsText);

    ranks.push({
      rank,
      unique_id: uid,
      avatar,
      nickname,
      diamonds,
      diamonds_description: diamondsText,
    });
    if (ranks.length >= 20) break;
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
