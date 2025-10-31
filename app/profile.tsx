import BottomNav from '@/components/BottomNav';
import ProfileOption, { ProfileOptionProps } from '@/components/profile/ProfileOption';
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Text, TouchableOpacity, View, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { useEffect, useState } from 'react';
import UserModel from '@/models/UserModel';

export default function Profile() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [connectedBanks, setConnectedBanks] = useState<string[]>([]);

  useEffect(() => {
    loadUserData();
  }, []);

  async function loadUserData() {
    if (!user) return;
    
    try {
      const data = await UserModel.get(user.id);
      setUserData(data);
      
      if (data?.plaidConnections) {
        const bankNames = data.plaidConnections.map(
          (conn: any) => conn.institutionName
        );
        setConnectedBanks(bankNames);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  async function handleLogout() {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
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
          }
        }
      ]
    );
  }

  const options: ProfileOptionProps[] = [
    { 
      icon: "person-outline", 
      label: "My Profile", 
      onPress: () => console.log("Go to My Profile") 
    },
    { 
      icon: "card-outline", 
      label: "Manage Banks", 
      onPress: () => router.push("/onboarding")
    },
    { 
      icon: "shield-checkmark-outline", 
      label: "Security", 
      onPress: () => console.log("Go to Security") 
    },
    { 
      icon: "language-outline", 
      label: "Language", 
      onPress: () => console.log("Go to Language") 
    },
    { 
      icon: "call-outline", 
      label: "Contact Us", 
      onPress: () => router.push("/contact_us") 
    },
    { 
      icon: "document-text-outline", 
      label: "Terms & Conditions", 
      onPress: () => console.log("Go to Terms") 
    },
    { 
      icon: "log-out-outline", 
      label: "Logout", 
      onPress: handleLogout
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView className="flex-1">
        <View className="items-center mt-4 px-4 relative">
          {/* User Profile */}
          <Image
            source={
              user?.imageUrl 
                ? { uri: user.imageUrl }
                : require('@/assets/images/user_profile.jpg')
            }
            className="w-[149] h-[149] rounded-full mt-[70] border border-black"
          />

          {/* User Name & Email */}
          <Text className="text-[28px] font-bold mt-2">
            {user?.firstName} {user?.lastName}
          </Text>
          <Text className="text-gray-500 font-bold text-subheading">
            {user?.primaryEmailAddress?.emailAddress}
          </Text>

          {/* Connected Banks */}
          {connectedBanks.length > 0 && (
            <View className="mt-4 bg-green-50 px-4 py-2 rounded-full flex-row items-center">
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text className="text-green-700 text-sm ml-2 font-medium">
                {connectedBanks.length} Bank{connectedBanks.length > 1 ? 's' : ''} Connected
              </Text>
            </View>
          )}
        </View>

        {/* Profile Options List */}
        <View className="bg-gray-100 flex-1 items-center">
          <View className="mt-2 px-4 pt-4 pb-20">
            {options.map((option, index) => (
              <ProfileOption 
                key={index} 
                {...option}
              />
            ))}
          </View>

          {/* App Version Label */}
          <View className="items-center mt-2">
            <Text className="text-gray-500 font-bold text-normal">
              App Version: V 1.0.0
            </Text>
            <Text className="text-gray-400 text-sm mt-1">
              Secured by Clerk + Plaid
            </Text>
          </View>
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
          }
        ]}
      />
    </SafeAreaView>
  );
}