// Supabase Edge Function: Proxies audio transcription requests to OpenAI Whisper API.
// The client sends audio as base64, this function decodes it and forwards to Whisper.
// Auth is verified via the standard Supabase JWT in the Authorization header.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const WHISPER_API_URL = "https://api.openai.com/v1/audio/transcriptions";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: { Authorization: req.headers.get("Authorization")! },
      },
    });

    // Verify auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", details: authError?.message }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { audio, mimeType, language } = body;

    if (!audio) {
      return new Response(
        JSON.stringify({ error: "Missing audio data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Decode base64 audio to binary
    const binaryAudio = Uint8Array.from(atob(audio), (c) => c.charCodeAt(0));

    // Determine file extension from mime type
    const extMap: Record<string, string> = {
      "audio/m4a": "m4a",
      "audio/mp4": "m4a",
      "audio/x-m4a": "m4a",
      "audio/mpeg": "mp3",
      "audio/webm": "webm",
      "audio/wav": "wav",
      "audio/ogg": "ogg",
    };
    const ext = extMap[mimeType || "audio/m4a"] || "m4a";

    // Build multipart form data for Whisper API
    const formData = new FormData();
    formData.append(
      "file",
      new Blob([binaryAudio], { type: mimeType || "audio/m4a" }),
      `audio.${ext}`
    );
    formData.append("model", "whisper-1");
    formData.append("response_format", "json");

    // Auto-detect language or use provided one
    if (language) {
      formData.append("language", language);
    }

    const whisperRes = await fetch(WHISPER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
      },
      body: formData,
    });

    const whisperData = await whisperRes.json();

    if (!whisperRes.ok) {
      console.error("Whisper API error:", whisperData);
      return new Response(
        JSON.stringify({
          error: "Transcription failed",
          details: whisperData.error?.message || "Unknown error",
        }),
        { status: whisperRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ text: whisperData.text }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("whisper-proxy error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
