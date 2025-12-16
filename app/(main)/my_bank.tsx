/**
 * written by: Team QuickPay
 * tested by: Team QuickPay
 * debugged by: Team QuickPay
 * Notes: Contributions were shared, see GitHub history for commit details.
 * Unit Tests for UserSyncService
 */
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function MyBanks() {
  const router = useRouter();

  const banks = [
    {
      id: 1,
      name: "Bank of America",
      last4: "4821",
      type: "Checking",
      logo: "https://1000logos.net/wp-content/uploads/2017/03/Bank-of-America-Logo.png",
      color1: "#7B001C",
      color2: "#3C000F",
    },
    {
      id: 2,
      name: "Capital One",
      last4: "9914",
      type: "Savings",
      logo: "https://1000logos.net/wp-content/uploads/2021/04/Capital-One-logo.png",
      color1: "#001F44",
      color2: "#003F6B",
    },
    {
      id: 3,
      name: "Commerce Bank",
      last4: "3770",
      type: "Checking",
      logo: "https://1000logos.net/wp-content/uploads/2020/04/Commerce-Bank-Logo-700x394.png",
      color1: "#063F36",
      color2: "#0A6F5B",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#00332d]">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="white" />
        </TouchableOpacity>

        <Text className="flex-1 text-center text-lg font-semibold text-white">
          My Banks
        </Text>

        <View className="w-6" />
      </View>

      <ScrollView
        className="px-4"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {banks.map((bank, index) => (
          <LinearGradient
            key={bank.id}
            colors={[bank.color1, bank.color2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 20,
              padding: 20,
              marginTop: index === 0 ? 10 : -40,
              elevation: 6,
              shadowColor: "#000",
              shadowOpacity: 0.25,
              shadowRadius: 10,
            }}
          >
            {/* Logo + Menu */}
            <View className="flex-row justify-between items-center">
              <Image
                source={{ uri: bank.logo }}
                className="w-28 h-10"
                resizeMode="contain"
              />
              <Ionicons name="ellipsis-horizontal" size={22} color="white" />
            </View>

            <Text className="text-white text-2xl font-bold mt-6">
              {bank.name}
            </Text>

            <Text className="text-white/80 text-lg tracking-widest mt-2">
              ••••  ••••  ••••  {bank.last4}
            </Text>

            <Text className="text-white/60 mt-1 text-sm">{bank.type} Account</Text>
          </LinearGradient>
        ))}

        {/* Add Bank */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => console.log("Add Bank Account")}
          className="mt-6 mb-8 bg-white/10 border border-white/10 rounded-2xl py-4 flex-row justify-center items-center"
        >
          <Ionicons name="add-circle-outline" size={22} color="#A7F3D0" />
          <Text className="text-white font-semibold text-base ml-2">
            Add Bank Account
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
