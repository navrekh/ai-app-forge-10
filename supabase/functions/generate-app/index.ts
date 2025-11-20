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

    const { prompt, framework } = await req.json();
    
    if (!prompt) {
      throw new Error('Prompt is required');
    }

    console.log('Generating app for user:', user.id);

    // Deduct credits for app generation (5 credits)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: creditResult, error: creditError } = await supabaseAdmin.rpc('deduct_credits', {
      _user_id: user.id,
      _amount: 5,
      _description: 'AI app generation'
    });

    if (creditError || !creditResult.success) {
      console.error('Credit deduction error:', creditError);
      const errorMsg = creditResult?.error || 'Failed to deduct credits';
      
      if (errorMsg.includes('Insufficient credits')) {
        return new Response(
          JSON.stringify({ 
            error: 'Insufficient credits. You need 5 credits to generate an app.',
            currentCredits: creditResult?.current_credits,
            requiredCredits: 5
          }),
          { 
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      throw new Error(errorMsg);
    }

    console.log('Credits deducted successfully. New balance:', creditResult.new_balance);

    // Call Lovable AI to generate the app
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('Lovable API key not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert mobile app architect. Generate a detailed app structure for ${framework} based on the user's requirements. Include screen names, navigation flow, and key components. Return a structured JSON response with: { title, description, screens: [{ name, description, components: [] }] }`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI generation error:', errorText);
      throw new Error('Failed to generate app with AI');
    }

    const aiData = await aiResponse.json();
    const generatedContent = aiData.choices?.[0]?.message?.content || '';

    // Parse AI response to extract app structure
    let appStructure;
    try {
      // Try to extract JSON from the response
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        appStructure = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback structure if parsing fails
        appStructure = {
          title: 'Generated App',
          description: generatedContent,
          screens: [
            { name: 'Home', description: 'Main screen', components: [] },
            { name: 'Details', description: 'Details screen', components: [] }
          ]
        };
      }
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      appStructure = {
        title: 'Generated App',
        description: generatedContent,
        screens: [
          { name: 'Home', description: 'Main screen', components: [] }
        ]
      };
    }

    // Save to app_history
    const { data: appHistory, error: historyError } = await supabaseClient
      .from('app_history')
      .insert({
        user_id: user.id,
        prompt: prompt,
        download_url: null,
      })
      .select()
      .single();

    if (historyError) {
      console.error('History save error:', historyError);
      throw new Error('Failed to save app history');
    }

    console.log('App generated and saved:', appHistory.id);

    return new Response(
      JSON.stringify({
        success: true,
        appId: appHistory.id,
        appStructure,
        creditsRemaining: creditResult.new_balance,
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
