import { Text, View, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
        source={require('@/assets/images/avatar.jpg')}
        className="w-[50px] h-[50px] rounded-full border border-black"
      />

      {/* Greeting Text */}
      <Text className="flex-1 text-[16px] ml-[12px] font-normal">
        Welcome Back, {"\n"}
        <Text className="font-bold text-[25px]">{name}!</Text>
      </Text>

      {/* Settings Button */}
      <TouchableOpacity onPress={onSettingPress}>
        <Ionicons name="settings-outline" size={24} color="#000" />
      </TouchableOpacity>
    </View>
  );
}
