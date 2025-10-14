import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View, TouchableWithoutFeedback, Keyboard, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FirebaseService from "@/services/FirebaseService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      await FirebaseService.resetPassword(email);
      Alert.alert(
        "Success", 
        "Password reset email sent! Please check your inbox.",
        [{ text: "OK", onPress: () => router.push("/login") }]
      );
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView className="flex-1 bg-white px-6 justify-center">
        {/* Header */}
        <Text className="text-3xl font-bold text-center text-[#222] mb-10">
          Reset Password
        </Text>

        {/* Email input */}
        <View className="mb-6">
          <Text className="text-sm text-gray-600 mb-2">Email</Text>
          <View className="flex-row items-center bg-gray-100 px-3 rounded-xl">
            <Ionicons name="mail-outline" size={20} color="#666" />
            <TextInput
              placeholder="Enter your email"
              className="flex-1 py-3 px-2 text-base"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>

        {/* Send reset link button */}
        <TouchableOpacity
          onPress={handleReset}
          disabled={loading}
          activeOpacity={0.9}
          className="rounded-2xl overflow-hidden shadow-md"
        >
          <LinearGradient
            colors={["#2563eb", "#1e40af"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="py-4"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-center text-white font-semibold text-lg tracking-wide p-1">
                Send Reset Link
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Back to login */}
        <View className="flex-row justify-center mt-6">
          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text className="text-blue-600 font-semibold">Back to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}