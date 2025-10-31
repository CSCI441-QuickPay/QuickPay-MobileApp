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
    const { publicToken, clerkId } = await req.json()

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

    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    })

    const accessToken = response.data.access_token
    const itemId = response.data.item_id

    // Store in Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { error } = await supabase
      .from('users')
      .update({
        plaid_access_token: accessToken,
        plaid_item_id: itemId,
        plaid_linked_at: new Date().toISOString(),
      })
      .eq('clerk_id', clerkId)

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, itemId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
