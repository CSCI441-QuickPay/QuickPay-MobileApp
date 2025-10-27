import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { Ionicons, MaterialIcons, AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';

import BottomNav from '@/components/BottomNav';
import BudgetHeader from '@/components/visual_budget/BudgetHeader';
import BudgetPlayground from '@/components/visual_budget/BudgetPlayground';
import BudgetModals from '@/components/visual_budget/BudgetModals';

import { budgetCategories } from '@/data/budget';
import { TreeBudgetCategory } from '@/models/BudgetModel';
import { getBudgetSummary } from '@/controllers/BudgetController';

export default function VisualBudget() {
  const [categories, setCategories] = useState<TreeBudgetCategory[]>(budgetCategories);
  const [totalBalance] = useState(1000.0);
  const summary = getBudgetSummary(categories.filter(c => c.type !== 'bank'), totalBalance);
  const banks = categories.filter(c => c.type === 'bank');

  // 🔁 all shared state lifted to top-level
  const [modalState, setModalState] = useState({
    add: false,
    edit: false,
    transaction: false,
  });
  const [selectedCategory, setSelectedCategory] = useState<TreeBudgetCategory | null>(null);
  const [parentForNewCategory, setParentForNewCategory] = useState<string | null>(null);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <BudgetHeader totalBalance={totalBalance} banks={banks} summary={summary} />

      {/* Playground */}
      <View className="flex-1 p-4">
        <BudgetPlayground
          categories={categories}
          setCategories={setCategories}
          setModalState={setModalState}
          setSelectedCategory={setSelectedCategory}
          setParentForNewCategory={setParentForNewCategory}
        />
      </View>

      {/* Modals */}
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

      {/* ✅ Consistent BottomNav (matches home.tsx) */}
      <BottomNav
        items={[
          {
            label: 'Home',
            icon: (color) => <Ionicons name="home" size={34} color={color} />,
            onPress: () => router.push('/home'),
          },
          {
            label: 'Budget',
            icon: (color) => <MaterialIcons name="account-tree" size={34} color={color} />,
            onPress: () => router.push('/visual_budget'),
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
            onPress: () => router.push('/favorite'),
          },
          {
            label: 'Profile',
            icon: (color) => <Ionicons name="person" size={34} color={color} />,
            onPress: () => router.push('/profile'),
          },
        ]}
      />
    </SafeAreaView>
  );
}
