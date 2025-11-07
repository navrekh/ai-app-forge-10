import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { buildId } = await req.json();
    
    if (!buildId) {
      throw new Error('Build ID is required');
    }

    console.log('Checking build status:', buildId);

    // Get build status
    const { data: build, error: buildError } = await supabaseClient
      .from('builds')
      .select('*')
      .eq('id', buildId)
      .eq('user_id', user.id)
      .single();

    if (buildError || !build) {
      throw new Error('Build not found');
    }

    return new Response(
      JSON.stringify({
        buildId: build.id,
        status: build.status,
        downloadUrl: build.download_url,
        errorMessage: build.error_message,
        createdAt: build.created_at,
        updatedAt: build.updated_at,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
