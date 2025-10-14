import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import { 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  TouchableWithoutFeedback, 
  Keyboard,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FirebaseService from "@/services/FirebaseService";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleLogin = async () => {
    // Validation
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      await FirebaseService.signIn(email, password);
      router.replace("/home");
    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
          keyboardVerticalOffset={0}
        >
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View className="flex-1 justify-center px-8">
              {/* Logo / Branding */}
              <View className="items-center mb-8">
                <View className="w-24 h-24 mb-4 rounded-full bg-[#00332d] items-center justify-center shadow-lg">
                  <Ionicons name="wallet-outline" size={48} color="#ccf8f1" />
                </View>
                <Text className="text-4xl font-bold text-[#00332d] mb-2">QuickPay</Text>
                <Text className="text-gray-500 text-base">Secure payments made simple</Text>
              </View>

              {/* Email Input */}
              <View className="mb-5">
                <Text className="text-sm font-medium text-gray-700 mb-2">Email Address</Text>
                <View 
                  className={`flex-row items-center border-2 rounded-xl px-4 ${
                    emailFocused ? 'border-[#00332d] bg-[#ccf8f1]/10' : 'border-gray-300 bg-white'
                  }`}
                  style={{ minHeight: 56 }}
                >
                  <Ionicons 
                    name="mail-outline" 
                    size={22} 
                    color={emailFocused ? "#00332d" : "#9CA3AF"} 
                    style={{ marginRight: 8 }}
                  />
                  <TextInput
                    placeholder="example@email.com"
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 text-base text-gray-900"
                    style={{ paddingVertical: 0, paddingHorizontal: 0, height: 56 }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    textAlignVertical="center"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View className="mb-3">
                <Text className="text-sm font-medium text-gray-700 mb-2">Password</Text>
                <View 
                  className={`flex-row items-center border-2 rounded-xl px-4 ${
                    passwordFocused ? 'border-[#00332d] bg-[#ccf8f1]/10' : 'border-gray-300 bg-white'
                  }`}
                  style={{ minHeight: 56 }}
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
                    className="flex-1 text-base text-gray-900"
                    style={{ paddingVertical: 0, paddingHorizontal: 0, height: 56 }}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    textAlignVertical="center"
                  />
                </View>
              </View>

              {/* Forgot Password */}
              <TouchableOpacity
                onPress={() => router.push("/forgot-password")}
                className="mb-8 self-end"
              >
                <Text className="text-[#00332d] text-sm font-semibold">
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleLogin}
                disabled={loading}
                className="rounded-2xl overflow-hidden shadow-lg mb-6"
                style={{ width: '100%', height: 64 }}
              >
                <LinearGradient
                  colors={["#00332d", "#005248"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                >
                  {loading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text className="text-white font-bold text-2xl tracking-wide">
                      Log In
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View className="flex-row items-center mb-6">
                <View className="flex-1 h-[1px] bg-gray-300" />
                <Text className="mx-4 text-gray-500 text-sm">OR</Text>
                <View className="flex-1 h-[1px] bg-gray-300" />
              </View>

              {/* Sign Up Link */}
              <View className="flex-row justify-center items-center">
                <Text className="text-gray-600 text-base">Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push("/signup")}>
                  <Text className="text-[#00332d] font-bold text-base">Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}