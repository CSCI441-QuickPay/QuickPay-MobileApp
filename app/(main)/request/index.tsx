/**
 * written by: Team QuickPay
 * tested by: Team QuickPay
 * debugged by: Team QuickPay
 * Notes: Contributions were shared, see GitHub history for commit details.
 * Unit Tests for UserSyncService
 */
import NumberPad from "@/components/request/NumberPad";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function RequestAmount() {
  const { initialAmount } = useLocalSearchParams();

  const initialRaw = Array.isArray(initialAmount)
    ? initialAmount[0]
    : initialAmount;

  // Internally: store amount WITHOUT commas -> "1234"
  const [amount, setAmount] = useState<string>(initialRaw ?? "0");
  const MAX_AMOUNT = 999_999_999;

  // Format displayed value → WITH commas
  const formatWithCommas = (value: string) => {
    if (value.includes(".")) {
      const [whole, decimal] = value.split(".");
      return Number(whole).toLocaleString("en-US") + "." + (decimal ?? "");
    }
    return Number(value).toLocaleString("en-US");
  };

  const handleNumPress = (n: string) => {
    let raw = amount;

    // Replace "0" unless input is "."
    if (raw === "0" && n !== ".") raw = n;
    else raw = raw + n;

    // Check limit (convert string WITHOUT commas)
    const numericValue = Number(raw);
    if (numericValue > MAX_AMOUNT) return;

    setAmount(raw);
  };

  const handleDelete = () => {
    if (amount.length === 1) setAmount("0");
    else setAmount(amount.slice(0, -1));
  };

  const confirm = () => {
    router.push({
      pathname: "/request/qr",
      params: { amount }, // send raw number WITHOUT commas
    });
  };

  const handleKeyboardChange = (text: string) => {
    let raw = text.replace(/,/g, "");

    raw = raw.replace(/^0+(?=\d)/, "");
    if (raw === "") raw = "0";

    if (!/^\d*\.?\d*$/.test(raw)) return;

    const numeric = Number(raw);
    if (numeric > MAX_AMOUNT) return;

    setAmount(raw);
  };

  const [focused, setFocused] = useState(false);

  // Create formatted display version
  const formattedAmount = formatWithCommas(amount);

  return (
    <SafeAreaView className="flex-1 bg-[#00332d]">
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center">
        <TouchableOpacity onPress={() => router.replace("/(main)/home")}>
          <Ionicons name="chevron-back" size={30} color="white" />
        </TouchableOpacity>

        <Text className="flex-1 text-center text-lg font-semibold text-white">
          Request for Payment
        </Text>

        <View className="w-6" />
      </View>

      {/* Amount Display */}
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-300 text-sm tracking-widest">
          ENTER AMOUNT
        </Text>

        {/* Centered $ + amount */}
        <View className="flex-row items-center justify-center mt-10">
          <Text
            className="text-6xl font-extrabold text-white"
            style={{ letterSpacing: 0.5 }}
          >
            $
          </Text>

          {/* Input container */}
          <View
            style={{
              position: "relative",
              marginLeft: 6,
              borderBottomWidth: focused ? 1 : 0,
              borderColor: "rgba(255,255,255,0.3)",
              paddingBottom: 2,
            }}
          >
            {/* Fake placeholder */}
            {amount === "0" && (
              <Text
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  fontSize: 56,
                  fontWeight: "800",
                  color: "rgba(255,255,255,0.25)",
                  includeFontPadding: false,
                  lineHeight: 62,
                }}
              >
                0
              </Text>
            )}

            {/* ACTUAL input */}
            <TextInput
              value={amount === "0" ? "" : formattedAmount} // hide value when it's zero
              placeholder=""
              onChangeText={handleKeyboardChange}
              keyboardType="numeric"
              style={{
                fontSize: 55,
                fontWeight: "800",
                color: "white",
                marginLeft: 8,
                minWidth: 120,
                textAlign: "left",
                padding: 0,
                lineHeight: 63,
              }}
            />
          </View>
        </View>
      </View>

      <View className="flex-1 justify-end pb-10">
        {/* Keypad pushed to bottom */}
        <View className="pb-4">
          <NumberPad onPressNumber={handleNumPress} onDelete={handleDelete} />
        </View>

        {/* Confirm Button slightly above keypad */}
        <View className="px-6 mb-8">
          <TouchableOpacity
            onPress={confirm}
            className="w-full py-4 bg-white rounded-2xl items-center"
            activeOpacity={0.8}
          >
            <Text className="text-[#00332d] font-bold text-lg">CONFIRM</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
