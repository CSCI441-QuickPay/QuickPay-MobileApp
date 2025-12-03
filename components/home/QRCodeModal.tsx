import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  Clipboard,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";
import QRCode from "react-native-qrcode-svg";
import * as Sharing from "expo-sharing";
import ViewShot from "react-native-view-shot";
import UserModel from "@/models/UserModel";
import { supabase } from "@/config/supabaseConfig";
import { fetchProfile } from "@/services/profileService";
import { useFocusEffect } from "@react-navigation/native";
import { getInitials } from "@/utils/profileUtils";
import { Profile as SupaProfile } from "../../types/Profile";

interface QRCodeModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function QRCodeModal({ visible, onClose }: QRCodeModalProps) {
  const { user, isLoaded } = useUser();
  const [showDetails, setShowDetails] = useState(false);
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const viewShotRef = useRef<ViewShot>(null);
  const [supabaseProfile, setSupabaseProfile] = useState<SupaProfile | null>(
    null
  );
  const fullName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User"
    : "Guest";
  const userEmail = user?.primaryEmailAddress?.emailAddress || "Not provided";
   // Load Supabase profile whenever this screen comes into focus
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadProfile = async () => {
        if (!isLoaded || !user?.id) return;

        try {
          const p = await fetchProfile(user.id);
          console.log("PROFILE HEADER from Supabase (focus):", p);

          if (isActive) {
            setSupabaseProfile(p || null);
          }
        } catch (err) {
          console.log("Profile header fetchProfile error:", err);
        }
      };

      loadProfile();

      // cleanup when screen loses focus
      return () => {
        isActive = false;
      };
    }, [isLoaded, user?.id])
  );
  // Load account number from database
  useEffect(() => {
    const loadAccountNumber = async () => {
      if (!user) return;

      try {
        setLoading(true);
        console.log("🔍 QRCodeModal: Fetching user for Clerk ID:", user.id);

        // Direct Supabase query to bypass any caching
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('clerk_id', user.id)
          .single();

        console.log("🔍 QRCodeModal: Raw Supabase response:");
        console.log("   - Has data:", !!data);
        console.log("   - Error:", error?.message || "none");
        console.log("   - Email:", data?.email);
        console.log("   - account_number field:", data?.account_number);
        console.log("   - Type of account_number:", typeof data?.account_number);
        console.log("   - Full data:", JSON.stringify(data, null, 2));

        if (error) {
          console.error("❌ Supabase query error:", error);
        }

        if (data?.account_number) {
          console.log("✅ Account number FOUND:", data.account_number);
          setAccountNumber(data.account_number);
        } else {
          console.warn("⚠️ Account number is NULL/undefined in database");
          console.warn("   Check Supabase dashboard to confirm the value exists");
        }
      } catch (error) {
        console.error("❌ Error loading account number:", error);
      } finally {
        setLoading(false);
      }
    };

    if (visible) {
      loadAccountNumber();
    }
  }, [user, visible]);

  const qrData = JSON.stringify({
    accountNumber: accountNumber,
    name: fullName,
    email: userEmail,
    type: "payment",
  });

  const handleCopyId = async () => {
    Clipboard.setString(accountNumber);
    Alert.alert("Copied!", "Account Number copied to clipboard");
  };

  const handleShare = async () => {
    try {
      if (viewShotRef.current && viewShotRef.current.capture) {
        // Capture the QR code card as an image
        const uri = await viewShotRef.current.capture();

        // Check if sharing is available
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: `Share QR Code - ${fullName}`,
            UTI: "public.png",
          });
        } else {
          Alert.alert("Success", "QR Code image saved successfully!");
        }
      }
    } catch (error) {
      console.error("Error sharing QR code:", error);
      Alert.alert("Error", "Failed to save QR code image");
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white px-6 py-4 flex-row items-center justify-between border-b border-gray-200 pt-12">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onClose}
            className="w-10 h-10 items-center justify-center -ml-2"
          >
            <Ionicons name="close" size={28} color="#9CA3AF" />
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

        {/* Content */}
        <View className="flex-1 items-center justify-start px-6 py-6">
          {/* QR Code Card */}
          <ViewShot
            ref={viewShotRef}
            options={{
              format: "png",
              quality: 1.0,
            }}
          >
            <View className="bg-white rounded-3xl p-8 items-center shadow-lg w-full max-w-sm">
              {/* User Info */}
              <View className="items-center mt-2 mb-4">
                {/* Avatar */}
                <View className="w-16 h-16 rounded-full bg-[#00332d] items-center justify-center overflow-hidden">
                  {supabaseProfile?.profile_picture ? (
                    <Image
                      source={{ uri: supabaseProfile.profile_picture }}
                      className="w-16 h-16"
                      resizeMode="cover"
                    />
                  ) : (
                    <Text className="text-white text-2xl font-bold">
                      {getInitials(fullName)}
                    </Text>
                  )}
                </View>

                {/* Name */}
                <Text className="text-lg font-semibold text-[#00332d] mt-3">
                  {fullName}
                </Text>

                {/* Email */}
                <Text className="text-gray-600 text-sm mt-1">
                  {userEmail}
                </Text>
              </View>

              
              {/* QR Code */}
              <View className="bg-white mt-4 rounded-2xl p-4 border-4 border-white/20">
                <QRCode
                  value={qrData}
                  size={220}
                  color="#00332d"
                  backgroundColor="white"
                />
              </View>

              {/* Account Number */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleCopyId}
                className="bg-gray-100 rounded-xl px-4 py-3 w-full flex-row items-center justify-between mt-6"
              >
                <View className="flex-1">
                  <Text className="text-xs text-gray-600 mb-1">Account Number</Text>
                  {loading ? (
                    <ActivityIndicator size="small" color="#00332d" />
                  ) : (
                    <Text
                      className="text-sm font-semibold text-gray-900"
                      numberOfLines={1}
                    >
                      {accountNumber || "Loading..."}
                    </Text>
                  )}
                </View>
                <Ionicons name="copy-outline" size={20} color="#00332d" />
              </TouchableOpacity>
            </View>
          </ViewShot>

          {/* Instructions */}
          <View className="w-full mt-4">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowDetails(!showDetails)}
              className="flex-row items-center justify-center mb-2"
            >
              <Text className="text-sm text-gray-600 mr-2">How to use</Text>
              <Ionicons
                name={showDetails ? "chevron-up" : "chevron-down"}
                size={16}
                color="#6B7280"
              />
            </TouchableOpacity>

            {showDetails && (
              <View className="bg-white rounded-xl p-4">
                {[
                  {
                    step: "1",
                    title: "Show QR Code",
                    desc: "Let the sender scan this QR code to instantly get your payment details.",
                  },
                  {
                    step: "2",
                    title: "Share Account Number",
                    desc: "Or share your unique Account Number via text or email.",
                  },
                  {
                    step: "3",
                    title: "Receive Money",
                    desc: "Money will be instantly credited to your account.",
                  },
                ].map((item, i) => (
                  <View
                    key={i}
                    className={`flex-row ${i < 2 ? "mb-3" : ""}`}
                  >
                    <View className="w-8 h-8 rounded-full bg-[#00332d] items-center justify-center mr-3">
                      <Text className="text-white text-sm font-bold">
                        {item.step}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-gray-900 mb-0.5">
                        {item.title}
                      </Text>
                      <Text className="text-xs text-gray-600 leading-4">
                        {item.desc}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
