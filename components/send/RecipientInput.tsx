/**
 * written by: Team QuickPay
 * tested by: Team QuickPay
 * debugged by: Team QuickPay
 * Notes: Contributions were shared, see GitHub history for commit details.
 * Unit Tests for UserSyncService
 */
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { RecipientInfo } from "@/services/PaymentService";
import FavoriteModel from "@/models/FavoriteModel";

interface RecipientInputProps {
  onRecipientSelect: (recipient: RecipientInfo | null) => void;
  onOpenFavorites: () => void;
  currentAccountNumber: string;
  scannedAccountNumber?: string;
  selectedRecipient?: RecipientInfo | null;
}

export default function RecipientInput({
  onRecipientSelect,
  onOpenFavorites,
  currentAccountNumber,
  scannedAccountNumber,
  selectedRecipient,
}: RecipientInputProps) {
  const [accountNumber, setAccountNumber] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validatedRecipient, setValidatedRecipient] =
    useState<RecipientInfo | null>(null);
  const [error, setError] = useState("");

  // Auto-fill when selected from favorites
  useEffect(() => {
    if (
      selectedRecipient &&
      selectedRecipient.accountNumber !== accountNumber
    ) {
      setAccountNumber(selectedRecipient.accountNumber);
      setValidatedRecipient(selectedRecipient);
      setError("");
    }
  }, [selectedRecipient]);

  // Auto-validate when scanned account number is provided
  useEffect(() => {
    if (!scannedAccountNumber) return;

    // Prevent loops
    if (scannedAccountNumber === accountNumber) return;

    // Set input field
    setAccountNumber(scannedAccountNumber);

    // Reset old validation state
    setError("");
    setValidatedRecipient(null);
    onRecipientSelect(null);

    // Auto validate same as manual typing
    validateAccountNumber(scannedAccountNumber);
  }, [scannedAccountNumber]);

  const handleAccountNumberChange = (text: string) => {
    // Only allow numeric input
    const cleaned = text.replace(/[^0-9]/g, "");
    // Limit to 10 digits
    const limited = cleaned.slice(0, 10);
    setAccountNumber(limited);
    setError("");
    setValidatedRecipient(null);
    onRecipientSelect(null);

    // Auto-validate when 10 digits are entered
    if (limited.length === 10) {
      validateAccountNumber(limited);
    }
  };

  const validateAccountNumber = async (accNum: string) => {
    // Validate account number contains only digits
    if (!/^\d+$/.test(accNum)) {
      setError("Account number must contain only numbers");
      return;
    }

    // Validate account number length
    if (accNum.length < 6) {
      setError("Account number must be at least 6 digits");
      return;
    }
    if (accNum.length > 20) {
      setError("Account number cannot exceed 20 digits");
      return;
    }

    if (accNum === currentAccountNumber) {
      setError("You cannot send money to yourself");
      return;
    }

    setIsValidating(true);
    setError("");

    try {
      // Use FavoriteModel directly like AddFavoriteModal does
      const accountHolder = await FavoriteModel.getAccountHolderByAccountNumber(
        accNum
      );

      if (!accountHolder) {
        setError("Account not found");
        setValidatedRecipient(null);
        onRecipientSelect(null);
      } else {
        // Create RecipientInfo object from account holder data
        const recipient: RecipientInfo = {
          accountNumber: accNum,
          firstName: accountHolder.name.split(" ")[0],
          lastName: accountHolder.name.split(" ").slice(1).join(" "),
          email: "", // Not needed for display
          profilePicture: accountHolder.profilePicture,
        };
        setValidatedRecipient(recipient);
        onRecipientSelect(recipient);
      }
    } catch (err) {
      setError("Failed to validate account");
      setValidatedRecipient(null);
      onRecipientSelect(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleScanQR = () => {
    router.push({
      pathname: "/qr_scan",
      params: { returnTo: "send" },
    });
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

  // Generate consistent color for recipient (same logic as send.tsx)
  const generateRecipientColor = (accountNumber: string): string => {
    const colors = [
      "#EF4444",
      "#F59E0B",
      "#10B981",
      "#3B82F6",
      "#8B5CF6",
      "#EC4899",
      "#14B8A6",
      "#F97316",
      "#06B6D4",
      "#6366F1",
    ];

    let hash = 0;
    for (let i = 0; i < accountNumber.length; i++) {
      hash = accountNumber.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const getRecipientColor = (recipient: RecipientInfo) => {
    return (
      recipient.profilePicture ||
      generateRecipientColor(recipient.accountNumber)
    );
  };

  return (
    <View>
      {/* Account number input row with favorites and QR buttons */}
      <View className="flex-row items-start gap-2 mb-3">
        {/* Input field with embedded QR button */}
        <View className="flex-1">
          <View className="flex-row items-center border-2 border-gray-200 rounded-2xl px-4 bg-white">
            <Ionicons name="person-outline" size={20} color="#9CA3AF" />
            <TextInput
              value={accountNumber}
              onChangeText={handleAccountNumberChange}
              placeholder="Account number"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              maxLength={10}
              className="flex-1 py-4 px-3 text-base text-gray-900"
              style={{ fontSize: 16 }}
            />

            {/* QR Scan button inside input */}
            <TouchableOpacity
              onPress={handleScanQR}
              className="w-10 h-10 items-center justify-center rounded-xl bg-gray-100"
              activeOpacity={0.7}
            >
              <Ionicons name="qr-code-outline" size={24} color="#00332d" />
            </TouchableOpacity>
          </View>

          {/* Validation indicator */}
          {isValidating && (
            <View className="mt-2 flex-row items-center">
              <ActivityIndicator size="small" color="#00332d" />
              <Text className="text-sm text-gray-600 ml-2">Validating...</Text>
            </View>
          )}

          {/* Error message */}
          {error && !isValidating && (
            <View className="mt-2 flex-row items-center">
              <Ionicons name="alert-circle" size={16} color="#EF4444" />
              <Text className="text-sm text-red-500 ml-1">{error}</Text>
            </View>
          )}
        </View>

        {/* Favorites button (square, outside input) */}
        <TouchableOpacity
          onPress={onOpenFavorites}
          className="w-14 h-14 items-center justify-center rounded-2xl bg-[#00332d]"
          activeOpacity={0.7}
          style={{ marginTop: 0 }}
        >
          <Ionicons name="star" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Validated recipient display */}
      {validatedRecipient && !error && (
        <View className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-3">
          {/* Name and Account Number */}
          <View className="mb-3">
            <View className="flex-row items-center mb-1">
              <Text className="text-base font-semibold text-gray-900 flex-1">
                {getDisplayName(validatedRecipient)}
              </Text>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            </View>
            <Text className="text-sm text-gray-600">
              Account: {validatedRecipient.accountNumber}
            </Text>
          </View>
          {/* Professional verification message */}
          <View className="pt-3 border-t border-green-200">
            <Text className="text-xs text-gray-700 leading-5">
              Please verify that the account number is correct before
              proceeding.
            </Text>
          </View>
        </View>
      )}

      {/* Help text */}
      {!validatedRecipient && !error && (
        <View className="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <View className="flex-row items-start">
            <Ionicons
              name="information-circle"
              size={18}
              color="#3B82F6"
              style={{ marginTop: 1 }}
            />
            <Text className="text-xs text-blue-800 ml-2 flex-1">
              Enter account number, scan QR, or select from favorites
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
