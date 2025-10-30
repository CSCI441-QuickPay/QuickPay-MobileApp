import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSignIn, useOAuth } from "@clerk/clerk-expo";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  // Clerk hooks
  const { isLoaded, signIn, setActive } = useSignIn();
  const google = useOAuth({ strategy: "oauth_google" });

  // Local state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!isLoaded) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#00332d" />
      </SafeAreaView>
    );
  }

  // ---------- Email / Password Sign In ----------
  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/home");
      } else {
        Alert.alert("Login Failed", "Invalid credentials or unverified account");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      Alert.alert("Error", err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Google OAuth ----------
  const handleGoogleSignIn = async () => {
    try {
      const { createdSessionId, signIn, signUp, setActive: setClerkActive } =
        await google.startOAuthFlow();

      if (createdSessionId) {
        await setClerkActive({ session: createdSessionId });
        router.replace("/home");
      } else if (signIn || signUp) {
        Alert.alert("Continue Registration", "Please complete your setup");
      } else {
        Alert.alert("OAuth Error", "The sign-in process did not complete");
      }
    } catch (err: any) {
      console.error("Google OAuth error:", err);
      Alert.alert("Google Sign-In Error", err?.message || "Something went wrong");
    }
  };

  // ---------- UI ----------
  return (
    <SafeAreaView className="flex-1 bg-white">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="justify-center px-8">
              {/* Logo */}
              <View className="items-center mb-8">
                <Image
                  source={require("@/assets/images/icon.png")}
                  className="w-64 h-32"
                  resizeMode="contain"
                />
                
                <Text className="text-gray-500 text-base">
                  Sign in to continue
                </Text>
              </View>

              {/* Email */}
              <View className="mb-5">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Email
                </Text>
                <View
                  className={`flex-row items-center border-2 rounded-2xl px-4 ${
                    emailFocused ? "border-[#00332d] bg-[#f5fdfc]" : "border-gray-300 bg-white"
                  }`}
                  style={{ height: 60 }}
                >
                  <Ionicons
                    name="mail-outline"
                    size={22}
                    color={emailFocused ? "#00332d" : "#9CA3AF"}
                    style={{ marginRight: 12 }}
                  />
                  <TextInput
                    placeholder="you@example.com"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    returnKeyType="next"
                    style={{ flex: 1, color: "#111827", fontSize: 17, fontWeight: "500" }}
                  />
                </View>
              </View>

              {/* Password */}
              <View className="mb-3">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Password
                </Text>
                <View
                  className={`flex-row items-center border-2 rounded-2xl px-4 ${
                    passwordFocused ? "border-[#00332d] bg-[#f5fdfc]" : "border-gray-300 bg-white"
                  }`}
                  style={{ height: 60 }}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={22}
                    color={passwordFocused ? "#00332d" : "#9CA3AF"}
                    style={{ marginRight: 12 }}
                  />
                  <TextInput
                    placeholder="Enter your password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    returnKeyType="done"
                    onSubmitEditing={handleEmailLogin}
                    style={{ flex: 1, color: "#111827", fontSize: 17, fontWeight: "500" }}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={22}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Forgot password */}
              <TouchableOpacity 
                onPress={() => router.push("/forgot_password")} 
                className="mb-8 self-end"
              >
                <Text className="text-[#00332d] text-sm font-semibold">
                  Forgot password?
                </Text>
              </TouchableOpacity>

              {/* Primary Sign In */}
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleEmailLogin}
                disabled={loading || !email || !password}
                className="rounded-2xl overflow-hidden shadow-lg mb-6"
                style={{ height: 56, opacity: !email || !password || loading ? 0.5 : 1 }}
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
                      Sign In
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View className="flex-row items-center mb-6">
                <View className="flex-1 h-[1px] bg-gray-300" />
                <Text className="mx-3 text-gray-500 text-sm">or continue with</Text>
                <View className="flex-1 h-[1px] bg-gray-300" />
              </View>

              {/* Google Button */}
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleGoogleSignIn}
                className="flex-row items-center justify-center bg-white border-2 border-gray-300 rounded-2xl mb-8"
                style={{ 
                  height: 56,
                  shadowColor: "#000", 
                  shadowOpacity: 0.05, 
                  shadowRadius: 4, 
                  elevation: 2 
                }}
              >
                <FontAwesome name="google" size={22} color="#DB4437" style={{ marginRight: 12 }} />
                <Text className="text-gray-900 font-semibold text-base">
                  Sign in with Google
                </Text>
              </TouchableOpacity>

              {/* Sign Up link */}
              <View className="flex-row justify-center">
                <Text className="text-gray-600 text-base">Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push("/signup")}>
                  <Text className="text-[#00332d] font-semibold text-base underline">
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}