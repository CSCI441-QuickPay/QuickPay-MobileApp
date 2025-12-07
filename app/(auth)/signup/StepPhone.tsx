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
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import PhoneInput from "react-native-phone-number-input";
import { useSignUp } from "@clerk/clerk-expo";

export default function StepPhone({ onNext, onBack, cachedData }: any) {
  const { signUp } = useSignUp();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneValue, setPhoneValue] = useState(cachedData?.phoneValue || "");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const phoneRef = useRef<PhoneInput>(null);
  const otpRefs = useRef<Array<TextInput | null>>([]);

  const sendOTP = async () => {
    if (!phoneNumber) {
      return;
    }

    setLoading(true);
    try {
      await signUp?.update({
        phoneNumber: phoneNumber
      });

      await signUp?.preparePhoneNumberVerification({ strategy: "phone_code" });
      setOtpSent(true);

      // Focus first OTP input after a short delay
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 300);
    } catch (err: any) {
      console.error("Phone verification error:", err);

      // Handle rate limiting gracefully - just proceed to OTP screen
      if (err?.message?.includes("Too many") || err?.message?.includes("rate limit")) {
        console.log("⚠️ Rate limited, proceeding to OTP screen anyway...");
        setOtpSent(true);
        setTimeout(() => {
          otpRefs.current[0]?.focus();
        }, 300);
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      return;
    }

    setLoading(true);
    try {
      const result = await signUp?.attemptPhoneNumberVerification({
        code: otpCode,
      });

      if (result?.status === "complete" || result?.verifications?.phoneNumber?.status === "verified") {
        onNext({ phoneNumber });
      } else {
        setOtp(["", "", "", "", "", ""]);
        otpRefs.current[0]?.focus();
      }
    } catch (err: any) {
      console.error("OTP verification error:", err);
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, '');
    
    if (numericText.length > 1) {
      // Handle paste - distribute digits across inputs
      const digits = numericText.slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      
      // Focus the next empty input or the last one
      const nextIndex = Math.min(index + digits.length, 5);
      otpRefs.current[nextIndex]?.focus();
      
      // Auto-verify if all 6 digits are filled
      if (newOtp.every(digit => digit !== "")) {
        setTimeout(() => {
          const otpCode = newOtp.join("");
          verifyOTPWithCode(otpCode);
        }, 300);
      }
    } else {
      // Single digit input
      const newOtp = [...otp];
      newOtp[index] = numericText;
      setOtp(newOtp);
      
      // Auto-advance to next input
      if (numericText && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
      
      // Auto-verify if all 6 digits are filled
      if (newOtp.every(digit => digit !== "") && index === 5) {
        setTimeout(() => {
          const otpCode = newOtp.join("");
          verifyOTPWithCode(otpCode);
        }, 300);
      }
    }
  };

  const verifyOTPWithCode = async (otpCode: string) => {
    if (otpCode.length < 6) return;

    setLoading(true);
    try {
      const result = await signUp?.attemptPhoneNumberVerification({
        code: otpCode,
      });

      if (result?.status === "complete" || result?.verifications?.phoneNumber?.status === "verified") {
        onNext({ phoneNumber });
      } else {
        setOtp(["", "", "", "", "", ""]);
        otpRefs.current[0]?.focus();
      }
    } catch (err: any) {
      console.error("OTP verification error:", err);
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      otpRefs.current[index - 1]?.focus();
    } else if (e.nativeEvent.key === 'Enter' && otp.every(digit => digit !== "")) {
      // Submit on Enter if all digits are filled
      verifyOTP();
    }
  };

  const handleBack = () => {
    if (otpSent) {
      // Go back to phone input screen
      setOtpSent(false);
      setOtp(["", "", "", "", "", ""]);
    } else {
      // Go back to previous step - save only what user typed, not the formatted number
      onBack({ phoneValue });
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
            <View className="items-center mb-8">
              <View className="bg-[#f0fdf4] rounded-full p-4 mb-4">
                <Ionicons name="phone-portrait-outline" size={48} color="#00332d" />
              </View>
              <Text className="text-4xl font-extrabold text-primary mb-3 text-center">
                {otpSent ? "Verify your code" : "What's your number?"}
              </Text>
              <Text className="text-gray-500 text-base text-center px-4">
                {otpSent
                  ? `Enter the 6-digit code sent to\n${phoneNumber}`
                  : "We'll send you a verification code"}
              </Text>
            </View>

            {!otpSent ? (
              <>
                {/* Phone Input */}
                <View className="mb-8">
                  <Text className="text-sm font-medium text-gray-700 mb-3">
                    Phone Number
                  </Text>
                  <PhoneInput
                    ref={phoneRef}
                    defaultCode="US"
                    layout="first"
                    value={phoneValue}
                    onChangeText={setPhoneValue}
                    onChangeFormattedText={setPhoneNumber}
                    textInputProps={{
                      returnKeyType: "done",
                      onSubmitEditing: sendOTP,
                    }}
                    containerStyle={{
                      width: "100%",
                      borderRadius: 16,
                      borderWidth: 2,
                      borderColor: "#e5e7eb",
                      backgroundColor: "white",
                      height: 60,
                    }}
                    textContainerStyle={{
                      backgroundColor: "white",
                      borderRadius: 16,
                      paddingVertical: 0,
                    }}
                    textInputStyle={{
                      fontSize: 17,
                      color: "#111827",
                      fontWeight: "500",
                    }}
                    codeTextStyle={{
                      fontSize: 17,
                      fontWeight: "600",
                      color: "#00332d",
                    }}
                    flagButtonStyle={{
                      width: 60,
                    }}
                  />
                </View>

                {/* Info Box */}
                <View className="bg-blue-50 rounded-2xl px-4 py-3 mb-8 flex-row items-start">
                  <Ionicons name="information-circle" size={20} color="#3B82F6" style={{ marginTop: 2, marginRight: 8 }} />
                  <Text className="text-sm text-blue-700 flex-1">
                    Standard messaging rates may apply. We'll only use this to verify your identity.
                  </Text>
                </View>

                {/* Send Code Button */}
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={sendOTP}
                  disabled={loading || !phoneNumber}
                  className="rounded-2xl overflow-hidden shadow-lg mb-6"
                  style={{ height: 56, opacity: !phoneNumber || loading ? 0.5 : 1 }}
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
                    {otp.map((digit, index) => (
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
                          ref={(ref) => (otpRefs.current[index] = ref)}
                          value={digit}
                          onChangeText={(text) => handleOtpChange(text, index)}
                          onKeyPress={(e) => handleOtpKeyPress(e, index)}
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
                    onPress={sendOTP}
                    disabled={loading}
                    className="py-2"
                  >
                    <Text className="text-primary text-base font-bold">
                      Resend Code
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Verify Button - Only show if manually needed */}
                {!loading && otp.every(digit => digit !== "") && (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={verifyOTP}
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
                {otpSent ? "Change Phone Number" : "Back"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
