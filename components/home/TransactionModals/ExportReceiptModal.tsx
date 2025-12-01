import { Modal, View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TransactionModalHeader from './TransactionModalHeader';
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';
import { useRef } from 'react';

export default function ExportReceiptModal({ visible, onClose, transaction }: any) {
  const viewShotRef = useRef<ViewShot>(null);

  const isIncome = transaction?.amount >= 0;
  const transactionType = isIncome ? 'Income' : 'Withdrawal';

  // Parse bank sources from subtitle
  const parseBankSources = () => {
    if (!transaction?.subtitle || !transaction.subtitle.includes('SOURCE:')) {
      return null;
    }

    const sourceMatch = transaction.subtitle.match(/SOURCE:\s*(.+)/);
    if (!sourceMatch) return null;

    const sourcesText = sourceMatch[1];
    const sourceItems = sourcesText.split(',').map((item: string) => {
      const match = item.trim().match(/(.+?)\((-?\$[\d.]+)\)/);
      if (match) {
        return {
          bank: match[1].trim(),
          amount: match[2].trim()
        };
      }
      return null;
    }).filter(Boolean);

    return sourceItems.length > 0 ? sourceItems : null;
  };

  const bankSources = parseBankSources();

  const handleExportImage = async () => {
    try {
      if (viewShotRef.current && viewShotRef.current.capture) {
        // Capture the receipt card as an image
        const uri = await viewShotRef.current.capture();

        // Check if sharing is available
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: `Share Receipt - ${transaction.company || 'Transaction'}`,
            UTI: "public.png",
          });
        } else {
          Alert.alert("Success", "Receipt image saved successfully!");
        }
      }
    } catch (error) {
      console.error("Error sharing receipt:", error);
      Alert.alert("Error", "Failed to save receipt image");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 max-h-[85%] min-h-[60%]">
          <TransactionModalHeader
            title="Export Receipt"
            subtitle="Preview and export this transaction receipt as an image"
            icon="share-outline"
            onClose={onClose}
          />
      
          <ScrollView showsVerticalScrollIndicator={false}>
            

            {/* Receipt Preview */}
            <ViewShot
              ref={viewShotRef}
              options={{
                format: "png",
                quality: 1.0,
              }}
            >
              <View className="bg-white rounded-2xl p-6 border-2 border-gray-200 mb-6">
                {/* Header */}
                <View className="items-center mb-4 pb-3 border-b border-gray-200">
                  <View className="w-12 h-12 rounded-full bg-[#00332d] items-center justify-center mb-2">
                    <Ionicons name="receipt-outline" size={24} color="white" />
                  </View>
                  <Text className="text-base font-bold text-gray-900">Transaction Receipt</Text>
                  <Text className="text-xs text-gray-500 mt-0.5">{transactionType}</Text>
                </View>

                {/* Transaction Summary */}
                <View className="bg-gray-50 rounded-xl p-4 mb-4">
                  <View className="flex-row items-center mb-3">
                    {transaction?.logo ? (
                      <Image source={transaction.logo} className="w-12 h-12 rounded-xl" />
                    ) : (
                      <View className="w-12 h-12 rounded-xl bg-[#00332d] items-center justify-center">
                        <Ionicons name="business-outline" size={24} color="white" />
                      </View>
                    )}
                    <View className="flex-1 ml-3">
                      <Text className="text-base font-semibold text-gray-900">
                        {transaction?.company || 'Company'}
                      </Text>
                      <Text className="text-sm text-gray-600 mt-0.5">
                        {transaction?.title || 'Transaction'}
                      </Text>
                    </View>
                  </View>

                  <View className="pt-3 border-t border-gray-200">
                    <Text className="text-xs text-gray-500 mb-1">Amount</Text>
                    <Text
                      className="text-2xl font-bold"
                      style={{ color: isIncome ? '#16A34A' : '#DC2626' }}
                    >
                      {isIncome ? '+' : '-'}${Math.abs(transaction?.amount || 0).toFixed(2)}
                    </Text>
                  </View>
                </View>

                {/* Transaction Details */}
                <View className="space-y-3">
                  <DetailRow label="Date" value={transaction?.date || 'N/A'} />
                  <DetailRow label="Country" value={transaction?.country || 'N/A'} />

                  {/* Bank Sources - Show detailed breakdown for charges */}
                  {!isIncome && bankSources && bankSources.length > 0 ? (
                    <View className="pt-3 border-t border-gray-200">
                      <Text className="text-xs text-gray-500 mb-2">Bank Sources Deducted</Text>
                      {bankSources.map((source: any, index: number) => (
                        <View
                          key={index}
                          className="flex-row justify-between items-center bg-gray-50 rounded-lg p-3 mb-2"
                        >
                          <View className="flex-row items-center">
                            <Ionicons name="card-outline" size={16} color="#00332d" />
                            <Text className="text-sm text-gray-900 ml-2 font-medium">
                              {source.bank}
                            </Text>
                          </View>
                          <Text className="text-sm font-semibold text-red-600">
                            {source.amount}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : transaction?.bankList && transaction.bankList.length > 0 ? (
                    <DetailRow label="Banks" value={transaction.bankList.join(', ')} />
                  ) : null}

                  {transaction?.budgetBlock && (
                    <DetailRow label="Budget Block" value={transaction.budgetBlock} />
                  )}
                  {transaction?.remark && (
                    <View className="pt-3 border-t border-gray-200">
                      <Text className="text-xs text-gray-500 mb-1">Remark</Text>
                      <Text className="text-sm text-gray-700">{transaction.remark}</Text>
                    </View>
                  )}
                </View>

                {/* Footer */}
                <View className="mt-6 pt-4 border-t border-gray-200 items-center">
                  <Text className="text-xs text-gray-400">Generated by QuickPay</Text>
                  <Text className="text-xs text-gray-400 mt-0.5">
                    {new Date().toLocaleString()}
                  </Text>
                </View>
              </View>
            </ViewShot>

            {/* Export Button */}
            <View className="pb-6">
              <TouchableOpacity
                onPress={handleExportImage}
                activeOpacity={0.8}
                className="bg-[#00332d] rounded-2xl py-4 items-center"
              >
                <Text className="text-white font-bold text-lg">Export as Image</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// Helper component for detail rows
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between items-center py-2">
      <Text className="text-sm text-gray-500">{label}</Text>
      <Text className="text-sm font-medium text-gray-900">{value}</Text>
    </View>
  );
}
