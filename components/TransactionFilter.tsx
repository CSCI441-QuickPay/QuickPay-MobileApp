import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons, FontAwesome5, Feather } from "@expo/vector-icons";

// Transaction filter button component
function FilterButton({ label, icon, onPress }: { label: string; icon: React.ReactNode; onPress?: () => void }) {
  return (
    <TouchableOpacity className="flex-row items-center border border-primary rounded-[20px] px-[12px] py-[6px] mr-[8px]" onPress={onPress}>
      {icon}
      <Text className="mx-[6px] text-normal text-primary">{label}</Text>
      <Ionicons name="chevron-down" size={16} color="#00332d"/>
    </TouchableOpacity>
  );
}

// Main TransactionFilter component
export default function TransactionFilter() {
  return (
    <View className="mx-[16px] mt-[8px]">
      {/* Title */}
      <Text className="text-subheading font-bold text-primary mb-[12px]">Transactions</Text>

      {/* Filter Buttons */}
      <View className="flex-row">
        <FilterButton 
          label="Recent"
          icon={<Ionicons name="time-outline" size={16} color="#00332d" />}
          onPress={() => console.log("Filter by recent")}
        />
        <FilterButton 
          label="Bank"
          icon={<FontAwesome5 name="th-large" size={16} color="#00332d" />}
          onPress={() => console.log("Filter by categories")}
        />
        <FilterButton 
          label="Sort"
          icon={<Feather name="sliders" size={16} color="#00332d" />}
          onPress={() => console.log("Sort transactions")}
        />
      </View>
    </View>
  );
}
