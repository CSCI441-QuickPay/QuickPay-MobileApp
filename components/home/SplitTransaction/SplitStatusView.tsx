import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import SplitTransactionHeader from './SplitTransactionHeader';
import SplitSummary from './SplitSummary';
import SplitShareSection from './SplitShareSection';
import SplitTransactionsList from './SplitTransactionsList';

type Props = {
  transaction: any;
  splitData: any;
  onClose: () => void;
  onEdit: () => void;
};

export default function SplitStatusView({ transaction, splitData, onClose, onEdit }: Props) {
  const total = Math.abs(transaction?.amount || 0);
  const splits = splitData?.splits || [];
  const people = splits.length;
  const received = splits.filter((s: any) => s.isPaid).reduce((sum: number, s: any) => sum + Number(s.amount || 0), 0);
  const perPerson = people > 0 ? total / people : 0;
  const canEdit = !splits.some((s: any) => s.isPaid);

  const handleShare = () => {};

  return (
    <>
      <SplitTransactionHeader
        title="Split Status"
        subtitle={transaction?.title}
        onEdit={canEdit ? onEdit : undefined}
        onClose={onClose}
        canEdit={canEdit}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <SplitShareSection code={splitData?.code || ''} onShare={handleShare} />

        <SplitSummary
          total={total}
          people={people}
          amountPerPerson={perPerson}
          received={received}
        />

        <Text className="text-base font-semibold text-gray-700 mb-3">
          Transactions ({splits.filter((s: any) => s.isPaid).length}/{people})
        </Text>
        <View className="bg-gray-50 border border-gray-200 rounded-2xl p-3 mb-8">
          <SplitTransactionsList splits={splits} />
        </View>
      </ScrollView>
    </>
  );
}
