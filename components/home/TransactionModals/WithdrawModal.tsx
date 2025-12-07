/**
 * written by: Team QuickPay
 * tested by: Team QuickPay
 * debugged by: Team QuickPay
 * Notes: Contributions were shared, see GitHub history for commit details.
 * Unit Tests for UserSyncService
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import BankAccountModel, { BankAccount } from '@/models/BankAccountModel';
import UserModel from '@/models/UserModel';
import { supabase } from '@/config/supabaseConfig';

interface WithdrawModalProps {
  visible: boolean;
  onClose: () => void;
  transaction?: any; // The green transaction that triggered this
}

export default function WithdrawModal({
  visible,
  onClose,
  transaction,
}: WithdrawModalProps) {
  const { user } = useUser();
  const [quickPayBalance, setQuickPayBalance] = useState(0);
  const [linkedBanks, setLinkedBanks] = useState<BankAccount[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible, user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Get database user
      const dbUser = await UserModel.getByClerkId(user.id);
      if (!dbUser) {
        Alert.alert('Error', 'User not found');
        return;
      }

      setQuickPayBalance(dbUser.balance);

      // Get linked banks
      if (dbUser.id) {
        const banks = await BankAccountModel.getByUserId(dbUser.id);
        setLinkedBanks(banks);
        if (banks.length > 0) {
          setSelectedBankId(banks[0].id || null);
        }
      }
    } catch (error) {
      console.error('Error loading withdraw data:', error);
      Alert.alert('Error', 'Failed to load bank accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!user || !selectedBankId) return;

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (withdrawAmount > quickPayBalance) {
      Alert.alert(
        'Insufficient Balance',
        `You only have $${quickPayBalance.toFixed(2)} in your QuickPay balance`
      );
      return;
    }

    Alert.alert(
      'Confirm Withdrawal',
      `Withdraw $${withdrawAmount.toFixed(2)} from QuickPay to your bank account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Withdraw', onPress: processWithdrawal },
      ]
    );
  };

  const processWithdrawal = async () => {
    if (!user || !selectedBankId) return;

    try {
      setIsProcessing(true);

      const dbUser = await UserModel.getByClerkId(user.id);
      if (!dbUser?.id) {
        throw new Error('User not found');
      }

      const withdrawAmount = parseFloat(amount);

      // Call Supabase RPC function for withdrawal
      const { data, error } = await supabase.rpc('process_withdrawal', {
        p_user_id: dbUser.id,
        p_bank_account_id: selectedBankId,
        p_amount: withdrawAmount,
      });

      if (error) throw error;

      // Success
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Withdrawal Successful',
        `$${withdrawAmount.toFixed(2)} has been sent to your bank account`,
        [{ text: 'OK', onPress: onClose }]
      );

      // Reset form
      setAmount('');
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Withdrawal Failed', error.message || 'Failed to process withdrawal');
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedBank = linkedBanks.find((b) => b.id === selectedBankId);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable className="flex-1 bg-black/50 justify-end" onPress={onClose}>
        <Pressable
          className="bg-white rounded-t-3xl max-h-[90%]"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Handle bar */}
          <View className="items-center py-3">
            <View className="w-12 h-1 bg-gray-300 rounded-full" />
          </View>

          {/* Header */}
          <View className="px-6 pb-4 border-b border-gray-100">
            <View className="flex-row items-center justify-between">
              <Text className="text-2xl font-bold text-gray-900">Withdraw to Bank</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close-circle" size={28} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <Text className="text-sm text-gray-500 mt-1">
              Transfer money from QuickPay to your bank account
            </Text>
          </View>

          {isLoading ? (
            <View className="items-center justify-center py-12">
              <ActivityIndicator size="large" color="#00332d" />
            </View>
          ) : (
            <ScrollView className="px-6 py-4">
              {/* QuickPay Balance */}
              <View className="bg-[#00332d]/5 rounded-2xl p-4 mb-6">
                <Text className="text-sm text-gray-600 mb-1">Available Balance</Text>
                <Text className="text-3xl font-bold text-[#00332d]">
                  ${quickPayBalance.toFixed(2)}
                </Text>
              </View>

              {linkedBanks.length === 0 ? (
                <View className="items-center py-8">
                  <Ionicons name="card-outline" size={48} color="#9CA3AF" />
                  <Text className="text-gray-600 mt-4 text-center">
                    No bank accounts linked.{'\n'}Please connect a bank account to withdraw.
                  </Text>
                </View>
              ) : (
                <>
                  {/* Select Bank */}
                  <View className="mb-6">
                    <Text className="text-sm font-semibold text-gray-700 mb-3">
                      Withdraw To
                    </Text>
                    {linkedBanks.map((bank) => (
                      <TouchableOpacity
                        key={bank.id}
                        onPress={() => setSelectedBankId(bank.id || null)}
                        className={`flex-row items-center p-4 rounded-2xl mb-2 border-2 ${
                          selectedBankId === bank.id
                            ? 'border-[#00332d] bg-[#00332d]/5'
                            : 'border-gray-200 bg-white'
                        }`}
                        activeOpacity={0.7}
                      >
                        <View
                          className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                            selectedBankId === bank.id ? 'bg-[#00332d]' : 'bg-gray-100'
                          }`}
                        >
                          <Ionicons
                            name="card"
                            size={20}
                            color={selectedBankId === bank.id ? 'white' : '#6B7280'}
                          />
                        </View>
                        <View className="flex-1">
                          <Text className="font-semibold text-gray-900">
                            {bank.institutionName || bank.accountName}
                          </Text>
                          <Text className="text-sm text-gray-500">
                            {bank.accountType} •••• {bank.mask}
                          </Text>
                        </View>
                        {selectedBankId === bank.id && (
                          <Ionicons name="checkmark-circle" size={24} color="#00332d" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Amount Input */}
                  <View className="mb-6">
                    <Text className="text-sm font-semibold text-gray-700 mb-3">
                      Withdrawal Amount
                    </Text>
                    <View className="flex-row items-center border-2 border-gray-200 rounded-2xl px-4 py-3 bg-white">
                      <Text className="text-2xl font-bold text-gray-900 mr-2">$</Text>
                      <TextInput
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="0.00"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="decimal-pad"
                        className="flex-1 text-2xl font-bold text-gray-900"
                      />
                      <TouchableOpacity
                        onPress={() => setAmount(quickPayBalance.toFixed(2))}
                        className="bg-[#00332d]/10 rounded-lg px-3 py-1"
                      >
                        <Text className="text-[#00332d] font-semibold text-sm">Max</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Withdraw Button */}
                  <TouchableOpacity
                    onPress={handleWithdraw}
                    disabled={isProcessing || !amount || parseFloat(amount) <= 0}
                    className="rounded-2xl overflow-hidden mb-4"
                    style={{
                      shadowColor: '#00332d',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity:
                        isProcessing || !amount || parseFloat(amount) <= 0 ? 0 : 0.3,
                      shadowRadius: 8,
                      elevation: 8,
                      opacity:
                        isProcessing || !amount || parseFloat(amount) <= 0 ? 0.4 : 1,
                    }}
                    activeOpacity={0.85}
                  >
                    <LinearGradient
                      colors={['#00332d', '#005248', '#007a5e']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      className="py-5 items-center justify-center flex-row"
                    >
                      {isProcessing && (
                        <ActivityIndicator
                          color="white"
                          size="small"
                          style={{ marginRight: 8 }}
                        />
                      )}
                      <Text className="text-white font-bold text-lg">
                        {isProcessing
                          ? 'Processing...'
                          : `Withdraw $${amount || '0.00'}`}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Info Note */}
                  <View className="bg-blue-50 rounded-2xl p-4 flex-row">
                    <Ionicons name="information-circle" size={20} color="#3B82F6" />
                    <Text className="text-sm text-gray-600 ml-2 flex-1">
                      Withdrawals typically arrive in 1-3 business days
                    </Text>
                  </View>
                </>
              )}
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
