/**
 * written by: Team QuickPay
 * tested by: Team QuickPay
 * debugged by: Team QuickPay
 * Notes: Contributions were shared, see GitHub history for commit details.
 * Unit Tests for UserSyncService
 */
import { SafeAreaView, View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function TermsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#00332d]">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="white" />
        </TouchableOpacity>

        <Text className="flex-1 text-center text-lg font-semibold text-white">
          Terms & Conditions
        </Text>

        <View className="w-6" />
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Card */}
        <View className="mx-4 mt-4 bg-white/10 border border-white/10 rounded-2xl p-5">
          <Text className="text-white text-lg font-semibold">
            QuickPay User Agreement
          </Text>

          <Text className="text-white/60 text-xs mt-1">
            Last updated: Dec 2025
          </Text>

          {/* Section 1 */}
          <Text className="text-white text-base font-semibold mt-6">
            1. Introduction
          </Text>
          <Text className="text-white/70 text-sm mt-2 leading-6">
            Welcome to QuickPay. By creating an account or using our app, you
            agree to the following Terms & Conditions. These conditions govern
            your use of payments, transfers, merchant tools, and any services
            we provide.
          </Text>

          {/* Section 2 */}
          <Text className="text-white text-base font-semibold mt-6">
            2. User Responsibilities
          </Text>
          <Text className="text-white/70 text-sm mt-2 leading-6">
            You are responsible for maintaining the confidentiality of your
            account, passwords, Face ID settings, and security PIN. You agree
            not to share your account with others or engage in fraudulent or
            illegal activities.
          </Text>

          {/* Section 3 */}
          <Text className="text-white text-base font-semibold mt-6">
            3. Payment & Transfer Rules
          </Text>
          <Text className="text-white/70 text-sm mt-2 leading-6">
            QuickPay provides digital transfer tools to simplify peer-to-peer
            payments. All transfers are final. QuickPay is not responsible for
            payments sent to the wrong recipient if the user confirms the
            transaction or provides incorrect information.
          </Text>

          {/* Section 4 */}
          <Text className="text-white text-base font-semibold mt-6">
            4. Merchant Mode
          </Text>
          <Text className="text-white/70 text-sm mt-2 leading-6">
            If you enable Merchant Mode, you must comply with local financial
            laws and ensure your business is legitimate. QuickPay may temporarily
            suspend merchant activity if suspicious transactions are detected.
          </Text>

          {/* Section 5 */}
          <Text className="text-white text-base font-semibold mt-6">
            5. Privacy & Data Usage
          </Text>
          <Text className="text-white/70 text-sm mt-2 leading-6">
            We only collect information necessary to operate your account,
            such as name, email, phone number, and payment activity. QuickPay
            will never sell your personal data to third parties.  
          </Text>

          {/* Section 6 */}
          <Text className="text-white text-base font-semibold mt-6">
            6. Account Termination
          </Text>
          <Text className="text-white/70 text-sm mt-2 leading-6">
            QuickPay reserves the right to disable or restrict any account
            involved in fraudulent behavior, abuse, or violations of these
            Terms & Conditions.
          </Text>

          {/* Section 7 */}
          <Text className="text-white text-base font-semibold mt-6">
            7. Updates to Terms
          </Text>
          <Text className="text-white/70 text-sm mt-2 leading-6">
            We may update these terms occasionally to reflect new features or
            regulatory requirements. Continued use of QuickPay means you accept
            the updated terms.
          </Text>

          {/* Footer */}
          <Text className="text-white/50 text-xs mt-10">
            By using QuickPay, you confirm you have read, understood, and
            agreed to all terms stated above.
          </Text>
        </View>
      </ScrollView>

      {/* Accept Button */}
      <View className="absolute bottom-0 left-0 right-0 px-6 pb-8">
        <TouchableOpacity
          className="w-full py-4 bg-white rounded-2xl items-center"
          onPress={() => router.back()}
        >
          <Text className="text-[#00332d] font-bold text-lg">
            AGREE & CONTINUE
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
