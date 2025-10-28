import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SplitTransactionHeader from './SplitTransactionHeader';
import SplitShareSection from './SplitShareSection';
import SplitSummary from './SplitSummary';
import SplitTransactionsList from './SplitTransactionsList';

type Props = {
  transaction: any;
  splitData: any;
  onClose: () => void;
  onEdit: () => void;
  showBanner?: boolean;
};

export default function SplitConfirmationView({ transaction, splitData, onClose, onEdit, showBanner }: Props) {
  const total = Math.abs(transaction?.amount || 0);
  const people = Number(splitData?.numberOfPeople ?? 0);
  const perPerson = people > 0 ? total / people : 0;
  const handleShare = () => {};

  return (
    <>
      <SplitTransactionHeader
        title="Split Status"
        subtitle={transaction?.title}
        onEdit={onEdit}
        onClose={onClose}
        canEdit
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {showBanner && (
          <View className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-5 flex-row items-center">
            <Ionicons name="checkmark-circle" size={28} color="#10B981" />
            <Text className="ml-2 text-sm font-semibold text-green-700">
              Split Created Successfully!
            </Text>
          </View>
        )}

        <SplitShareSection code={splitData?.code || ''} onShare={handleShare} />

        <SplitSummary
          total={total}
          people={people}
          amountPerPerson={perPerson}
          received={0}
        />

        <Text className="text-base font-semibold text-gray-700 mb-3">
          Transactions (0/{people})
        </Text>
        <View className="bg-gray-50 border border-gray-200 rounded-2xl p-3 mb-8 flex-1">
          <SplitTransactionsList splits={[]} />
        </View>
      </ScrollView>
    </>
  );
}
