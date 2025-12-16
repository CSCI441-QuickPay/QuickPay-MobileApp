/**
 * written by: Team QuickPay
 * tested by: Team QuickPay
 * debugged by: Team QuickPay
 * Notes: Contributions were shared, see GitHub history for commit details.
 * Unit Tests for UserSyncService
 */
import { SafeAreaView, View, Text, TouchableOpacity, ScrollView, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useRouter } from "expo-router";

export default function SecurityScreen() {
  const router = useRouter();

  // Switch states
  const [faceID, setFaceID] = useState(true);
  const [confidentialMode, setConfidentialMode] = useState(false);
  const [facePass, setFacePass] = useState(false);
  const [faceTransfer, setFaceTransfer] = useState(true);

  return (
    <SafeAreaView className="flex-1 bg-[#00332d]">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="white" />
        </TouchableOpacity>

        <Text className="flex-1 text-center text-lg font-semibold text-white">
          Security
        </Text>

        <View className="w-6" />
      </View>

      <ScrollView className="flex-1">
        {/* Top Banner */}
        <View className="mx-4 mt-3 bg-white/10 rounded-2xl p-5 border border-white/10">
          <Text className="text-white text-base font-semibold">
            Protect Your QuickPay Account
          </Text>

          <Text className="text-white/70 text-sm mt-1">
            Add extra layers of security to keep your account safe.
          </Text>

          <TouchableOpacity className="bg-white mt-4 py-3 rounded-xl items-center">
            <Text className="text-[#00332d] font-semibold">LEARN MORE</Text>
          </TouchableOpacity>
        </View>

        {/* ====================== GENERAL ====================== */}
        <Text className="mt-8 mb-2 px-4 text-xs tracking-widest text-white/40">
          GENERAL
        </Text>

        {/* Face ID Login */}
        <SecurityRow
          icon="scan-outline"
          label="Login with Face ID"
          subtitle="Log into QuickPay easily using Face ID."
          toggleValue={faceID}
          onToggle={() => setFaceID(!faceID)}
        />

        {/* Confidential Mode */}
        <SecurityRow
          icon="eye-off-outline"
          label="Confidential Mode"
          subtitle="Flip phone to hide balance and sensitive info."
          toggleValue={confidentialMode}
          onToggle={() => setConfidentialMode(!confidentialMode)}
        />

        {/* Change PIN */}
        <SecurityRow
          icon="key-outline"
          label="Change PIN"
          subtitle="Update your 4-digit security PIN."
          chevron
          onPress={() => console.log("Navigate to change PIN")}
        />

        {/* Auto Logout */}
        <SecurityRow
          icon="time-outline"
          label="Logout after 1 minute"
          subtitle="QuickPay will auto-lock after inactivity."
          chevron
        />

        {/* ====================== AUTHORIZATION ====================== */}
        <Text className="mt-8 mb-2 px-4 text-xs tracking-widest text-white/40">
          AUTHORIZATION OPTIONS
        </Text>

        {/* FacePass */}
        <SecurityRow
          icon="id-card-outline"
          label="Pay & Transfer with FacePass"
          subtitle="Transaction Limit: Above $100,000"
          toggleValue={facePass}
          onToggle={() => setFacePass(!facePass)}
        />

        {/* Face ID Payments */}
        <SecurityRow
          icon="finger-print-outline"
          label="Pay & Transfer with Face ID"
          subtitle="Limit: Up to $400"
          toggleValue={faceTransfer}
          onToggle={() => setFaceTransfer(!faceTransfer)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ============================================================
   COMPONENT: Security Row (Card Style)
   ============================================================ */
function SecurityRow({
  icon,
  label,
  subtitle,
  toggleValue,
  onToggle,
  chevron,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  toggleValue?: boolean;
  onToggle?: () => void;
  chevron?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      disabled={!onPress}
      onPress={onPress}
      className="mx-4 bg-white/10 border border-white/10 rounded-2xl px-4 py-4 mb-3 flex-row items-center"
    >
      {/* Icon */}
      <View className="w-10 h-10 rounded-full bg-white/5 items-center justify-center">
        <Ionicons name={icon} size={20} color="white" />
      </View>

      {/* Text Content */}
      <View className="flex-1 ml-3">
        <Text className="text-white text-[15px] font-semibold">{label}</Text>
        {subtitle && (
          <Text className="text-white/60 text-xs leading-4 mt-1">
            {subtitle}
          </Text>
        )}
      </View>

      {/* Toggle or Chevron */}
      {toggleValue !== undefined ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          thumbColor={toggleValue ? "#00c57d" : "#ddd"}
          trackColor={{ true: "#0faa68", false: "#555" }}
        />
      ) : chevron ? (
        <Ionicons name="chevron-forward" size={20} color="white" />
      ) : null}
    </TouchableOpacity>
  );
}
