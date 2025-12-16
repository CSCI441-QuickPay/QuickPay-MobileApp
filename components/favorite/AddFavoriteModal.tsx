/**
 * written by: Team QuickPay
 * tested by: Team QuickPay
 * debugged by: Team QuickPay
 * Notes: Contributions were shared, see GitHub history for commit details.
 * Unit Tests for UserSyncService
 */
import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import FavoriteModel from "@/models/FavoriteModel";
import UserModel from "@/models/UserModel";
import { useUser } from "@clerk/clerk-expo";
import { getInitials, getProfileColor } from "@/utils/profileUtils";
import { supabase } from "@/config/supabaseConfig";

export interface FavoriteContact {
  id: string;
  accountNumber: string;
  accountHolderName?: string;
  accountHolderProfile?: string;
  nickname?: string;
}

interface AddFavoriteModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (favorite: FavoriteContact) => void;
  onUpdate?: (favorite: FavoriteContact) => void;
  editingContact?: FavoriteContact | null;
}

export default function AddFavoriteModal({
  visible,
  onClose,
  onAdd,
  onUpdate,
  editingContact,
}: AddFavoriteModalProps) {
  const { user } = useUser();
  const [accountNumber, setAccountNumber] = useState("");
  const [nickname, setNickname] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  const [accountFocused, setAccountFocused] = useState(false);
  const [nicknameFocused, setNicknameFocused] = useState(false);

  // Refs for auto advancing
  const nicknameRef = useRef<TextInput>(null);

  useEffect(() => {
    if (editingContact) {
      setAccountNumber(editingContact.accountNumber || "");
      setNickname(editingContact.nickname || "");
      setAccountHolderName(editingContact.accountHolderName || "");
      setVerified(!!editingContact.accountHolderName);
    } else {
      resetForm();
    }
  }, [editingContact, visible]);

  const resetForm = () => {
    setAccountNumber("");
    setNickname("");
    setAccountHolderName("");
    setVerified(false);
  };

  // Helper function to get user's database UUID from Clerk ID
  const getUserDatabaseId = async (clerkId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', clerkId)
        .single();

      if (error || !data) {
        console.error('Error fetching user database ID:', error);
        return null;
      }

      return data.id;
    } catch (err) {
      console.error('Error in getUserDatabaseId:', err);
      return null;
    }
  };

  // Verify account number and fetch account holder details
  const handleVerifyAccount = async () => {
    // Validate account number is not empty
    if (!accountNumber.trim()) {
      Alert.alert("Validation Error", "Please enter an account number");
      return;
    }

    // Validate account number contains only digits
    if (!/^\d+$/.test(accountNumber.trim())) {
      Alert.alert("Invalid Input", "Account number must contain only numbers (0-9)");
      return;
    }

    // Validate account number length (assuming reasonable length between 6-20 digits)
    const trimmedAccount = accountNumber.trim();
    if (trimmedAccount.length < 6) {
      Alert.alert("Invalid Input", "Account number must be at least 6 digits long");
      return;
    }
    if (trimmedAccount.length > 20) {
      Alert.alert("Invalid Input", "Account number cannot exceed 20 digits");
      return;
    }

    setLoading(true);
    try {
      const accountHolder = await FavoriteModel.getAccountHolderByAccountNumber(trimmedAccount);

      if (!accountHolder) {
        Alert.alert("Account Not Found", "No user found with this account number. Please verify the number and try again.");
        setVerified(false);
        setAccountHolderName("");
      } else {
        setAccountHolderName(accountHolder.name);
        setVerified(true);
        // No popup - just auto-focus nickname field for smooth UX
        setTimeout(() => {
          nicknameRef.current?.focus();
        }, 100);
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to verify account");
      setVerified(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!accountNumber.trim()) {
      Alert.alert("Error", "Please enter an account number");
      return;
    }

    if (!verified) {
      Alert.alert("Error", "Please verify the account number first");
      return;
    }

    if (!user) {
      Alert.alert("Error", "You must be logged in");
      return;
    }

    setLoading(true);
    try {
      // Get user's database UUID from Clerk ID
      const userDatabaseId = await getUserDatabaseId(user.id);
      if (!userDatabaseId) {
        Alert.alert("Error", "Could not find your user account. Please try logging in again.");
        setLoading(false);
        return;
      }

      if (editingContact && onUpdate) {
        // Update existing favorite
        console.log("Updating favorite...", editingContact.id);
        await FavoriteModel.updateNickname(editingContact.id, nickname.trim());

        const updatedFavorite: FavoriteContact = {
          id: editingContact.id,
          accountNumber: accountNumber.trim(),
          accountHolderName,
          nickname: nickname.trim() || undefined,
        };
        onUpdate(updatedFavorite);
        console.log("Favorite updated successfully");
      } else {
        // Check for duplicates before creating
        console.log("Checking for duplicates...", { userDatabaseId, accountNumber: accountNumber.trim() });
        const isDuplicate = await FavoriteModel.isFavorite(userDatabaseId, accountNumber.trim());
        if (isDuplicate) {
          Alert.alert("Duplicate", "This contact is already in your favorites");
          setLoading(false);
          return;
        }

        // Create new favorite
        console.log("Creating new favorite...", { userDatabaseId, accountNumber: accountNumber.trim(), nickname: nickname.trim() });
        const favorite = await FavoriteModel.create(
          userDatabaseId,
          accountNumber.trim(),
          nickname.trim() || undefined
        );

        console.log("Favorite created:", favorite);

        const newFavorite: FavoriteContact = {
          id: favorite.id!,
          accountNumber: favorite.accountNumber,
          accountHolderName: favorite.accountHolderName,
          accountHolderProfile: favorite.accountHolderProfile,
          nickname: favorite.nickname,
        };

        console.log("Calling onAdd with:", newFavorite);
        onAdd(newFavorite);
        console.log("onAdd completed");
      }

      resetForm();
      onClose();
    } catch (err: any) {
      console.error("Error saving favorite - Full error:", err);
      console.error("Error message:", err.message);
      console.error("Error stack:", err.stack);
      Alert.alert("Save Failed", err.message || "Failed to save favorite. Please check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="bg-white rounded-t-3xl"
          style={{ maxHeight: "85%" }}
        >
          {/* Header */}
          <View className="px-6 pt-6 pb-4">
            <View className="flex-row items-center justify-between">
              <View className="w-12 h-12 rounded-full bg-[#F3F4F6] items-center justify-center mr-3">
                <Ionicons name="person-add-outline" size={24} color="#00332d" />
              </View>

              <View className="flex-1">
                <Text className="text-xl font-bold text-black">
                  {editingContact ? "Edit Contact" : "Add Contact"}
                </Text>
                <Text className="text-xs text-gray-500 mt-0.5">
                  {editingContact ? "Update contact information" : "Add a new contact to your favorites"}
                </Text>
              </View>

              <TouchableOpacity onPress={handleClose} activeOpacity={0.7} className="ml-2">
                <Ionicons name="close-circle" size={32} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="px-6 pb-6">
              {/* Account Number */}
              <View className="mb-5">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Account Number *</Text>
                <View className="flex-row items-center gap-2">
                  <View
                    className="flex-1 flex-row items-center border-2 rounded-2xl px-4 border-gray-300 bg-white"
                    style={{ height: 56 }}
                  >
                    <Ionicons
                      name="card-outline"
                      size={22}
                      color="#9CA3AF"
                      style={{ marginRight: 12 }}
                    />
                    <TextInput
                      placeholder="Enter account number"
                      placeholderTextColor="#9CA3AF"
                      value={accountNumber}
                      onChangeText={(text) => {
                        // Only allow numeric input
                        const numericOnly = text.replace(/[^0-9]/g, '');
                        setAccountNumber(numericOnly);
                        setVerified(false);
                        setAccountHolderName("");
                      }}
                      keyboardType="numeric"
                      returnKeyType="done"
                      onSubmitEditing={handleVerifyAccount}
                      editable={!editingContact}
                      maxLength={20}
                      style={{
                        flex: 1,
                        fontSize: 17,
                        fontWeight: "500",
                        color: editingContact ? "#9CA3AF" : "#111827",
                      }}
                    />
                    {verified && (
                      <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                    )}
                  </View>
                  {!editingContact && (
                    <TouchableOpacity
                      onPress={handleVerifyAccount}
                      disabled={loading || !accountNumber.trim()}
                      className={`rounded-2xl px-4 ${
                        loading || !accountNumber.trim() ? "bg-gray-300" : "bg-[#00332d]"
                      }`}
                      style={{ height: 56, justifyContent: "center" }}
                      activeOpacity={0.8}
                    >
                      {loading ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <Text className="text-white font-bold text-sm">Verify</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
                {verified && accountHolderName && (
                  <View className="mt-3 bg-green-50 border border-green-200 rounded-xl p-3 flex-row items-center">
                    {/* Profile Image */}
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: getProfileColor(accountHolderName) }}
                    >
                      <Text className="text-white text-sm font-bold">
                        {getInitials(accountHolderName)}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs text-green-600 mb-0.5">Verified Account</Text>
                      <Text className="text-sm font-semibold text-green-700">
                        {accountHolderName}
                      </Text>
                    </View>
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  </View>
                )}
              </View>

              {/* Nickname */}
              <View className="mb-5">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Nickname (Optional)</Text>
                <View
                  className={`flex-row items-center border-2 rounded-2xl px-4 ${
                    nicknameFocused ? "border-[#00332d] bg-[#f5fdfc]" : "border-gray-300 bg-white"
                  }`}
                  style={{ height: 56 }}
                >
                  <Ionicons
                    name="pricetag-outline"
                    size={22}
                    color={nicknameFocused ? "#00332d" : "#9CA3AF"}
                    style={{ marginRight: 12 }}
                  />
                  <TextInput
                    ref={nicknameRef}
                    placeholder="e.g., Mom, Dad, Friend"
                    placeholderTextColor="#9CA3AF"
                    value={nickname}
                    onChangeText={(text) => {
                      // Allow letters, spaces, and common characters, limit length
                      const sanitized = text.replace(/[^a-zA-Z0-9\s'-]/g, '');
                      if (sanitized.length <= 30) {
                        setNickname(sanitized);
                      }
                    }}
                    returnKeyType="done"
                    onFocus={() => setNicknameFocused(true)}
                    onBlur={() => setNicknameFocused(false)}
                    maxLength={30}
                    style={{
                      flex: 1,
                      fontSize: 17,
                      fontWeight: "500",
                      color: "#111827",
                    }}
                  />
                </View>
              </View>

              {/* Save Button */}
              <View className="pb-6">
                {!verified && !editingContact && (
                  <Text className="text-xs text-gray-500 mb-2 text-center">
                    Please verify the account number first
                  </Text>
                )}
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={handleSave}
                  disabled={!verified || loading}
                  className="rounded-2xl overflow-hidden shadow-lg"
                  style={{ height: 56, opacity: (!verified || loading) ? 0.5 : 1 }}
                >
                  <LinearGradient
                    colors={(!verified || loading) ? ["#9CA3AF", "#9CA3AF"] : ["#00332d", "#005248"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {loading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-white font-bold text-base tracking-wide">
                        {editingContact ? "Save Changes" : "Add Favorite"}
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>

          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
