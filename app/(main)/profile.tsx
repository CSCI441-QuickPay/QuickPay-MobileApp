import BottomNav from "@/components/BottomNav";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { getFavoritesCount } from "@/data/favorites";
import { getUserStats } from "@/data/user";
import UserModel from "@/models/UserModel";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchProfile } from "../../services/profileService";
import { Profile as SupaProfile } from "../../types/Profile";
// Get initials from name
const getInitials = (name: string) => {
  const names = name.split(" ");
  if (names.length >= 2) {
    return `${names[0][0]}${names[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export default function Profile() {
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();

  const [supabaseProfile, setSupabaseProfile] = useState<SupaProfile | null>(
    null
  );

  // Load Supabase profile whenever this screen comes into focus
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadProfile = async () => {
        if (!isLoaded || !user?.id) return;

        try {
          const p = await fetchProfile(user.id);
          console.log("PROFILE HEADER from Supabase (focus):", p);

          if (isActive) {
            setSupabaseProfile(p || null);
          }
        } catch (err) {
          console.log("Profile header fetchProfile error:", err);
        }
      };

      loadProfile();

      // cleanup when screen loses focus
      return () => {
        isActive = false;
      };
    }, [isLoaded, user?.id])
  );
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [loadingAccount, setLoadingAccount] = useState(true);
  const [stats, setStats] = useState({ activeCards: 0, totalFavorites: 0 });

  // Load account number and stats from database or mock data
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;

      try {
        setLoadingAccount(true);

        // Fetch real data from database first
        const dbUser = await UserModel.getByClerkId(user.id);

        // If Demo Mode is ON, merge real data with mock data
        if (isDemoMode) {
          console.log("🎭 Demo Mode ON - Merging real + mock data");

          const FavoriteModel = (await import("@/models/FavoriteModel")).default;
          const { fetchPlaidAccounts } = await import("@/services/PlaidService");

          // Get real data
          const [plaidAccounts, realFavorites] = await Promise.all([
            fetchPlaidAccounts(user.id).catch(() => []),
            FavoriteModel.getByUserId(dbUser?.id || "")
          ]);

          // Merge: real favorites + mock favorites
          const mockFavoritesCount = getFavoritesCount();
          const totalFavorites = realFavorites.length + mockFavoritesCount;

          setStats({
            activeCards: plaidAccounts.length + getUserStats(mockFavoritesCount).activeCards, // Plaid + mock
            totalFavorites: totalFavorites, // Real + Mock combined
          });

          // Use real account number even in Demo Mode
          if (dbUser?.accountNumber) {
            setAccountNumber(dbUser.accountNumber);
          }

          setLoadingAccount(false);
          return;
        }

        // Real Mode - fetch from Plaid and database
        if (!dbUser) {
          setStats({ activeCards: 0, totalFavorites: 0 });
          setLoadingAccount(false);
          return;
        }

        if (dbUser.accountNumber) {
          setAccountNumber(dbUser.accountNumber);
        }

        // Fetch real stats from Plaid and database
        const FavoriteModel = (await import("@/models/FavoriteModel")).default;
        const { fetchPlaidAccounts } = await import("@/services/PlaidService");

        const [plaidAccounts, favorites] = await Promise.all([
          fetchPlaidAccounts(user.id).catch(() => []),
          FavoriteModel.getByUserId(dbUser.id!)
        ]);

        setStats({
          activeCards: plaidAccounts.length, // Count of connected Plaid banks
          totalFavorites: favorites.length,
        });
      } catch (error) {
        console.error("Error loading profile data:", error);
        // Fallback to empty stats on error
        setStats({ activeCards: 0, totalFavorites: 0 });
      } finally {
        setLoadingAccount(false);
      }
    };

    if (isLoaded && user) {
      loadProfileData();
    }
  }, [user, isLoaded, isDemoMode]);

  if (!isLoaded) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500 text-lg">Loading...</Text>
      </SafeAreaView>
    );
  }

  const fullName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User"
    : "Guest";
  const userEmail = user?.primaryEmailAddress?.emailAddress || "Not provided";

  const handleCopyAccountNumber = async () => {
    if (accountNumber) {
      await Clipboard.setStringAsync(accountNumber);
      Alert.alert("Copied!", "Account number copied to clipboard");
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            router.replace("/login");
          } catch (error: any) {
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header Section */}
      <View className="px-6 pt-4 pb-5">
        {/* Title with Logout Button */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center flex-1">
            <View className="w-14 h-14 rounded-full bg-[#f0fdf4] items-center justify-center mr-3">
              <Ionicons name="person" size={28} color="#00332d" />
            </View>
            <View>
              <Text className="text-3xl font-extrabold text-primary">
                Profile
              </Text>
              <Text className="text-gray-500 text-sm mt-0.5">
                Manage your account
              </Text>
            </View>
          </View>

          {/* Logout Button (Standard iOS/Android position) */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleLogout}
            className="px-3 py-1.5"
          >
            <Ionicons name="log-out-outline" size={26} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* User Info Card */}
        <View className="rounded-2xl overflow-hidden mb-5">
          <LinearGradient
            colors={["#00332d", "#005248"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 20 }}
          >
            <View className="flex-row items-center mb-4">
              {/* Avatar with Initials/After Upload */}
              <View className="w-16 h-16 rounded-full bg-white items-center justify-center mr-4 overflow-hidden">
                {supabaseProfile?.profile_picture ? (
                  <Image
                    source={{ uri: supabaseProfile.profile_picture }}
                    className="w-16 h-16 rounded-full"
                    resizeMode="cover"
                    onError={() => {
                      console.log(
                        "Header avatar failed to load:",
                        supabaseProfile.profile_picture
                      );
                    }}
                  />
                ) : (
                  <Text className="text-2xl font-extrabold text-primary">
                    {getInitials(fullName)}
                  </Text>
                )}
              </View>

              <View className="flex-1">
                <Text className="text-white text-xl font-bold mb-1">
                  {fullName}
                </Text>
                <Text className="text-white/70 text-sm font-medium">
                  {userEmail}
                </Text>
              </View>
            </View>

            {/* Account Number with Copy */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCopyAccountNumber}
              disabled={loadingAccount || !accountNumber}
              className="bg-white/20 px-4 py-3 rounded-xl flex-row items-center justify-between"
              style={{
                minWidth: 200,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 3,
              }}
            >
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Ionicons name="shield-checkmark" size={14} color="#10B981" style={{ marginRight: 4 }} />
                  <Text className="text-white/80 text-xs font-semibold">
                    Verified Account
                  </Text>
                </View>
                {loadingAccount ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-bold text-base tracking-wider">
                    {accountNumber || "Loading..."}
                  </Text>
                )}
              </View>
              {!loadingAccount && accountNumber && (
                <View className="ml-3 w-8 h-8 rounded-full bg-white/20 items-center justify-center">
                  <Ionicons name="copy-outline" size={16} color="white" />
                </View>
              )}
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Stats Cards */}
        <View className="flex-row gap-3 mb-5">
          <TouchableOpacity
            activeOpacity={0.7}
            className="flex-1 bg-blue-50 rounded-2xl p-4 border-2 border-blue-100"
          >
            <View className="flex-row items-center justify-between mb-2">
              <Ionicons name="card-outline" size={24} color="#3B82F6" />
              <Text className="text-2xl font-bold text-blue-600">
                {stats.activeCards}
              </Text>
            </View>
            <Text className="text-gray-600 text-sm font-medium">
              Active Banks
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/favorite")}
            className="flex-1 bg-amber-50 rounded-2xl p-4 border-2 border-amber-100"
          >
            <View className="flex-row items-center justify-between mb-2">
              <Ionicons name="star" size={24} color="#F59E0B" />
              <Text className="text-2xl font-bold text-amber-600">
                {stats.totalFavorites}
              </Text>
            </View>
            <Text className="text-gray-600 text-sm font-medium">Favorites</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Settings List */}
      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Account Section */}
        <View className="mb-6">
          <Text className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide">
            Account
          </Text>
          <View className="gap-2">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/my_profile")}
              className="flex-row items-center bg-white border-2 border-gray-200 rounded-2xl p-4"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-3">
                <Ionicons name="person-outline" size={20} color="#3B82F6" />
              </View>
              <Text className="flex-1 text-base font-semibold text-gray-900">
                My Profile
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/security")}
              className="flex-row items-center bg-white border-2 border-gray-200 rounded-2xl p-4"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <View className="w-10 h-10 rounded-full bg-green-50 items-center justify-center mr-3">
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color="#10B981"
                />
              </View>
              <Text className="flex-1 text-base font-semibold text-gray-900">
                Security
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/my_bank")}
              className="flex-row items-center bg-white border-2 border-gray-200 rounded-2xl p-4"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <View className="w-10 h-10 rounded-full bg-purple-50 items-center justify-center mr-3">
                <Ionicons name="card-outline" size={20} color="#8B5CF6" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">
                  My Banks
                </Text>
                <Text className="text-xs text-gray-500 mt-0.5">
                  {stats.activeCards} active
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Preferences Section */}
        <View className="mb-6">
          <Text className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide">
            Preferences
          </Text>
          <View className="gap-2">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/notification")}
              className="flex-row items-center bg-white border-2 border-gray-200 rounded-2xl p-4"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <View className="w-10 h-10 rounded-full bg-orange-50 items-center justify-center mr-3">
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color="#F97316"
                />
              </View>
              <Text className="flex-1 text-base font-semibold text-gray-900">
                Notifications
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/language")}
              className="flex-row items-center bg-white border-2 border-gray-200 rounded-2xl p-4"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <View className="w-10 h-10 rounded-full bg-indigo-50 items-center justify-center mr-3">
                <Ionicons name="language-outline" size={20} color="#6366F1" />
              </View>
              <Text className="flex-1 text-base font-semibold text-gray-900">
                Language
              </Text>
              <View className="flex-row items-center">
                <Text className="text-sm text-gray-500 mr-2">English</Text>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>

            {/* Demo Mode Toggle */}
            <View
              className="flex-row items-center bg-white border-2 border-gray-200 rounded-2xl p-4"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <View className="w-10 h-10 rounded-full bg-purple-50 items-center justify-center mr-3">
                <Ionicons name="flask-outline" size={20} color="#8B5CF6" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">
                  Demo Mode
                </Text>
                <Text className="text-xs text-gray-500 mt-0.5">
                  Use mock data for testing
                </Text>
              </View>
              <Switch
                value={isDemoMode}
                onValueChange={toggleDemoMode}
                trackColor={{ false: "#D1D5DB", true: "#A78BFA" }}
                thumbColor={isDemoMode ? "#8B5CF6" : "#F3F4F6"}
                ios_backgroundColor="#D1D5DB"
              />
            </View>
          </View>
        </View>

        {/* Support Section */}
        <View className="mb-6">
          <Text className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide">
            Support
          </Text>
          <View className="gap-2">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/contact_us")}
              className="flex-row items-center bg-white border-2 border-gray-200 rounded-2xl p-4"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <View className="w-10 h-10 rounded-full bg-teal-50 items-center justify-center mr-3">
                <Ionicons name="call-outline" size={20} color="#14B8A6" />
              </View>
              <Text className="flex-1 text-base font-semibold text-gray-900">
                Contact Us
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/term_condition")}
              className="flex-row items-center bg-white border-2 border-gray-200 rounded-2xl p-4"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color="#6B7280"
                />
              </View>
              <Text className="flex-1 text-base font-semibold text-gray-900">
                Terms & Conditions
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* App Version */}
        <View className="items-center py-2">
          <Text className="text-gray-400 font-medium text-sm">
            QuickPay v2.0.0
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav
        items={[
          {
            label: "Home",
            icon: (color) => <Ionicons name="home" size={34} color={color} />,
            onPress: () => router.push("/home"),
          },
          {
            label: "Budget",
            icon: (color) => (
              <MaterialIcons name="account-tree" size={34} color={color} />
            ),
            onPress: () => router.push("/visual_budget"),
          },
          {
            label: "Scan",
            icon: (color) => (
              <AntDesign name="qrcode" size={40} color={color} />
            ),
            onPress: () => console.log("Go Scan"),
            special: true,
          },
          {
            label: "Favorite",
            icon: (color) => <AntDesign name="star" size={34} color={color} />,
            onPress: () => router.push("/favorite"),
          },
          {
            label: "Profile",
            icon: (color) => <Ionicons name="person" size={34} color={color} />,
            onPress: () => router.push("/profile"),
            active: true,
          },
        ]}
      />
    </SafeAreaView>
  );
}
