import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import BalanceCard from "@/components/home/BalanceCard";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/home/Header";
import TransactionFilter from "@/components/home/TransactionFilter";
import TransactionList from "@/components/home/TransactionList";
import { transactions } from "@/data/transaction";
import UserSyncService from "@/services/UserSyncService";

export default function Home() {
  const { user } = useUser();
  const firstName = user?.firstName || "User";

  // Sync user to Supabase when home loads
  useEffect(() => {
    async function syncUser() {
      if (user) {
        try {
          console.log("🔄 Syncing user to Supabase from home...", user.id);
          await UserSyncService.syncCurrentUser(user);
          console.log("✅ User synced successfully");
        } catch (error) {
          console.error("❌ Failed to sync user:", error);
        }
      }
    }
    syncUser();
  }, [user]);

  // Calculate total balance from transactions
  const totalBalance = transactions.reduce((sum, t) => sum + t.amount, 0);

  const [filterState, setFilterState] = useState({
    timeFilter: "all",
    bankFilter: "all",
    sortType: "date_desc",
  });

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Fixed Header */}
      <View className="bg-white">
        <Header/>
      </View>

      {/* Fixed Balance Card */}
      <BalanceCard
        balance={totalBalance}
        onRequest={() => console.log("Request Money")}
        onSend={() => router.push("/favorite")}
      />

      {/* Fixed Transaction Filter */}
      <TransactionFilter onFilterChange={setFilterState} />

      {/* Scrollable Transaction List */}
      <View className="flex-1 mt-2">
        <TransactionList filters={filterState} />
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
            icon: (color) => (
              <MaterialIcons name="account-tree" size={34} color={color} />
            ),
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
          },
        ]}
      />
    </SafeAreaView>
  );
}