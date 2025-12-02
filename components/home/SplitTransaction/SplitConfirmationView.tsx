import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
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
  onCancelSplit: () => void;
  showBanner?: boolean;
};

export default function SplitConfirmationView({ transaction, splitData, onClose, onEdit, onCancelSplit, showBanner }: Props) {
  const [displayBanner, setDisplayBanner] = useState(showBanner);
  const total = Math.abs(transaction?.amount || 0);
  const people = Number(splitData?.numberOfPeople ?? 0);
  const perPerson = people > 0 ? total / people : 0;
  const handleShare = () => {};

  // Auto-hide success banner after 3 seconds
  useEffect(() => {
    if (showBanner) {
      setDisplayBanner(true);
      const timer = setTimeout(() => {
        setDisplayBanner(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showBanner]);

  return (
    <>
      <SplitTransactionHeader
        title="Split Status"
        subtitle={transaction?.title}
        onClose={onClose}
      />

      {displayBanner && (
        <View className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 mb-5 flex-row items-center shadow-sm">
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="bg-gray-50 border border-gray-200 rounded-2xl p-3 mb-8 flex-1"
      >
        <SplitTransactionsList splits={[]} />
      </ScrollView>

      {/* Action Buttons Row */}
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

        {/* Cancel Button */}
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
    </>
  );
}
