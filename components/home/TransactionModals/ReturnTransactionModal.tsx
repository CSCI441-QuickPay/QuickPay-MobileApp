import { Modal, View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useState } from 'react';
import TransactionModalHeader from './TransactionModalHeader';

export default function ReturnTransactionModal({ visible, onClose, transaction }: any) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    console.log('Return confirmed:', reason);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 max-h-[70%]">
          <TransactionModalHeader title="Return Transaction" subtitle={transaction.title} onClose={onClose} />

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text className="text-base text-gray-700 mb-3">
              Please provide a reason for returning this transaction.
            </Text>
            <TextInput
              placeholder="Reason for return"
              value={reason}
              onChangeText={setReason}
              className="border-2 border-gray-200 rounded-2xl px-4 py-3 mb-6 text-base text-gray-900"
              multiline
            />

            <TouchableOpacity
              onPress={handleConfirm}
              activeOpacity={0.8}
              className="bg-primary rounded-2xl py-4 items-center mb-4"
            >
              <Text className="text-white font-bold text-lg">Confirm Return</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose}>
              <Text className="text-gray-500 text-center font-medium">Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
