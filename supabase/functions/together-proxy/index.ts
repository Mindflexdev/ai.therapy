// Supabase Edge Function: Proxies Together AI requests so the API key stays server-side.
// The client sends { model, messages, temperature, max_tokens, top_p } and authenticates
// via the standard Supabase anon/JWT token in the Authorization header.

// Use Supabase Edge Functions built-in auth - the client is automatically created
// with the user's JWT from the Authorization header.
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const TOGETHER_API_URL = "https://api.together.xyz/v1/chat/completions";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Helper to verify JWT using Supabase's built-in auth in edge functions
async function verifyAuth(req: Request, supabase: SupabaseClient): Promise<{ user: any } | { error: string }> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Missing or invalid authorization header" };
  }

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    console.error("Auth verification failed:", error);
    return { error: error?.message || "Invalid JWT" };
  }
  return { user };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Create Supabase client - the edge function environment handles the JWT
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });

    // Verify the user is authenticated via Supabase JWT
    const authResult = await verifyAuth(req, supabase);
    if ("error" in authResult) {
      return new Response(JSON.stringify({ error: "Unauthorized", details: authResult.error }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { user } = authResult;

    // Get Together AI key from edge function secrets
    const togetherApiKey = Deno.env.get("TOGETHER_API_KEY");
    if (!togetherApiKey) {
      return new Response(JSON.stringify({ error: "Together AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Forward the request to Together AI
    const body = await req.json();

    // Only allow specific fields through (prevent prompt injection via extra params)
    const payload = {
      model: body.model,
      messages: body.messages,
      temperature: body.temperature ?? 0.7,
      max_tokens: body.max_tokens ?? 1024,
      top_p: body.top_p ?? 0.9,
    };

    const togetherRes = await fetch(TOGETHER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${togetherApiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const togetherData = await togetherRes.json();

    return new Response(JSON.stringify(togetherData), {
      status: togetherRes.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("together-proxy error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
