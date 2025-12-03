import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PaymentSource } from '@/services/PaymentService';

interface BankSourceCardProps {
  source: PaymentSource;
  onUpdateAmount: (amount: number) => void;
  onRemove: () => void;
}

// Bank branding matching Visual Budget page
const getBankStyle = (sourceName: string) => {
  const name = sourceName.toLowerCase();

  if (name.includes('chase')) {
    return { icon: 'card' as const, color: '#3B82F6' };
  } else if (name.includes('wells fargo')) {
    return { icon: 'business' as const, color: '#10B981' };
  } else if (name.includes('bank of america') || name.includes('bofa')) {
    return { icon: 'card-outline' as const, color: '#F59E0B' };
  } else if (name.includes('citi')) {
    return { icon: 'wallet-outline' as const, color: '#8B5CF6' };
  } else if (name.includes('quickpay')) {
    return { icon: 'wallet' as const, color: '#10B981' };
  }

  // Default for other banks
  return { icon: 'card-outline' as const, color: '#6B7280' };
};

export default function BankSourceCard({
  source,
  onUpdateAmount,
  onRemove,
}: BankSourceCardProps) {
  const [amountText, setAmountText] = useState(
    source.amount > 0 ? source.amount.toFixed(2) : ''
  );

  const handleAmountChange = (text: string) => {
    // Remove all non-numeric characters except decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');

    // Ensure only one decimal point
    const parts = cleaned.split('.');
    const formatted =
      parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;

    setAmountText(formatted);

    // Update parent with numeric value
    const numericValue = parseFloat(formatted) || 0;
    onUpdateAmount(numericValue);
  };

  const handleBlur = () => {
    // Format to 2 decimal places on blur
    const numericValue = parseFloat(amountText) || 0;
    if (numericValue > 0) {
      setAmountText(numericValue.toFixed(2));
    }
  };

  const bankStyle = getBankStyle(source.name);
  const isOverBalance = source.amount > source.balance;

  return (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100">
      {/* Header: Bank name and remove button */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <View
            className="w-12 h-12 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: `${bankStyle.color}15` }}
          >
            <Ionicons name={bankStyle.icon} size={24} color={bankStyle.color} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900">
              {source.name}
            </Text>
            <Text className="text-sm text-gray-500">
              Available: ${source.balance.toFixed(2)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={onRemove}
          className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center ml-2"
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={22} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Amount input */}
      <View className="flex-row items-center">
        <Text className="text-2xl font-semibold text-gray-900 mr-2">$</Text>
        <TextInput
          value={amountText}
          onChangeText={handleAmountChange}
          onBlur={handleBlur}
          placeholder="0.00"
          placeholderTextColor="#9CA3AF"
          keyboardType="decimal-pad"
          className={`flex-1 text-2xl font-semibold ${
            isOverBalance ? 'text-red-500' : 'text-gray-900'
          }`}
          style={{ fontSize: 24 }}
        />
      </View>

      {/* Error message if over balance */}
      {isOverBalance && (
        <View className="mt-2 flex-row items-center">
          <Ionicons name="alert-circle" size={16} color="#EF4444" />
          <Text className="text-sm text-red-500 ml-1">
            Amount exceeds available balance
          </Text>
        </View>
      )}
    </View>
  );
}
