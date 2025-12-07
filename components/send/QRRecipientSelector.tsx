/**
 * written by: Team QuickPay
 * tested by: Team QuickPay
 * debugged by: Team QuickPay
 * Notes: Contributions were shared, see GitHub history for commit details.
 * Unit Tests for UserSyncService
 */
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function QRRecipientSelector() {
  const handleScanQR = () => {
    // Navigate to QR scanner with a flag indicating it's for sending payment
    router.push({
      pathname: '/qr_scan',
      params: { returnTo: 'send' },
    });
  };

  return (
    <View className="flex-1 items-center justify-center px-6 py-12">
      {/* QR Icon */}
      <View className="w-24 h-24 rounded-3xl bg-[#00332d] items-center justify-center mb-6">
        <Ionicons name="qr-code-outline" size={48} color="white" />
      </View>

      {/* Title */}
      <Text className="text-2xl font-bold text-gray-900 mb-2">
        Scan QR Code
      </Text>

      {/* Description */}
      <Text className="text-base text-gray-600 text-center mb-8 px-4">
        Scan a QuickPay QR code to automatically fill in the recipient's account number
      </Text>

      {/* Scan button */}
      <TouchableOpacity
        onPress={handleScanQR}
        className="bg-[#00332d] rounded-2xl px-8 py-4 flex-row items-center"
        activeOpacity={0.7}
      >
        <Ionicons name="camera" size={24} color="white" />
        <Text className="text-white font-bold text-lg ml-2">
          Open Camera
        </Text>
      </TouchableOpacity>

      {/* Help text */}
      <View className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4 w-full">
        <View className="flex-row items-start">
          <Ionicons name="information-circle" size={20} color="#3B82F6" style={{ marginTop: 2 }} />
          <View className="flex-1 ml-2">
            <Text className="text-sm font-semibold text-blue-900 mb-1">
              How it works
            </Text>
            <Text className="text-sm text-blue-800">
              Ask the recipient to show their QuickPay QR code from their profile, then scan it with your camera to instantly add their account.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
