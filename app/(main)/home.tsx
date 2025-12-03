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
  calculateTotalBalance,
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
import { ActivityIndicator, DeviceEventEmitter, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const { user } = useUser();
  const { isDemoMode } = useDemoMode();

  const [plaidAccounts, setPlaidAccounts] = useState<PlaidAccount[]>([]);
  const [plaidTransactions, setPlaidTransactions] = useState<any[]>([]);
  const [loadingPlaidData, setLoadingPlaidData] = useState(false);

  // Separate quickpay/plaid balances so we can see breakdowns
  const [quickpayBalance, setQuickpayBalance] = useState<number>(0);
  const [plaidBalance, setPlaidBalance] = useState<number>(0);

  // single prop passed to BalanceCard (sum of both)
  const [totalBalance, setTotalBalance] = useState<number>(0);

  const [hasPlaidLinked, setHasPlaidLinked] = useState<boolean | null>(null);
  const [plaidError, setPlaidError] = useState<string | null>(null);

  // helper: recompute combined total and log breakdown
  const recomputeTotal = (qp: number, pb: number) => {
    const total = Number((qp || 0) + (pb || 0));
    console.log("[Home] balances: quickpay=", qp, "plaid=", pb, "total=", total);
    setTotalBalance(total);
  };

  // Fetch Plaid transactions and accounts
  const fetchPlaidData = async () => {
    if (!user) return;

    setLoadingPlaidData(true);
    setPlaidError(null);

    // Read authoritative quickpay from DB first to avoid race/stale quickpay
    let authoritativeQuickpay = quickpayBalance;
    try {
      const userRow = await UserModel.getByClerkId(user.id);
      authoritativeQuickpay = Number(userRow?.balance || 0);
      setQuickpayBalance(authoritativeQuickpay);
      console.log('[Home] fetchPlaidData authoritativeQuickpay=', authoritativeQuickpay);
    } catch (e) {
      console.warn('[Home] fetchPlaidData failed to read user balance', e);
    }

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
      let combinedPlaidBalance = calculateTotalBalance(accountsData);

      if (isDemoMode) {
        const { PaymentService } = await import("@/services/PaymentService");
        const demoTxs = await PaymentService.getDemoTransactions();

        combinedTransactions = [...demoTxs, ...transformedTransactions, ...mockTransactions];

        // Add demo/mock bank balances
        const demoMockBalance = banks.reduce((sum, bank) => sum + (bank.budget || bank.amount), 0);
        combinedPlaidBalance += demoMockBalance;
      }

      setPlaidTransactions(combinedTransactions);
      setPlaidBalance(combinedPlaidBalance);

      // combine with authoritative quickpay we read earlier
      recomputeTotal(authoritativeQuickpay, combinedPlaidBalance);
    } catch (error: any) {
      console.error("❌ Failed to fetch Plaid data:", error);
      setPlaidError(error.message || "Failed to load bank data");

      try {
        const { PaymentService } = await import("@/services/PaymentService");
        const demoTxs = isDemoMode ? await PaymentService.getDemoTransactions() : [];
        const combinedTransactions = isDemoMode ? [...demoTxs, ...mockTransactions] : [...mockTransactions];
        setPlaidTransactions(combinedTransactions);

        const fallbackPlaidBalance = isDemoMode
          ? banks.reduce((sum, bank) => sum + (bank.budget || bank.amount), 0)
          : 0;
        setPlaidBalance(fallbackPlaidBalance);
        recomputeTotal(authoritativeQuickpay, fallbackPlaidBalance);
      } catch {
        setPlaidTransactions(mockTransactions);
        setPlaidBalance(0);
        recomputeTotal(authoritativeQuickpay, 0);
      }
    } finally {
      setLoadingPlaidData(false);
    }
  };

  // Helper to refresh only the user balance (used when no Plaid accounts are linked)
  const refreshUserBalance = async () => {
    if (!user) return;
    try {
      const userData = await UserModel.getByClerkId(user.id);
      const qb = Number(userData?.balance || 0);
      setQuickpayBalance(qb);
      recomputeTotal(qb, plaidBalance);
    } catch (err) {
      console.error("❌ Failed to refresh user balance:", err);
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

        // set quickpayBalance from DB on init
        const initialQuickpay = Number(userData?.balance || 0);
        setQuickpayBalance(initialQuickpay);

        if (isDemoMode) {
          if (hasPlaid) {
            await fetchPlaidData();
          } else {
            const { PaymentService } = await import("@/services/PaymentService");
            const demoTxs = await PaymentService.getDemoTransactions();
            setPlaidTransactions([...demoTxs, ...mockTransactions]);
            const mockBalance = banks.reduce((sum, bank) => sum + (bank.budget || bank.amount), 0);
            setPlaidBalance(mockBalance);
            recomputeTotal(initialQuickpay, mockBalance);
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
            setPlaidBalance(0);
            recomputeTotal(initialQuickpay, 0);
          }
        } else {
          await fetchPlaidData();
        }
      } catch (err) {
        console.error("❌ Failed to initialize user:", err);
      }
    }
    initializeUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isDemoMode]);

  // Subscribe to PaymentService event so Home updates totalBalance when payments happen
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener("user:updated", async (payload: any) => {
      try {
        console.log("[Home] received user:updated payload:", payload);

        // If payload contains a newBalance, update quickpay and recompute total
        if (payload?.newBalance != null) {
          const newQuickpay = Number(payload.newBalance || 0);
          setQuickpayBalance(newQuickpay);

          // If Plaid linked keep current plaidBalance (or optionally re-fetch if you want authoritative fresh Plaid)
          if (hasPlaidLinked) {
            // re-fetch Plaid data to keep totals in sync with any server-updates
            await fetchPlaidData();
            // fetchPlaidData will call recomputeTotal after it sets plaidBalance
          } else {
            recomputeTotal(newQuickpay, plaidBalance);
            // also refresh authoritative user row
            await refreshUserBalance();
          }
          return;
        }

        // Fallback: if payload does not include newBalance, decide what to refresh:
        if (hasPlaidLinked) {
          await fetchPlaidData();
        } else {
          await refreshUserBalance();
        }
      } catch (e) {
        console.warn("Home: user:updated handler failed", e);
      }
    });

    return () => {
      sub.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, hasPlaidLinked, isDemoMode, plaidBalance, quickpayBalance]);

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
            if (isActive) {
              const qb = Number(userData?.balance || 0);
              setQuickpayBalance(qb);
              recomputeTotal(qb, plaidBalance);
            }
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