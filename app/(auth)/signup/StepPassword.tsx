import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSignUp } from "@clerk/clerk-expo";
import { router } from "expo-router";

export default function StepPassword({ onNext, onBack, signupData, cachedData }: any) {
  const { signUp, setActive } = useSignUp();
  const [password, setPassword] = useState(cachedData?.password || "");
  const [confirmPassword, setConfirmPassword] = useState(cachedData?.confirmPassword || "");
  const [loading, setLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleBack = () => {
    // Save current data when going back
    onBack({ password, confirmPassword });
  };

  const validatePassword = () => {
    if (password.length < 8) {
      Alert.alert("Weak Password", "Password must be at least 8 characters long.");
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    if (!validatePassword()) return;

    if (!signUp) {
      Alert.alert("Error", "Signup session not found. Please start over.", [
        { text: "OK", onPress: () => router.replace("/(auth)/signup") }
      ]);
      return;
    }

    setLoading(true);
    try {
      // Update the signUp with password - this is the final required field
      const result = await signUp.update({ password });

      console.log("SignUp result status:", result?.status);
      console.log("SignUp verifications:", result?.verifications);

      // Check if signup is complete after adding password
      if (result.status === "complete") {
        // Create the session
        if (result.createdSessionId) {
          await setActive({ session: result.createdSessionId });

          // Success - the app/index.tsx will automatically redirect to plaid-onboarding
          // since the user won't have plaid_access_token yet
          console.log("✅ Signup complete! Session created.");
        } else {
          Alert.alert("Error", "Account created but session not available. Please try logging in.");
          router.replace("/(auth)/login");
        }
      } else if (result.status === "missing_requirements") {
        // Still missing requirements - this shouldn't happen if email & phone are verified
        console.log("Missing requirements:", result.missingFields, result.unverifiedFields);
        Alert.alert(
          "Additional Information Required",
          "Please complete all required verification steps.",
          [{ text: "OK" }]
        );
      } else {
        // Unexpected status
        console.log("Unexpected signup status:", result.status);
        Alert.alert("Error", "Unexpected signup status. Please try again or contact support.");
        router.replace("/(auth)/signup");
      }
    } catch (err: any) {
      console.error("Sign up error:", err);

      // Handle specific error cases
      const errorMessage = err.message || err.toString();

      if (errorMessage.includes("No sign up attempt was found") ||
          errorMessage.includes("sign up attempt") ||
          errorMessage.includes("session") && errorMessage.includes("expired")) {
        Alert.alert(
          "Session Expired",
          "Your signup session has expired. Please start the signup process again.",
          [{ text: "Start Over", onPress: () => router.replace("/(auth)/signup") }]
        );
      } else if (errorMessage.includes("form_identifier_exists") ||
                 errorMessage.includes("already exists") ||
                 errorMessage.includes("taken")) {
        Alert.alert(
          "Account Exists",
          "An account with this email or phone number already exists. Please sign in instead.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Go to Login", onPress: () => router.replace("/(auth)/login") }
          ]
        );
      } else {
        Alert.alert("Sign Up Error", errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (password.length === 0) return { text: "", color: "" };
    if (password.length < 8) return { text: "Weak", color: "#EF4444" };
    if (password.length < 12) return { text: "Medium", color: "#F59E0B" };
    return { text: "Strong", color: "#10B981" };
  };

  const strength = getPasswordStrength();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-white"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="justify-center px-8">
            {/* Header */}
            <Text className="text-4xl font-extrabold text-primary mb-3">
              Create a password
            </Text>
            <Text className="text-gray-500 text-base mb-10">
              Choose a strong password to secure your account
            </Text>

            {/* Password Input */}
            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Password
              </Text>
              <View
                className={`flex-row items-center border-2 rounded-2xl px-4 ${
                  passwordFocused
                    ? "border-[#00332d] bg-[#f5fdfc]"
                    : "border-gray-300 bg-white"
                }`}
                style={{ height: 56 }}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={22}
                  color={passwordFocused ? "#00332d" : "#9CA3AF"}
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  returnKeyType="next"
                  style={{ flex: 1, color: "#111827", fontSize: 16 }}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
              {password.length > 0 && (
                <View className="flex-row items-center mt-2">
                  <Text
                    className="text-sm font-medium ml-1"
                    style={{ color: strength.color }}
                  >
                    {strength.text}
                  </Text>
                </View>
              )}
            </View>

            {/* Confirm Password Input */}
            <View className="mb-3">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </Text>
              <View
                className={`flex-row items-center border-2 rounded-2xl px-4 ${
                  confirmPasswordFocused
                    ? "border-[#00332d] bg-[#f5fdfc]"
                    : "border-gray-300 bg-white"
                }`}
                style={{ height: 56 }}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={22}
                  color={confirmPasswordFocused ? "#00332d" : "#9CA3AF"}
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  placeholder="Confirm your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onFocus={() => setConfirmPasswordFocused(true)}
                  onBlur={() => setConfirmPasswordFocused(false)}
                  returnKeyType="done"
                  onSubmitEditing={handleSignUp}
                  style={{ flex: 1, color: "#111827", fontSize: 16 }}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Password Requirements */}
            <View className="bg-gray-50 rounded-block px-4 py-4 mb-8">
              <Text className="text-sm text-gray-600 mb-2 font-medium">
                Password must contain:
              </Text>
              <View className="flex-row items-center mb-1">
                <Ionicons
                  name={password.length >= 8 ? "checkmark-circle" : "ellipse-outline"}
                  size={16}
                  color={password.length >= 8 ? "#10B981" : "#9CA3AF"}
                />
                <Text className="text-sm text-gray-600 ml-2">
                  At least 8 characters
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons
                  name={
                    password === confirmPassword && password.length > 0
                      ? "checkmark-circle"
                      : "ellipse-outline"
                  }
                  size={16}
                  color={
                    password === confirmPassword && password.length > 0
                      ? "#10B981"
                      : "#9CA3AF"
                  }
                />
                <Text className="text-sm text-gray-600 ml-2">
                  Passwords match
                </Text>
              </View>
            </View>

            {/* Create Account Button */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleSignUp}
              disabled={loading || !password || !confirmPassword}
              className="rounded-2xl overflow-hidden shadow-lg mb-6"
              style={{
                height: 56,
                opacity: !password || !confirmPassword ? 0.5 : 1,
              }}
            >
              <LinearGradient
                colors={["#00332d", "#005248"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-base tracking-wide">
                    Create Account
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Back Button */}
            <TouchableOpacity onPress={handleBack} className="items-center py-3">
              <Text className="text-primary text-base font-semibold">
                Back
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}