import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Share,
  Alert,
  Modal,
  Clipboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";
import QRCode from "react-native-qrcode-svg";

interface QRCodeModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function QRCodeModal({ visible, onClose }: QRCodeModalProps) {
  const { user } = useUser();
  const [showDetails, setShowDetails] = useState(false);

  const paymentId = user?.id || "USER_ID";
  const userName =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User";
  const userEmail = user?.primaryEmailAddress?.emailAddress || "";

  const qrData = JSON.stringify({
    id: paymentId,
    name: userName,
    email: userEmail,
    type: "payment",
  });

  const handleCopyId = async () => {
    Clipboard.setString(paymentId);
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
            <Ionicons name="close" size={28} color="#000" />
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
            <View className="bg-white mt-4 rounded-2xl p-4 border-4 border-white/20">
              <QRCode
                value={qrData}
                size={220}
                color="#00332d"
                backgroundColor="white"
              />
            </View>

            {/* Payment ID */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleCopyId}
              className="bg-gray-100 rounded-xl px-4 py-3 w-full flex-row items-center justify-between mt-6"
            >
              <View className="flex-1">
                <Text className="text-xs text-gray-600 mb-1">Payment ID</Text>
                <Text
                  className="text-sm font-semibold text-gray-900"
                  numberOfLines={1}
                >
                  {paymentId}
                </Text>
              </View>
              <Ionicons name="copy-outline" size={20} color="#00332d" />
            </TouchableOpacity>
          </View>

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
                    title: "Share Payment ID",
                    desc: "Or share your unique Payment ID via text or email.",
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
