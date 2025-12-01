// services/profileService.ts
import { supabase, supabaseAnonKey, supabaseUrl } from "../config/supabaseConfig";
import { Profile } from "../types/Profile";

// ---------------------------------------------
// Fetch profile by clerk_id from users table
// ---------------------------------------------
export const fetchProfile = async (
  clerkId: string
): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_id", clerkId)
    .maybeSingle();

  if (error) {
    console.log("fetchProfile error:", error);
    throw error;
  }

  return (data as Profile) ?? null;
};

// ---------------------------------------------
// Upsert profile (create or update) by clerk_id
// ---------------------------------------------
export const upsertProfile = async (
  payload: Partial<Profile> & { clerk_id: string }
): Promise<Profile> => {

  // 🔥 Prevent overwriting profile_picture
  const safePayload = { ...payload };
  delete (safePayload as any).profile_picture;

  const { data, error } = await supabase
    .from("users")
    .upsert(safePayload, { onConflict: "clerk_id" })
    .select()
    .single();

  if (error) {
    console.log("upsertProfile error:", error);
    throw error;
  }

  return data as Profile;
};

// ---------------------------------------------
// Update phone number in users table
// ---------------------------------------------
export const updatePhoneNumber = async (clerkId: string, phone: string) => {
  const { error } = await supabase
    .from("users")
    .update({ phone_number: phone })
    .eq("clerk_id", clerkId);

  if (error) {
    console.log("updatePhoneNumber error:", error);
    throw error;
  }
};

// ---------------------------------------------
// Update merchant_mode flag in users table
// ---------------------------------------------
export const updateMerchantMode = async (
  clerkId: string,
  merchantMode: boolean
) => {
  const { error } = await supabase
    .from("users")
    .update({ merchant_mode: merchantMode })
    .eq("clerk_id", clerkId);

  if (error) {
    console.log("updateMerchantMode error:", error);
    throw error;
  }
};

// ---------------------------------------------
// Upload avatar via REST (no supabase.storage.upload)
// and update users.profile_picture
// ---------------------------------------------
export const uploadAvatar = async (
  clerkId: string,
  localUri: string
): Promise<string> => {
  const ext = localUri.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${clerkId}-${Date.now()}.${ext}`;
  const filePath = fileName;

  const file: any = {
    uri: localUri,
    name: fileName,
    type: ext === "png" ? "image/png" : "image/jpeg",
  };

  const formData = new FormData();
  formData.append("file", file);

  const uploadUrl = `${supabaseUrl}/storage/v1/object/avatars/${encodeURIComponent(
    filePath
  )}`;

  console.log("Uploading avatar to:", uploadUrl);

  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    console.log("Supabase REST upload error:", res.status, text);
    throw new Error("Failed to upload avatar");
  }

  // Build public URL
  const publicUrl = `${supabaseUrl}/storage/v1/object/public/avatars/${encodeURIComponent(
    filePath
  )}`;
  console.log("PUBLIC AVATAR URL =>", publicUrl);

  // 🔥 Save URL into users.profile_picture AND log the row
  const { data: updatedRow, error: updateError } = await supabase
    .from("users")
    .update({ profile_picture: publicUrl })
    .eq("clerk_id", clerkId)
    .select("id, clerk_id, profile_picture")
    .maybeSingle();

  if (updateError) {
    console.log("Supabase update_profile_picture error:", updateError);
    throw updateError;
  }

  console.log("Updated user row with avatar:", updatedRow);

  // Prefer the value that actually came back from DB
  return updatedRow?.profile_picture ?? publicUrl;
};