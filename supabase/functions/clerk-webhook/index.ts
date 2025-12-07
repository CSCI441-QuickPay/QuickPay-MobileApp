/**
 * written by: Team QuickPay
 * tested by: Team QuickPay
 * debugged by: Team QuickPay
 * Notes: Contributions were shared, see GitHub history for commit details.
 * Unit Tests for UserSyncService
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    const eventType = payload.type

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Use service role for deletes
    )

    console.log('Clerk webhook event:', eventType)

    // Handle user deletion
    if (eventType === 'user.deleted') {
      const clerkId = payload.data.id

      console.log('Deleting user from Supabase:', clerkId)

      const { error } = await supabase
        .from('users')
        .delete()
        .eq('clerk_id', clerkId)

      if (error) {
        console.error('Error deleting user:', error)
        throw error
      }

      console.log('User deleted successfully')
    }

    // Handle user creation - create in Supabase if doesn't exist
    if (eventType === 'user.created') {
      const clerkId = payload.data.id
      const email = payload.data.email_addresses[0]?.email_address
      const firstName = payload.data.first_name
      const lastName = payload.data.last_name
      const phoneNumber = payload.data.phone_numbers[0]?.phone_number
      const profilePicture = payload.data.image_url

      console.log('Creating user in Supabase:', clerkId)

      // Check if user already exists
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', clerkId)
        .single()

      if (!existing) {
        const { error } = await supabase
          .from('users')
          .insert({
            clerk_id: clerkId,
            email: email,
            first_name: firstName,
            last_name: lastName,
            phone_number: phoneNumber,
            profile_picture: profilePicture,
            balance: 0,
            is_active: true,
            verified: false,
          })

        if (error) {
          console.error('Error creating user:', error)
          // Don't throw - user might already exist from app sync
        } else {
          console.log('User created successfully')
        }
      }
    }

    // Handle user update
    if (eventType === 'user.updated') {
      const clerkId = payload.data.id
      const email = payload.data.email_addresses[0]?.email_address
      const firstName = payload.data.first_name
      const lastName = payload.data.last_name
      const phoneNumber = payload.data.phone_numbers[0]?.phone_number
      const profilePicture = payload.data.image_url

      console.log('Updating user in Supabase:', clerkId)

      const { error } = await supabase
        .from('users')
        .update({
          email: email,
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
          profile_picture: profilePicture,
        })
        .eq('clerk_id', clerkId)

      if (error) {
        console.error('Error updating user:', error)
      } else {
        console.log('User updated successfully')
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
