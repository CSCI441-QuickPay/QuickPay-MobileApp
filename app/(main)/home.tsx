import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BalanceCard from "@/components/home/BalanceCard";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/home/Header";
import TransactionFilter from "@/components/home/TransactionFilter";
import TransactionList from "@/components/home/TransactionList";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { banks } from "@/data/budget";
import { transactions as mockTransactions } from "@/data/transaction";
import UserModel from "@/models/UserModel";
import {
  calculateTotalBalance,
  fetchPlaidAccounts,
  fetchPlaidTransactions,
  PlaidAccount,
  PlaidTransaction,
  transformPlaidTransaction,
} from "@/services/PlaidService";
import UserSyncService from "@/services/UserSyncService";

export default function Home() {
  const { user } = useUser();
  const { isDemoMode } = useDemoMode();

  // Plaid data state
  const [plaidAccounts, setPlaidAccounts] = useState<PlaidAccount[]>([]);
  const [plaidTransactions, setPlaidTransactions] = useState<any[]>([]);
  const [loadingPlaidData, setLoadingPlaidData] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);
  const [hasPlaidLinked, setHasPlaidLinked] = useState<boolean | null>(null);
  const [plaidError, setPlaidError] = useState<string | null>(null);

  // Fetch Plaid transactions and accounts
  const fetchPlaidData = async () => {
    if (!user) return;

    // Skip Plaid fetch in Demo Mode
    if (isDemoMode) {
      console.log("🎭 Demo Mode ON - Skipping Plaid fetch");
      return;
    }

    setLoadingPlaidData(true);
    setPlaidError(null);

    try {
      console.log("🏦 Fetching Plaid data for user:", user.id);

      const [accountsData, transactionsData] = await Promise.all([
        fetchPlaidAccounts(user.id),
        fetchPlaidTransactions(user.id),
      ]);

      console.log("✅ Received accounts:", accountsData.length);
      console.log("✅ Received transactions:", transactionsData.transactions.length);

      setPlaidAccounts(accountsData);

      const transformedTransactions = transactionsData.transactions.map((tx: PlaidTransaction) =>
        transformPlaidTransaction(tx, accountsData)
      );

      console.log("✅ Transformed transactions:", transformedTransactions.length);

      // Log sample transaction data for debugging
      if (transactionsData.transactions.length > 0) {
        console.log("\n========== SAMPLE PLAID TRANSACTION DATA ==========");
        console.log("Raw Plaid Transaction (first):", JSON.stringify(transactionsData.transactions[0], null, 2));
        console.log("\nTransformed Transaction (first):", JSON.stringify(transformedTransactions[0], null, 2));
        console.log("====================================================\n");
      }

      setPlaidTransactions(transformedTransactions);

      const balance = calculateTotalBalance(accountsData);
      console.log("✅ Total balance:", balance);
      setTotalBalance(balance);

    } catch (error: any) {
      console.error("❌ Failed to fetch Plaid data:", error);
      console.error("❌ Error message:", error.message);

      setPlaidError(error.message || "Failed to load bank data");
      setPlaidTransactions(mockTransactions);

      try {
        const userData = await UserModel.getByClerkId(user.id);
        setTotalBalance(userData?.balance || 0);
      } catch (err) {
        console.error("❌ Failed to get user balance:", err);
        setTotalBalance(0);
      }
    } finally {
      setLoadingPlaidData(false);
    }
  };

  // Sync user to Supabase and check Plaid status
  useEffect(() => {
    async function initializeUser() {
      if (user) {
        try {
          // If Demo Mode is ON, use mock data
          if (isDemoMode) {
            console.log("🎭 Demo Mode ON - Using mock data");
            setPlaidTransactions(mockTransactions);
            // Calculate total balance from mock banks
            const mockBalance = banks.reduce(
              (sum, bank) => sum + (bank.budget || bank.amount),
              0
            );
            setTotalBalance(mockBalance);
            setHasPlaidLinked(false);
            return;
          }

          // Real Mode - sync user and fetch real data
          console.log("🔄 Syncing user to Supabase from home...", user.id);
          await UserSyncService.syncCurrentUser(user);
          console.log("✅ User synced successfully");

          // Check if user has Plaid linked
          const userData = await UserModel.getByClerkId(user.id);
          const hasPlaid = !!userData?.plaidAccessToken;
          console.log("🔗 Plaid linked on home:", hasPlaid);
          console.log("🔗 Plaid access token:", userData?.plaidAccessToken);

          setHasPlaidLinked(hasPlaid);

          if (!hasPlaid) {
            // Check if user has skipped Plaid onboarding
            const skipKey = `plaid_onboarding_skipped_${user.id}`;
            const hasSkipped = await AsyncStorage.getItem(skipKey);
            console.log("⏭️ User has skipped Plaid:", hasSkipped === "true");

            if (hasSkipped !== "true") {
              // First-time user - redirect to full-screen Plaid onboarding page
              console.log(
                "⚠️ First-time user, redirecting to plaid-onboarding-hosted..."
              );
              router.replace("/plaid-onboarding-hosted");
              return;
            } else {
              // User skipped - show empty state (no data)
              console.log("ℹ️ User skipped Plaid - showing empty state");
              setPlaidTransactions([]);
              // Get balance from database
              const userData = await UserModel.getByClerkId(user.id);
              setTotalBalance(userData?.balance || 0);
            }
          } else {
            // Fetch Plaid data if linked
            await fetchPlaidData();
          }
        } catch (error) {
          console.error("❌ Failed to initialize user:", error);
        }
      }
    }
    initializeUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isDemoMode]);

  const [filterState, setFilterState] = useState({
    timeFilter: "all",
    bankFilter: "all",
    sortType: "date_desc",
  });

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Fixed Header */}
      <View className="bg-white">
        <Header />
      </View>

      {/* Fixed Balance Card */}
      <BalanceCard
        balance={totalBalance}
        onRequest={() =>
          router.push({
            pathname: "/request",
            params: { initialAmount: "0" },
          })
        }
        onSend={() => router.push("/send")}
        showLinkAccount={hasPlaidLinked === false}
        onLinkAccount={async () => {
          if (user) {
            // Clear skip flag and navigate to Plaid onboarding
            const skipKey = `plaid_onboarding_skipped_${user.id}`;
            await AsyncStorage.removeItem(skipKey);
            console.log(
              "🔄 Cleared skip flag, navigating to Plaid onboarding..."
            );
            router.push("/plaid-onboarding-hosted");
          }
        }}
      />

      {/* Error Banner */}
      {plaidError && (
        <View className="mx-4 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-red-800 font-semibold">Unable to load bank data</Text>
              <Text className="text-red-600 text-sm mt-1">{plaidError}</Text>
            </View>
            <TouchableOpacity
              onPress={() => fetchPlaidData()}
              className="ml-3 bg-red-600 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold">Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Fixed Transaction Filter */}
      <TransactionFilter
        onFilterChange={setFilterState}
        connectedBanks={plaidAccounts.map(acc => acc.name)}
      />

      {/* Scrollable Transaction List with Pull-to-Refresh */}
      <ScrollView
        className="flex-1 mt-2"
        refreshControl={
          <RefreshControl
            refreshing={loadingPlaidData}
            onRefresh={fetchPlaidData}
            colors={["#00332d"]}
            tintColor="#00332d"
          />
        }
      >
        {loadingPlaidData ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#00332d" />
            <Text className="text-gray-500 mt-4">Loading transactions...</Text>
          </View>
        ) : (
          <TransactionList
            filters={filterState}
            transactions={isDemoMode ? mockTransactions : plaidTransactions}
          />
        )}
      </ScrollView>

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
            icon: (color) => (
              <AntDesign name="qrcode" size={40} color={color} />
            ),
            onPress: () => router.push("/qr_scan"),
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
