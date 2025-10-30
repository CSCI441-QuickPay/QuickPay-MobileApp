import BottomNav from "@/components/BottomNav";
import ProfileOption, { ProfileOptionProps } from "@/components/profile/ProfileOption";
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Text, TouchableOpacity, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser, useAuth } from "@clerk/clerk-expo";

export default function Profile() {
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();

  if (!isLoaded) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500 text-lg">Loading...</Text>
      </SafeAreaView>
    );
  }

  const fullName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User" : "Guest";
  const userId = user?.id || "Unknown ID";
  const userEmail = user?.primaryEmailAddress?.emailAddress || "Not provided";

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

  // Profile Options
  const option: ProfileOptionProps[] = [
    { icon: "person-outline", label: "My Profile", onPress: () => console.log("Go to My Profile") },
    { icon: "shield-checkmark-outline", label: "Security", onPress: () => console.log("Go to Security") },
    { icon: "language-outline", label: "Language", onPress: () => console.log("Go to Language") },
    { icon: "call-outline", label: "Contact Us", onPress: () => router.push("/contact_us") },
    { icon: "document-text-outline", label: "Terms & Conditions", onPress: () => console.log("Go to Terms") },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-1">
        {/* Profile Header */}
        <View className="items-center mt-4 px-4 relative h-[300px]">
          {/* Settings / Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            className="absolute right-10 top-5"
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={37} color="#000" />
          </TouchableOpacity>

          {/* User Profile Image */}
          <Image
            source={require("@/assets/images/user_profile.jpg")}
            className="w-[149] h-[149] rounded-full mt-[70] border border-black"
          />

          {/* User Info */}
          <Text className="text-[28px] font-bold mt-2 text-[#00332d]">{fullName}</Text>
          <Text className="text-gray-500 font-medium mt-1">ID: {userId}</Text>
          <Text className="text-gray-500 font-medium mt-1">{userEmail}</Text>
        </View>

        {/* Options List */}
        <View className="bg-gray-100 flex-1 items-center">
          <View className="mt-2 px-4 pt-4">
            {option.map((option, index) => (
              <ProfileOption key={index} {...option} />
            ))}
          </View>

          {/* App Version */}
          <View className="items-center mt-2 mb-8">
            <Text className="text-gray-500 font-bold text-normal">App Version: v1.0.0</Text>
          </View>
        </View>
      </View>

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
            icon: (color) => <MaterialIcons name="account-tree" size={34} color={color} />,
            onPress: () => router.push("/visual_budget"),
          },
          {
            label: "Scan",
            icon: (color) => <AntDesign name="qrcode" size={40} color={color} />,
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
