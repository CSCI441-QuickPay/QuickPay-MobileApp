import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Configuration, PlaidApi, PlaidEnvironments } from "npm:plaid@24.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔄 Starting token exchange process...')
    const { publicToken, clerkId } = await req.json()
    console.log(`📋 Clerk ID: ${clerkId}`)
    console.log(`🎫 Public token: ${publicToken?.substring(0, 20)}...`)

    if (!publicToken) {
      throw new Error('Missing publicToken in request')
    }

    if (!clerkId) {
      throw new Error('Missing clerkId in request')
    }

    console.log('🔧 Initializing Plaid client...')
    const plaidClient = new PlaidApi(
      new Configuration({
        basePath: PlaidEnvironments[Deno.env.get('PLAID_ENV') || 'sandbox'],
        baseOptions: {
          headers: {
            'PLAID-CLIENT-ID': Deno.env.get('PLAID_CLIENT_ID'),
            'PLAID-SECRET': Deno.env.get('PLAID_SECRET'),
          },
        },
      })
    )

    console.log('🔄 Exchanging public token with Plaid...')
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    })

    const accessToken = response.data.access_token
    const itemId = response.data.item_id
    console.log(`✅ Received access token for item: ${itemId}`)

    // Store in Supabase
    console.log('💾 Storing tokens in Supabase...')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { error, data } = await supabase
      .from('users')
      .update({
        plaid_access_token: accessToken,
        plaid_item_id: itemId,
        plaid_linked_at: new Date().toISOString(),
      })
      .eq('clerk_id', clerkId)
      .select()

    if (error) {
      console.error('❌ Supabase error:', error)
      throw error
    }

    if (!data || data.length === 0) {
      console.error('❌ No user found with clerk_id:', clerkId)
      throw new Error('User not found in database')
    }

    console.log('✅ Successfully stored tokens in database')
    console.log('🎉 Token exchange complete!')

    return new Response(
      JSON.stringify({ success: true, itemId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('❌ Error in token exchange:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
