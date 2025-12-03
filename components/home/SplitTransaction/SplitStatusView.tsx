import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SplitTransactionHeader from './SplitTransactionHeader';
import SplitSummary from './SplitSummary';
import SplitShareSection from './SplitShareSection';
import SplitTransactionsList from './SplitTransactionsList';

type Props = {
  transaction: any;
  splitData: any;
  onClose: () => void;
  onEdit: () => void;
  onCancelSplit: () => void;
};

export default function SplitStatusView({ transaction, splitData, onClose, onEdit, onCancelSplit }: Props) {
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
        onClose={onClose}
      />

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
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="bg-gray-50 border border-gray-200 rounded-2xl p-3 mb-8 flex-1"
      >
        <SplitTransactionsList splits={splits} />
      </ScrollView>

      {/* Action Buttons Row - Only show if no money has been received */}
      {canEdit && (
        <View className="flex-row gap-2 pb-6">
          {/* Edit Button */}
          <TouchableOpacity
            onPress={onEdit}
            activeOpacity={0.85}
            className="flex-1 bg-primary rounded-xl items-center justify-center"
            style={{ height: 44 }}
          >
            <View className="flex-row items-center">
              <Ionicons name="create-outline" size={16} color="#ccf8f1" style={{ marginRight: 4 }} />
              <Text className="text-secondary font-semibold text-sm">Edit Split</Text>
            </View>
          </TouchableOpacity>

          {/* Cancel Button - Only show if canEdit (no money received) */}
          <TouchableOpacity
            onPress={onCancelSplit}
            activeOpacity={0.9}
            className="flex-1 rounded-xl bg-red-50 border border-red-200 items-center justify-center"
            style={{ height: 44 }}
          >
            <View className="flex-row items-center">
              <Ionicons name="close-circle-outline" size={16} color="#DC2626" style={{ marginRight: 4 }} />
              <Text className="text-red-600 font-semibold text-sm">Cancel Split</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}

