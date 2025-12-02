import { fetchProfile } from "@/services/profileService";
import type { Profile } from "@/types/Profile";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

export default function RequestQR() {
  const { amount } = useLocalSearchParams();
  const { user } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (user?.id) fetchProfile(user.id).then(setProfile);
  }, [user?.id]);

  const displayName =
    `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() ||
    `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();

  const avatar = profile?.profile_picture ?? null;

  const formatWithCommas = (value: string) => {
    if (!value) return "0";
    return Number(value).toLocaleString("en-US");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity onPress={() => router.replace("/(main)/home")}>
          <Ionicons name="close" size={26} color="#00332d" />
        </TouchableOpacity>

        <Text className="flex-1 text-center text-xl font-semibold text-[#00332d]">
          My QR Code
        </Text>

        <View className="w-6" />
      </View>

      {/* Main Card */}
      <View className="mx-6 mt-4 bg-white p-6 rounded-3xl shadow-lg">
        {/* Avatar */}
        <View className="items-center">
          <View className="w-16 h-16 rounded-full bg-[#00332d] items-center justify-center overflow-hidden">
            {avatar ? (
              <Image source={{ uri: avatar }} className="w-16 h-16" />
            ) : (
              <Text className="text-white text-2xl font-bold">
                {displayName.charAt(0)}
              </Text>
            )}
          </View>

          <Text className="text-lg font-semibold text-[#00332d] mt-3">
            {displayName}
          </Text>
          <Text className="text-gray-600 text-sm mt-1">
            {user?.primaryEmailAddress?.emailAddress}
          </Text>
        </View>

        {/* Amount */}
        <View className="items-center mt-6">
          <Text className="text-gray-400 text-sm">REQUEST AMOUNT</Text>
          <Text className="text-4xl text-[#00332d] font-extrabold mt-1">
            ${formatWithCommas(amount as string)}
          </Text>
        </View>

        {/* QR Code */}
        <View className="items-center mt-6">
          <QRCode
            value={`quickpay://request?amount=${amount}&uid=${user?.id}`}
            size={220}
            color="#00332d"
            backgroundColor="white"
          />
        </View>

        {/* CHANGE + RESET Buttons */}
        <View className="flex-row justify-between mt-6 gap-3">
          {/* CHANGE */}
          <TouchableOpacity
            onPress={() =>
              router.replace({
                pathname: "/request",
                params: { initialAmount: amount }, // keep amount
              })
            }
            className="flex-1 bg-[#00332d]/90 py-3 rounded-xl items-center"
          >
            <Text className="text-white font-semibold">CHANGE</Text>
          </TouchableOpacity>

          {/* RESET */}
          <TouchableOpacity
            onPress={() =>
              router.replace({
                pathname: "/request",
                params: { initialAmount: "0" }, // reset
              })
            }
            className="flex-1 bg-gray-200 py-3 rounded-xl items-center"
          >
            <Text className="text-[#00332d] font-semibold">RESET</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-6 flex-row justify-center gap-10">
          {/* Share QR */}
          <TouchableOpacity className="items-center" activeOpacity={0.8}>
            <View className="w-12 h-12 rounded-full bg-[#00332d]/10 items-center justify-center">
              <Ionicons name="qr-code-outline" size={26} color="#00332d" />
            </View>
            <Text className="text-[#00332d] text-xs mt-1">Share QR</Text>
          </TouchableOpacity>

          {/* Share Link */}
          <TouchableOpacity className="items-center" activeOpacity={0.8}>
            <View className="w-12 h-12 rounded-full bg-[#00332d]/10 items-center justify-center">
              <Ionicons name="link-outline" size={26} color="#00332d" />
            </View>
            <Text className="text-[#00332d] text-xs mt-1">Share Link</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
