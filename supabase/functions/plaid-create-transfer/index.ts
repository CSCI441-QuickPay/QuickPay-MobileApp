import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Configuration, PlaidApi, PlaidEnvironments, TransferType, TransferNetwork, ACHClass } from "npm:plaid@24.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { accessToken, accountId, amount, description, recipientId } = await req.json()

    console.log('Creating Plaid transfer:', { accountId, amount, description, recipientId })

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

    // Step 1: Create authorization
    const authResponse = await plaidClient.transferAuthorizationCreate({
      access_token: accessToken,
      account_id: accountId,
      type: TransferType.Debit,
      network: TransferNetwork.Ach,
      amount: amount.toString(),
      ach_class: ACHClass.Ppd,
      user: {
        legal_name: 'QuickPay User',
      },
    })

    console.log('✅ Authorization created:', authResponse.data.authorization.id)

    // Step 2: Create transfer using authorization
    const transferResponse = await plaidClient.transferCreate({
      access_token: accessToken,
      account_id: accountId,
      authorization_id: authResponse.data.authorization.id,
      description: description || 'QuickPay Transfer',
    })

    console.log('✅ Transfer created:', transferResponse.data.transfer.id)

    return new Response(
      JSON.stringify({
        transfer_id: transferResponse.data.transfer.id,
        authorization_id: authResponse.data.authorization.id,
        status: transferResponse.data.transfer.status,
        amount: transferResponse.data.transfer.amount,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('❌ Error creating transfer:', error)
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
