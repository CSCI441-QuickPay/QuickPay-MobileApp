import { FavoriteContact } from "@/data/favorites"; // <- use shared type
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface AddFavoriteModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (favorite: FavoriteContact) => void;
  onUpdate?: (favorite: FavoriteContact) => void;
  editingContact?: FavoriteContact | null;
}

export default function AddFavoriteModal({ visible, onClose, onAdd, onUpdate, editingContact }: AddFavoriteModalProps) {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");

  const [nameFocused, setNameFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [nicknameFocused, setNicknameFocused] = useState(false);

  // Refs for auto advancing
  const phoneRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const nicknameRef = useRef<TextInput>(null);

  useEffect(() => {
    if (editingContact) {
      setName(editingContact.name || "");
      setPhoneNumber(editingContact.phoneNumber || "");
      setEmail(editingContact.email || "");
      setNickname(editingContact.nickname || "");
    } else {
      resetForm();
    }
  }, [editingContact, visible]);

  const resetForm = () => {
    setName("");
    setPhoneNumber("");
    setEmail("");
    setNickname("");
  };

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a name");
      return;
    }

    if (!phoneNumber.trim() && !email.trim()) {
      Alert.alert("Error", "Please enter either a phone number or email");
      return;
    }

    const newFavorite: FavoriteContact = {
      id: editingContact ? editingContact.id : Date.now().toString(),
      name: name.trim(),
      phoneNumber: phoneNumber.trim() || undefined,
      email: email.trim() || undefined,
      nickname: nickname.trim() || undefined,
    };

    if (editingContact && onUpdate) {
      onUpdate(newFavorite);
    } else {
      onAdd(newFavorite);
    }

    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="bg-white rounded-t-3xl" style={{ maxHeight: "85%" }}>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Header */}
            <View className="px-6 pt-6 pb-4 border-b border-gray-200">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 rounded-full bg-[#f0fdf4] items-center justify-center mr-3">
                    <Ionicons name="person-add-outline" size={24} color="#00332d" />
                  </View>
                  <Text className="text-2xl font-extrabold text-primary">{editingContact ? "Edit Contact" : "Add Contact"}</Text>
                </View>
                <TouchableOpacity onPress={handleClose} activeOpacity={0.7}>
                  <Ionicons name="close" size={28} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>

            <View className="px-6 py-6">
              {/* Name */}
              <View className="mb-5">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Full Name *</Text>
                <View className={`flex-row items-center border-2 rounded-2xl px-4 ${nameFocused ? "border-[#00332d] bg-[#f5fdfc]" : "border-gray-300 bg-white"}`} style={{ height: 56 }}>
                  <Ionicons name="person-outline" size={22} color={nameFocused ? "#00332d" : "#9CA3AF"} style={{ marginRight: 12 }} />
                  <TextInput placeholder="John Doe" placeholderTextColor="#9CA3AF" value={name} onChangeText={setName} onFocus={() => setNameFocused(true)} onBlur={() => setNameFocused(false)} returnKeyType="next" onSubmitEditing={() => phoneRef.current?.focus()} blurOnSubmit={false} style={{ flex: 1, fontSize: 17, fontWeight: "500", color: "#111827" }} />
                </View>
              </View>

              {/* Phone Number */}
              <View className="mb-5">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Phone Number</Text>
                <View className={`flex-row items-center border-2 rounded-2xl px-4 ${phoneFocused ? "border-[#00332d] bg-[#f5fdfc]" : "border-gray-300 bg-white"}`} style={{ height: 56 }}>
                  <Ionicons name="call-outline" size={22} color={phoneFocused ? "#00332d" : "#9CA3AF"} style={{ marginRight: 12 }} />
                  <TextInput ref={phoneRef} placeholder="(555) 123-4567" placeholderTextColor="#9CA3AF" value={phoneNumber} onChangeText={handlePhoneChange} keyboardType="phone-pad" maxLength={14} onFocus={() => setPhoneFocused(true)} onBlur={() => setPhoneFocused(false)} returnKeyType="next" onSubmitEditing={() => emailRef.current?.focus()} blurOnSubmit={false} style={{ flex: 1, fontSize: 17, fontWeight: "500", color: "#111827" }} />
                </View>
              </View>

              {/* Email */}
              <View className="mb-5">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Email Address</Text>
                <View className={`flex-row items-center border-2 rounded-2xl px-4 ${emailFocused ? "border-[#00332d] bg-[#f5fdfc]" : "border-gray-300 bg-white"}`} style={{ height: 56 }}>
                  <Ionicons name="mail-outline" size={22} color={emailFocused ? "#00332d" : "#9CA3AF"} style={{ marginRight: 12 }} />
                  <TextInput ref={emailRef} placeholder="john@example.com" placeholderTextColor="#9CA3AF" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" returnKeyType="next" onSubmitEditing={() => nicknameRef.current?.focus()} blurOnSubmit={false} onFocus={() => setEmailFocused(true)} onBlur={() => setEmailFocused(false)} style={{ flex: 1, fontSize: 17, fontWeight: "500", color: "#111827" }} />
                </View>
              </View>

              {/* Nickname */}
              <View className="mb-6">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Nickname (Optional)</Text>
                <View className={`flex-row items-center border-2 rounded-2xl px-4 ${nicknameFocused ? "border-[#00332d] bg-[#f5fdfc]" : "border-gray-300 bg-white"}`} style={{ height: 56 }}>
                  <Ionicons name="pricetag-outline" size={22} color={nicknameFocused ? "#00332d" : "#9CA3AF"} style={{ marginRight: 12 }} />
                  <TextInput ref={nicknameRef} placeholder="e.g., Mom, Dad, Friend" placeholderTextColor="#9CA3AF" value={nickname} onChangeText={setNickname} returnKeyType="done" onFocus={() => setNicknameFocused(true)} onBlur={() => setNicknameFocused(false)} style={{ flex: 1, fontSize: 17, fontWeight: "500", color: "#111827" }} />
                </View>
              </View>

              {/* Save Button */}
              <TouchableOpacity activeOpacity={0.9} onPress={handleSave} className="rounded-2xl overflow-hidden shadow-lg" style={{ height: 56 }}>
                <LinearGradient colors={["#00332d", "#005248"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                  <Text className="text-white font-bold text-base tracking-wide">{editingContact ? "Save Changes" : "Add Contact"}</Text>
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
