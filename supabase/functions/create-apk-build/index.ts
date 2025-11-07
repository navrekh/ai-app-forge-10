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

    const { appHistoryId } = await req.json();
    
    if (!appHistoryId) {
      throw new Error('App history ID is required');
    }

    console.log('Creating APK build for app:', appHistoryId);

    // Get app data from history
    const { data: app, error: appError } = await supabaseClient
      .from('app_history')
      .select('*')
      .eq('id', appHistoryId)
      .single();

    if (appError || !app) {
      throw new Error('App not found');
    }

    // Check if user owns this app or if it's public (no user_id)
    if (app.user_id && app.user_id !== user.id) {
      throw new Error('Unauthorized access to app');
    }

    // Create build record
    const { data: build, error: buildError } = await supabaseClient
      .from('builds')
      .insert({
        project_id: appHistoryId,
        user_id: user.id,
        platform: 'android',
        status: 'pending',
      })
      .select()
      .single();

    if (buildError) {
      console.error('Build creation error:', buildError);
      throw new Error('Failed to create build record');
    }

    console.log('Build record created:', build.id);

    // Trigger Expo EAS build in background
    const EXPO_TOKEN = Deno.env.get('EXPO_ACCESS_TOKEN');
    if (!EXPO_TOKEN) {
      throw new Error('Expo access token not configured');
    }

    // Start the build process asynchronously without blocking response
    (async () => {
      try {
        // Update status to building
        await supabaseClient
          .from('builds')
          .update({ status: 'building' })
          .eq('id', build.id);

        console.log('Build started for:', build.id);

        // Simulate EAS Build API call
        // In production, you would call:
        // POST https://api.expo.dev/v2/builds
        // with project configuration and credentials
        
        // For demo purposes, simulate a build taking 2 minutes
        await new Promise(resolve => setTimeout(resolve, 120000));

        // Update with download URL
        await supabaseClient
          .from('builds')
          .update({
            status: 'completed',
            download_url: `https://example.com/builds/${build.id}.apk`,
          })
          .eq('id', build.id);

        console.log('Build completed:', build.id);
      } catch (error) {
        console.error('Background build error:', error);
        await supabaseClient
          .from('builds')
          .update({
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Build failed',
          })
          .eq('id', build.id);
      }
    })();

    return new Response(
      JSON.stringify({
        success: true,
        buildId: build.id,
        status: 'pending',
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
