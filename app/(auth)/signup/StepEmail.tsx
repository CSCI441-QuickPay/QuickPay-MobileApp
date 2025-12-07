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

export default function StepEmail({ onNext, onBack, cachedData }: any) {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [email, setEmail] = useState(cachedData?.email || "");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const codeRefs = useRef<Array<TextInput | null>>([]);

  if (!isLoaded) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#00332d" />
      </View>
    );
  }

  const handleBack = () => {
    if (isCodeSent) {
      // Go back to email input screen
      setIsCodeSent(false);
      setCode(["", "", "", "", "", ""]);
    } else {
      // Save current data and go back to previous step
      onBack({ email });
    }
  };

  // ---------- Step 1: Send email verification ----------
  const sendEmailVerification = async () => {
    if (!email.includes("@")) {
      return;
    }

    setLoading(true);
    try {
      await signUp.update({ emailAddress: email });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setIsCodeSent(true);

      // Focus first code input after a short delay
      setTimeout(() => {
        codeRefs.current[0]?.focus();
      }, 300);
    } catch (err: any) {
      console.error("Email verification error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ---------- Step 2: Verify email code ----------
  const verifyCodeWithString = async (codeString: string) => {
    if (codeString.length < 6) return;

    setLoading(true);
    try {
      const complete = await signUp.attemptEmailAddressVerification({
        code: codeString,
      });

      if (complete.status === "complete" || complete.verifications?.emailAddress?.status === "verified") {
        onNext({ email });
      } else {
        setCode(["", "", "", "", "", ""]);
        codeRefs.current[0]?.focus();
      }
    } catch (err: any) {
      console.error("Email verification error:", err);
      setCode(["", "", "", "", "", ""]);
      codeRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (text: string, index: number) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, '');
    
    if (numericText.length > 1) {
      // Handle paste - distribute digits across inputs
      const digits = numericText.slice(0, 6).split('');
      const newCode = [...code];
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newCode[index + i] = digit;
        }
      });
      setCode(newCode);
      
      // Focus the next empty input or the last one
      const nextIndex = Math.min(index + digits.length, 5);
      codeRefs.current[nextIndex]?.focus();
      
      // Auto-verify if all 6 digits are filled
      if (newCode.every(digit => digit !== "")) {
        setTimeout(() => {
          const codeString = newCode.join("");
          verifyCodeWithString(codeString);
        }, 300);
      }
    } else {
      // Single digit input
      const newCode = [...code];
      newCode[index] = numericText;
      setCode(newCode);
      
      // Auto-advance to next input
      if (numericText && index < 5) {
        codeRefs.current[index + 1]?.focus();
      }
      
      // Auto-verify if all 6 digits are filled
      if (newCode.every(digit => digit !== "") && index === 5) {
        setTimeout(() => {
          const codeString = newCode.join("");
          verifyCodeWithString(codeString);
        }, 300);
      }
    }
  };

  const handleCodeKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      codeRefs.current[index - 1]?.focus();
    } else if (e.nativeEvent.key === 'Enter' && code.every(digit => digit !== "")) {
      // Submit on Enter if all digits are filled
      handleVerify();
    }
  };

  const handleVerify = async () => {
    const codeString = code.join("");
    if (codeString.length < 6) {
      return;
    }

    await verifyCodeWithString(codeString);
  };

  // ---------- UI ----------
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
            <View className="items-center mb-8">
              <View className="bg-[#f0fdf4] rounded-full p-4 mb-4">
                <Ionicons name="mail-outline" size={48} color="#00332d" />
              </View>
              <Text className="text-4xl font-extrabold text-primary mb-3 text-center">
                {isCodeSent ? "Check your email" : "Verify your email"}
              </Text>
              <Text className="text-gray-500 text-base text-center px-4">
                {isCodeSent
                  ? `Enter the 6-digit code sent to\n${email}`
                  : "We'll send you a verification code"}
              </Text>
            </View>

            {!isCodeSent ? (
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
                      onSubmitEditing={sendEmailVerification}
                      style={{ flex: 1, color: "#111827", fontSize: 17, fontWeight: "500" }}
                    />
                  </View>
                </View>

                {/* Info Box */}
                <View className="bg-blue-50 rounded-2xl px-4 py-3 mb-8 flex-row items-start">
                  <Ionicons name="information-circle" size={20} color="#3B82F6" style={{ marginTop: 2, marginRight: 8 }} />
                  <Text className="text-sm text-blue-700 flex-1">
                    We'll send a verification code to this email address. Please check your inbox and spam folder.
                  </Text>
                </View>

                {/* Send Code Button */}
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={sendEmailVerification}
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
                        Send Verification Code
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* OTP Input - Individual boxes */}
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
                    onPress={sendEmailVerification}
                    disabled={loading}
                    className="py-2"
                  >
                    <Text className="text-primary text-base font-bold">
                      Resend Code
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Verify Button - Only show if manually needed */}
                {!loading && code.every(digit => digit !== "") && (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={handleVerify}
                    className="rounded-2xl overflow-hidden shadow-lg mb-6"
                    style={{ height: 56 }}
                  >
                    <LinearGradient
                      colors={["#00332d", "#005248"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
                    >
                      <Text className="text-white font-bold text-base tracking-wide">
                        Verify Code
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}

                {loading && (
                  <View className="items-center mb-6">
                    <ActivityIndicator size="large" color="#00332d" />
                    <Text className="text-gray-500 text-sm mt-3">
                      Verifying code...
                    </Text>
                  </View>
                )}
              </>
            )}

            {/* Back Button */}
            <TouchableOpacity onPress={handleBack} className="items-center py-3">
              <Text className="text-primary text-base font-semibold">
                {isCodeSent ? "Change Email Address" : "Back"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
