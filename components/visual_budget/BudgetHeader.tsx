import { View, Text } from 'react-native';

export default function BudgetHeader({ totalBalance, banks, summary }: any) {
  return (
    <View className="px-6 py-4 border-b border-gray-200">
      <Text className="text-3xl font-bold text-black mb-2">Budget Overview</Text>
      <View className="flex-row justify-between">
        <View className="flex-1 bg-gray-50 rounded-xl p-4 mr-2">
          <Text className="text-xs text-gray-500 font-medium mb-1">Total Balance</Text>
          <Text className="text-3xl font-bold text-black">${totalBalance.toFixed(0)}</Text>
          <Text className="text-xs text-gray-400 mt-1">{banks.length} banks connected</Text>
        </View>

        <View className="flex-1 bg-red-50 rounded-xl p-4 ml-2">
          <Text className="text-xs text-red-600 font-medium mb-1">Total Spent</Text>
          <Text className="text-3xl font-bold text-red-700">${summary.totalSpent.toFixed(0)}</Text>
          <Text className="text-xs text-red-500 mt-1">This period</Text>
        </View>
      </View>
    </View>
  );
}
