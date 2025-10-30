import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSignUp } from "@clerk/clerk-expo";

export default function StepName({ onNext, cachedData }: any) {
  const { signUp } = useSignUp();
  const [firstName, setFirstName] = useState(cachedData?.firstName || "");
  const [lastName, setLastName] = useState(cachedData?.lastName || "");
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [lastNameFocused, setLastNameFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (firstName.trim() && lastName.trim()) {
      setLoading(true);
      try {
        // Create the signUp object with name - this is the ONLY create() call
        await signUp?.create({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        });
        onNext({ firstName, lastName });
      } catch (err: any) {
        console.error("Create signUp error:", err);
        Alert.alert("Error", err.message || "Failed to start signup process");
      } finally {
        setLoading(false);
      }
    }
  };

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
              What's your name?
            </Text>
            <Text className="text-gray-500 text-base mb-10">
              Let's get to know you
            </Text>

            {/* First Name */}
            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                First Name
              </Text>
              <View
                className={`flex-row items-center border-2 rounded-2xl px-4 ${
                  firstNameFocused
                    ? "border-[#00332d] bg-[#f5fdfc]"
                    : "border-gray-300 bg-white"
                }`}
                style={{ height: 56 }}
              >
                <Ionicons
                  name="person-outline"
                  size={22}
                  color={firstNameFocused ? "#00332d" : "#9CA3AF"}
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  placeholder="Enter your first name"
                  placeholderTextColor="#9CA3AF"
                  value={firstName}
                  onChangeText={setFirstName}
                  onFocus={() => setFirstNameFocused(true)}
                  onBlur={() => setFirstNameFocused(false)}
                  returnKeyType="next"
                  style={{ flex: 1, color: "#111827", fontSize: 16 }}
                />
              </View>
            </View>

            {/* Last Name */}
            <View className="mb-8">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Last Name
              </Text>
              <View
                className={`flex-row items-center border-2 rounded-2xl px-4 ${
                  lastNameFocused
                    ? "border-[#00332d] bg-[#f5fdfc]"
                    : "border-gray-300 bg-white"
                }`}
                style={{ height: 56 }}
              >
                <Ionicons
                  name="person-outline"
                  size={22}
                  color={lastNameFocused ? "#00332d" : "#9CA3AF"}
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  placeholder="Enter your last name"
                  placeholderTextColor="#9CA3AF"
                  value={lastName}
                  onChangeText={setLastName}
                  onFocus={() => setLastNameFocused(true)}
                  onBlur={() => setLastNameFocused(false)}
                  returnKeyType="done"
                  onSubmitEditing={handleContinue}
                  style={{ flex: 1, color: "#111827", fontSize: 16 }}
                />
              </View>
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleContinue}
              disabled={!firstName.trim() || !lastName.trim() || loading}
              className="rounded-2xl overflow-hidden shadow-lg"
              style={{ height: 56, opacity: !firstName.trim() || !lastName.trim() || loading ? 0.5 : 1 }}
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
                    Continue
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Back to Login */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-600 text-base">Already have an account? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text className="text-primary font-semibold text-base underline">Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}