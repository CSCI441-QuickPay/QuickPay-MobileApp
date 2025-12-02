import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface BankOption {
  id: string;
  type: 'bank' | 'quickpay';
  name: string;
  balance: number;
  accountType?: string;
  mask?: string;
}

// Bank branding matching Visual Budget page
const getBankStyle = (bankName: string) => {
  const name = bankName.toLowerCase();

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

interface BankSourceSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelectBank: (bank: BankOption) => void;
  availableBanks: BankOption[];
  quickPayBalance: number;
  alreadySelectedIds: string[];
}

export default function BankSourceSelector({
  visible,
  onClose,
  onSelectBank,
  availableBanks,
  quickPayBalance,
  alreadySelectedIds,
}: BankSourceSelectorProps) {
  const quickPayOption: BankOption = {
    id: 'quickpay',
    type: 'quickpay',
    name: 'QuickPay Balance',
    balance: quickPayBalance,
  };

  const allOptions = [quickPayOption, ...availableBanks];

  const isSelected = (id: string) => alreadySelectedIds.includes(id);

  const handleSelectBank = (bank: BankOption) => {
    if (isSelected(bank.id)) {
      return; // Already selected
    }
    onSelectBank(bank);
    onClose();
  };

  const formatAccountType = (type?: string) => {
    if (!type) return '';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable
        className="flex-1 bg-black/50 justify-end"
        onPress={onClose}
        activeOpacity={1}
      >
        <Pressable
          className="bg-white rounded-t-3xl max-h-[80%]"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Handle bar */}
          <View className="items-center py-3">
            <View className="w-12 h-1 bg-gray-300 rounded-full" />
          </View>

          {/* Header */}
          <View className="px-6 pb-4 border-b border-gray-100">
            <Text className="text-xl font-bold text-gray-900">
              Select Payment Source
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              Choose where to send money from
            </Text>
          </View>

          {/* Bank list */}
          <ScrollView className="px-6 py-2" showsVerticalScrollIndicator={false}>
            {allOptions.map((option) => {
              const selected = isSelected(option.id);
              const disabled = selected || option.balance <= 0;
              const bankStyle = getBankStyle(option.name);

              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => handleSelectBank(option)}
                  disabled={disabled}
                  className={`py-4 border-b border-gray-100 ${
                    disabled ? 'opacity-50' : ''
                  }`}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center justify-between">
                    {/* Left: Icon and info */}
                    <View className="flex-row items-center flex-1">
                      <View
                        className="w-12 h-12 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: `${bankStyle.color}15` }}
                      >
                        <Ionicons
                          name={bankStyle.icon}
                          size={24}
                          color={bankStyle.color}
                        />
                      </View>

                      <View className="flex-1">
                        <Text className="text-base font-semibold text-gray-900">
                          {option.name}
                        </Text>
                        {option.accountType && (
                          <Text className="text-sm text-gray-500">
                            {formatAccountType(option.accountType)}
                            {option.mask && ` •••• ${option.mask}`}
                          </Text>
                        )}
                        <Text className="text-sm text-gray-600 mt-1">
                          Available: ${option.balance.toFixed(2)}
                        </Text>
                      </View>
                    </View>

                    {/* Right: Checkmark or chevron */}
                    {selected ? (
                      <View className="w-6 h-6 rounded-full bg-[#00332d] items-center justify-center">
                        <Ionicons name="checkmark" size={16} color="white" />
                      </View>
                    ) : disabled ? (
                      <Ionicons name="lock-closed" size={20} color="#9CA3AF" />
                    ) : (
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#9CA3AF"
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Footer note */}
          <View className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <Text className="text-xs text-gray-500 text-center">
              You can split payments across multiple sources
            </Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
