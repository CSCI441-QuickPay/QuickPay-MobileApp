import { useState, useRef, useEffect } from "react";
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
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import FavoriteModel from "@/models/FavoriteModel";
import UserModel from "@/models/UserModel";
import { useUser } from "@clerk/clerk-expo";

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

  // Verify account number and fetch account holder details
  const handleVerifyAccount = async () => {
    if (!accountNumber.trim()) {
      Alert.alert("Error", "Please enter an account number");
      return;
    }

    setLoading(true);
    try {
      const accountHolder = await FavoriteModel.getAccountHolderByAccountNumber(accountNumber.trim());

      if (!accountHolder) {
        Alert.alert("Account Not Found", "No user found with this account number");
        setVerified(false);
        setAccountHolderName("");
      } else {
        setAccountHolderName(accountHolder.name);
        setVerified(true);
        Alert.alert("Account Verified", `Account holder: ${accountHolder.name}`);
        // Auto-focus nickname field
        nicknameRef.current?.focus();
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
      if (editingContact && onUpdate) {
        // Update existing favorite
        await FavoriteModel.updateNickname(editingContact.id, nickname.trim());

        const updatedFavorite: FavoriteContact = {
          id: editingContact.id,
          accountNumber: accountNumber.trim(),
          accountHolderName,
          nickname: nickname.trim() || undefined,
        };
        onUpdate(updatedFavorite);
      } else {
        // Check for duplicates before creating
        const isDuplicate = await FavoriteModel.isFavorite(user.id, accountNumber.trim());
        if (isDuplicate) {
          Alert.alert("Duplicate", "This contact is already in your favorites");
          setLoading(false);
          return;
        }

        // Create new favorite
        const favorite = await FavoriteModel.create(
          user.id,
          accountNumber.trim(),
          nickname.trim() || undefined
        );

        const newFavorite: FavoriteContact = {
          id: favorite.id!,
          accountNumber: favorite.accountNumber,
          accountHolderName: favorite.accountHolderName,
          accountHolderProfile: favorite.accountHolderProfile,
          nickname: favorite.nickname,
        };
        onAdd(newFavorite);
      }

      resetForm();
      onClose();
    } catch (err: any) {
      console.error("Error saving favorite:", err);
      Alert.alert("Error", err.message || "Failed to save favorite");
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
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Header */}
            <View className="px-6 pt-6 pb-4 border-b border-gray-200">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 rounded-full bg-[#f0fdf4] items-center justify-center mr-3">
                    <Ionicons name="person-add-outline" size={24} color="#00332d" />
                  </View>
                  <Text className="text-2xl font-extrabold text-primary">
                    {editingContact ? "Edit Contact" : "Add Contact"}
                  </Text>
                </View>
                <TouchableOpacity onPress={handleClose} activeOpacity={0.7}>
                  <Ionicons name="close" size={28} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>

            <View className="px-6 py-6">
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
                        setAccountNumber(text);
                        setVerified(false);
                        setAccountHolderName("");
                      }}
                      keyboardType="numeric"
                      returnKeyType="done"
                      onSubmitEditing={handleVerifyAccount}
                      editable={!editingContact}
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
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" style={{ marginRight: 8 }} />
                    <Text className="text-sm font-semibold text-green-700">
                      Account holder: {accountHolderName}
                    </Text>
                  </View>
                )}
              </View>

              {/* Nickname */}
              <View className="mb-6">
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
                    onChangeText={setNickname}
                    returnKeyType="done"
                    onFocus={() => setNicknameFocused(true)}
                    onBlur={() => setNicknameFocused(false)}
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
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleSave}
                className="rounded-2xl overflow-hidden shadow-lg"
                style={{ height: 56 }}
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
                    {editingContact ? "Save Changes" : "Add Favorite"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Cancel Button */}
              <TouchableOpacity onPress={handleClose} className="items-center py-4 mt-2" activeOpacity={0.7}>
                <Text className="text-gray-600 text-base font-semibold">Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
