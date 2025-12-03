import { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialIcons, AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { useFocusEffect } from '@react-navigation/native';

import BottomNav from '@/components/BottomNav';
import BudgetHeader from '@/components/visual_budget/BudgetHeader';
import BudgetPlayground from '@/components/visual_budget/BudgetPlayground';
import BudgetModals from '@/components/visual_budget/BudgetModals/BudgetModals';

import { budgetCategories } from '@/data/budget';
import { transactions } from '@/data/transaction';
import { TreeBudgetCategory } from '@/models/BudgetModel';
import { getBudgetSummary } from '@/controllers/BudgetController';
import { useDemoMode } from '@/contexts/DemoModeContext';
import UserModel from '@/models/UserModel';
import { fetchPlaidAccounts, PlaidAccount, unlinkPlaidAccount } from '@/services/PlaidService';

export default function VisualBudget() {
  const { user } = useUser();
  const { isDemoMode, isLoading: demoModeLoading } = useDemoMode();

  // State management
  const [categories, setCategories] = useState<TreeBudgetCategory[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load budget data based on Demo Mode
  useEffect(() => {
    const loadBudgetData = async () => {
      // Wait for demo mode preference to load
      if (demoModeLoading) {
        console.log("⏳ Waiting for demo mode preference to load...");
        return;
      }

      if (!user) {
        console.log("⚠️ No user found");
        return;
      }

      try {
        setLoading(true);

        // If Demo Mode is ON, use mock data + QuickPay Balance
        if (isDemoMode) {
          console.log("🎭 Demo Mode ON - Using mock budget data + QuickPay Balance");

          // Get user's balance from database for QuickPay Balance
          const dbUser = await UserModel.getByClerkId(user.id);
          const userBalance = dbUser?.balance || 0;
          console.log(`💵 Demo Mode: QuickPay user balance = $${userBalance.toFixed(2)}`);

          // Create QuickPay Balance block
          const quickPayBlock: TreeBudgetCategory = {
            id: 'quickpay-balance',
            name: 'QuickPay Balance',
            icon: 'wallet',
            color: '#10B981',
            spent: 0,
            budget: userBalance,
            amount: userBalance,
            parentId: null,
            children: ['total'],
            position: { x: 60, y: 30 },
            type: 'bank',
          };

          // Merge QuickPay Balance with mock budget categories
          const allCategories = [quickPayBlock, ...budgetCategories];
          console.log(`✅ Demo Mode: Created ${allCategories.length} categories (1 QuickPay + ${budgetCategories.length} mock)`);
          setCategories(allCategories);

          // Total balance = user balance + mock banks
          const mockBankBalance = transactions.reduce((sum, t) => sum + t.amount, 0);
          setTotalBalance(userBalance + mockBankBalance);
          console.log(`💰 Demo Mode: Total Balance = $${(userBalance + mockBankBalance).toFixed(2)}`);
          setLoading(false);
          return;
        }

        // Real Mode - fetch from database AND Plaid
        console.log("📊 Real Mode - Loading real budget data from Plaid");

        let dbUser;
        try {
          dbUser = await UserModel.getByClerkId(user.id);
          console.log(`🔍 Real Mode: dbUser found:`, dbUser ? 'Yes' : 'No');
        } catch (err) {
          console.error("❌ Real Mode: Error fetching user:", err);
        }

        // Get user's QuickPay balance
        const userBalance = dbUser?.balance || 0;
        console.log(`💰 Real Mode: QuickPay Balance = $${userBalance.toFixed(2)}`);

        // Fetch Plaid accounts
        let plaidAccounts: PlaidAccount[] = [];
        try {
          plaidAccounts = await fetchPlaidAccounts(user.id);
          console.log(`✅ Real Mode: Fetched ${plaidAccounts.length} Plaid accounts`);
        } catch (error) {
          console.error('❌ Real Mode: Error fetching Plaid accounts:', error);
        }

        // Transform Plaid accounts into bank blocks positioned horizontally
        const bankColors = ['#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];
        const HORIZONTAL_SPACING = 200; // Space between banks horizontally
        const plaidBankBlocks: TreeBudgetCategory[] = plaidAccounts.map((account, index) => ({
          id: account.account_id,
          name: account.name,
          icon: 'card',
          color: bankColors[index % bankColors.length],
          spent: 0,
          budget: account.balances.available || account.balances.current || 0,
          amount: account.balances.available || account.balances.current || 0,
          parentId: null,
          children: ['total'], // All Plaid banks connect to Current Budget
          position: {
            x: 260 + (index * HORIZONTAL_SPACING), // Position to the right of QuickPay, horizontally spaced
            y: 30 // Same Y level as QuickPay Balance
          },
          type: 'bank',
        }));

        // Calculate total balance from QuickPay + all Plaid accounts
        const plaidTotalBalance = plaidBankBlocks.reduce((sum, bank) => sum + bank.budget, 0);
        const totalBalance = userBalance + plaidTotalBalance;
        setTotalBalance(totalBalance);
        console.log(`💰 Real Mode: Total Balance = $${totalBalance.toFixed(2)} (QuickPay: $${userBalance}, Plaid: $${plaidTotalBalance})`);

        // Create QuickPay Balance block
        const quickPayBlock: TreeBudgetCategory = {
          id: 'quickpay-balance',
          name: 'QuickPay Balance',
          icon: 'wallet',
          color: '#10B981',
          spent: 0,
          budget: userBalance,
          amount: userBalance,
          parentId: null,
          children: ['total'],
          position: { x: 60, y: 30 },
          type: 'bank',
        };

        // Calculate center position for Current Budget (below all parent banks)
        const totalParents = 1 + plaidBankBlocks.length; // QuickPay + Plaid banks
        const allParentIds = ['quickpay-balance', ...plaidBankBlocks.map(b => b.id)];

        // Position Current Budget at the center of all parent banks
        const centerX = totalParents === 1
          ? 60 // If only QuickPay, center below it
          : (60 + (260 + (plaidBankBlocks.length - 1) * HORIZONTAL_SPACING)) / 2; // Center between QuickPay and last Plaid bank

        const currentBudgetBlock: TreeBudgetCategory = {
          id: 'total',
          name: 'Current Budget',
          icon: 'cash',
          color: '#6366F1',
          spent: 0,
          budget: totalBalance,
          amount: totalBalance,
          parentId: null, // No single parent - connects to multiple parents
          children: [],
          position: { x: centerX, y: 230 },
          type: 'budget',
        };

        // Combine all blocks: QuickPay + Plaid Banks + Current Budget
        const realCategories = [quickPayBlock, ...plaidBankBlocks, currentBudgetBlock];
        console.log(`✅ Real Mode: Created ${realCategories.length} blocks (1 QuickPay + ${plaidBankBlocks.length} Plaid banks + 1 Current Budget)`);
        console.log(`📦 Real Mode: Setting categories:`, realCategories.map(c => c.name));
        setCategories(realCategories);
      } catch (error) {
        console.error("❌ Failed to load budget data:", error);
        setCategories([]);
        setTotalBalance(0);
      } finally {
        setLoading(false);
      }
    };

    loadBudgetData();
  }, [user, isDemoMode, demoModeLoading]);

  // Refetch budget data when screen comes into focus (e.g., after linking/unlinking banks)
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const refreshBudgetData = async () => {
        if (!user || !isActive || demoModeLoading) return;

        console.log("🔄 Visual Budget screen focused - refreshing budget data");

        try {
          if (isDemoMode) {
            // Demo Mode: Reload mock data
            const dbUser = await UserModel.getByClerkId(user.id);
            const userBalance = dbUser?.balance || 0;

            const quickPayBlock: TreeBudgetCategory = {
              id: 'quickpay-balance',
              name: 'QuickPay Balance',
              icon: 'wallet',
              color: '#10B981',
              spent: 0,
              budget: userBalance,
              amount: userBalance,
              parentId: null,
              children: ['total'],
              position: { x: 60, y: 30 },
              type: 'bank',
            };

            const allCategories = [quickPayBlock, ...budgetCategories];
            const mockBankBalance = transactions.reduce((sum, t) => sum + t.amount, 0);
            if (isActive) {
              setCategories(allCategories);
              setTotalBalance(userBalance + mockBankBalance);
            }
          } else {
            // Real Mode: Refetch Plaid accounts
            const dbUser = await UserModel.getByClerkId(user.id);
            const userBalance = dbUser?.balance || 0;

            const plaidAccounts = await fetchPlaidAccounts(user.id);
            console.log(`✅ Refresh: Fetched ${plaidAccounts.length} Plaid accounts`);

            const bankColors = ['#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];
            const HORIZONTAL_SPACING = 200;

            const plaidBankBlocks: TreeBudgetCategory[] = plaidAccounts.map((account, index) => ({
              id: account.account_id,
              name: account.name,
              icon: 'card',
              color: bankColors[index % bankColors.length],
              spent: 0,
              budget: account.balances.available || account.balances.current || 0,
              amount: account.balances.available || account.balances.current || 0,
              parentId: null,
              children: ['total'],
              position: {
                x: 260 + (index * HORIZONTAL_SPACING),
                y: 30
              },
              type: 'bank',
            }));

            const plaidTotalBalance = plaidBankBlocks.reduce((sum, bank) => sum + bank.budget, 0);
            const totalBalance = userBalance + plaidTotalBalance;

            const quickPayBlock: TreeBudgetCategory = {
              id: 'quickpay-balance',
              name: 'QuickPay Balance',
              icon: 'wallet',
              color: '#10B981',
              spent: 0,
              budget: userBalance,
              amount: userBalance,
              parentId: null,
              children: ['total'],
              position: { x: 60, y: 30 },
              type: 'bank',
            };

            const totalParents = 1 + plaidBankBlocks.length;
            const centerX = totalParents === 1
              ? 60
              : (60 + (260 + (plaidBankBlocks.length - 1) * HORIZONTAL_SPACING)) / 2;

            const currentBudgetBlock: TreeBudgetCategory = {
              id: 'total',
              name: 'Current Budget',
              icon: 'cash',
              color: '#6366F1',
              spent: 0,
              budget: totalBalance,
              amount: totalBalance,
              parentId: null,
              children: [],
              position: { x: centerX, y: 230 },
              type: 'budget',
            };

            if (isActive) {
              setCategories([quickPayBlock, ...plaidBankBlocks, currentBudgetBlock]);
              setTotalBalance(totalBalance);
            }
          }
        } catch (error) {
          console.error("❌ Error refreshing budget data:", error);
        }
      };

      refreshBudgetData();

      return () => {
        isActive = false;
      };
    }, [user, isDemoMode, demoModeLoading])
  );

  // Handle bank unlinking
  const handleBankUnlink = async (bank: any) => {
    if (!user) return;

    try {
      setLoading(true);
      await unlinkPlaidAccount(user.id);

      Alert.alert(
        'Bank Unlinked',
        `${bank.name} has been successfully unlinked.`,
        [{ text: 'OK' }]
      );

      // Reload budget data after unlinking
      const dbUser = await UserModel.getByClerkId(user.id);
      const userBalance = dbUser?.balance || 0;

      // Fetch updated Plaid accounts
      const plaidAccounts = await fetchPlaidAccounts(user.id);
      const bankColors = ['#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];
      const HORIZONTAL_SPACING = 200;

      const plaidBankBlocks: TreeBudgetCategory[] = plaidAccounts.map((account, index) => ({
        id: account.account_id,
        name: account.name,
        icon: 'card',
        color: bankColors[index % bankColors.length],
        spent: 0,
        budget: account.balances.available || account.balances.current || 0,
        amount: account.balances.available || account.balances.current || 0,
        parentId: null,
        children: ['total'],
        position: {
          x: 260 + (index * HORIZONTAL_SPACING),
          y: 30
        },
        type: 'bank',
      }));

      const plaidTotalBalance = plaidBankBlocks.reduce((sum, bank) => sum + bank.budget, 0);
      const totalBalance = userBalance + plaidTotalBalance;

      const quickPayBlock: TreeBudgetCategory = {
        id: 'quickpay-balance',
        name: 'QuickPay Balance',
        icon: 'wallet',
        color: '#10B981',
        spent: 0,
        budget: userBalance,
        amount: userBalance,
        parentId: null,
        children: ['total'],
        position: { x: 60, y: 30 },
        type: 'bank',
      };

      const totalParents = 1 + plaidBankBlocks.length;
      const centerX = totalParents === 1
        ? 60
        : (60 + (260 + (plaidBankBlocks.length - 1) * HORIZONTAL_SPACING)) / 2;

      const currentBudgetBlock: TreeBudgetCategory = {
        id: 'total',
        name: 'Current Budget',
        icon: 'cash',
        color: '#6366F1',
        spent: 0,
        budget: totalBalance,
        amount: totalBalance,
        parentId: null,
        children: [],
        position: { x: centerX, y: 230 },
        type: 'budget',
      };

      setCategories([quickPayBlock, ...plaidBankBlocks, currentBudgetBlock]);
      setTotalBalance(totalBalance);
    } catch (error: any) {
      console.error("❌ Error unlinking bank:", error);
      Alert.alert(
        'Unlink Failed',
        error.message || 'Failed to unlink bank. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Get budget summary - calculates total spent across all categories
  const summary = getBudgetSummary(
    categories.filter(c => c.type !== 'bank'),
    totalBalance
  );

  // Get ALL bank accounts including QuickPay for display in header expansion
  const allBanks = categories.filter(c => c.type === 'bank');

  // Get EXTERNAL banks only (excluding QuickPay) for bank count display
  const externalBanks = categories.filter(c => c.type === 'bank' && c.id !== 'quickpay-balance');

  // Modal state management
  const [modalState, setModalState] = useState({
    add: false,
    edit: false,
    transaction: false,
  });
  const [selectedCategory, setSelectedCategory] = useState<TreeBudgetCategory | null>(null);
  const [parentForNewCategory, setParentForNewCategory] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<TreeBudgetCategory | null>(null);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header - Consistent with home page */}
      <View className="bg-white">
        <BudgetHeader
          totalBalance={totalBalance}
          banks={allBanks}
          externalBankCount={externalBanks.length}
          summary={summary}
          userName={user?.firstName || 'User'}
          onBankUnlink={handleBankUnlink}
        />
      </View>

      {/* Playground - Main budget visualization */}
      <View className="flex-1 p-4">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500">Loading budget data...</Text>
          </View>
        ) : (
          <BudgetPlayground
            categories={categories}
            setCategories={setCategories}
            setModalState={setModalState}
            setSelectedCategory={setSelectedCategory}
            setParentForNewCategory={setParentForNewCategory}
            categoryToDelete={categoryToDelete}
            setCategoryToDelete={setCategoryToDelete}
          />
        )}
      </View>

      {/* Modals - Category management */}
      <BudgetModals
        modalState={modalState}
        setModalState={setModalState}
        categories={categories}
        setCategories={setCategories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        parentForNewCategory={parentForNewCategory}
        setParentForNewCategory={setParentForNewCategory}
        onDeleteCategory={(category) => setCategoryToDelete(category)}
      />

      <BottomNav
        items={[
          {
            label: 'Home',
            icon: (color) => <Ionicons name="home" size={34} color={color} />,
            onPress: () => router.push('/(main)/home'),
          },
          {
            label: 'Budget',
            icon: (color) => <MaterialIcons name="account-tree" size={34} color={color} />,
            onPress: () => router.push('/(main)/visual_budget'),
            active: true,
          },
          {
            label: 'Scan',
            icon: (color) => <AntDesign name="qrcode" size={40} color={color} />,
            onPress: () => console.log('Go Scan'),
            special: true,
          },
          {
            label: 'Favorite',
            icon: (color) => <AntDesign name="star" size={34} color={color} />,
            onPress: () => router.push('/(main)/favorite'),
          },
          {
            label: 'Profile',
            icon: (color) => <Ionicons name="person" size={34} color={color} />,
            onPress: () => router.push('/(main)/profile'),
          },
        ]}
      />
    </SafeAreaView>
  );
}