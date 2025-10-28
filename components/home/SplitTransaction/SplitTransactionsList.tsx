import { ScrollView, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SplitTransactionsList({ splits = [] as any[] }) {
  if (!splits.length) {
    return (
      <View className="items-center py-8">
        <Ionicons name="receipt-outline" size={40} color="#9CA3AF" />
        <Text className="text-sm text-gray-500 mt-2">No payments received yet</Text>
        <Text className="text-xs text-gray-400 mt-1">Share the code to start receiving</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator>
      {splits.map((split, i) => (
        <View key={i} className="bg-white rounded-xl p-3 mb-2 flex-row items-center">
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: split.isPaid ? '#D1FAE5' : '#FEF3C7' }}
          >
            <Text className="text-base font-bold" style={{ color: split.isPaid ? '#059669' : '#D97706' }}>
              {split.name ? split.name[0].toUpperCase() : i + 1}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-black">{split.name || `Person ${i + 1}`}</Text>
            <Text className="text-xs text-gray-500 mt-0.5">${Number(split.amount).toFixed(2)}</Text>
          </View>
          <View
            className={`rounded-full px-2.5 py-1 flex-row items-center ${
              split.isPaid ? 'bg-green-100' : 'bg-orange-100'
            }`}
          >
            <Ionicons name={split.isPaid ? 'checkmark-circle' : 'time-outline'} size={14} color={split.isPaid ? '#059669' : '#D97706'} />
            <Text className={`text-xs font-semibold ml-1 ${split.isPaid ? 'text-green-700' : 'text-orange-700'}`}>
              {split.isPaid ? 'Received' : 'Pending'}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
