import { SafeAreaView, View, Text, Switch, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useRouter } from "expo-router";

export default function NotificationSettings() {
  const router = useRouter();

  // Here are the states (connect to Supabase later if needed)
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(false);

  const [transactionAlerts, setTransactionAlerts] = useState(true);
  const [requestAlerts, setRequestAlerts] = useState(true);
  const [promotions, setPromotions] = useState(true);

  return (
    <SafeAreaView className="flex-1 bg-[#00332d]">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="white" />
        </TouchableOpacity>

        <Text className="flex-1 text-center text-lg font-semibold text-white">
          Notifications
        </Text>

        <View className="w-6" />
      </View>

      <ScrollView className="mt-2" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* MASTER NOTIFICATION SECTION */}
        <Text className="px-4 text-white/80 text-xs tracking-widest mt-4 mb-1">
          GENERAL NOTIFICATIONS
        </Text>

        <View className="mx-4 rounded-2xl bg-white/10 border border-white/10 overflow-hidden">
          {/* Push Notifications */}
          <View className="flex-row items-center justify-between px-4 py-4">
            <View className="flex-row items-center">
              <Ionicons name="notifications-outline" size={20} color="#A7F3D0" />
              <Text className="text-white text-base ml-3">Push Notifications</Text>
            </View>

            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              thumbColor={pushEnabled ? "#34D399" : "#E5E7EB"}
              trackColor={{ false: "#4B5563", true: "#065F46" }}
            />
          </View>

          {/* Email */}
          <View className="h-px bg-white/10 mx-4" />

          <View className="flex-row items-center justify-between px-4 py-4">
            <View className="flex-row items-center">
              <Ionicons name="mail-outline" size={20} color="#A7F3D0" />
              <Text className="text-white text-base ml-3">Email Notifications</Text>
            </View>

            <Switch
              value={emailEnabled}
              onValueChange={setEmailEnabled}
              thumbColor={emailEnabled ? "#34D399" : "#E5E7EB"}
              trackColor={{ false: "#4B5563", true: "#065F46" }}
            />
          </View>

          {/* SMS */}
          <View className="h-px bg-white/10 mx-4" />

          <View className="flex-row items-center justify-between px-4 py-4">
            <View className="flex-row items-center">
              <Ionicons name="chatbox-outline" size={20} color="#A7F3D0" />
              <Text className="text-white text-base ml-3">SMS Notifications</Text>
            </View>

            <Switch
              value={smsEnabled}
              onValueChange={setSmsEnabled}
              thumbColor={smsEnabled ? "#34D399" : "#E5E7EB"}
              trackColor={{ false: "#4B5563", true: "#065F46" }}
            />
          </View>
        </View>

        {/* TRANSACTION SECTION */}
        <Text className="px-4 text-white/80 text-xs tracking-widest mt-8 mb-1">
          TRANSACTION ALERTS
        </Text>

        <View className="mx-4 rounded-2xl bg-white/10 border border-white/10 overflow-hidden">
          {/* Transaction Alerts */}
          <View className="flex-row items-center justify-between px-4 py-4">
            <View className="flex-row items-center">
              <Ionicons name="card-outline" size={20} color="#A7F3D0" />
              <Text className="text-white text-base ml-3">Incoming / Outgoing Transfers</Text>
            </View>

            <Switch
              value={transactionAlerts}
              onValueChange={setTransactionAlerts}
              thumbColor={transactionAlerts ? "#34D399" : "#E5E7EB"}
              trackColor={{ false: "#4B5563", true: "#065F46" }}
            />
          </View>

          <View className="h-px bg-white/10 mx-4" />

          {/* Payment Request Alerts */}
          <View className="flex-row items-center justify-between px-4 py-4">
            <View className="flex-row items-center">
              <Ionicons name="swap-horizontal-outline" size={20} color="#A7F3D0" />
              <Text className="text-white text-base ml-3">Payment Requests</Text>
            </View>

            <Switch
              value={requestAlerts}
              onValueChange={setRequestAlerts}
              thumbColor={requestAlerts ? "#34D399" : "#E5E7EB"}
              trackColor={{ false: "#4B5563", true: "#065F46" }}
            />
          </View>
        </View>

        {/* MARKETING SECTION */}
        <Text className="px-4 text-white/80 text-xs tracking-widest mt-8 mb-1">
          MARKETING & PROMOTIONS
        </Text>

        <View className="mx-4 rounded-2xl bg-white/10 border border-white/10 overflow-hidden">
          <View className="flex-row items-center justify-between px-4 py-4">
            <View className="flex-row items-center">
              <Ionicons name="gift-outline" size={20} color="#A7F3D0" />
              <Text className="text-white text-base ml-3">Promotions & Offers</Text>
            </View>

            <Switch
              value={promotions}
              onValueChange={setPromotions}
              thumbColor={promotions ? "#34D399" : "#E5E7EB"}
              trackColor={{ false: "#4B5563", true: "#065F46" }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
