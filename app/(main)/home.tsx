import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
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
import { transactions as mockTransactions } from "@/data/transaction";
import UserSyncService from "@/services/UserSyncService";
import UserModel from "@/models/UserModel";
import {
  fetchPlaidTransactions,
  fetchPlaidAccounts,
  calculateTotalBalance,
  transformPlaidTransaction,
  PlaidAccount,
  PlaidTransaction
} from "@/services/PlaidService";

export default function Home() {
  const { user } = useUser();

  // Plaid data state
  const [plaidAccounts, setPlaidAccounts] = useState<PlaidAccount[]>([]);
  const [plaidTransactions, setPlaidTransactions] = useState<any[]>([]);
  const [loadingPlaidData, setLoadingPlaidData] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);
  const [hasPlaidLinked, setHasPlaidLinked] = useState<boolean | null>(null);

  // Fetch Plaid transactions and accounts
  const fetchPlaidData = async () => {
    if (!user) return;

    setLoadingPlaidData(true);
    try {
      console.log("🏦 Fetching Plaid data...");

      // Fetch accounts and transactions in parallel
      const [accountsData, transactionsData] = await Promise.all([
        fetchPlaidAccounts(user.id),
        fetchPlaidTransactions(user.id)
      ]);

      console.log("📊 Accounts:", accountsData);
      console.log("📊 Transactions:", transactionsData);

      setPlaidAccounts(accountsData);

      // Transform Plaid transactions to app format
      const transformedTransactions = transactionsData.transactions.map((tx: PlaidTransaction) =>
        transformPlaidTransaction(tx, accountsData)
      );

      setPlaidTransactions(transformedTransactions);

      // Calculate total balance
      const balance = calculateTotalBalance(accountsData);
      setTotalBalance(balance);

      console.log("✅ Plaid data loaded successfully");
    } catch (error) {
      console.error("❌ Failed to fetch Plaid data:", error);
      // Fallback to mock data on error
      setPlaidTransactions(mockTransactions);
      setTotalBalance(mockTransactions.reduce((sum, t) => sum + t.amount, 0));
    } finally {
      setLoadingPlaidData(false);
    }
  };

  // Sync user to Supabase and check Plaid status
  useEffect(() => {
    async function initializeUser() {
      if (user) {
        try {
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
              console.log("⚠️ First-time user, redirecting to plaid-onboarding-hosted...");
              router.replace("/plaid-onboarding-hosted");
              return;
            } else {
              // User skipped - use mock data
              console.log("ℹ️ User skipped Plaid - using mock data");
              setPlaidTransactions(mockTransactions);
              setTotalBalance(mockTransactions.reduce((sum, t) => sum + t.amount, 0));
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
  }, [user]);

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
        showLinkAccount={hasPlaidLinked === false}
        onLinkAccount={async () => {
          if (user) {
            // Clear skip flag and navigate to Plaid onboarding
            const skipKey = `plaid_onboarding_skipped_${user.id}`;
            await AsyncStorage.removeItem(skipKey);
            console.log("🔄 Cleared skip flag, navigating to Plaid onboarding...");
            router.push("/plaid-onboarding-hosted");
          }
        }}
      />

      {/* Fixed Transaction Filter */}
      <TransactionFilter onFilterChange={setFilterState} />

      {/* Scrollable Transaction List */}
      <View className="flex-1 mt-2">
        {loadingPlaidData ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#00332d" />
            <Text className="text-gray-500 mt-4">Loading transactions...</Text>
          </View>
        ) : (
          <TransactionList
            filters={filterState}
            transactions={plaidTransactions.length > 0 ? plaidTransactions : mockTransactions}
          />
        )}
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