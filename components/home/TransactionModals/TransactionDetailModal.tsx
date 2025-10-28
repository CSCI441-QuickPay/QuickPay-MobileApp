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

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={modalStyles.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={modalStyles.container}
        >
          <TransactionModalHeader
            title="Transaction Details"
            subtitle={transaction.title}
            onClose={onClose}
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[modalStyles.scrollArea, { paddingBottom: insets.bottom + 10 }]}
          >
            {/* Transaction Summary */}
            <View style={modalStyles.card}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {transaction.logo ? (
                  <Image source={transaction.logo} style={{ width: 52, height: 52, borderRadius: 12 }} />
                ) : (
                  <Ionicons name="card-outline" size={40} color="#00332d" />
                )}
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>
                    {transaction.company || 'Company'}
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
              <View style={modalStyles.fieldRow}>
                <Text style={modalStyles.fieldLabel}>Country</Text>
                <Text style={modalStyles.fieldValue}>{transaction.country || 'N/A'}</Text>
              </View>
              <View style={modalStyles.fieldRow}>
                <Text style={modalStyles.fieldLabel}>Banks</Text>
                <Text style={modalStyles.fieldValue}>
                  {transaction.bankList?.join(', ') || 'N/A'}
                </Text>
              </View>
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
                onChangeText={setInternalNote}
                multiline
                placeholder="Write your private note..."
                placeholderTextColor="#9CA3AF"
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
