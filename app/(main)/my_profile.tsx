
// React / Expo imports
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// Navigation hook from Expo Router
import { useRouter } from "expo-router";

// Icons
import { Ionicons } from "@expo/vector-icons";

// Clerk (your auth system)
import { useUser } from "@clerk/clerk-expo";

// Your Supabase service functions + types
// NOTE: ../../ because profile.tsx is inside app/main/
import {
    fetchProfile,
    updateMerchantMode,
    updatePhoneNumber,
    uploadAvatar,
    upsertProfile,
} from "../../services/profileService";

import { Profile } from "../../types/Profile";

export default function MyProfileScreen() {
  const router = useRouter();

  // Clerk-provided logged-in user (NOT Supabase auth)
  const { user, isLoaded } = useUser();

  // Clerk user ID (this is what we look up in Supabase users.clerk_id)
  const clerkUserId = user?.id ?? null;

  // Local UI state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Phone number editing state
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [savingPhone, setSavingPhone] = useState(false);

  //uploading avatar state
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // -----------------------------
  // Load user profile on mount
  // -----------------------------
  useEffect(() => {
    const init = async () => {
      setErrorText(null);
      setLoading(true);

      try {
        // Wait for Clerk to finish loading
        if (!isLoaded) return;

        // If Clerk says no user logged in → cannot continue
        if (!clerkUserId) {
          setErrorText("No logged in user from Clerk. Please sign in again.");
          return;
        }

        // 1. Try to fetch existing profile from Supabase (users table)
        let p = await fetchProfile(clerkUserId);

        // 2. If no row exists, we create a default one using Clerk data
        if (!p) {
          const defaultProfilePartial: Partial<Profile> & { clerk_id: string } =
            {
              clerk_id: clerkUserId,
              email: user?.primaryEmailAddress?.emailAddress ?? null,
              first_name: user?.firstName ?? null,
              last_name: user?.lastName ?? null,
              phone_number: user?.primaryPhoneNumber?.phoneNumber ?? null,

              // Optional app-specific fields (only work if added to DB):
              app_id: Math.floor(100000 + Math.random() * 900000).toString(),
              merchant_mode: false,
              is_active: true,
              verified: false,
            };

          // Save new profile to Supabase
          p = await upsertProfile(defaultProfilePartial);
        }

        // Load profile into state
        setProfile(p);

        // Phone input default
        setPhoneInput(p.phone_number ?? "");
      } catch (err: any) {
        console.log("profile init error:", err);
        setErrorText(err?.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [clerkUserId, isLoaded]);

  // ------------------------------------------------------
  // Toggle merchant mode (ON / OFF) → save to Supabase
  // ------------------------------------------------------
  const handleToggleMerchant = async (value: boolean) => {
    if (!clerkUserId || !profile) return;

    // Update UI immediately
    setProfile({ ...profile, merchant_mode: value });

    try {
      // Save to database
      await updateMerchantMode(clerkUserId, value);
    } catch (err) {
      console.log("Error updating merchant mode:", err);
      setErrorText("Failed to update merchant mode.");
    }
  };

  // ------------------------------------------------------
  // Update phone number
  // ------------------------------------------------------
  const handleSavePhone = async () => {
    if (!clerkUserId || !profile) return;
    if (!phoneInput.trim()) return;

    setSavingPhone(true);

    try {
      await updatePhoneNumber(clerkUserId, phoneInput.trim());
      setProfile({ ...profile, phone_number: phoneInput.trim() });
      setEditingPhone(false);
    } catch (err) {
      console.log("Error updating phone number:", err);
      setErrorText("Failed to update phone number.");
    } finally {
      setSavingPhone(false);
    }
  };

  // UI while Clerk loads
  if (!isLoaded) {
    return (
      <SafeAreaView className="flex-1 bg-[#050816] items-center justify-center">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  // UI while Supabase profile loads
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#050816] items-center justify-center">
        <ActivityIndicator size="large" />
        {errorText && (
          <Text className="text-red-400 mt-3 text-xs px-6 text-center">
            {errorText}
          </Text>
        )}
      </SafeAreaView>
    );
  }

  // Failed to load profile entirely
  if (!profile) {
    return (
      <SafeAreaView className="flex-1 bg-[#050816] items-center justify-center px-6">
        <Text className="text-slate-50 mb-2">Profile not found.</Text>
        {errorText && (
          <Text className="text-red-400 text-xs text-center">{errorText}</Text>
        )}
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 px-4 py-2 rounded-xl bg-emerald-500"
        >
          <Text className="text-slate-950 font-semibold">Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Build clean display name
  const fullName =
    `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() ||
    "QuickPay User";

  // If no app_id exists, fallback to short-form UUID
  const appIdDisplay =
    profile.app_id ??
    (profile.id ? profile.id.slice(0, 6).toUpperCase() : "------");

  const merchantEnabled = profile.merchant_mode ?? false;

  //Handle change avatar
 const handleChangeAvatar = async () => {
  if (!clerkUserId) return;

  try {
    setErrorText(null);
    setAvatarError(false);

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setErrorText("Permission to access photos was denied.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled) return;

    const uri = result.assets[0]?.uri;
    if (!uri) return;

    setUploadingAvatar(true);

    // Upload to Supabase
    await uploadAvatar(clerkUserId, uri);

    // Refetch updated full row from DB
    const fresh = await fetchProfile(clerkUserId);
    if (fresh) setProfile(fresh);

  } catch (err) {
    console.log("Avatar upload error:", err);
    setErrorText("Failed to update profile picture.");
  } finally {
    setUploadingAvatar(false);
  }
};

  

  return (
    <SafeAreaView className="flex-1 bg-[#050816]">
      {/* Handles iOS keyboard nicely */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {/* -------------------------------------- */}
          {/* Top Bar */}
          {/* -------------------------------------- */}
          <View className="flex-row items-center px-4 py-2">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="#F9FAFB" />
            </TouchableOpacity>
            <Text className="flex-1 text-center text-slate-50 text-lg font-semibold">
              My Profile
            </Text>
            <View className="w-6" />
          </View>

          {/* Error Banner */}
          {errorText && (
            <View className="mx-4 mt-1 mb-1 rounded-xl bg-red-500/10 border border-red-500/40 px-3 py-2">
              <Text className="text-[11px] text-red-300">{errorText}</Text>
            </View>
          )}

          {/* -------------------------------------- */}
          {/* Profile Header (avatar + name + app ID) */}
          {/* -------------------------------------- */}
          <View className="mx-4 mt-3 mb-6 rounded-2xl bg-slate-900/80 flex-row items-center p-5">
            {/* Avatar */}
            <View className="relative">
                <View className="w-20 h-20 rounded-full border-2 border-emerald-500/70 bg-slate-900 overflow-hidden items-center justify-center">
                    {!avatarError && profile.profile_picture ? (
                    <Image
                        source={{ uri: profile.profile_picture }}
                        className="w-20 h-20"
                        resizeMode="cover"
                        onError={() => {
                        console.log("AVATAR FAILED:", profile.profile_picture);
                        setAvatarError(true);
                        }}
                    />
                    ) : (
                    <Ionicons name="person" size={40} color="#9CA3AF" />
                    )}
                </View>

                <TouchableOpacity
                    onPress={handleChangeAvatar}
                    disabled={uploadingAvatar}
                    className="absolute -bottom-1 right-0 w-7 h-7 rounded-full bg-emerald-500 items-center justify-center"
                >
                    {uploadingAvatar ? (
                    <ActivityIndicator size="small" color="#F9FAFB" />
                    ) : (
                    <Ionicons name="camera" size={16} color="#F9FAFB" />
                    )}
                </TouchableOpacity>
            </View>


            {/* Name + App ID */}
            <View className="ml-4 flex-1">
              <Text className="text-slate-50 text-lg font-bold">
                {fullName}
              </Text>
              <Text className="text-slate-400 mt-1">
                App ID: {appIdDisplay}
              </Text>
            </View>
          </View>

          {/* -------------------------------------- */}
          {/* Phone Number Section */}
          {/* -------------------------------------- */}
          <Text className="mt-8 mb-2 px-4 text-[11px] tracking-[1px] text-slate-400">
            REGISTERED PHONE NUMBER
          </Text>

          <View className="mx-4 rounded-2xl bg-slate-950/70 border border-slate-800 px-4 py-4 mt-2 mb-4">
            <View className="flex-row items-start">
              <View className="w-8 h-8 rounded-full bg-slate-900 items-center justify-center">
                <Ionicons name="call-outline" size={18} color="#22C55E" />
              </View>

              {/* Editing Mode */}
              {editingPhone ? (
                <View className="flex-1 ml-3">
                  <TextInput
                    className="border-b border-slate-700 text-slate-50 text-base pb-1"
                    placeholder="+1..."
                    placeholderTextColor="#6B7280"
                    keyboardType="phone-pad"
                    value={phoneInput}
                    onChangeText={setPhoneInput}
                  />
                </View>
              ) : (
                // View Mode
                <View className="flex-1 ml-3">
                  <Text className="text-slate-50 text-base font-medium">
                    {profile.phone_number || "Add phone number"}
                  </Text>
                </View>
              )}

              {/* Action Button */}
              {editingPhone ? (
                <TouchableOpacity
                  onPress={handleSavePhone}
                  disabled={savingPhone}
                >
                  <Text className="text-sky-400 text-xs font-semibold">
                    {savingPhone ? "Saving..." : "SAVE"}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => router.push("/update_phone")}>
                  <Text className="text-sky-400 text-xs font-semibold">
                    CHANGE
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <Text className="text-slate-400 text-[11px] mt-2">
              Keep your phone number updated to maintain access to QuickPay.
            </Text>
          </View>

          {/* -------------------------------------- */}
          {/* Merchant Mode Toggle */}
          {/* -------------------------------------- */}
          <Text className="mt-5 mb-1 px-4 text-[11px] text-slate-400 tracking-[1px]">
            QUICKPAY MERCHANT MODE
          </Text>

          <View className="mx-4 rounded-2xl bg-slate-950/70 border border-slate-800 px-3 py-3">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-slate-900 items-center justify-center">
                <Ionicons name="storefront-outline" size={18} color="#22C55E" />
              </View>

              <View className="flex-1 ml-3">
                <Text className="text-slate-50 text-[15px] font-semibold">
                  Merchant Mode
                </Text>
                <Text className="text-slate-400 text-[11px] mt-1 leading-4">
                  Turn on Merchant Mode to manage daily sales and track
                  performance.
                </Text>
              </View>

              <Switch
                value={merchantEnabled}
                onValueChange={handleToggleMerchant}
                thumbColor={merchantEnabled ? "#22C55E" : "#E5E7EB"}
                trackColor={{ false: "#4B5563", true: "#16A34A" }}
              />
            </View>
          </View>

          {/* -------------------------------------- */}
          {/* Personal Details Section */}
          {/* -------------------------------------- */}
          <Text className="mt-5 mb-1 px-4 text-[11px] text-slate-400 tracking-[1px]">
            PERSONAL DETAILS
          </Text>

          <View className="mx-4 rounded-2xl bg-slate-950/70 border border-slate-800 px-3 py-3">
            <ProfileRow
              icon="mail-outline"
              label="Email"
              value={profile.email || ""}
            />

            <View className="h-px bg-slate-800 -mx-3" />

            <ProfileRow
              icon="person-outline"
              label="First Name"
              value={profile.first_name || ""}
            />

            <View className="h-px bg-slate-800 -mx-3" />

            <ProfileRow
              icon="person-outline"
              label="Last Name"
              value={profile.last_name || ""}
            />

            <View className="h-px bg-slate-800 -mx-3" />

            <ProfileRow
              icon="call-outline"
              label="Phone"
              value={profile.phone_number || ""}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// UI helper row for personal details
type RowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

function ProfileRow({ icon, label, value }: RowProps) {
  return (
    <View className="flex-row justify-between items-center py-3">
      <View className="flex-row items-center">
        <Ionicons name={icon} size={18} color="#9CA3AF" />
        <Text className="ml-2 text-[12px] text-slate-400">{label}</Text>
      </View>
      <Text className="text-[14px] text-slate-50">{value || "-"}</Text>
    </View>
  );
}

// Date formatting helper
function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
