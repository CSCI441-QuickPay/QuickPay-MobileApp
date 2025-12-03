import BottomNav from "@/components/BottomNav";
import BalanceCard from "@/components/home/BalanceCard";
import Header from "@/components/home/Header";
import TransactionFilter from "@/components/home/TransactionFilter";
import TransactionList from "@/components/home/TransactionList";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { banks } from "@/data/budget";
import { transactions as mockTransactions } from "@/data/transaction";
import UserModel from "@/models/UserModel";
import {
  fetchPlaidAccounts,
  fetchPlaidTransactions,
  PlaidAccount,
  PlaidTransaction,
  transformPlaidTransaction,
} from "@/services/PlaidService";
import UserSyncService from "@/services/UserSyncService";
import { useUser } from "@clerk/clerk-expo";
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const { user } = useUser();
  const { isDemoMode } = useDemoMode();

  const [plaidAccounts, setPlaidAccounts] = useState<PlaidAccount[]>([]);
  const [plaidTransactions, setPlaidTransactions] = useState<any[]>([]);
  const [loadingPlaidData, setLoadingPlaidData] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);
  const [hasPlaidLinked, setHasPlaidLinked] = useState<boolean | null>(null);
  const [plaidError, setPlaidError] = useState<string | null>(null);

  // Fetch Plaid transactions and accounts
  const fetchPlaidData = async () => {
    if (!user) return;

    setLoadingPlaidData(true);
    setPlaidError(null);

    try {
      const [accountsData, transactionsData] = await Promise.all([
        fetchPlaidAccounts(user.id),
        fetchPlaidTransactions(user.id),
      ]);

      setPlaidAccounts(accountsData);

      const transformedTransactions = transactionsData.transactions.map((tx: PlaidTransaction) =>
        transformPlaidTransaction(tx, accountsData)
      );

      let combinedTransactions = transformedTransactions;

      // Get QuickPay balance
      const userData = await UserModel.getByClerkId(user.id);
      const quickPayBalance = userData?.balance || 0;

      // Calculate Plaid balance (Tartan returns dollars, not cents - no conversion needed)
      const plaidBalance = accountsData.reduce((sum, account) => {
        const balance = account.balances.available || account.balances.current || 0;
        return sum + balance;
      }, 0);

      // Calculate total balance using same logic as visual_budget.tsx
      let combinedBalance = quickPayBalance + plaidBalance;

      if (isDemoMode) {
        const { PaymentService } = await import("@/services/PaymentService");
        const demoTxs = await PaymentService.getDemoTransactions();

        combinedTransactions = [...demoTxs, ...transformedTransactions, ...mockTransactions];

        // Add demo/mock bank balances (same as visual_budget.tsx)
        const mockBankBalance = banks.reduce((sum, bank) => sum + (bank.budget || bank.amount || 0), 0);
        combinedBalance += mockBankBalance;
      }

      setPlaidTransactions(combinedTransactions);
      setTotalBalance(combinedBalance);
    } catch (error: any) {
      console.error("❌ Failed to fetch Plaid data:", error);
      setPlaidError(error.message || "Failed to load bank data");

      try {
        const { PaymentService } = await import("@/services/PaymentService");
        const demoTxs = isDemoMode ? await PaymentService.getDemoTransactions() : [];
        const combinedTransactions = isDemoMode ? [...demoTxs, ...mockTransactions] : [...mockTransactions];
        setPlaidTransactions(combinedTransactions);

        // Get QuickPay balance for fallback
        const userData = await UserModel.getByClerkId(user.id);
        const quickPayBalance = userData?.balance || 0;

        const fallbackBalance = isDemoMode
          ? quickPayBalance + banks.reduce((sum, bank) => sum + (bank.budget || bank.amount || 0), 0)
          : quickPayBalance;
        setTotalBalance(fallbackBalance);
      } catch {
        setPlaidTransactions(mockTransactions);
        setTotalBalance(0);
      }
    } finally {
      setLoadingPlaidData(false);
    }
  };

  // Sync user and check Plaid status
  useEffect(() => {
    async function initializeUser() {
      if (!user) return;

      try {
        await UserSyncService.syncCurrentUser(user);

        const userData = await UserModel.getByClerkId(user.id);
        const hasPlaid = !!userData?.plaidAccessToken;
        setHasPlaidLinked(hasPlaid);

        if (isDemoMode) {
          if (hasPlaid) {
            await fetchPlaidData();
          } else {
            const { PaymentService } = await import("@/services/PaymentService");
            const demoTxs = await PaymentService.getDemoTransactions();
            setPlaidTransactions([...demoTxs, ...mockTransactions]);

            // Demo Mode without Plaid: QuickPay + Mock banks (same logic as visual_budget.tsx)
            const quickPayBalance = userData?.balance || 0;
            const mockBalance = banks.reduce((sum, bank) => sum + (bank.budget || bank.amount || 0), 0);
            setTotalBalance(quickPayBalance + mockBalance);
          }
          return;
        }

        if (!hasPlaid) {
          const skipKey = `plaid_onboarding_skipped_${user.id}`;
          const hasSkipped = await AsyncStorage.getItem(skipKey);

          if (hasSkipped !== "true") {
            router.replace("/plaid-onboarding-hosted");
            return;
          } else {
            setPlaidTransactions([]);
            setTotalBalance(userData?.balance || 0);
          }
        } else {
          await fetchPlaidData();
        }
      } catch (err) {
        console.error("❌ Failed to initialize user:", err);
      }
    }
    initializeUser();
  }, [user, isDemoMode]);

  // Refresh transactions on screen focus
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const refreshData = async () => {
        if (!user || !isActive) return;

        if (isDemoMode) {
          const { PaymentService } = await import("@/services/PaymentService");
          const demoTxs = await PaymentService.getDemoTransactions();
          if (demoTxs.length > 0 && isActive) {
            setPlaidTransactions([...demoTxs, ...mockTransactions]);
          }
        } else if (hasPlaidLinked) {
          await fetchPlaidData();
        } else {
          try {
            const userData = await UserModel.getByClerkId(user.id);
            if (isActive) setTotalBalance(userData?.balance || 0);
          } catch (err) {
            console.error("❌ Failed to refresh balance:", err);
          }
        }
      };

      refreshData();
      return () => { isActive = false; };
    }, [user, isDemoMode, hasPlaidLinked])
  );

  const [filterState, setFilterState] = useState({
    timeFilter: "all",
    bankFilter: "all",
    sortType: "date_desc",
  });

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="bg-white">
        <Header />
      </View>

      <BalanceCard
        balance={totalBalance}
        onRequest={() => router.push({ pathname: "/request", params: { initialAmount: "0" } })}
        onSend={() => router.push("/send")}
        showLinkAccount={hasPlaidLinked === false}
        onLinkAccount={async () => {
          if (user) {
            const skipKey = `plaid_onboarding_skipped_${user.id}`;
            await AsyncStorage.removeItem(skipKey);
            router.push("/plaid-onboarding-hosted");
          }
        }}
      />

      {plaidError && (
        <View className="mx-4 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-red-800 font-semibold">Unable to load bank data</Text>
              <Text className="text-red-600 text-sm mt-1">{plaidError}</Text>
            </View>
            <TouchableOpacity onPress={fetchPlaidData} className="ml-3 bg-red-600 px-4 py-2 rounded-lg">
              <Text className="text-white font-semibold">Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <TransactionFilter
        onFilterChange={setFilterState}
        connectedBanks={
          isDemoMode
            ? Array.from(new Set([...plaidAccounts.map(acc => acc.name), ...banks.map(bank => bank.name)]))
            : plaidAccounts.map(acc => acc.name)
        }
      />

      <ScrollView
        className="flex-1 mt-2"
        refreshControl={<RefreshControl refreshing={loadingPlaidData} onRefresh={fetchPlaidData} colors={["#00332d"]} tintColor="#00332d" />}
      >
        {loadingPlaidData ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#00332d" />
            <Text className="text-gray-500 mt-4">Loading transactions...</Text>
          </View>
        ) : (
          <TransactionList filters={filterState} transactions={plaidTransactions} />
        )}
      </ScrollView>

      <BottomNav
        items={[
          { label: "Home", icon: (color) => <Ionicons name="home" size={34} color={color} />, onPress: () => router.push("/home"), active: true },
          { label: "Budget", icon: (color) => <MaterialIcons name="account-tree" size={34} color={color} />, onPress: () => router.push("/visual_budget") },
          { label: "Scan", icon: (color) => <AntDesign name="qrcode" size={40} color={color} />, onPress: () => router.push("/qr_scan"), special: true },
          { label: "Favorite", icon: (color) => <AntDesign name="star" size={34} color={color} />, onPress: () => router.push("/favorite") },
          { label: "Profile", icon: (color) => <Ionicons name="person" size={34} color={color} />, onPress: () => router.push("/profile") },
        ]}
      />
    </SafeAreaView>
  );
}
