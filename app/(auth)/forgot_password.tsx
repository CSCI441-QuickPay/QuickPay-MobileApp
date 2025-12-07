/**
 * written by: Team QuickPay
 * tested by: Team QuickPay
 * debugged by: Team QuickPay
 * Notes: Contributions were shared, see GitHub history for commit details.
 * Unit Tests for UserSyncService
 */
import React, { useState, useRef } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSignIn } from "@clerk/clerk-expo";

export default function ForgotPassword() {
  const { isLoaded, signIn } = useSignIn();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"email" | "code" | "password">("email");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const codeRefs = useRef<Array<TextInput | null>>([]);

  if (!isLoaded) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#00332d" />
      </SafeAreaView>
    );
  }

  // Step 1: Send reset code to email
  const handleSendCode = async () => {
    if (!email.includes("@")) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await signIn?.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setStep("code");
      Alert.alert("Code Sent", `We've sent a 6-digit code to ${email}`);
      
      // Focus first code input after a short delay
      setTimeout(() => {
        codeRefs.current[0]?.focus();
      }, 300);
    } catch (err: any) {
      console.error("Reset password error:", err);
      Alert.alert("Error", err.message || "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

  // Step 2 & 3: Verify code and set new password
  const handleResetPassword = async () => {
    const codeString = code.join("");
    if (codeString.length < 6) {
      Alert.alert("Invalid Code", "Please enter the complete 6-digit code");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Weak Password", "Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn?.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: codeString,
        password: newPassword,
      });

      if (result?.status === "complete") {
        Alert.alert("Success", "Your password has been reset successfully", [
          {
            text: "OK",
            onPress: () => router.replace("/login"),
          },
        ]);
      } else {
        Alert.alert("Error", "Failed to reset password. Please try again.");
      }
    } catch (err: any) {
      console.error("Reset password verification error:", err);
      Alert.alert("Error", err.message || "Invalid code or password");
      setCode(["", "", "", "", "", ""]);
      codeRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (text: string, index: number) => {
    const numericText = text.replace(/[^0-9]/g, '');
    
    if (numericText.length > 1) {
      // Handle paste
      const digits = numericText.slice(0, 6).split('');
      const newCode = [...code];
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newCode[index + i] = digit;
        }
      });
      setCode(newCode);
      
      const nextIndex = Math.min(index + digits.length, 5);
      codeRefs.current[nextIndex]?.focus();
      
      // Auto-advance to password if all filled
      if (newCode.every(digit => digit !== "")) {
        setStep("password");
      }
    } else {
      const newCode = [...code];
      newCode[index] = numericText;
      setCode(newCode);
      
      if (numericText && index < 5) {
        codeRefs.current[index + 1]?.focus();
      }
      
      // Auto-advance to password if all filled
      if (newCode.every(digit => digit !== "") && index === 5) {
        setTimeout(() => {
          setStep("password");
        }, 300);
      }
    }
  };

  const handleCodeKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  const handleBack = () => {
    if (step === "password") {
      setStep("code");
      setNewPassword("");
    } else if (step === "code") {
      setStep("email");
      setCode(["", "", "", "", "", ""]);
    } else {
      router.back();
    }
  };

  const getPasswordStrength = () => {
    if (newPassword.length === 0) return { text: "", color: "" };
    if (newPassword.length < 8) return { text: "Weak", color: "#EF4444" };
    if (newPassword.length < 12) return { text: "Medium", color: "#F59E0B" };
    return { text: "Strong", color: "#10B981" };
  };

  const strength = getPasswordStrength();

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
              {/* Header */}
              <View className="items-center mb-8">
                <View className="bg-[#f0fdf4] rounded-full p-4 mb-4">
                  <Ionicons 
                    name={step === "email" ? "mail-outline" : step === "code" ? "shield-checkmark-outline" : "lock-closed-outline"} 
                    size={48} 
                    color="#00332d" 
                  />
                </View>
                <Text className="text-4xl font-extrabold text-primary mb-3 text-center">
                  {step === "email" ? "Reset Password" : step === "code" ? "Enter Code" : "New Password"}
                </Text>
                <Text className="text-gray-500 text-base text-center px-4">
                  {step === "email" 
                    ? "Enter your email to receive a reset code"
                    : step === "code"
                    ? `Enter the 6-digit code sent to\n${email}`
                    : "Choose a strong password for your account"}
                </Text>
              </View>

              {step === "email" && (
                <>
                  {/* Email Input */}
                  <View className="mb-8">
                    <Text className="text-sm font-medium text-gray-700 mb-3">
                      Email Address
                    </Text>
                    <View
                      className={`flex-row items-center border-2 rounded-2xl px-4 ${
                        emailFocused
                          ? "border-[#00332d] bg-[#f5fdfc]"
                          : "border-gray-300 bg-white"
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
                        returnKeyType="done"
                        onSubmitEditing={handleSendCode}
                        style={{ flex: 1, color: "#111827", fontSize: 17, fontWeight: "500" }}
                      />
                    </View>
                  </View>

                  {/* Send Code Button */}
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={handleSendCode}
                    disabled={loading || !email.includes("@")}
                    className="rounded-2xl overflow-hidden shadow-lg mb-6"
                    style={{ height: 56, opacity: !email.includes("@") || loading ? 0.5 : 1 }}
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
                          Send Reset Code
                        </Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}

              {step === "code" && (
                <>
                  {/* OTP Input */}
                  <View className="mb-8">
                    <View className="flex-row justify-between px-2">
                      {code.map((digit, index) => (
                        <View
                          key={index}
                          className="border-2 rounded-2xl bg-white"
                          style={{
                            width: 52,
                            height: 64,
                            borderColor: digit ? "#00332d" : "#e5e7eb",
                            backgroundColor: digit ? "#f5fdfc" : "white",
                          }}
                        >
                          <TextInput
                            ref={(ref) => (codeRefs.current[index] = ref)}
                            value={digit}
                            onChangeText={(text) => handleCodeChange(text, index)}
                            onKeyPress={(e) => handleCodeKeyPress(e, index)}
                            keyboardType="number-pad"
                            maxLength={1}
                            selectTextOnFocus
                            style={{
                              flex: 1,
                              textAlign: "center",
                              fontSize: 24,
                              fontWeight: "700",
                              color: "#111827",
                            }}
                          />
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Resend Code */}
                  <View className="items-center mb-8">
                    <Text className="text-gray-500 text-sm mb-2">
                      Didn't receive the code?
                    </Text>
                    <TouchableOpacity
                      onPress={handleSendCode}
                      disabled={loading}
                      className="py-2"
                    >
                      <Text className="text-primary text-base font-bold">
                        Resend Code
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Continue Button */}
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => setStep("password")}
                    disabled={code.some(digit => digit === "")}
                    className="rounded-2xl overflow-hidden shadow-lg mb-6"
                    style={{ height: 56, opacity: code.some(digit => digit === "") ? 0.5 : 1 }}
                  >
                    <LinearGradient
                      colors={["#00332d", "#005248"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
                    >
                      <Text className="text-white font-bold text-base tracking-wide">
                        Continue
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}

              {step === "password" && (
                <>
                  {/* New Password Input */}
                  <View className="mb-5">
                    <Text className="text-sm font-medium text-gray-700 mb-3">
                      New Password
                    </Text>
                    <View
                      className={`flex-row items-center border-2 rounded-2xl px-4 ${
                        passwordFocused
                          ? "border-[#00332d] bg-[#f5fdfc]"
                          : "border-gray-300 bg-white"
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
                        placeholder="Enter new password"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={!showPassword}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => setPasswordFocused(false)}
                        returnKeyType="done"
                        onSubmitEditing={handleResetPassword}
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
                    {newPassword.length > 0 && (
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

                  {/* Password Requirements */}
                  <View className="bg-gray-50 rounded-2xl px-4 py-4 mb-8">
                    <Text className="text-sm text-gray-600 mb-2 font-medium">
                      Password must contain:
                    </Text>
                    <View className="flex-row items-center">
                      <Ionicons
                        name={newPassword.length >= 8 ? "checkmark-circle" : "ellipse-outline"}
                        size={16}
                        color={newPassword.length >= 8 ? "#10B981" : "#9CA3AF"}
                      />
                      <Text className="text-sm text-gray-600 ml-2">
                        At least 8 characters
                      </Text>
                    </View>
                  </View>

                  {/* Reset Password Button */}
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={handleResetPassword}
                    disabled={loading || newPassword.length < 8}
                    className="rounded-2xl overflow-hidden shadow-lg mb-6"
                    style={{ height: 56, opacity: newPassword.length < 8 || loading ? 0.5 : 1 }}
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
                          Reset Password
                        </Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}

              {/* Back Button */}
              <TouchableOpacity onPress={handleBack} className="items-center py-3">
                <Text className="text-primary text-base font-semibold">
                  {step === "email" ? "Back to Login" : "Back"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
