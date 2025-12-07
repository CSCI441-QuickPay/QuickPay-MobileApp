/**
 * written by: Team QuickPay
 * tested by: Team QuickPay
 * debugged by: Team QuickPay
 * Notes: Contributions were shared, see GitHub history for commit details.
 * Unit Tests for UserSyncService
 */
import { SafeAreaView, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function LanguageScreen() {
  const router = useRouter();

  // Default language — replace with your global stored setting later
  const [selected, setSelected] = useState("English");

  const languages = [
    { code: "en", label: "English" },
    { code: "km", label: "ភាសាខ្មែរ (Khmer)" },
    { code: "zh", label: "中文 (Chinese)" },
    { code: "es", label: "Español (Spanish)" },
  ];

  const handleSelect = (label: string) => {
    setSelected(label);

    // (Optional) Save to local storage or your Supabase settings later
    // AsyncStorage.setItem("app_language", label);

    // Navigate back automatically after selection
    setTimeout(() => {
      router.back();
    }, 150);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#00332d]">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="white" />
        </TouchableOpacity>

        <Text className="flex-1 text-center text-lg font-semibold text-white">
          Language
        </Text>

        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 mt-3" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="mx-4 bg-white/10 border border-white/10 rounded-2xl">
          {languages.map((lang, index) => (
            <TouchableOpacity
              key={lang.code}
              onPress={() => handleSelect(lang.label)}
              className="flex-row items-center justify-between px-4 py-5"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <Ionicons name="language-outline" size={20} color="#A7F3D0" />
                <Text className="text-white text-base ml-3">{lang.label}</Text>
              </View>

              {selected === lang.label ? (
                <Ionicons name="checkmark-circle" size={22} color="#34D399" />
              ) : (
                <View className="w-5 h-5 rounded-full border border-white/30" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
