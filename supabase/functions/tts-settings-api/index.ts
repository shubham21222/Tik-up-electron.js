import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * TTS Settings REST API
 * ─────────────────────
 * GET    /tts-settings-api              → Fetch current TTS settings
 * PUT    /tts-settings-api              → Update TTS settings
 * POST   /tts-settings-api?action=override → Add/update special user voice override
 * DELETE /tts-settings-api?username=xxx → Remove special user override
 *
 * All routes require Authorization: Bearer <jwt>
 *
 * Example response (GET):
 * {
 *   "enabled": true,
 *   "language": "en-GB",
 *   "voice_id": "JBFqnCBsd6RMkjVDRZzb",
 *   "voice_provider": "elevenlabs",
 *   "random_voice": false,
 *   "speed": 50,
 *   "pitch": 50,
 *   "volume": 80,
 *   "trigger_mode": "all_chat",
 *   "comment_type": "any",
 *   "comment_command": "!tts",
 *   "min_chars": 3,
 *   "max_length": 300,
 *   "max_queue_length": 10,
 *   "cooldown_seconds": 0,
 *   "interrupt_mode": false,
 *   "charge_points": false,
 *   "cost_per_message": 5,
 *   "filter_letter_spam": true,
 *   "filter_mentions": false,
 *   "filter_commands": false,
 *   "message_template": "{comment}",
 *   "blacklist_words": [],
 *   "allowed_users": { "all_users": true, ... },
 *   "special_users": [{ "username": "vip_user", "voice_id": "...", "speed": 60, "pitch": 50 }]
 * }
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE, OPTIONS",
};

// Default settings for new users (matches src/hooks/use-tts-settings.tsx)
const DEFAULT_TTS = {
  enabled: false,
  voice_provider: "elevenlabs",
  voice_id: "JBFqnCBsd6RMkjVDRZzb",
  language: "en-GB",
  random_voice: false,
  speed: 50,
  pitch: 50,
  volume: 80,
  trigger_mode: "all_chat",
  min_chars: 3,
  cooldown_seconds: 0,
  blacklist_words: [] as string[],
  interrupt_mode: false,
  max_length: 300,
  allowed_users: {
    all_users: true,
    followers: false,
    subscribers: false,
    moderators: false,
    team_members: false,
    top_gifters: false,
    top_gifters_count: 3,
    allowed_list: [],
  },
  comment_type: "any",
  comment_command: "!tts",
  charge_points: false,
  cost_per_message: 5,
  max_queue_length: 10,
  filter_letter_spam: true,
  filter_mentions: false,
  filter_commands: false,
  message_template: "{comment}",
  special_users: [] as Array<{ username: string; allowed: boolean; voice_id: string; speed: number; pitch: number }>,
};

/** Authenticate the request and return user ID */
async function authenticateRequest(req: Request): Promise<{ userId: string; error?: never } | { userId?: never; error: Response }> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      error: new Response(JSON.stringify({ error: "Missing or invalid Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }),
    };
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
  if (claimsError || !claimsData?.claims?.sub) {
    return {
      error: new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }),
    };
  }

  return { userId: claimsData.claims.sub as string };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate
    const auth = await authenticateRequest(req);
    if (auth.error) return auth.error;
    const userId = auth.userId;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // ── GET: Fetch TTS settings ──
    if (req.method === "GET") {
      const { data } = await supabase
        .from("tts_settings")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      // Return existing or defaults
      const settings = data || { ...DEFAULT_TTS, user_id: userId };

      return new Response(JSON.stringify(settings), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── PUT: Update TTS settings ──
    if (req.method === "PUT") {
      const body = await req.json();

      // Remove fields that shouldn't be updated directly
      delete body.id;
      delete body.user_id;
      delete body.created_at;
      delete body.updated_at;

      // Check if settings exist
      const { data: existing } = await supabase
        .from("tts_settings")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      let result;
      if (existing) {
        // Update existing
        result = await supabase
          .from("tts_settings")
          .update(body)
          .eq("user_id", userId)
          .select()
          .single();
      } else {
        // Insert new with defaults
        result = await supabase
          .from("tts_settings")
          .insert({ ...DEFAULT_TTS, ...body, user_id: userId })
          .select()
          .single();
      }

      if (result.error) {
        console.error("TTS settings save error:", result.error);
        return new Response(JSON.stringify({ error: "Failed to save settings", detail: result.error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(result.data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── POST ?action=override: Add/update special user voice override ──
    if (req.method === "POST" && action === "override") {
      const body = await req.json();
      const { username, voice_id, speed, pitch, allowed } = body;

      if (!username) {
        return new Response(JSON.stringify({ error: "username is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get current settings
      const { data: current } = await supabase
        .from("tts_settings")
        .select("special_users")
        .eq("user_id", userId)
        .maybeSingle();

      const specialUsers: any[] = (current?.special_users as any[]) || [];

      // Remove existing entry for this username
      const filtered = specialUsers.filter(
        (su: any) => su.username?.toLowerCase() !== username.toLowerCase()
      );

      // Add new entry
      filtered.push({
        username,
        allowed: allowed !== false,
        voice_id: voice_id || "JBFqnCBsd6RMkjVDRZzb",
        speed: speed ?? 50,
        pitch: pitch ?? 50,
      });

      // Upsert
      if (current) {
        await supabase
          .from("tts_settings")
          .update({ special_users: filtered })
          .eq("user_id", userId);
      } else {
        await supabase
          .from("tts_settings")
          .insert({ ...DEFAULT_TTS, user_id: userId, special_users: filtered });
      }

      return new Response(JSON.stringify({ success: true, special_users: filtered }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── DELETE ?username=xxx: Remove special user override ──
    if (req.method === "DELETE") {
      const usernameToDelete = url.searchParams.get("username");
      if (!usernameToDelete) {
        return new Response(JSON.stringify({ error: "username query parameter is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: current } = await supabase
        .from("tts_settings")
        .select("special_users")
        .eq("user_id", userId)
        .maybeSingle();

      const specialUsers: any[] = (current?.special_users as any[]) || [];
      const filtered = specialUsers.filter(
        (su: any) => su.username?.toLowerCase() !== usernameToDelete.toLowerCase()
      );

      if (current) {
        await supabase
          .from("tts_settings")
          .update({ special_users: filtered })
          .eq("user_id", userId);
      }

      return new Response(JSON.stringify({ success: true, special_users: filtered }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("TTS settings API error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
