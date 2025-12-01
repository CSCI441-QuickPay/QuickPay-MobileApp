import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { FavoriteContact } from "./AddFavoriteModal";
import FavoriteModel from "@/models/FavoriteModel";
import UnifiedModalHeader from "@/components/shared/UnifiedModalHeader";
import { getInitials, getProfileColor } from "@/utils/profileUtils";

interface EditFavoriteModalProps {
  visible: boolean;
  onClose: () => void;
  onUpdate: (favorite: FavoriteContact) => void;
  onDelete: (id: string) => void;
  contact: FavoriteContact | null;
}

export default function EditFavoriteModal({
  visible,
  onClose,
  onUpdate,
  onDelete,
  contact,
}: EditFavoriteModalProps) {
  const [nickname, setNickname] = useState("");
  const [nicknameFocused, setNicknameFocused] = useState(false);
  const nicknameRef = useRef<TextInput>(null);

  useEffect(() => {
    if (contact) {
      setNickname(contact.nickname || "");
    }
  }, [contact, visible]);

  const handleSave = async () => {
    if (!contact) return;

    try {
      // Update nickname in database
      await FavoriteModel.updateNickname(contact.id, nickname.trim());

      const updatedFavorite: FavoriteContact = {
        id: contact.id,
        accountNumber: contact.accountNumber,
        accountHolderName: contact.accountHolderName,
        accountHolderProfile: contact.accountHolderProfile,
        nickname: nickname.trim() || undefined,
      };

      onUpdate(updatedFavorite);
      onClose();
    } catch (err: any) {
      console.error("Error updating nickname:", err);
      Alert.alert("Error", err.message || "Failed to update nickname");
    }
  };

  const handleDelete = () => {
    if (!contact) return;

    Alert.alert(
      "Delete Contact",
      `Are you sure you want to delete ${contact.nickname || contact.accountHolderName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            onDelete(contact.id);
            onClose();
          },
        },
      ]
    );
  };

  const handleClose = () => {
    onClose();
  };

  if (!contact) return null;

  const initials = getInitials(contact.accountHolderName || "");
  const profileColor = getProfileColor(contact.accountHolderName || "User");

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
            <UnifiedModalHeader
              title="Edit Contact"
              subtitle="Update contact nickname and information"
              icon="create-outline"
              onClose={handleClose}
            />
          </View>

          <View className="px-6 pb-6">
            {/* Contact Info - Read Only */}
            <View className="mb-5 bg-gray-50 rounded-2xl p-4 border-2 border-gray-200">
              <View className="flex-row items-center">
                {/* Profile Image - Larger */}
                <View
                  className="w-14 h-14 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: profileColor }}
                >
                  <Text className="text-white text-lg font-extrabold">
                    {initials}
                  </Text>
                </View>
                {/* Account Holder Info */}
                <View className="flex-1">
                  <Text className="text-base font-bold text-gray-900 mb-1">
                    {contact.accountHolderName}
                  </Text>
                  <View className="flex-row items-center">
                    <Ionicons
                      name="card-outline"
                      size={14}
                      color="#6B7280"
                      style={{ marginRight: 4 }}
                    />
                    <Text className="text-sm text-gray-600 font-medium">
                      {contact.accountNumber}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

              {/* Nickname - Editable */}
              <View className="mb-5">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Nickname (Optional)
                </Text>
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
                    onSubmitEditing={handleSave}
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

              <View className="flex-row gap-2 pb-6">
        {/* Save Button */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleSave}
          className="flex-1 rounded-xl overflow-hidden"
          style={{ height: 44 }}
        >
          <LinearGradient
            colors={["#00332d", "#005248"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <View className="flex-row items-center">
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color="#ccf8f1"
                style={{ marginRight: 4 }}
              />
              <Text className="text-white font-semibold text-sm">Save Changes</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Delete Button */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleDelete}
          className="flex-1 rounded-xl bg-red-50 border border-red-200 items-center justify-center"
          style={{ height: 44 }}
        >
          <View className="flex-row items-center">
            <Ionicons
              name="trash-outline"
              size={16}
              color="#DC2626"
              style={{ marginRight: 4 }}
            />
            <Text className="text-red-600 font-semibold text-sm">Delete</Text>
          </View>
        </TouchableOpacity>
      </View>

          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
