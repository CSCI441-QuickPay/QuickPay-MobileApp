import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SplitTransactionHeader from './SplitTransactionHeader';

type Props = {
  transaction: any;
  existingSplit?: any | null; // from parent; may be temp or from transaction
  onClose: () => void;
  onCreated: (splitData: any) => void;
};

export default function SplitCreateView({ transaction, existingSplit, onClose, onCreated }: Props) {
  const amount = Math.abs(transaction?.amount || 0);

  const initialPeople = useMemo(() => {
    // prefill if we have a previous split and no payments yet
    if (existingSplit && !(existingSplit.splits || []).some((s: any) => s.isPaid)) {
      return Number(existingSplit.numberOfPeople) || (existingSplit.splits?.length ?? 0);
    }
    return 0;
  }, [existingSplit]);

  const [people, setPeople] = useState(
    initialPeople ? String(initialPeople) : ''
  );

  const count = parseInt(people || '0', 10);
  const perPerson = count > 0 ? amount / count : 0;

  const handleGenerate = () => {
    if (count < 2) {
      Alert.alert('Invalid', 'Please enter at least 2 people to split with');
      return;
    }
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const data = {
      code,
      numberOfPeople: count,
      splits: Array.from({ length: count }, () => ({ amount: perPerson, isPaid: false })),
    };
    onCreated(data);
  };

  return (
    <>
      <SplitTransactionHeader
        title="Split Transaction"
        subtitle="Divide this expense among multiple people"
        icon="pie-chart-outline"
        onClose={onClose}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="mb-5">
          <Text className="text-base font-semibold text-gray-700 mb-2">Transaction Amount</Text>
          <View className="bg-gray-50 border-2 border-gray-200 rounded-2xl px-5 h-14 justify-center">
            <Text className="text-2xl font-bold text-black">${amount.toFixed(2)}</Text>
          </View>
        </View>

        <View className="mb-5">
          <Text className="text-base font-semibold text-gray-700 mb-2">Number of People</Text>
          <View className="bg-gray-50 border-2 border-gray-200 rounded-2xl px-5 h-14 justify-center">
            <TextInput
              placeholder="e.g., 3"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              value={people}
              onChangeText={setPeople}
            />
          </View>
          <Text className="text-xs text-gray-500 mt-2 ml-1">Enter the total number of people (including yourself)</Text>
        </View>

        <View className="mb-8">
          <Text className="text-base font-semibold text-gray-700 mb-3">Amount per Person</Text>
          <View className="bg-blue-50 border-2 border-blue-200 rounded-2xl px-5 h-14 flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-blue-700">
              {count >= 2 ? `$${perPerson.toFixed(2)}` : '$0.00'}
            </Text>
            <Ionicons name="calculator-outline" size={24} color="#2563EB" />
          </View>
        </View>

        <View className="pb-6">
          <TouchableOpacity
            onPress={handleGenerate}
            activeOpacity={0.8}
            disabled={count < 2}
            className="bg-primary rounded-2xl py-4 items-center"
            style={{ opacity: count < 2 ? 0.5 : 1 }}
          >
            <Text className="text-secondary font-bold text-xl">Create Split</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

