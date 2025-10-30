import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface SplitTransferModalProps {
  visible: boolean;
  onClose: () => void;
  contactName: string;
  onConfirm: (amount: number, bankSplits: BankSplit[]) => void;
}

export interface BankSplit {
  id: string;
  bankName: string;
  accountLast4: string;
  percentage: number;
  amount: number;
}

const USER_BANKS = [
  { id: "1", name: "Chase Checking", last4: "4567", icon: "card-outline" },
  { id: "2", name: "Bank of America Savings", last4: "8901", icon: "wallet-outline" },
  { id: "3", name: "Wells Fargo Credit", last4: "2345", icon: "card" },
  { id: "4", name: "Citibank Investment", last4: "6789", icon: "trending-up-outline" },
];

export default function SplitTransferModal({
  visible,
  onClose,
  contactName,
  onConfirm,
}: SplitTransferModalProps) {
  const [totalAmount, setTotalAmount] = useState("");
  const [amountFocused, setAmountFocused] = useState(false);
  const [selectedBanks, setSelectedBanks] = useState<string[]>([USER_BANKS[0].id]);
  const [showBankPicker, setShowBankPicker] = useState(false);

  const resetForm = () => {
    setTotalAmount("");
    setSelectedBanks([USER_BANKS[0].id]);
    setShowBankPicker(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleBankSelection = (bankId: string) => {
    if (selectedBanks.includes(bankId)) {
      if (selectedBanks.length > 1) {
        setSelectedBanks(selectedBanks.filter((id) => id !== bankId));
      } else {
        Alert.alert("Error", "You must select at least one bank account");
      }
    } else {
      setSelectedBanks([...selectedBanks, bankId]);
    }
  };

  const calculateSplits = (): BankSplit[] => {
    const amount = parseFloat(totalAmount);
    const splitCount = selectedBanks.length;
    const percentagePerBank = 100 / splitCount;
    const amountPerBank = amount / splitCount;

    return selectedBanks.map((bankId, index) => {
      const bank = USER_BANKS.find((b) => b.id === bankId)!;
      // Handle rounding for last bank
      const isLast = index === selectedBanks.length - 1;
      const bankAmount = isLast
        ? amount - amountPerBank * (splitCount - 1)
        : amountPerBank;

      return {
        id: bankId,
        bankName: bank.name,
        accountLast4: bank.last4,
        percentage: Math.round(percentagePerBank * 100) / 100,
        amount: Math.round(bankAmount * 100) / 100,
      };
    });
  };

  const handleConfirm = () => {
    const amount = parseFloat(totalAmount);

    if (!totalAmount || isNaN(amount) || amount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    if (selectedBanks.length === 0) {
      Alert.alert("Error", "Please select at least one bank account");
      return;
    }

    const splits = calculateSplits();
    onConfirm(amount, splits);
    resetForm();
    onClose();
  };

  const formatCurrency = (value: string) => {
    // Remove non-numeric characters except decimal point
    const cleaned = value.replace(/[^0-9.]/g, "");
    
    // Prevent multiple decimal points
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      return parts[0] + "." + parts.slice(1).join("");
    }
    
    // Limit to 2 decimal places
    if (parts[1]?.length > 2) {
      return parts[0] + "." + parts[1].substring(0, 2);
    }
    
    return cleaned;
  };

  const handleAmountChange = (text: string) => {
    const formatted = formatCurrency(text);
    setTotalAmount(formatted);
  };

  const amount = parseFloat(totalAmount) || 0;
  const splits = amount > 0 ? calculateSplits() : [];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="bg-white rounded-t-3xl"
          style={{ maxHeight: "90%" }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View className="px-6 pt-6 pb-4 border-b border-gray-200">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center flex-1">
                  <View className="w-12 h-12 rounded-full bg-[#f0fdf4] items-center justify-center mr-3">
                    <Ionicons name="send" size={24} color="#00332d" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-2xl font-extrabold text-primary">
                      Send Money
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      To {contactName}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={handleClose} activeOpacity={0.7}>
                  <Ionicons name="close" size={28} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>

            <View className="px-6 py-6">
              {/* Amount Input */}
              <View className="mb-6">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Total Amount *
                </Text>
                <View
                  className={`flex-row items-center border-2 rounded-2xl px-4 ${
                    amountFocused
                      ? "border-[#00332d] bg-[#f5fdfc]"
                      : "border-gray-300 bg-white"
                  }`}
                  style={{ height: 64 }}
                >
                  <Text className="text-2xl font-bold text-gray-600 mr-2">$</Text>
                  <TextInput
                    placeholder="0.00"
                    placeholderTextColor="#9CA3AF"
                    value={totalAmount}
                    onChangeText={handleAmountChange}
                    keyboardType="decimal-pad"
                    onFocus={() => setAmountFocused(true)}
                    onBlur={() => setAmountFocused(false)}
                    style={{
                      flex: 1,
                      fontSize: 28,
                      fontWeight: "700",
                      color: "#111827",
                    }}
                  />
                </View>
              </View>

              {/* Split Across Banks */}
              <View className="mb-6">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-sm font-semibold text-gray-700">
                    Split Across Banks
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowBankPicker(!showBankPicker)}
                    activeOpacity={0.7}
                    className="flex-row items-center"
                  >
                    <Text className="text-primary font-semibold text-sm mr-1">
                      {showBankPicker ? "Hide" : "Select"}
                    </Text>
                    <Ionicons
                      name={showBankPicker ? "chevron-up" : "chevron-down"}
                      size={18}
                      color="#00332d"
                    />
                  </TouchableOpacity>
                </View>

                {/* Bank Selection */}
                {showBankPicker && (
                  <View className="bg-gray-50 rounded-2xl p-3 mb-4">
                    {USER_BANKS.map((bank) => {
                      const isSelected = selectedBanks.includes(bank.id);
                      return (
                        <TouchableOpacity
                          key={bank.id}
                          onPress={() => toggleBankSelection(bank.id)}
                          activeOpacity={0.7}
                          className={`flex-row items-center p-3 rounded-xl mb-2 ${
                            isSelected ? "bg-[#f0fdf4] border-2 border-[#00332d]" : "bg-white"
                          }`}
                        >
                          <View
                            className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${
                              isSelected ? "border-[#00332d] bg-[#00332d]" : "border-gray-300"
                            }`}
                          >
                            {isSelected && (
                              <Ionicons name="checkmark" size={16} color="white" />
                            )}
                          </View>
                          <Ionicons
                            name={bank.icon as any}
                            size={24}
                            color={isSelected ? "#00332d" : "#9CA3AF"}
                            style={{ marginRight: 12 }}
                          />
                          <View className="flex-1">
                            <Text
                              className={`font-semibold ${
                                isSelected ? "text-primary" : "text-gray-700"
                              }`}
                            >
                              {bank.name}
                            </Text>
                            <Text className="text-sm text-gray-500">
                              •••• {bank.last4}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* Selected Banks Count */}
                <View className="bg-blue-50 rounded-2xl px-4 py-3 flex-row items-center">
                  <Ionicons
                    name="information-circle"
                    size={20}
                    color="#3B82F6"
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-sm text-blue-700 flex-1">
                    Splitting across {selectedBanks.length}{" "}
                    {selectedBanks.length === 1 ? "account" : "accounts"}
                  </Text>
                </View>
              </View>

              {/* Split Preview */}
              {amount > 0 && splits.length > 0 && (
                <View className="mb-6">
                  <Text className="text-sm font-semibold text-gray-700 mb-3">
                    Split Preview
                  </Text>
                  <View className="bg-gray-50 rounded-2xl p-4">
                    {splits.map((split, index) => (
                      <View
                        key={split.id}
                        className={`flex-row items-center justify-between py-3 ${
                          index < splits.length - 1 ? "border-b border-gray-200" : ""
                        }`}
                      >
                        <View className="flex-1">
                          <Text className="text-base font-semibold text-gray-900">
                            {split.bankName}
                          </Text>
                          <Text className="text-sm text-gray-500">
                            •••• {split.accountLast4}
                          </Text>
                        </View>
                        <View className="items-end">
                          <Text className="text-lg font-bold text-primary">
                            ${split.amount.toFixed(2)}
                          </Text>
                          <Text className="text-xs text-gray-500">
                            {split.percentage.toFixed(1)}%
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Confirm Button */}
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleConfirm}
                disabled={!totalAmount || parseFloat(totalAmount) <= 0}
                className="rounded-2xl overflow-hidden shadow-lg mb-3"
                style={{
                  height: 56,
                  opacity: !totalAmount || parseFloat(totalAmount) <= 0 ? 0.5 : 1,
                }}
              >
                <LinearGradient
                  colors={["#00332d", "#005248"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text className="text-white font-bold text-base tracking-wide">
                    Confirm Transfer
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Cancel Button */}
              <TouchableOpacity
                onPress={handleClose}
                className="items-center py-3"
                activeOpacity={0.7}
              >
                <Text className="text-gray-600 text-base font-semibold">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}