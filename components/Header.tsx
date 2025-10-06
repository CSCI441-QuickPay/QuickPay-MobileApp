import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

type HeaderProps = {
  name: string;
  onSettingPress: () => void;  // Callback when setting button is pressed
};

// Header component
export default function Header({ name, onSettingPress }: HeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-[16px] py-[12px] bg-white">
      {/* Profile Image */}
      <Image 
        source={require('@/assets/images/user_profile.jpg')}
        className="w-[72px] h-[72px] rounded-full border border-black"
      />

      {/* Greeting Text */}
      <Text className="flex-1 text-subheading ml-[12px] font-normal">
        Welcome Back, {"\n"}
        <Text className="font-bold text-heading">{name}!</Text>
      </Text>

      {/* Settings Button */}
      <TouchableOpacity onPress={onSettingPress}>
        <Ionicons name="settings-outline" size={37} color="#000" />
      </TouchableOpacity>
    </View>
  );
}
