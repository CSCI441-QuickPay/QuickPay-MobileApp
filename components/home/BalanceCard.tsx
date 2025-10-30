import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type BalanceCardProps = {
  balance: number;
  onRequest: () => void;
  onSend: () => void;
};

export default function BalanceCard({ balance, onRequest, onSend }: BalanceCardProps) {
  const [hidden, setHidden] = useState(false);

  return (
    <View className="mx-6 my-4">
      <View className="rounded-2xl overflow-hidden">
        <LinearGradient
          colors={["#00332d", "#005248"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: 24 }}
        >
          {/* Balance Section */}
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-1">
              <Text className="text-white/70 text-sm font-medium mb-2">
                Total Balance
              </Text>
              <View className="flex-row items-center">
                <Text className="text-white text-4xl font-extrabold">
                  {hidden ? "••••••" : `$${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                </Text>
                <TouchableOpacity
                  onPress={() => setHidden(!hidden)}
                  activeOpacity={0.7}
                  className="ml-3 w-10 h-10 items-center justify-center"
                >
                  <Ionicons
                    name={hidden ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="rgba(255,255,255,0.7)"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onRequest}
              className="flex-1 bg-white/20 rounded-xl py-3 flex-row items-center justify-center"
            >
              <Ionicons
                name="arrow-down"
                size={18}
                color="white"
                style={{ marginRight: 6 }}
              />
              <Text className="text-white font-bold text-sm">Request</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onSend}
              className="flex-1 bg-white rounded-xl py-3 flex-row items-center justify-center"
            >
              <Ionicons
                name="arrow-up"
                size={18}
                color="#00332d"
                style={{ marginRight: 6 }}
              />
              <Text className="text-primary font-bold text-sm">Send</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}