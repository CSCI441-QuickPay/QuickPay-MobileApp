import {
  View,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

export default function StepDone() {
  return (
    <View className="flex-1 bg-white justify-center items-center px-8">
      {/* Logo */}
      <Image
        source={require("@/assets/images/adaptive-icon.png")}
        style={{ width: 200, height: 200, marginBottom: 32 }}
        resizeMode="contain"
      />

      {/* Welcome Text */}
      <Text className="text-4xl font-extrabold text-primary mb-3 text-center">
        Welcome to QuickPay!
      </Text>

      <Text className="text-gray-500 text-base text-center mb-10 px-4">
        You're all set to start managing your finances.
      </Text>

      {/* Go to Dashboard Button */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.replace("/home")}
        className="rounded-2xl overflow-hidden w-full shadow-lg"
        style={{ height: 56 }}
      >
        <LinearGradient
          colors={["#00332d", "#005248"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text className="text-white font-bold text-base tracking-wide">
            Get Started
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}