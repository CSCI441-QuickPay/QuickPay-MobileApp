import NumberPad from "@/components/request/NumberPad";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";

export default function RequestAmount() {
  const { initialAmount } = useLocalSearchParams();

  const initialRaw = Array.isArray(initialAmount) ? initialAmount[0] : initialAmount;

  // Internally: store amount WITHOUT commas -> "1234"
  const [amount, setAmount] = useState<string>(initialRaw ?? "0");
  const MAX_AMOUNT = 999_999_999;

  // Format displayed value → WITH commas
  const formatWithCommas = (value: string) => {
    if (value.includes(".")) {
      const [whole, decimal] = value.split(".");
      return (
        Number(whole).toLocaleString("en-US") +
        "." +
        (decimal ?? "")
      );
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

  // Create formatted display version
  const formattedAmount = formatWithCommas(amount);

  return (
    <SafeAreaView className="flex-1 bg-[#00332d]">
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={30} color="white" />
        </TouchableOpacity>

        <Text className="flex-1 text-center text-lg font-semibold text-white">
          Enter Amount
        </Text>

        <View className="w-6" />
      </View>

      {/* Amount Display */}
      <View className="items-center mt-12">
        <Text className="text-gray-300 text-sm">REQUEST AMOUNT</Text>
        <Text className="text-6xl font-extrabold text-white mt-2">
          ${formattedAmount}
        </Text>
      </View>

      {/* Keypad */}
      <NumberPad onPressNumber={handleNumPress} onDelete={handleDelete} />

      {/* Confirm */}
      <View className="px-6 mt-12">
        <TouchableOpacity
          onPress={confirm}
          className="w-full py-4 bg-white rounded-2xl items-center"
        >
          <Text className="text-[#00332d] font-bold text-lg">CONFIRM</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
