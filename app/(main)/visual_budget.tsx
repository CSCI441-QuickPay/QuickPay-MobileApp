import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';
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

export default function VisualBudget() {
  const { user } = useUser();
  
  // State management
  const [categories, setCategories] = useState<TreeBudgetCategory[]>(budgetCategories);
  
  // ✅ FIXED: Calculate total balance from transactions (same as home page)
  const totalBalance = transactions.reduce((sum, t) => sum + t.amount, 0);
  
  // Get budget summary - calculates total spent across all categories
  const summary = getBudgetSummary(
    categories.filter(c => c.type !== 'bank'), 
    totalBalance
  );
  
  // Get bank accounts
  const banks = categories.filter(c => c.type === 'bank');

  // Modal state management
  const [modalState, setModalState] = useState({
    add: false,
    edit: false,
    transaction: false,
  });
  const [selectedCategory, setSelectedCategory] = useState<TreeBudgetCategory | null>(null);
  const [parentForNewCategory, setParentForNewCategory] = useState<string | null>(null);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header - Consistent with home page */}
      <View className="bg-white">
        <BudgetHeader 
          totalBalance={totalBalance} 
          banks={banks} 
          summary={summary}
          userName={user?.firstName || 'User'}
        />
      </View>

      {/* Playground - Main budget visualization */}
      <View className="flex-1 p-4">
        <BudgetPlayground
          categories={categories}
          setCategories={setCategories}
          setModalState={setModalState}
          setSelectedCategory={setSelectedCategory}
          setParentForNewCategory={setParentForNewCategory}
        />
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