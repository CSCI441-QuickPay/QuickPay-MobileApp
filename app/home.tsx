import BalanceCard from '@/components/home/BalanceCard';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/home/Header';
import TransactionFilter from '@/components/home/TransactionFilter';
import TransactionList from '@/components/home/TransactionList';
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from 'react';
import { View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FirebaseService from "@/services/FirebaseService";

export default function Home() {
  const [filter, setFilter] = useState("all");

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
              await FirebaseService.signOut();
              router.replace("/login");
            } catch (error: any) {
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          }
        }
      ]
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <Header 
        name="Emily" 
        onSettingPress={handleLogout}
      />
        
      <BalanceCard 
        balance={1234.00} 
        onRequest={() => console.log("Request Money")} 
        onSend={() => console.log("Send Money")} 
      />

      <TransactionFilter onFilterChange={setFilter} />

      <View className="flex-1 mt-[14px] bg-gray-100">
        <TransactionList filter={filter} />
      </View>
      
      <BottomNav
        items={[
          {
            label: "Home",
            icon: (color) => <Ionicons name="home" size={34} color={color} />,
            onPress: () => router.push("/home"),
            active: true,
          },
          {
            label: "Budget",
            icon: (color) => <MaterialIcons name="account-tree" size={34} color={color} />,
            onPress: () => router.push("/visual_budget")
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
          }
        ]}
      />
    </SafeAreaView>
  );
}