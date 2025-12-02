import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';
import { Ionicons, MaterialIcons, AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';

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

        // Real Mode - fetch from database or show QuickPay Balance only
        console.log("📊 Real Mode - Loading real budget data");

        let dbUser;
        try {
          dbUser = await UserModel.getByClerkId(user.id);
          console.log(`🔍 Real Mode: dbUser found:`, dbUser ? 'Yes' : 'No');
        } catch (err) {
          console.error("❌ Real Mode: Error fetching user:", err);
        }

        if (!dbUser) {
          console.log("⚠️ Real Mode: No database user - showing QuickPay with $0 balance");
          // Still show QuickPay blocks even with no user
          const quickPayBlock: TreeBudgetCategory = {
            id: 'quickpay-balance',
            name: 'QuickPay Balance',
            icon: 'wallet',
            color: '#10B981',
            spent: 0,
            budget: 0,
            amount: 0,
            parentId: null,
            children: ['total'],
            position: { x: 60, y: 30 },
            type: 'bank',
          };

          const currentBudgetBlock: TreeBudgetCategory = {
            id: 'total',
            name: 'Current Budget',
            icon: 'cash',
            color: '#6366F1',
            spent: 0,
            budget: 0,
            amount: 0,
            parentId: 'quickpay-balance',
            children: [],
            position: { x: 60, y: 230 },
            type: 'budget',
          };

          console.log("✅ Real Mode: Created 2 blocks with $0 (no user)");
          setCategories([quickPayBlock, currentBudgetBlock]);
          setTotalBalance(0);
          setLoading(false);
          return;
        }

        // Get user's balance from database
        const userBalance = dbUser.balance || 0;
        setTotalBalance(userBalance);
        console.log(`💰 Real Mode: User Balance = $${userBalance.toFixed(2)}`);

        // Create QuickPay Balance block with Current Budget child
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

        const currentBudgetBlock: TreeBudgetCategory = {
          id: 'total',
          name: 'Current Budget',
          icon: 'cash',
          color: '#6366F1',
          spent: 0,
          budget: userBalance,
          amount: userBalance,
          parentId: 'quickpay-balance',
          children: [],
          position: { x: 60, y: 230 },
          type: 'budget',
        };

        console.log("✅ Real Mode: Created 2 blocks (QuickPay Balance + Current Budget)");
        const realCategories = [quickPayBlock, currentBudgetBlock];
        console.log(`📦 Real Mode: Setting ${realCategories.length} categories:`, realCategories.map(c => c.name));
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