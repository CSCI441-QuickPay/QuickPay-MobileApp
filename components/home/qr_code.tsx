import React, { useState } from "react";
import { View, Text, TouchableOpacity, Share, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import Svg, { Rect, G } from "react-native-svg";
import * as Clipboard from "expo-clipboard";

// Simple QR Code placeholder component
function SimpleQRCode({ value, size = 200 }: { value: string; size?: number }) {
  // This is a simplified visual representation
  // In production, use react-native-qrcode-svg or similar library
  const gridSize = 21; // Standard QR code grid
  const cellSize = size / gridSize;
  
  // Create a simple pattern based on the value
  const pattern = value.split("").map((char) => char.charCodeAt(0) % 2 === 0);
  
  return (
    <View style={{ width: size, height: size, backgroundColor: "white" }}>
      <Svg width={size} height={size}>
        <G>
          {/* Border */}
          <Rect x={0} y={0} width={cellSize * 7} height={cellSize * 7} fill="#00332d" />
          <Rect x={cellSize} y={cellSize} width={cellSize * 5} height={cellSize * 5} fill="white" />
          <Rect x={cellSize * 2} y={cellSize * 2} width={cellSize * 3} height={cellSize * 3} fill="#00332d" />
          
          <Rect x={cellSize * 14} y={0} width={cellSize * 7} height={cellSize * 7} fill="#00332d" />
          <Rect x={cellSize * 15} y={cellSize} width={cellSize * 5} height={cellSize * 5} fill="white" />
          <Rect x={cellSize * 16} y={cellSize * 2} width={cellSize * 3} height={cellSize * 3} fill="#00332d" />
          
          <Rect x={0} y={cellSize * 14} width={cellSize * 7} height={cellSize * 7} fill="#00332d" />
          <Rect x={cellSize} y={cellSize * 15} width={cellSize * 5} height={cellSize * 5} fill="white" />
          <Rect x={cellSize * 2} y={cellSize * 16} width={cellSize * 3} height={cellSize * 3} fill="#00332d" />
          
          {/* Pattern based on data */}
          {Array.from({ length: 100 }).map((_, i) => {
            const x = (i % 10) + 8;
            const y = Math.floor(i / 10) + 8;
            if (pattern[i % pattern.length]) {
              return (
                <Rect
                  key={i}
                  x={x * cellSize}
                  y={y * cellSize}
                  width={cellSize}
                  height={cellSize}
                  fill="#00332d"
                />
              );
            }
            return null;
          })}
        </G>
      </Svg>
      
      {/* Overlay message */}
      <View style={{ position: "absolute", bottom: 10, left: 0, right: 0, alignItems: "center" }}>
        <View style={{ backgroundColor: "rgba(0, 51, 45, 0.9)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
          <Text style={{ color: "white", fontSize: 10, fontWeight: "600" }}>
            Scan to Pay
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function QRCodePage() {
  const { user } = useUser();
  const [showDetails, setShowDetails] = useState(false);

  // Generate unique payment ID (you can customize this based on your backend)
  const paymentId = user?.id || "USER_ID";
  const userName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User";
  const userEmail = user?.primaryEmailAddress?.emailAddress || "";

  // QR Code data - format as JSON for easy parsing
  const qrData = JSON.stringify({
    id: paymentId,
    name: userName,
    email: userEmail,
    type: "payment",
  });

  const handleCopyId = async () => {
    await Clipboard.setStringAsync(paymentId);
    Alert.alert("Copied!", "Payment ID copied to clipboard");
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Send money to ${userName}\nPayment ID: ${paymentId}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <View className="bg-white px-6 py-4 flex-row items-center justify-between border-b border-gray-200">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center -ml-2"
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">My QR Code</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleShare}
          className="w-10 h-10 items-center justify-center -mr-2"
        >
          <Ionicons name="share-outline" size={24} color="#00332d" />
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView className="flex-1" contentContainerStyle={{ paddingVertical: 20 }}>
        <View className="items-center px-6">
          {/* QR Code Card */}
          <View className="bg-white rounded-3xl p-8 items-center shadow-lg w-full max-w-sm">
            {/* User Info */}
            <View className="items-center mb-6">
              <View className="w-16 h-16 rounded-full bg-[#00332d] items-center justify-center mb-3">
                <Text className="text-white text-2xl font-bold">
                  {userName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text className="text-xl font-bold text-gray-900">{userName}</Text>
              <Text className="text-sm text-gray-600 mt-1">{userEmail}</Text>
            </View>

            {/* QR Code */}
            <View className="bg-white p-4 rounded-2xl border-4 border-[#00332d] mb-6">
              <SimpleQRCode value={qrData} size={220} />
            </View>

            {/* Payment ID */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleCopyId}
              className="bg-gray-100 rounded-xl px-4 py-3 w-full flex-row items-center justify-between"
            >
              <View className="flex-1">
                <Text className="text-xs text-gray-600 mb-1">Payment ID</Text>
                <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>
                  {paymentId}
                </Text>
              </View>
              <Ionicons name="copy-outline" size={20} color="#00332d" />
            </TouchableOpacity>
          </View>

          {/* Instructions */}
          <View className="mt-8 w-full">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowDetails(!showDetails)}
              className="flex-row items-center justify-center"
            >
              <Text className="text-sm text-gray-600 mr-2">How to use</Text>
              <Ionicons
                name={showDetails ? "chevron-up" : "chevron-down"}
                size={16}
                color="#6B7280"
              />
            </TouchableOpacity>

            {showDetails && (
              <View className="mt-4 bg-white rounded-xl p-4">
                <View className="flex-row mb-4">
                  <View className="w-8 h-8 rounded-full bg-[#00332d] items-center justify-center mr-3">
                    <Text className="text-white text-sm font-bold">1</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-gray-900 mb-1">
                      Show QR Code
                    </Text>
                    <Text className="text-xs text-gray-600">
                      Let the sender scan this QR code to instantly get your payment details
                    </Text>
                  </View>
                </View>

                <View className="flex-row mb-4">
                  <View className="w-8 h-8 rounded-full bg-[#00332d] items-center justify-center mr-3">
                    <Text className="text-white text-sm font-bold">2</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-gray-900 mb-1">
                      Share Payment ID
                    </Text>
                    <Text className="text-xs text-gray-600">
                      Or share your unique Payment ID via text or email
                    </Text>
                  </View>
                </View>

                <View className="flex-row">
                  <View className="w-8 h-8 rounded-full bg-[#00332d] items-center justify-center mr-3">
                    <Text className="text-white text-sm font-bold">3</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-gray-900 mb-1">
                      Receive Money
                    </Text>
                    <Text className="text-xs text-gray-600">
                      Money will be instantly credited to your account
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View className="bg-white px-6 py-4 border-t border-gray-200 gap-3">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleShare}
          className="bg-[#00332d] rounded-2xl py-4 flex-row items-center justify-center"
        >
          <Ionicons name="share-outline" size={20} color="white" style={{ marginRight: 8 }} />
          <Text className="text-white text-base font-bold">Share QR Code</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleCopyId}
          className="bg-white border-2 border-[#00332d] rounded-2xl py-4 flex-row items-center justify-center"
        >
          <Ionicons name="copy-outline" size={20} color="#00332d" style={{ marginRight: 8 }} />
          <Text className="text-[#00332d] text-base font-bold">Copy Payment ID</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}