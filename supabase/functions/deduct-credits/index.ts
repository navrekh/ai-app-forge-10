import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { amount, description } = await req.json()

    if (!amount || !description) {
      throw new Error('Amount and description are required')
    }

    console.log('Deducting credits:', { amount, description })

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Use service role to call deduct_credits function
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: result, error: deductError } = await supabaseAdmin.rpc('deduct_credits', {
      _user_id: user.id,
      _amount: amount,
      _description: description
    })

    if (deductError) {
      console.error('Credit deduction error:', deductError)
      throw deductError
    }

    if (!result.success) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: result.error,
          current_credits: result.current_credits,
          required_credits: result.required_credits
        }),
        { 
          status: 402, // Payment Required
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Credits deducted successfully:', result)

    return new Response(
      JSON.stringify({ 
        success: true,
        new_balance: result.new_balance,
        low_credits: result.low_credits,
        message: result.low_credits ? 'Credits low! Please recharge soon.' : 'Credits deducted successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Deduct credits error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})