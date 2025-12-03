import React, { useState } from 'react';
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

export default function TransactionDetailModal({ visible, onClose, transaction }: any) {
  const insets = useSafeAreaInsets();
  const [budgetVisible, setBudgetVisible] = useState(false);
  const [internalNote, setInternalNote] = useState(transaction?.internalNote || '');
  const [editingNote, setEditingNote] = useState(false);

  const publicRemark = transaction?.remark || '';
  const isCharge = transaction?.amount < 0;

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

  // Extract single bank account source
  // Priority: 1) bank field from Plaid, 2) all banks from multi-source, 3) subtitle if not multi-bank format, 4) Unknown
  const bankAccount = transaction?.bank ||
                     (bankSources && bankSources.length > 0
                       ? bankSources.map((s: any) => s.bank).join(', ')
                       : (transaction?.subtitle && !transaction.subtitle.match(/\w+\(-?\$[\d.]+\)/)
                          ? transaction.subtitle.replace('Account: ', '')
                          : 'Unknown Bank'));

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
                {merchantLogo ? (
                  <Image source={merchantLogo} style={{ width: 52, height: 52, borderRadius: 12 }} />
                ) : (
                  <Ionicons name="card-outline" size={40} color="#00332d" />
                )}
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>
                    {companyName}
                  </Text>
                  <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
                    {transaction.date || 'N/A'}
                  </Text>
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
