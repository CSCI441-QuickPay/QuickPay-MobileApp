import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from "npm:plaid@24.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { clerkId } = await req.json()

    console.log('Creating link token for user:', clerkId)
    console.log('PLAID_ENV:', Deno.env.get('PLAID_ENV'))
    console.log('PLAID_CLIENT_ID:', Deno.env.get('PLAID_CLIENT_ID')?.substring(0, 10) + '...')

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

    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: clerkId },
      client_name: 'QuickPay',
      products: [Products.Auth, Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
      android_package_name: 'com.anonymous.QuickPay',
    })

    console.log('✅ Link token created successfully')

    return new Response(
      JSON.stringify({ link_token: response.data.link_token }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('❌ Error creating link token:', error)
    console.error('Error details:', error.response?.data || error.message)
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.response?.data || 'No additional details'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
