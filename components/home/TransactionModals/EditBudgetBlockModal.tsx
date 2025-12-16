/**
 * written by: Team QuickPay
 * tested by: Team QuickPay
 * debugged by: Team QuickPay
 * Notes: Contributions were shared, see GitHub history for commit details.
 * Unit Tests for UserSyncService
 */
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import TransactionModalHeader from './TransactionModalHeader';

const BLOCKS = ['Utilities', 'TV', 'Food', 'Entertainment', 'Transport', 'Other'];

export default function EditBudgetBlockModal({ visible, onClose }: any) {
  const handleSelect = (block: string) => {
    console.log('Budget block changed to:', block);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 max-h-[70%]">
          <TransactionModalHeader
            title="Edit Budget Block"
            subtitle="Assign this transaction to a budget category"
            icon="wallet-outline"
            onClose={onClose}
          />

          <ScrollView showsVerticalScrollIndicator={false}>
            {BLOCKS.map((block) => (
              <TouchableOpacity
                key={block}
                onPress={() => handleSelect(block)}
                className="bg-gray-50 border-2 border-gray-200 rounded-2xl px-5 py-3 mb-3"
              >
                <Text className="text-base text-gray-800">{block}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
