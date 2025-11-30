// services/profileService.ts
import { supabase } from '../config/supabaseConfig';
import { Profile } from '../types/Profile';

// Get a user row by Clerk user id
export const fetchProfile = async (clerkId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('users')              // 👈 table name = users
    .select('*')
    .eq('clerk_id', clerkId)    // 👈 match on clerk_id column
    .maybeSingle();

  if (error) {
    console.log('fetchProfile error:', error);
    throw error;
  }

  return (data as Profile) ?? null;
};

// Create / update a user row for this Clerk id
export const upsertProfile = async (
  payload: Partial<Profile> & { clerk_id: string },
): Promise<Profile> => {
  const { data, error } = await supabase
    .from('users')
    .upsert(payload, { onConflict: 'clerk_id' }) // 👈 unique on clerk_id
    .select()
    .single();

  if (error) {
    console.log('upsertProfile error:', error);
    throw error;
  }

  return data as Profile;
};

export const updatePhoneNumber = async (clerkId: string, phone: string) => {
  const { error } = await supabase
    .from('users')
    .update({ phone_number: phone })
    .eq('clerk_id', clerkId);

  if (error) {
    console.log('updatePhoneNumber error:', error);
    throw error;
  }
};

export const updateMerchantMode = async (clerkId: string, merchantMode: boolean) => {
  const { error } = await supabase
    .from('users')
    .update({ merchant_mode: merchantMode })  // requires column, see below
    .eq('clerk_id', clerkId);

  if (error) {
    console.log('updateMerchantMode error:', error);
    throw error;
  }
};
