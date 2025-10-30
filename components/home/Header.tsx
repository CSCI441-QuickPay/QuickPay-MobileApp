import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import QRCodeModal from "./QRCodeModal";

export default function Header() {
  const [showQRModal, setShowQRModal] = useState(false);
  const { user, isLoaded } = useUser();

  if (!isLoaded || !user) {
    return null;
  }

  // ✅ SAME LOGIC AS PROFILE
  const getInitials = (name: string) => {
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";
  const initials = getInitials(fullName);

  return (
    <>
      <View className="flex-row items-center justify-between px-6 py-4">
        {/* User Info */}
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-full bg-[#00332d] items-center justify-center mr-3">
            <Text className="text-white text-lg font-bold">{initials}</Text>
          </View>
          <View>
            <Text className="text-sm text-gray-600">Welcome back,</Text>
            <Text className="text-xl font-bold text-gray-900">{fullName}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row items-center gap-3">
          {/* QR Code Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowQRModal(true)}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
          >
            <Ionicons name="qr-code-outline" size={22} color="#00332d" />
          </TouchableOpacity>

          {/* Settings Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/(main)/profile")}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
          >
            <Ionicons name="settings-outline" size={22} color="#00332d" />
          </TouchableOpacity>
        </View>
      </View>

      {/* QR Code Modal */}
      <QRCodeModal visible={showQRModal} onClose={() => setShowQRModal(false)} />
    </>
  );
}
