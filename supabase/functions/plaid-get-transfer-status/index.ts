/**
 * written by: Team QuickPay
 * tested by: Team QuickPay
 * debugged by: Team QuickPay
 * Notes: Contributions were shared, see GitHub history for commit details.
 * Unit Tests for UserSyncService
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    const { transferId } = await req.json()

    console.log('Getting transfer status for:', transferId)

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

    const response = await plaidClient.transferGet({
      transfer_id: transferId,
    })

    console.log('✅ Transfer status retrieved:', response.data.transfer.status)

    return new Response(
      JSON.stringify({
        transfer_id: response.data.transfer.id,
        status: response.data.transfer.status,
        amount: response.data.transfer.amount,
        created: response.data.transfer.created,
        network: response.data.transfer.network,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('❌ Error getting transfer status:', error)
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
