import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Animated, Image, Text, TextInput, TouchableOpacity, View, TouchableWithoutFeedback, Keyboard, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Login() {
  // Local states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const scaleAnim = useRef(new Animated.Value(1)).current; // Button scale animation

  // Handle login → store session + redirect
  const handleLogin = async () => {
    await AsyncStorage.setItem("isLoggedIn", "true");
    router.replace("/home");
  };

  // Press animations
  const handlePressIn = () =>
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
  const handlePressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <SafeAreaView className="flex-1 bg-white px-6 justify-center">
        {/* Logo / Branding */}
        <View className="items-center mb-10">
            <Image
            source={require("../assets/images/user_profile.jpg")}
            className="w-20 h-20 mb-4"
            />
            <Text className="text-3xl font-bold text-[#222]">QuickPay</Text>
            <Text className="text-gray-500 mt-1">Secure payments made simple</Text>
        </View>

        {/* Email */}
        <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-2">Email/Phone Number</Text>
            <View className="flex-row items-center bg-gray-100 px-3 rounded-xl">
            <Ionicons name="mail-outline" size={20} color="#666" />
            <TextInput
                placeholder="Enter your email or phone number"
                className="flex-1 py-3 px-2 text-base"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />
            </View>
        </View>

        {/* Password */}
        <View className="mb-2">
            <Text className="text-sm text-gray-600 mb-2">Password</Text>
            <View className="flex-row items-center bg-gray-100 px-3 rounded-xl">
            <Ionicons name="lock-closed-outline" size={20} color="#666" />
            <TextInput
                placeholder="Enter your password"
                className="flex-1 py-3 px-2 text-base"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            </View>
        </View>

        {/* Forgot password */}
        <TouchableOpacity
            onPress={() => router.push("/forgot-password")}
            className="mt-2 mb-6"
        >
            <Text className="text-right text-blue-600 text-sm font-semibold">
            Forgot Password?
            </Text>
        </TouchableOpacity>

        {/* Login button (animated) */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
            activeOpacity={0.9}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handleLogin}
            className="rounded-2xl overflow-hidden shadow-lg "
            >
            <LinearGradient
                colors={["#2563eb", "#1e40af"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="py-4"
            >
                <Text className="text-center text-white font-semibold text-lg tracking-wide p-1">
                Log In
                </Text>
            </LinearGradient>
            </TouchableOpacity>
        </Animated.View>

        {/* Divider */}
        <View className="flex-row items-center my-6">
            <View className="flex-1 h-[1px] bg-gray-300" />
            <Text className="mx-3 text-gray-400">OR</Text>
            <View className="flex-1 h-[1px] bg-gray-300" />
        </View>

        {/* Sign up link */}
        <View className="flex-row justify-center">
            <Text className="text-gray-600">Don’t have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/signup")}>
            <Text className="text-blue-600 font-semibold">Sign Up</Text>
            </TouchableOpacity>
        </View>
        </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
