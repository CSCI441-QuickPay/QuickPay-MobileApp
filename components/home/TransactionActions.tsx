import { Ionicons} from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SplitTransactionModal } from './SplitTransaction';
import {
  ExportReceiptModal,
  ReturnTransactionModal,
  TransactionDetailModal,
  WithdrawModal,
} from './TransactionModals';

export default function TransactionActions({ visible, transaction }: { visible: boolean; transaction: any }) {
  const [splitModalVisible, setSplitModalVisible] = useState(false);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [returnModalVisible, setReturnModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [localTransaction, setLocalTransaction] = useState(transaction);

  // Sync localTransaction when transaction prop changes
  useEffect(() => {
    setLocalTransaction(transaction);
  }, [transaction]);

  if (!visible) return null;

  const isSplit = localTransaction?.splitData?.splits?.length > 0;
  const canSplit = localTransaction.amount < 0; // Red/expense transactions
  const canWithdraw = localTransaction.amount > 0; // Green/receiving transactions

  const handleSplitCreated = (splitData: any) => {
    setLocalTransaction((prev: any) => ({
      ...prev,
      splitData,
    }));
  };

  const handleSplitCanceled = () => {
    setLocalTransaction((prev: any) => ({
      ...prev,
      splitData: undefined,
    }));
  };

  return (
    <>
      <View className="flex-row items-center justify-around px-4 py-4 border-t border-gray-100 bg-white">

        {/* 1️⃣ Export Receipt */}
        <ActionButton
          icon="share-outline"
          label="Export"
          onPress={() => setExportModalVisible(true)} disabled={undefined} active={undefined}        />

        {/* 2️⃣ Return Transaction */}
        <ActionButton
          icon="refresh-outline"
          label="Return"
          onPress={() => setReturnModalVisible(true)} disabled={undefined} active={undefined}        />

        {/* 3️⃣ Split Transaction OR Withdraw (for green transactions) */}
        {canWithdraw ? (
          <ActionButton
            icon="cash-outline"
            label="Withdraw"
            onPress={() => setWithdrawModalVisible(true)}
            active={false}
            disabled={false}
            activeColor="#10B981"
          />
        ) : (
          <ActionButton
            icon="pie-chart-outline"
            label="Split"
            onPress={() => setSplitModalVisible(true)}
            active={isSplit}
            disabled={!canSplit}
            activeColor="#10B981"
          />
        )}

        {/* 4️⃣ More */}
        <ActionButton
          icon="ellipsis-horizontal"
          label="More"
          onPress={() => setDetailModalVisible(true)} disabled={undefined} active={undefined}        />
      </View>

      {/* Modals - All use localTransaction for consistency */}
      <SplitTransactionModal
        visible={splitModalVisible}
        onClose={() => setSplitModalVisible(false)}
        transaction={localTransaction}
        onSplitCreated={handleSplitCreated}
        onSplitCanceled={handleSplitCanceled}
      />
      <ExportReceiptModal
        visible={exportModalVisible}
        onClose={() => setExportModalVisible(false)}
        transaction={localTransaction}
      />
      <ReturnTransactionModal
        visible={returnModalVisible}
        onClose={() => setReturnModalVisible(false)}
        transaction={localTransaction}
      />
      <TransactionDetailModal
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        transaction={localTransaction}
      />
      <WithdrawModal
        visible={withdrawModalVisible}
        onClose={() => setWithdrawModalVisible(false)}
        transaction={localTransaction}
      />
    </>
  );
}

function ActionButton({ icon, label, onPress, disabled, active, activeColor = '#6B7280' }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      className="items-center justify-center"
      style={{ width: 70 }}
    >
      <View
        className="w-11 h-11 rounded-full items-center justify-center mb-1"
        style={{
          backgroundColor: active ? '#F0FDF4' : '#F9FAFB',
          borderWidth: active ? 2 : 0,
          borderColor: active ? activeColor : 'transparent',
        }}
      >
        <Ionicons
          name={icon}
          size={20}
          color={active ? activeColor : disabled ? '#D1D5DB' : '#6B7280'}
        />
      </View>
      <Text className="text-xs font-medium" style={{ color: '#6B7280' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
