/**
 * written by: Team QuickPay
 * tested by: Team QuickPay
 * debugged by: Team QuickPay
 * Notes: Contributions were shared, see GitHub history for commit details.
 * Unit Tests for UserSyncService
 */
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '@/tailwind.config'; 

const fullConfig = resolveConfig(tailwindConfig);
const primary = fullConfig.theme.colors.primary;
// Define the type for each navigation item
type NavItem = {
  label: string;
  icon: (color: string) => React.ReactNode; // Returns an icon component
  onPress: () => void;
  active?: boolean; // Change color if active
  special?: boolean; // Special styling for the Scan button
};

// Bottom navigation component
const BottomNav = ({ items }: { items: NavItem[] }) => {
  return (
    <View className="flex-row justify-around bg-secondary py-[8px] px-[12px]">
      {items.map((item, index) => {
        // Default color for icon, White if active, dark green otherwise
        const color = item.active ? primary : "#4A5A57";

        // Special styling for the Scan button
        if (item.special) {
          return (
            <TouchableOpacity
              key={index}
              className="items-center justify-center bg-primary p-[16px] rounded-[20px] -mt-[20px] h-[80px] w-[80px]"
              onPress={item.onPress}
            >
              {/* Special icon color for the Scan button */}
              {item.icon("#ccf8f1")}
              {/* Special label color for the Scan button */}
              <Text className="text-small mt-[4px] text-secondary">{item.label}</Text>
            </TouchableOpacity>
          );
        }

        // Regular Nav items
        return (
          <TouchableOpacity
            key={index}
            className="flex-1 items-center justify-around py-[6px] "
            onPress={item.onPress}
          >
            {item.icon(color)}
            <Text className="text-small mt-[4px]" style={{ color }}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default BottomNav;
