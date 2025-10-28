import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import TransactionModalHeader from './TransactionModalHeader';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function ExportReceiptModal({ visible, onClose, transaction }: any) {
  const handleExport = async () => {
    const html = `
      <html><body style="font-family:sans-serif;padding:20px;">
      <h2>${transaction.title || 'Transaction Receipt'}</h2>
      <p><b>Amount:</b> $${Math.abs(transaction.amount).toFixed(2)}</p>
      <p><b>Date:</b> ${transaction.date || 'N/A'}</p>
      <p><b>Company:</b> ${transaction.company || 'N/A'}</p>
      <p><b>Country:</b> ${transaction.country || 'N/A'}</p>
      </body></html>`;
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 max-h-[70%]">
          <TransactionModalHeader title="Export Receipt" onClose={onClose} />
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text className="text-base text-gray-700 mb-4">
              Export this transaction as a PDF receipt to share or save.
            </Text>

            <TouchableOpacity
              onPress={handleExport}
              activeOpacity={0.8}
              className="bg-primary rounded-2xl py-4 items-center mb-4"
            >
              <Text className="text-white font-bold text-lg">Export as PDF</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose}>
              <Text className="text-gray-500 text-center font-medium mt-4">Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
