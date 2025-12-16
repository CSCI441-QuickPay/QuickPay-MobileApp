/**
 * written by: Team QuickPay
 * tested by: Team QuickPay
 * debugged by: Team QuickPay
 * Notes: Contributions were shared, see GitHub history for commit details.
 * Unit Tests for UserSyncService
 */
import { Modal, View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TransactionModalHeader from './TransactionModalHeader';
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';
import { useRef, useState, useEffect } from 'react';
import FavoriteModel from '@/models/FavoriteModel';
import { useUser } from '@clerk/clerk-expo';
import { supabase } from '@/config/supabaseConfig';

export default function ExportReceiptModal({ visible, onClose, transaction }: any) {
  const viewShotRef = useRef<ViewShot>(null);
  const { user } = useUser();
  const [recipientAvatar, setRecipientAvatar] = useState<string | null>(null);
  const [recipientAccountNumber, setRecipientAccountNumber] = useState<string>('');
  const [bankName, setBankName] = useState<string | null>(null);

  const isIncome = transaction?.amount >= 0;
  const transactionType = isIncome ? 'Income' : 'Withdrawal';

  // Extract company/merchant name - handle both Plaid and local data
  const companyName = transaction?.company || transaction?.merchant_name || transaction?.title || 'Company';

  // Extract merchant logo - handle both Plaid (logo_url) and local (logo) data
  const merchantLogo = transaction?.logo || (transaction?.logo_url ? { uri: transaction.logo_url } : null);

  // Extract category - use formatted category from Plaid or existing category
  const category = transaction?.category || 'Other';

  // Set country - default to United States
  const country = transaction?.country || 'United States';

  // Parse bank sources from subtitle for multi-bank transactions
  const parseBankSources = () => {
    if (!transaction?.subtitle) return null;

    // Check if subtitle contains multi-bank format: "BANK1(-$X.XX), BANK2(-$Y.YY)"
    // Supports both "SOURCE: ..." and direct format without prefix
    const hasMultiBankFormat = transaction.subtitle.match(/\w+\(-?\$[\d.]+\)/);
    if (!hasMultiBankFormat) return null;

    // Extract the sources text (remove "SOURCE:" prefix if present)
    const sourcesText = transaction.subtitle.replace(/^SOURCE:\s*/, '');

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

  // Parse account numbers from subtitle
  const parseAccountNumbers = () => {
    if (!transaction?.subtitle) return null;

    // Check for "From: XXX • To: YYY" format
    const match = transaction.subtitle.match(/From:\s*([^\s•]+)\s*•\s*To:\s*([^\s•]+)/);
    if (match) {
      return {
        from: match[1].trim(),
        to: match[2].trim()
      };
    }
    return null;
  };

  const accountNumbers = parseAccountNumbers();

  // Fetch recipient avatar, account number, and bank name when modal opens
  useEffect(() => {
    const fetchRecipientData = async () => {
      if (!visible || !user) return;

      try {
        // Fetch recipient profile if account numbers exist
        if (accountNumbers) {
          // Determine which account number is the recipient's
          // For sent transactions (amount < 0), recipient is "To"
          // For received transactions (amount >= 0), recipient is "From"
          const recipientAccNum = isIncome ? accountNumbers.from : accountNumbers.to;
          setRecipientAccountNumber(recipientAccNum);

          // Fetch recipient profile from users table
          const accountHolder = await FavoriteModel.getAccountHolderByAccountNumber(recipientAccNum);
          if (accountHolder?.profilePicture) {
            setRecipientAvatar(accountHolder.profilePicture);
          }
        }

        // Fetch bank name if transaction has bank_account_id
        if (transaction?.bank_account_id) {
          const { data: bankAccount, error } = await supabase
            .from('bank_accounts')
            .select('name')
            .eq('id', transaction.bank_account_id)
            .single();

          if (!error && bankAccount) {
            setBankName(bankAccount.name);
          }
        }
      } catch (error) {
        console.error('Error fetching recipient data:', error);
      }
    };

    fetchRecipientData();
  }, [visible, transaction, user, accountNumbers, isIncome]);

  // Extract single bank account source
  // Priority: 1) Fetched bank name from database, 2) bank field from Plaid, 3) all banks from multi-source, 4) QuickPay (default)
  const bankAccount = bankName ||
                     transaction?.bank ||
                     (bankSources && bankSources.length > 0
                       ? bankSources.map((s: any) => s.bank).join(', ')
                       : 'QuickPay');

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
            dialogTitle: `Share Receipt - ${companyName}`,
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
                    {recipientAvatar ? (
                      <Image source={{ uri: recipientAvatar }} className="w-12 h-12 rounded-full" />
                    ) : merchantLogo ? (
                      <Image source={merchantLogo} className="w-12 h-12 rounded-xl" />
                    ) : (
                      <View className="w-12 h-12 rounded-full bg-[#00332d] items-center justify-center">
                        <Ionicons name="person-outline" size={24} color="white" />
                      </View>
                    )}
                    <View className="flex-1 ml-3">
                      <Text className="text-base font-semibold text-gray-900">
                        {companyName}
                      </Text>
                      {recipientAccountNumber && (
                        <Text className="text-xs text-gray-500 mt-1">
                          {recipientAccountNumber}
                        </Text>
                      )}
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
                  {category && category !== 'Other' && (
                    <DetailRow label="Category" value={category} />
                  )}

                  {/* Bank Accounts - Show detailed breakdown when multiple banks used */}
                  {bankSources && bankSources.length > 0 ? (
                    <View className="pt-3 border-t border-gray-200">
                      <Text className="text-xs text-gray-500 mb-2">Bank Accounts Deducted</Text>
                      {bankSources.map((source: any, index: number) => (
                        <View
                          key={index}
                          className="flex-row justify-between items-center bg-gray-50 rounded-lg p-3 mb-2"
                        >
                          <View className="flex-row items-center">
                            <Ionicons name="card-outline" size={18} color="#00332d" />
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
                  ) : (
                    <View className="flex-row items-center justify-between py-2">
                      <Text className="text-sm text-gray-500">Bank Account</Text>
                      <View className="flex-row items-center">
                        <Ionicons name="card-outline" size={16} color="#00332d" style={{ marginRight: 6 }} />
                        <Text className="text-sm font-medium text-gray-900">{bankAccount}</Text>
                      </View>
                    </View>
                  )}

                  <DetailRow label="Country" value={country} />

                  {/* Account Numbers */}
                  {accountNumbers && (
                    <View className="pt-3 border-t border-gray-200">
                      <Text className="text-xs text-gray-500 mb-2">QuickPay Account Numbers</Text>
                      <View className="flex-row justify-between items-center mb-2">
                        <View className="flex-row items-center">
                          <Ionicons name="person-outline" size={14} color="#6B7280" style={{ marginRight: 4 }} />
                          <Text className="text-sm text-gray-500">Sender</Text>
                        </View>
                        <Text className="text-sm font-medium text-gray-900">{accountNumbers.from}</Text>
                      </View>
                      <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                          <Ionicons name="person-outline" size={14} color="#6B7280" style={{ marginRight: 4 }} />
                          <Text className="text-sm text-gray-500">Recipient</Text>
                        </View>
                        <Text className="text-sm font-medium text-gray-900">{accountNumbers.to}</Text>
                      </View>
                    </View>
                  )}

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
