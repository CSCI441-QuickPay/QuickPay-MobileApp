import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";

type BalanceCardProps = {
  balance: number; // User's balance amount
  onRequest: () => void; // Callback when Request button is pressed
  onSend: () => void; // Callback when Send button is pressed
};

// Balance card component
export default function BalanceCard ({ balance, onRequest, onSend }: BalanceCardProps) {
  // State to manage balance visibility
  const [hidden, setHidden] = useState(false);

  return (
    <View className="bg-secondary rounded-[12px] overflow-hidden m-[16px] shadow-sm">
      {/* Balance Section */}
      <View className="flex-row items-center p-[16px]">
        <Text className="text-[28px] font-bold text-primary">
          ${" "}
          {hidden
            ? "•••••"
            : balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </Text>

        {/* Toggle visibility button */}
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
      <View className="flex-row bg-primary">
        {/* Request Button */}
        <TouchableOpacity className="flex-1 flex-row items-center justify-center py-[14px]" onPress={onRequest}>
          <MaterialIcons name="request-page" size={24} color="#ccf8f1" />
          <Text className="text-secondary text-subheading ml-[6px] font-medium">Request</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View className="w-[1px] bg-secondary opacity-30" />

        {/* Send Button */}
        <TouchableOpacity className="flex-1 flex-row items-center justify-center py-[14px]" onPress={onSend}>
          <Feather name="send" size={24} color="#ccf8f1" />
          <Text className="text-secondary text-subheading ml-[6px] font-medium">Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
