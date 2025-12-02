// types/Profile.ts
export interface Profile {
  id?: string;                 // uuid
  clerk_id: string | null;    // text
  email: string | null;

  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  profile_picture: string | null;

  balance: string | null;     // numeric comes back as string
  is_active: boolean | null;
  verified: boolean | null;

  plaid_access_token: string | null;
  plaid_item_id: string | null;
  plaid_linked_at: string | null;

  created_at: string | null;
  updated_at: string | null;

  // optional extra columns if you add them later
  app_id?: string | null;
  merchant_mode?: boolean | null;
};
