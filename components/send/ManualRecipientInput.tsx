/**
 * written by: Team QuickPay
 * tested by: Team QuickPay
 * debugged by: Team QuickPay
 * Notes: Contributions were shared, see GitHub history for commit details.
 * Unit Tests for UserSyncService
 */
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RecipientInfo, PaymentService } from '@/services/PaymentService';

interface ManualRecipientInputProps {
  onRecipientSelect: (recipient: RecipientInfo) => void;
  currentAccountNumber: string;
}

export default function ManualRecipientInput({
  onRecipientSelect,
  currentAccountNumber,
}: ManualRecipientInputProps) {
  const [accountNumber, setAccountNumber] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validatedRecipient, setValidatedRecipient] = useState<RecipientInfo | null>(null);
  const [error, setError] = useState('');

  const handleAccountNumberChange = (text: string) => {
    // Only allow numeric input
    const cleaned = text.replace(/[^0-9]/g, '');
    // Limit to 10 digits
    const limited = cleaned.slice(0, 10);
    setAccountNumber(limited);
    setError('');
    setValidatedRecipient(null);
  };

  const handleValidate = async () => {
    if (accountNumber.length !== 10) {
      setError('Account number must be 10 digits');
      return;
    }

    if (accountNumber === currentAccountNumber) {
      setError('You cannot send money to yourself');
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      const recipient = await PaymentService.getRecipientInfo(accountNumber);

      if (!recipient) {
        setError('Account not found');
        setValidatedRecipient(null);
      } else {
        setValidatedRecipient(recipient);
        onRecipientSelect(recipient);
      }
    } catch (err) {
      setError('Failed to validate account');
      setValidatedRecipient(null);
    } finally {
      setIsValidating(false);
    }
  };

  const getInitials = (recipient: RecipientInfo) => {
    if (recipient.firstName && recipient.lastName) {
      return `${recipient.firstName[0]}${recipient.lastName[0]}`.toUpperCase();
    }
    return recipient.email[0].toUpperCase();
  };

  const getDisplayName = (recipient: RecipientInfo) => {
    if (recipient.firstName && recipient.lastName) {
      return `${recipient.firstName} ${recipient.lastName}`;
    }
    return recipient.email;
  };

  return (
    <View className="px-6 py-4">
      {/* Account number input */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Account Number
        </Text>
        <View className="flex-row items-center gap-2">
          <View className="flex-1 flex-row items-center border-2 border-gray-200 rounded-2xl px-4 focus:border-[#00332d]">
            <Ionicons name="card-outline" size={22} color="#9CA3AF" />
            <TextInput
              value={accountNumber}
              onChangeText={handleAccountNumberChange}
              placeholder="Enter 10-digit account number"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              maxLength={10}
              className="flex-1 py-4 px-3 text-base text-gray-900"
              style={{ fontSize: 17 }}
            />
          </View>
          <TouchableOpacity
            onPress={handleValidate}
            disabled={accountNumber.length !== 10 || isValidating}
            className={`rounded-2xl px-4 ${
              accountNumber.length === 10 && !isValidating
                ? 'bg-[#00332d]'
                : 'bg-gray-300'
            }`}
            style={{ height: 56 }}
            activeOpacity={0.7}
          >
            <View className="flex-1 items-center justify-center">
              {isValidating ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold">Verify</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Error message */}
        {error ? (
          <View className="mt-2 flex-row items-center">
            <Ionicons name="alert-circle" size={16} color="#EF4444" />
            <Text className="text-sm text-red-500 ml-1">{error}</Text>
          </View>
        ) : null}
      </View>

      {/* Validated recipient display */}
      {validatedRecipient && (
        <View className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-full bg-[#00332d] items-center justify-center mr-3">
              <Text className="text-white font-bold text-lg">
                {getInitials(validatedRecipient)}
              </Text>
            </View>
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-base font-semibold text-gray-900">
                  {getDisplayName(validatedRecipient)}
                </Text>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" className="ml-2" />
              </View>
              <Text className="text-sm text-gray-600 mt-0.5">
                {validatedRecipient.accountNumber}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Help text */}
      <View className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-3">
        <View className="flex-row items-start">
          <Ionicons name="information-circle" size={20} color="#3B82F6" style={{ marginTop: 2 }} />
          <Text className="text-sm text-blue-800 ml-2 flex-1">
            Enter the recipient's 10-digit QuickPay account number and tap Verify
          </Text>
        </View>
      </View>
    </View>
  );
}
