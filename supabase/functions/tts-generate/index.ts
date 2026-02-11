import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

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
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      return new Response(JSON.stringify({ error: "TTS not configured" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Validate user
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;

    // Check PRO subscription
    const serviceClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: sub } = await serviceClient
      .from("subscriptions")
      .select("plan, status")
      .eq("user_id", userId)
      .maybeSingle();

    const { data: profile } = await serviceClient
      .from("profiles")
      .select("plan_type")
      .eq("user_id", userId)
      .maybeSingle();

    const isPro = (sub?.plan === "pro" || sub?.plan === "enterprise") || profile?.plan_type === "pro";
    if (!isPro) {
      return new Response(JSON.stringify({ error: "TTS requires a Pro subscription" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get TTS settings
    const { data: ttsSettings } = await serviceClient
      .from("tts_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    const body = await req.json();
    const { text, voice_id, overlay_token, username } = body;

    if (!text || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Apply TTS settings validation
    const settings = ttsSettings || {};
    const minChars = settings.min_chars || 3;
    const maxLength = settings.max_length || 200;
    const blacklist: string[] = settings.blacklist_words || [];

    if (text.length < minChars) {
      return new Response(JSON.stringify({ error: `Text too short (min ${minChars} chars)` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const truncatedText = text.slice(0, maxLength);

    // Check blacklist
    const lowerText = truncatedText.toLowerCase();
    for (const word of blacklist) {
      if (lowerText.includes(word.toLowerCase())) {
        return new Response(JSON.stringify({ error: "Message contains blocked content" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const selectedVoice = voice_id || settings.voice_id || "JBFqnCBsd6RMkjVDRZzb";
    const speed = settings.speed || 1.0;

    // Call ElevenLabs
    const ttsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: truncatedText,
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            speed,
          },
        }),
      }
    );

    if (!ttsResponse.ok) {
      const errText = await ttsResponse.text();
      console.error("ElevenLabs error:", errText);
      return new Response(JSON.stringify({ error: "TTS generation failed" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const audioBuffer = await ttsResponse.arrayBuffer();
    const audioBase64 = base64Encode(audioBuffer);

    // Log to TTS queue
    await serviceClient.from("tts_queue").insert({
      user_id: userId,
      overlay_token: overlay_token || "",
      text_content: truncatedText,
      username: username || "Viewer",
      voice_id: selectedVoice,
      status: "completed",
      processed_at: new Date().toISOString(),
    });

    // If overlay_token provided, broadcast to overlay
    if (overlay_token) {
      const channel = serviceClient.channel(`tts-${overlay_token}`);
      await channel.send({
        type: "broadcast",
        event: "play_tts",
        payload: {
          audioBase64,
          username: username || "Viewer",
          text: truncatedText,
          volume: settings.volume || 80,
          interrupt: settings.interrupt_mode || false,
        },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      audioContent: audioBase64,
      text: truncatedText,
      username: username || "Viewer",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
