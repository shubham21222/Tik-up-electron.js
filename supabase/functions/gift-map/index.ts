import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Cache gift map in memory (edge function instance reuse)
let cachedGiftMap: Record<string, { name: string; diamond: number; coinValue: number }> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("authorization") || "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const sb = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await sb.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Return cached if fresh
    if (cachedGiftMap && Date.now() - cacheTimestamp < CACHE_TTL) {
      return new Response(JSON.stringify({ gifts: cachedGiftMap, cached: true, count: Object.keys(cachedGiftMap).length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("TIKTOK_DATA_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch gift info — requires room_id
    const url = new URL(req.url);
    const roomId = url.searchParams.get("room_id") || "0";

    const res = await fetch(
      `https://tiktok.eulerstream.com/webcast/gift_info?room_id=${roomId}&webcast_language=en`,
      { headers: { "x-api-key": apiKey } }
    );

    if (!res.ok) {
      console.error(`gift_info API error: ${res.status} ${await res.text()}`);
      return new Response(JSON.stringify({ error: `gift_info API error: ${res.status}`, gifts: {} }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const json = await res.json();
    
    // Debug: log top-level keys and nested structure
    console.log(`gift_info top keys: ${Object.keys(json).join(",")}`);
    if (json.response) console.log(`response keys: ${Object.keys(json.response).join(",")}`);
    if (json.response?.data) console.log(`response.data keys: ${Object.keys(json.response.data).join(",")}`);
    
    // The API returns nested: { response: { data: { gifts: [...] } } } or { data: [...] }
    // Try multiple paths to find the gifts array
    let giftsArray: Array<Record<string, unknown>> = [];
    
    if (Array.isArray(json.data)) {
      giftsArray = json.data;
    } else if (json.response?.data && Array.isArray(json.response.data)) {
      giftsArray = json.response.data;
    } else if (json.response?.data?.gifts && Array.isArray(json.response.data.gifts)) {
      giftsArray = json.response.data.gifts;
    } else if (json.gifts && Array.isArray(json.gifts)) {
      giftsArray = json.gifts;
    } else {
      // Try to find any array in the response
      const findArrays = (obj: Record<string, unknown>, path: string): string[] => {
        const found: string[] = [];
        for (const [key, val] of Object.entries(obj)) {
          if (Array.isArray(val) && val.length > 0) found.push(`${path}.${key}[${val.length}]`);
          else if (val && typeof val === "object" && !Array.isArray(val)) {
            found.push(...findArrays(val as Record<string, unknown>, `${path}.${key}`));
          }
        }
        return found;
      };
      console.log(`Arrays found: ${findArrays(json, "root").join(", ")}`);
    }

    console.log(`gift_info parsed ${giftsArray.length} gifts`);
    if (giftsArray[0]) {
      console.log(`Sample gift keys: ${Object.keys(giftsArray[0]).join(",")}`);
      console.log(`Sample gift: ${JSON.stringify(giftsArray[0]).slice(0, 500)}`);
    }

    const map: Record<string, { name: string; diamond: number; coinValue: number }> = {};

    for (const gift of giftsArray) {
      const id = String(gift.id || gift.giftId || gift.gift_id || "");
      if (!id) continue;

      const name = String(gift.name || "Gift");
      // TikTok gift_info uses diamond_count or diamonds or coin_count
      const diamond = Number(gift.diamond_count || gift.diamonds || gift.diamond || gift.diamondCount || 0);
      const coinValue = Number(gift.coin_count || gift.coins || gift.coinValue || gift.coin_value || diamond);

      map[id] = { name, diamond, coinValue };
      
      // Also index by lowercase name for fallback lookups
      if (name) {
        map[`name:${name.toLowerCase()}`] = { name, diamond, coinValue };
      }
    }

    cachedGiftMap = map;
    cacheTimestamp = Date.now();

    const numericCount = Object.keys(map).filter(k => !k.startsWith("name:")).length;
    console.log(`Gift map built: ${numericCount} by ID, ${Object.keys(map).length} total entries`);

    return new Response(JSON.stringify({ gifts: map, count: numericCount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error fetching gift map:", err);
    return new Response(JSON.stringify({ error: err.message, gifts: {} }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
