import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";

type BalanceCardProps = {
  balance: number;
  onRequest: () => void;
  onSend: () => void;
};

export default function BalanceCard({ balance, onRequest, onSend }: BalanceCardProps) {
  const [hidden, setHidden] = useState(false);

  return (
    <View className="bg-[#ccf8f1] rounded-xl overflow-hidden m-4 shadow">
      {/* Balance Section */}
      <View className="flex-row items-center p-4">
        <Text className="text-[22px] font-bold text-[#00332d]">
          ${" "}
          {hidden
            ? "•••••"
            : balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </Text>

        <TouchableOpacity onPress={() => setHidden(!hidden)}>
          <Ionicons
            name={hidden ? "eye-off" : "eye"}
            size={24}
            color="#00332d"
            style={{ marginLeft: 25 }}
          />
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View className="flex-row bg-[#00332d]">
        {/* Request Button */}
        <TouchableOpacity className="flex-1 flex-row items-center justify-center py-3.5" onPress={onRequest}>
          <MaterialIcons name="request-page" size={24} color="#ccf8f1" />
          <Text className="text-[#ccf8f1] text-base font-medium ml-1.5">
            Request
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View className="w-px bg-[#ccf8f1] opacity-30" />

        {/* Send Button */}
        <TouchableOpacity className="flex-1 flex-row items-center justify-center py-3.5" onPress={onSend}>
          <Feather name="send" size={24} color="#ccf8f1" />
          <Text className="text-[#ccf8f1] text-base font-medium ml-1.5">
            Send
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
