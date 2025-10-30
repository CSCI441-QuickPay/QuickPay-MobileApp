import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

interface HeaderProps {
  name: string;
}

export default function Header({ name }: HeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-6 py-4">
      {/* User Info */}
      <View className="flex-row items-center">
        <View className="w-12 h-12 rounded-full bg-[#00332d] items-center justify-center mr-3">
          <Text className="text-white text-lg font-bold">
            {name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View>
          <Text className="text-sm text-gray-600">Welcome back,</Text>
          <Text className="text-xl font-bold text-gray-900">{name}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row items-center gap-3">
        {/* QR Code Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push("/(main)/qr_code")}
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
        >
          <Ionicons name="qr-code-outline" size={22} color="#00332d" />
        </TouchableOpacity>

        {/* Settings Button - Redirects to Profile */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push("/(main)/profile")}
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
        >
          <Ionicons name="settings-outline" size={22} color="#00332d" />
        </TouchableOpacity>
      </View>
    </View>
  );
}