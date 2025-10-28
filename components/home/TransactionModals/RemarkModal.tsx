import { Modal, View, Text, TouchableOpacity } from 'react-native';
import TransactionModalHeader from './TransactionModalHeader';

type Props = {
  visible: boolean;
  onClose: () => void;
  remark?: string;
};

export default function RemarkModal({ visible, onClose, remark = '' }: Props) {
  const canEdit = false; // remarks cannot be added after payment

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 max-h-[55%]">
          <TransactionModalHeader title="Public Remark" onClose={onClose} />

          <View
            className={`rounded-2xl p-4 border ${
              remark ? 'bg-white border-gray-200' : 'bg-gray-100 border-gray-200 opacity-70'
            }`}
          >
            <Text className="text-xs text-gray-600 mb-2">
              This remark was added during the payment and is visible to both sender and receiver.
            </Text>

            {remark ? (
              <Text className="text-base text-gray-800">{remark}</Text>
            ) : (
              <Text className="text-gray-400 italic">No remark was added for this payment.</Text>
            )}
          </View>

          {!canEdit && (
            <TouchableOpacity onPress={onClose}>
              <Text className="text-gray-500 text-center mt-5 font-medium">Close</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}
