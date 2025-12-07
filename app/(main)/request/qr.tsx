/**
 * written by: Team QuickPay
 * tested by: Team QuickPay
 * debugged by: Team QuickPay
 * Notes: Contributions were shared, see GitHub history for commit details.
 * Unit Tests for UserSyncService
 */
import { fetchProfile } from "@/services/profileService";
import type { Profile } from "@/types/Profile";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  SafeAreaView,
  Share,
  Text, TouchableOpacity,
  View
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { captureRef } from "react-native-view-shot";

export default function RequestQR() {
  const { amount } = useLocalSearchParams();
  const { user } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);

  // ❗ THIS REF IS REQUIRED
  const qrRef = useRef(null);

  useEffect(() => {
    if (user?.id) fetchProfile(user.id).then(setProfile);
  }, [user?.id]);

  const displayName =
    `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() ||
    `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();

  const avatar = profile?.profile_picture ?? null;

  const formatWithCommas = (value: string) =>
    Number(value || 0).toLocaleString("en-US");

  // 🔥 SHARE QR IMAGE
  const shareQR = async () => {
    try {
      const uri = await captureRef(qrRef, {
        format: "png",
        quality: 1,
      });

      await Share.share({
        url: uri,
        title: "My QuickPay QR",
        message: "Scan to send me money via QuickPay.",
      });
    } catch (err) {
      console.log("shareQR error:", err);
    }
  };

  // 🔥 SHARE DEEP LINK
  const shareLink = async () => {
    try {
      const link = `quickpay://request?amount=${amount}&uid=${user?.id}`;

      await Share.share({
        message: `Send me money via QuickPay:\n${link}`,
      });
    } catch (err) {
      console.log("shareLink error:", err);
    }
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

        <TouchableOpacity onPress={shareQR}>
          <Ionicons name="share-outline" size={26} color="#00332d" />
        </TouchableOpacity>
      </View>

      {/* Main Card */}
      <View className="mx-6 mt-8 bg-white p-6 rounded-3xl shadow-lg">
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
          <View ref={qrRef} collapsable={false}>
            <QRCode
              value={`quickpay://request?amount=${amount}&uid=${user?.id}`}
              size={220}
              color="#00332d"
              backgroundColor="white"
            />
          </View>
        </View>

        {/* CHANGE + RESET */}
        <View className="flex-row justify-between mt-6 gap-3">
          <TouchableOpacity
            onPress={() =>
              router.replace({ pathname: "/request", params: { initialAmount: amount } })
            }
            className="flex-1 bg-[#00332d]/90 py-3 rounded-xl items-center"
          >
            <Text className="text-white font-semibold">CHANGE</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              router.replace({ pathname: "/request", params: { initialAmount: "0" } })
            }
            className="flex-1 bg-gray-200 py-3 rounded-xl items-center"
          >
            <Text className="text-[#00332d] font-semibold">RESET</Text>
          </TouchableOpacity>
        </View>

        {/* SHARE BUTTONS */}
        <View className="mt-6 flex-row justify-center gap-10">
          <TouchableOpacity onPress={shareQR} className="items-center">
            <View className="w-12 h-12 rounded-full bg-[#00332d]/10 items-center justify-center">
              <Ionicons name="qr-code-outline" size={26} color="#00332d" />
            </View>
            <Text className="text-[#00332d] text-xs mt-1">Share QR</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={shareLink} className="items-center">
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
