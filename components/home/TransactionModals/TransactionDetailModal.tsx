import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { modalStyles } from '@/styles/modalStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TransactionModalHeader from './TransactionModalHeader';
import EditBudgetBlockModal from './EditBudgetBlockModal';
import FavoriteModel from '@/models/FavoriteModel';
import { useUser } from '@clerk/clerk-expo';
import { supabase } from '@/config/supabaseConfig';

export default function TransactionDetailModal({ visible, onClose, transaction }: any) {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const [budgetVisible, setBudgetVisible] = useState(false);
  const [internalNote, setInternalNote] = useState(transaction?.internalNote || '');
  const [recipientAvatar, setRecipientAvatar] = useState<string | null>(null);
  const [bankName, setBankName] = useState<string | null>(null);

  const publicRemark = transaction?.remark || '';
  const isIncome = transaction?.amount >= 0;

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

  // Fetch recipient avatar and bank name when modal opens
  useEffect(() => {
    const fetchRecipientData = async () => {
      if (!visible || !user) return;

      try {
        // Fetch recipient profile if account numbers exist
        if (accountNumbers) {
          // For sent transactions (amount < 0), recipient is "To"
          // For received transactions (amount >= 0), recipient is "From"
          const recipientAccNum = isIncome ? accountNumbers.from : accountNumbers.to;

          // Fetch recipient profile
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

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={modalStyles.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={modalStyles.container}
        >
          <TransactionModalHeader
            title="Transaction Details"
            subtitle="View and manage transaction information"
            icon="information-circle-outline"
            onClose={onClose}
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[modalStyles.scrollArea, { paddingBottom: insets.bottom + 10 }]}
          >
            {/* Transaction Summary */}
            <View style={modalStyles.card}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {recipientAvatar ? (
                  <Image source={{ uri: recipientAvatar }} style={{ width: 52, height: 52, borderRadius: 26 }} />
                ) : merchantLogo ? (
                  <Image source={merchantLogo} style={{ width: 52, height: 52, borderRadius: 12 }} />
                ) : (
                  <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: '#00332d', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="person-outline" size={28} color="white" />
                  </View>
                )}
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>
                    {companyName}
                  </Text>
                  {accountNumbers && (
                    <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                      {isIncome ? accountNumbers.from : accountNumbers.to}
                    </Text>
                  )}
                </View>
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: '700',
                    color: transaction.amount < 0 ? '#DC2626' : '#16A34A',
                  }}
                >
                  {`${transaction.amount < 0 ? '-' : '+'}$${Math.abs(transaction.amount).toFixed(2)}`}
                </Text>
              </View>
            </View>

            {/* Transaction Info */}
            <View style={modalStyles.card}>
              <Text style={modalStyles.sectionTitle}>Transaction Info</Text>

              {/* Date */}
              <View style={modalStyles.fieldRow}>
                <Text style={modalStyles.fieldLabel}>Date</Text>
                <Text style={modalStyles.fieldValue}>{transaction.date || 'N/A'}</Text>
              </View>

              {/* Category */}
              {category && category !== 'Other' && (
                <View style={modalStyles.fieldRow}>
                  <Text style={modalStyles.fieldLabel}>Category</Text>
                  <View style={{ backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6 }}>
                    <Text style={{ fontSize: 14, color: '#1E40AF', fontWeight: '600' }}>
                      {category}
                    </Text>
                  </View>
                </View>
              )}

              {/* Bank Account - Always display unless there's a detailed breakdown */}
              {!bankSources || bankSources.length === 0 ? (
                <View style={modalStyles.fieldRow}>
                  <Text style={modalStyles.fieldLabel}>Bank Account</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="card-outline" size={16} color="#00332d" style={{ marginRight: 6 }} />
                    <Text style={modalStyles.fieldValue}>{bankAccount}</Text>
                  </View>
                </View>
              ) : null}

              <View style={modalStyles.fieldRow}>
                <Text style={modalStyles.fieldLabel}>Country</Text>
                <Text style={modalStyles.fieldValue}>{country}</Text>
              </View>

              {/* Bank Accounts - Show detailed breakdown when multiple banks used */}
              {bankSources && bankSources.length > 0 ? (
                <View style={{ marginTop: 8, marginBottom: 8 }}>
                  <Text style={[modalStyles.fieldLabel, { marginBottom: 8 }]}>
                    Bank Accounts Deducted
                  </Text>
                  {bankSources.map((source: any, index: number) => (
                    <View
                      key={index}
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: '#F9FAFB',
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: index < bankSources.length - 1 ? 8 : 0
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="card-outline" size={18} color="#00332d" />
                        <Text style={{ fontSize: 14, color: '#111827', marginLeft: 8, fontWeight: '500' }}>
                          {source.bank}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#DC2626' }}>
                        {source.amount}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {/* Account Numbers */}
              {accountNumbers && (
                <View style={{ marginTop: 8, marginBottom: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' }}>
                  <Text style={[modalStyles.fieldLabel, { marginBottom: 8 }]}>
                    Account Numbers
                  </Text>
                  <View style={modalStyles.fieldRow}>
                    <Text style={modalStyles.fieldLabel}>From</Text>
                    <Text style={modalStyles.fieldValue}>{accountNumbers.from}</Text>
                  </View>
                  <View style={modalStyles.fieldRow}>
                    <Text style={modalStyles.fieldLabel}>To</Text>
                    <Text style={modalStyles.fieldValue}>{accountNumbers.to}</Text>
                  </View>
                </View>
              )}

              <View style={modalStyles.fieldRow}>
                <Text style={modalStyles.fieldLabel}>Budget Block</Text>
                <TouchableOpacity onPress={() => setBudgetVisible(true)}>
                  <Text style={[modalStyles.fieldValue, { color: '#00332d' }]}>
                    {transaction.budgetBlock || 'Unassigned'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Notes */}
            <View style={modalStyles.notesContainer}>
              <Text style={modalStyles.sectionTitle}>Notes</Text>
              <TextInput
                style={modalStyles.noteInput}
                value={internalNote}
                onChangeText={(text) => {
                  // Limit to 1000 characters for notes
                  if (text.length <= 1000) {
                    setInternalNote(text);
                  }
                }}
                multiline
                placeholder="Write your private note..."
                placeholderTextColor="#9CA3AF"
                maxLength={1000}
              />
              <View style={modalStyles.remarkBox}>
                <Text style={modalStyles.fieldLabel}>Public Remark</Text>
                <Text style={[modalStyles.fieldValue, { color: '#9CA3AF', fontStyle: 'italic' }]}>
                  {publicRemark || 'No remark was added during payment.'}
                </Text>
              </View>
            </View>

            
          </ScrollView>

          <EditBudgetBlockModal visible={budgetVisible} onClose={() => setBudgetVisible(false)} />
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
