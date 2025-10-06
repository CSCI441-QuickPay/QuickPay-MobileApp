import BalanceCard from '@/components/BalanceCard';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import TransactionFilter from '@/components/TransactionFilter';
import TransactionList from '@/components/TransactionList';
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from 'react';
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function Home() {
  const [filter, setFilter] = useState("all");

  // optional logout handler
  async function handleLogout() {
    await AsyncStorage.removeItem("isLoggedIn");
    router.replace("/login");
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <Header 
        name="Emily" 
        onSettingPress={handleLogout} // 👈 Logout on settings press
      />
        
      {/* Balance Card */}
      <BalanceCard 
        balance={1234.00} 
        onRequest={() => console.log("Request Money")} 
        onSend={() => console.log("Send Money")} 
      />

      {/* Transaction Filter */}
      <TransactionFilter onFilterChange={setFilter} />

      {/* Main content area */}
      <View className="flex-1 mt-[14px] bg-gray-100">
        <TransactionList filter={filter} />
      </View>
      
      {/* Bottom Navigation */}
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
            onPress: () => console.log("Go Budget"),
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
            icon: (color) => <Ionicons name="person-outline" size={34} color={color} />,
            onPress: () => router.push("/profile"),
          }
        ]}
      />
    </SafeAreaView>
  );
}