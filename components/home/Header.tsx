import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";
import QRCodeModal from "./QRCodeModal";
import { fetchProfile } from "@/services/profileService";
import { router } from "expo-router";

export default function Header() {
  const [showQRModal, setShowQRModal] = useState(false);
  const { user, isLoaded } = useUser();
  const [supabaseProfile, setSupabaseProfile] = useState<{ profile_picture?: string | null } | null>(null);

  if (!isLoaded || !user) return null;

  // Load Supabase profile (for avatar)
  useEffect(() => {
    const load = async () => {
      if (!isLoaded || !user?.id) return;
      try {
        const p = await fetchProfile(user.id);
        setSupabaseProfile(p);
      } catch (err) {
        console.log("Header fetchProfile error:", err);
      }
    };

    load();
  }, [isLoaded, user?.id]);

  // Initials fallback
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const fullName =
    `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";
  const initials = getInitials(fullName);

  return (
    <>
      <View className="flex-row items-center justify-between px-6 py-4">
        {/* User Info */}
        <View className="flex-row items-center">
          {/* Avatar or initials */}
          <View className="w-12 h-12 rounded-full bg-[#00332d] overflow-hidden items-center justify-center mr-3">
            {supabaseProfile?.profile_picture ? (
              <Image
                source={{ uri: supabaseProfile.profile_picture }}
                className="w-12 h-12"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-white text-lg font-bold">{initials}</Text>
            )}
          </View>

          <View>
            <Text className="text-sm text-gray-600">Welcome back,</Text>
            <Text className="text-xl font-bold text-gray-900">
              {user.firstName}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowQRModal(true)}
            className="w-12 h-12 rounded-full bg-[#FB2C36] items-center justify-center"
            style={{
              shadowColor: "#00332d",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
            }}
          >
            <Ionicons name="qr-code-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <QRCodeModal visible={showQRModal} onClose={() => setShowQRModal(false)} />
    </>
  );
}
