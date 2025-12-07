/**
 * written by: Team QuickPay
 * tested by: Team QuickPay
 * debugged by: Team QuickPay
 * Notes: Contributions were shared, see GitHub history for commit details.
 * Unit Tests for UserSyncService
 */
// app/main/update-phone.tsx
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import PhoneInput from "react-native-phone-number-input";

import { updatePhoneNumber } from "../../services/profileService";

export default function UpdatePhoneScreen() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  // same vibe as StepPhone
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneValue, setPhoneValue] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const [phoneObjId, setPhoneObjId] = useState<string | null>(null); // Clerk phone resource id

  const phoneRef = useRef<PhoneInput>(null);
  const otpRefs = useRef<Array<TextInput | null>>([]);

  const fullPhone = phoneNumber; // already formatted by PhoneInput (E.164)

  const handleBack = () => {
    if (otpSent) {
      setOtpSent(false);
      setOtp(["", "", "", "", "", ""]);
      setErrorText(null);
    } else {
      router.back();
    }
  };

  // -------------------- SEND OTP (correct Clerk flow) --------------------
  const sendOTP = async () => {
    if (!fullPhone || !user || !isLoaded) return;

    setLoading(true);
    setErrorText(null);

    try {
      // 1. Create an unverified phone number for this user
      const created = await user.createPhoneNumber({
        phoneNumber: fullPhone,
      });

      // 2. Reload user so phoneNumbers array is fresh
      await user.reload();

      // 3. Find the phone resource we just created
      const newPhoneObj = user.phoneNumbers.find((p) => p.id === created.id);

      if (!newPhoneObj) {
        throw new Error("Unable to find created phone number.");
      }

      setPhoneObjId(newPhoneObj.id);

      // 4. Send SMS with verification code
      await newPhoneObj.prepareVerification();
      
      setOtpSent(true);
      
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 300);
    } catch (err: any) {
      console.error("Phone update verification error:", err);

      // handle rate limit similar to your sign-up step
      if (
        err?.message?.includes("Too many") ||
        err?.message?.includes("rate limit")
      ) {
        console.log("⚠️ Rate limited, going to OTP screen anyway");
        setOtpSent(true);
        setTimeout(() => {
          otpRefs.current[0]?.focus();
        }, 300);
      } else {
        setErrorText(
          err?.errors?.[0]?.message ||
            "Failed to send verification code. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // -------------------- VERIFY OTP + UPDATE SUPABASE --------------------
  const verifyOTPWithCode = async (otpCode: string) => {
    if (!user || !phoneObjId || otpCode.length < 6) return;

    setLoading(true);
    setErrorText(null);

    try {
      // reload to be safe
      await user.reload();
      const phoneObj = user.phoneNumbers.find((p) => p.id === phoneObjId);

      if (!phoneObj) {
        throw new Error("Phone number not found on user.");
      }

      const attempt = await phoneObj.attemptVerification({ code: otpCode });

      if (attempt?.verification?.status === "verified") {
        // optional: make this the primary phone number in Clerk
        await user.update({ primaryPhoneNumberId: phoneObj.id });

        // update Supabase users.phone_number so profile screen stays in sync
        await updatePhoneNumber(user.id, fullPhone);

        router.back();
      } else {
        setOtp(["", "", "", "", "", ""]);
        otpRefs.current[0]?.focus();
        setErrorText("Invalid code. Please try again.");
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
      setErrorText("Unable to verify code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    const code = otp.join("");
    if (code.length < 6) return;
    await verifyOTPWithCode(code);
  };

  // -------------------- OTP input handlers (same as StepPhone) ----------
  const handleOtpChange = (text: string, index: number) => {
    const numericText = text.replace(/[^0-9]/g, "");

    if (numericText.length > 1) {
      const digits = numericText.slice(0, 6).split("");
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);

      const nextIndex = Math.min(index + digits.length, 5);
      otpRefs.current[nextIndex]?.focus();

      if (newOtp.every((d) => d !== "")) {
        setTimeout(() => {
          verifyOTPWithCode(newOtp.join(""));
        }, 300);
      }
    } else {
      const newOtp = [...otp];
      newOtp[index] = numericText;
      setOtp(newOtp);

      if (numericText && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }

      if (newOtp.every((d) => d !== "") && index === 5) {
        setTimeout(() => {
          verifyOTPWithCode(newOtp.join(""));
        }, 300);
      }
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (
      e.nativeEvent.key === "Enter" &&
      otp.every((digit) => digit !== "")
    ) {
      verifyOTP();
    }
  };

  // ---------------------------- UI ----------------------------

  if (!isLoaded || !user) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#00332d" />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-white"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* TOP BAR WITH CHEVRON (fixed at top) */}
          <View className="pt-12 px-4 pb-2 mt-12">
            <TouchableOpacity onPress={handleBack}>
              <Ionicons name="chevron-back" size={26} color="#111827" />
            </TouchableOpacity>
          </View>

          {/* MAIN CONTENT */}
          <View className="justify-center px-8 pb-10">
            {/* Header */}
            <View className="items-center mb-8">
              <View className="bg-[#f0fdf4] rounded-full p-4 mb-4">
                <Ionicons
                  name="phone-portrait-outline"
                  size={48}
                  color="#00332d"
                />
              </View>
              <Text className="text-3xl font-extrabold text-primary mb-3 text-center">
                {otpSent ? "Verify your code" : "Update phone number"}
              </Text>
              <Text className="text-gray-500 text-base text-center px-4">
                {otpSent
                  ? `Enter the 6-digit code sent to\n${fullPhone}`
                  : "Enter your new phone number. We'll send you a verification code to confirm this change."}
              </Text>
            </View>

            {!otpSent ? (
              <>
                {/* Phone Input (same style/colors as StepPhone) */}
                <View className="mb-8">
                  <Text className="text-sm font-medium text-gray-700 mb-3">
                    New Phone Number
                  </Text>
                  <PhoneInput
                    ref={phoneRef}
                    defaultCode="US" // or "KH" if you want Cambodia by default
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
                  <Ionicons
                    name="information-circle"
                    size={20}
                    color="#3B82F6"
                    style={{ marginTop: 2, marginRight: 8 }}
                  />
                  <Text className="text-sm text-blue-700 flex-1">
                    Make sure this phone is available on your current device.
                    We’ll send a text to verify it before updating your account.
                  </Text>
                </View>

                {/* NEXT / SEND CODE BUTTON (same gradient) */}
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={sendOTP}
                  disabled={loading || !fullPhone}
                  className="rounded-2xl overflow-hidden shadow-lg mb-6"
                  style={{
                    height: 56,
                    opacity: !fullPhone || loading ? 0.5 : 1,
                  }}
                >
                  <LinearGradient
                    colors={["#00332d", "#005248"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {loading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-white font-bold text-base tracking-wide">
                        Next
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* OTP Input - same style as StepPhone */}
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
                    Didn&apos;t receive the code?
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

                {/* Verify Button (same gradient) */}
                {!loading && otp.every((d) => d !== "") && (
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
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text className="text-white font-bold text-base tracking-wide">
                        Confirm new number
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

            {errorText && (
              <Text className="text-red-500 text-sm text-center mb-4">
                {errorText}
              </Text>
            )}

            {/* Back text */}
            <TouchableOpacity onPress={handleBack} className="items-center py-3">
              <Text className="text-primary text-base font-semibold">
                {otpSent ? "Change phone number" : "Back to profile"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
