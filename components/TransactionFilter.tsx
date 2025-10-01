import React from "react";
import { Text, TouchableOpacity, View, Modal } from "react-native";
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
export default function TransactionFilter(
  // Props: onFilterChange => call when user click on filter button
  { onFilterChange = () => {} }: { onFilterChange?: (filter: string) => void }) {

    const[modalVisible, setModalVisible] = React.useState(false); // State to manage modal visibility
    
    // Option for filter modal
    const filterOptions = [
      { label: "This Week", value: "week" },
      { label: "Last Week", value: "last_week" },
      { label: "Last Month", value: "last_month" },
      { label: "All", value: "all" },
    ];
  
  
  return (
    <View className="mx-[16px] mt-[8px]">
      {/* Title */}
      <Text className="text-subheading font-bold text-primary mb-[12px]">Transactions</Text>

      {/* Filter Buttons */}
      <View className="flex-row">
        <FilterButton 
          label="Recent"
          icon={<Ionicons name="time-outline" size={16} color="#00332d" />}
          onPress={() => setModalVisible(true)}  // Open modal on press
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

      {/* Modal for Recent option */}
      <Modal visible={modalVisible} animationType="fade" transparent={true} onRequestClose={() => setModalVisible(false)}>
        {/* Semi-transparent background to user can tap outside to close */}
        <TouchableOpacity className="flex-1 bg-black/30" activeOpacity={1} onPressOut={() => setModalVisible(false)}>
          {/* box with filter options */}
          <View className="absolute top-[150px] left-8 right-8 bg-white rounded-xl p-3 shadow-lg">
            {filterOptions.map((option) => (
              <TouchableOpacity 
              key={option.value} 
              className="p-3 border-b border-gray-200"
              onPress={() => {
                onFilterChange(option.value); // Call parent callback
                setModalVisible(false); // Close modal
              }}
              >
                <Text className="text-normal text-gray-800">{option.label}</Text>
              </TouchableOpacity>
            ))}

          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
