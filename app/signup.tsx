import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  TouchableWithoutFeedback, 
  Keyboard, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import FirebaseService from "@/services/FirebaseService";

export default function SignUp() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Focus states
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [lastNameFocused, setLastNameFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  const handleSignUp = async () => {
    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await FirebaseService.signUp(email, password, firstName, lastName, phone);
      Alert.alert("Success", "Account created successfully!", [
        { text: "OK", onPress: () => router.replace("/home") }
      ]);
    } catch (error: any) {
      Alert.alert("Sign Up Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            <ScrollView 
              style={{ flex: 1 }}
              contentContainerStyle={{ 
                paddingHorizontal: 32,
                paddingTop: 20,
                paddingBottom: 5
              }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
              bounces={true}
              scrollEnabled={true}
            >
              {/* Logo / Branding */}
              <View className="items-center mb-6">
                <View className="w-20 h-20 mb-3 rounded-full bg-[#00332d] items-center justify-center shadow-lg">
                  <Ionicons name="person-add" size={40} color="#ccf8f1" />
                </View>
                <Text className="text-3xl font-bold text-[#00332d] mb-1">Create Account</Text>
                <Text className="text-gray-500 text-sm">Join QuickPay today</Text>
              </View>

              {/* First Name and Last Name - Side by Side */}
              <View className="flex-row mb-4" style={{ gap: 12 }}>
                {/* First Name */}
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-2">First Name *</Text>
                  <View 
                    className={`flex-row items-center border-2 rounded-xl px-4 ${
                      firstNameFocused ? 'border-[#00332d] bg-[#ccf8f1]/10' : 'border-gray-300 bg-white'
                    }`}
                    style={{ minHeight: 56 }}
                  >
                    <Ionicons 
                      name="person-outline" 
                      size={22} 
                      color={firstNameFocused ? "#00332d" : "#9CA3AF"} 
                      style={{ marginRight: 8 }}
                    />
                    <TextInput
                      placeholder="First name"
                      placeholderTextColor="#9CA3AF"
                      className="flex-1 text-base text-gray-900"
                      style={{ paddingVertical: 0, paddingHorizontal: 0, height: 56 }}
                      autoCapitalize="words"
                      autoCorrect={false}
                      value={firstName}
                      onChangeText={setFirstName}
                      onFocus={() => setFirstNameFocused(true)}
                      onBlur={() => setFirstNameFocused(false)}
                      textAlignVertical="center"
                    />
                  </View>
                </View>

                {/* Last Name */}
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-2">Last Name *</Text>
                  <View 
                    className={`flex-row items-center border-2 rounded-xl px-4 ${
                      lastNameFocused ? 'border-[#00332d] bg-[#ccf8f1]/10' : 'border-gray-300 bg-white'
                    }`}
                    style={{ minHeight: 56 }}
                  >
                    <Ionicons 
                      name="person-outline" 
                      size={22} 
                      color={lastNameFocused ? "#00332d" : "#9CA3AF"} 
                      style={{ marginRight: 8 }}
                    />
                    <TextInput
                      placeholder="Last name"
                      placeholderTextColor="#9CA3AF"
                      className="flex-1 text-base text-gray-900"
                      style={{ paddingVertical: 0, paddingHorizontal: 0, height: 56 }}
                      autoCapitalize="words"
                      autoCorrect={false}
                      value={lastName}
                      onChangeText={setLastName}
                      onFocus={() => setLastNameFocused(true)}
                      onBlur={() => setLastNameFocused(false)}
                      textAlignVertical="center"
                    />
                  </View>
                </View>
              </View>

              {/* Email */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">Email *</Text>
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

              {/* Phone Number */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">Phone Number (Optional)</Text>
                <View 
                  className={`flex-row items-center border-2 rounded-xl px-4 ${
                    phoneFocused ? 'border-[#00332d] bg-[#ccf8f1]/10' : 'border-gray-300 bg-white'
                  }`}
                  style={{ minHeight: 56 }}
                >
                  <Ionicons 
                    name="call-outline" 
                    size={22} 
                    color={phoneFocused ? "#00332d" : "#9CA3AF"} 
                    style={{ marginRight: 8 }}
                  />
                  <TextInput
                    placeholder="Enter your phone number"
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 text-base text-gray-900"
                    style={{ paddingVertical: 0, paddingHorizontal: 0, height: 56 }}
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                    onFocus={() => setPhoneFocused(true)}
                    onBlur={() => setPhoneFocused(false)}
                    textAlignVertical="center"
                  />
                </View>
              </View>

              {/* Password */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">Password *</Text>
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

              {/* Confirm Password */}
              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-2">Confirm Password *</Text>
                <View 
                  className={`flex-row items-center border-2 rounded-xl px-4 ${
                    confirmPasswordFocused ? 'border-[#00332d] bg-[#ccf8f1]/10' : 'border-gray-300 bg-white'
                  }`}
                  style={{ minHeight: 56 }}
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
                    className="flex-1 text-base text-gray-900"
                    style={{ paddingVertical: 0, paddingHorizontal: 0, height: 56 }}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    onFocus={() => setConfirmPasswordFocused(true)}
                    onBlur={() => setConfirmPasswordFocused(false)}
                    textAlignVertical="center"
                  />
                </View>
              </View>

              {/* Sign Up button */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleSignUp}
                disabled={loading}
                className="rounded-2xl overflow-hidden shadow-lg"
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
                      Sign Up
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>

            {/* Footer - Taller with better proportions */}
            <View className="bg-white border-t border-gray-200 py-5 px-8">
              <View className="flex-row justify-center items-center">
                <Text className="text-gray-600 text-base">Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push("/login")}>
                  <Text className="text-[#00332d] font-bold text-base">Log In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}