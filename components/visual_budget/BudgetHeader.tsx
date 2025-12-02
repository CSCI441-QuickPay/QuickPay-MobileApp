import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

/**
 * BudgetHeader Component
 *
 * Props:
 * - totalBalance: Sum of all bank budgets
 * - banks: Array of ALL bank objects (including QuickPay) for display in expansion
 * - externalBankCount: Number of external banks connected (excluding QuickPay)
 * - summary: Object with totalSpent (sum of all category.spent values)
 *
 * Expected calculation in parent:
 * const totalBalance = banks.reduce((sum, bank) => sum + bank.budget, 0);
 * const totalSpent = categories.filter(c => c.type === 'category').reduce((sum, cat) => sum + cat.spent, 0);
 */
export default function BudgetHeader({ totalBalance, banks, externalBankCount, summary }: any) {
  const [showBanks, setShowBanks] = useState(false);

  const handleConnectBank = () => {
    // Navigate to Plaid onboarding page (same as "Link Bank" button on home page)
    console.log('🔗 Navigating to Plaid onboarding from Budget page...');
    router.push('/plaid-onboarding-hosted');
  };

  return (
    <View className="px-6 pt-4 pb-5 border-b border-gray-200">
      {/* Header with Icon - Like Favorites */}
      <View className="flex-row items-center mb-6">
        <View className="w-14 h-14 rounded-full bg-[#f0fdf4] items-center justify-center mr-3">
          <Ionicons name="wallet" size={28} color="#00332d" />
        </View>
        <View>
          <Text className="text-3xl font-extrabold text-primary">
            Budget Overview
          </Text>
          <Text className="text-gray-500 text-sm mt-0.5">
            Track your spending
          </Text>
        </View>
      </View>
      
      <View className="flex-row justify-between">
        {/* Total Balance Card - Expandable */}
        <TouchableOpacity 
          className="flex-1 bg-primary rounded-xl p-4 mr-2"
          activeOpacity={0.7}
          onPress={() => setShowBanks(!showBanks)}
        >
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-xs text-secondary/80 font-medium">Total Balance</Text>
            <Ionicons 
              name={showBanks ? "chevron-up" : "chevron-down"} 
              size={16} 
              color="#ccf8f1" 
            />
          </View>
          <Text className="text-3xl font-bold text-secondary">${totalBalance.toFixed(2)}</Text>
          <Text className="text-xs text-secondary/70 mt-1">{externalBankCount || 0} banks connected</Text>
        </TouchableOpacity>

        {/* Total Spent Card */}
        <View className="flex-1 bg-red-50 rounded-xl p-4 ml-2 border border-red-100">
          <Text className="text-xs text-red-600 font-medium mb-1">Total Spent</Text>
          <Text className="text-3xl font-bold text-red-700">${summary?.totalSpent?.toFixed(2) || 0}</Text>
          <Text className="text-xs text-red-500 mt-1">This period</Text>
        </View>
      </View>

      {/* Expandable Bank List */}
      {showBanks && (
        <View className="mt-4">
          <Text className="text-sm font-semibold text-gray-700 mb-3">
            Connected Banks
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingRight: 12 }}
          >
            {banks && banks.map((bank: any) => (
              <View
                key={bank.id}
                className="bg-white rounded-xl p-4 border border-gray-200 min-w-[140px]"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View 
                    className="w-8 h-8 rounded-lg items-center justify-center"
                    style={{ backgroundColor: bank.color + '20' }}
                  >
                    <Ionicons name={bank.icon as any} size={18} color={bank.color} />
                  </View>
                  <View 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: bank.color }}
                  />
                </View>
                <Text className="text-xs text-gray-600 mb-1" numberOfLines={1}>
                  {bank.name}
                </Text>
                <Text className="text-lg font-bold text-gray-900">
                  ${(bank.budget || 0).toFixed(2)}
                </Text>
              </View>
            ))}

            {/* Add Bank Button */}
            <TouchableOpacity
              onPress={handleConnectBank}
              activeOpacity={0.7}
              className="bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-300 min-w-[140px] items-center justify-center"
            >
              <View className="w-8 h-8 rounded-lg bg-primary items-center justify-center mb-2">
                <Ionicons name="add" size={20} color="#ccf8f1" />
              </View>
              <Text className="text-xs text-gray-700 font-semibold mb-1">
                Add Bank
              </Text>
              <Text className="text-xs text-gray-500 text-center">
                Connect via Plaid
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
    </View>
  );
}