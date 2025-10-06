import { View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";

export default function SignUp() {
  // Local states
  const [firstname, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Handle account creation → save state + redirect
  const handleSignUp = async () => {
    if (!firstname || !lastName || !email || !password || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    await AsyncStorage.setItem("isLoggedIn", "true");
    router.replace("/home");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <SafeAreaView className="flex-1 bg-white px-6 justify-center">
        {/* Header */}
        <Text className="text-3xl font-bold text-center text-[#222] mb-10">
            Create Account 
        </Text>

        {/* First Name */}
        <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-2">First Name</Text>
            <View className="flex-row items-center bg-gray-100 px-3 rounded-xl">
            <Ionicons name="person-outline" size={20} color="#666" />
            <TextInput
                placeholder="Enter your first name"
                className="flex-1 py-3 px-2 text-base"
                value={firstname}
                onChangeText={setFirstName}
            />
            </View>
        </View>
        {/* Last Name */}
        <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-2">Last Name</Text>
            <View className="flex-row items-center bg-gray-100 px-3 rounded-xl">
            <Ionicons name="person-outline" size={20} color="#666" />
            <TextInput
                placeholder="Enter your last name"
                className="flex-1 py-3 px-2 text-base"
                value={lastName}
                onChangeText={setLastName}
            />
            </View>
        </View>

        {/* Email */}
        <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-2">Email</Text>
            <View className="flex-row items-center bg-gray-100 px-3 rounded-xl">
            <Ionicons name="mail-outline" size={20} color="#666" />
            <TextInput
                placeholder="Enter your email"
                className="flex-1 py-3 px-2 text-base"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />
            </View>
        </View>

        {/* Phone Number */}
        <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-2">Phone Number</Text>
            <View className="flex-row items-center bg-gray-100 px-3 rounded-xl">
            <Ionicons name="call-outline" size={20} color="#666" />
            <TextInput
                placeholder="Enter your phone number"
                className="flex-1 py-3 px-2 text-base"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
            />
            </View>
        </View>

        {/* Password */}
        <View className="mb-4">
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

        {/* Confirm Password */}
        <View className="mb-6">
            <Text className="text-sm text-gray-600 mb-2">Confirm Password</Text>
            <View className="flex-row items-center bg-gray-100 px-3 rounded-xl">
            <Ionicons name="lock-closed-outline" size={20} color="#666" />
            <TextInput
                placeholder="Confirm your password"
                className="flex-1 py-3 px-2 text-base"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
            />
            </View>
        </View>

        {/* Sign Up button */}
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleSignUp}
            className="rounded-2xl overflow-hidden shadow-md"
        >
            <LinearGradient
            colors={["#2563eb", "#1e40af"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="py-4"
            >
            <Text className="text-center text-white font-semibold text-lg tracking-wide p-1">
                Sign Up
            </Text>
            </LinearGradient>
        </TouchableOpacity>

        {/* Back to Login */}
        <View className="flex-row justify-center mt-6">
            <Text className="text-gray-600">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
            <Text className="text-blue-600 font-semibold">Log In</Text>
            </TouchableOpacity>
        </View>
        </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
