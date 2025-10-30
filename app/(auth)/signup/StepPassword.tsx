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
import UserSyncService from "@/services/UserSyncService";

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
      Alert.alert("Error", "Signup session not found. Please start over.");
      return;
    }

    setLoading(true);
    try {
      // Update the signUp with password
      await signUp.update({ password });

      // Try to complete the signup
      // Clerk will automatically create session if all required verifications are done
      const result = await signUp.attemptVerification({
        strategy: "password",
      });

      console.log("SignUp result status:", result?.status);
      console.log("SignUp verifications:", result?.verifications);

      // If sign-up is complete, set the active session
      if (result?.status === "complete" && result?.createdSessionId) {
        await setActive({ session: result.createdSessionId });

        // The sync will happen in home screen after user is fully loaded
        Alert.alert("Success!", "Your account has been created.");
        onNext({ password });
      } else if (result?.status === "missing_requirements") {
        // Still missing some required fields/verifications
        console.log("Missing requirements:", result?.missingFields, result?.unverifiedFields);
        Alert.alert("Almost there!", "Please complete all required steps.");
        onNext({ password });
      } else {
        // Some other status - proceed anyway
        console.log("Unexpected status:", result?.status);
        onNext({ password });
      }
    } catch (err: any) {
      console.error("Sign up error:", err);
      Alert.alert("Sign Up Error", err.message || "Something went wrong.");
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