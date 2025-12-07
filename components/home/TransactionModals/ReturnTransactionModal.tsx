/**
 * written by: Team QuickPay
 * tested by: Team QuickPay
 * debugged by: Team QuickPay
 * Notes: Contributions were shared, see GitHub history for commit details.
 * Unit Tests for UserSyncService
 */
import { Modal, View, Text, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import TransactionModalHeader from './TransactionModalHeader';

export default function ReturnTransactionModal({ visible, onClose, transaction }: any) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    // Validate reason is not empty
    if (!reason.trim()) {
      Alert.alert('Validation Error', 'Please provide a reason for the return');
      return;
    }

    if (reason.trim().length < 5) {
      Alert.alert('Invalid Input', 'Reason must be at least 5 characters long');
      return;
    }

    console.log('Return confirmed:', reason);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 max-h-[70%]">
          <TransactionModalHeader
            title="Return Transaction"
            subtitle="Provide a reason for returning this transaction"
            icon="refresh-outline"
            onClose={onClose}
          />

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text className="text-base text-gray-700 mb-3">
              Please provide a reason for returning this transaction.
            </Text>
            <TextInput
              placeholder="Reason for return"
              value={reason}
              onChangeText={(text) => {
                // Limit to 500 characters for reason
                if (text.length <= 500) {
                  setReason(text);
                }
              }}
              className="border-2 border-gray-200 rounded-2xl px-4 py-3 mb-6 text-base text-gray-900"
              multiline
              maxLength={500}
            />

            <View className="pb-6">
              <TouchableOpacity
                onPress={handleConfirm}
                activeOpacity={0.8}
                className="bg-primary rounded-2xl py-4 items-center"
              >
                <Text className="text-white font-bold text-lg">Confirm Return</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
