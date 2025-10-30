import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import BottomNav from "@/components/BottomNav";
import AddFavoriteModal, { FavoriteContact } from "@/components/favorite/AddFavoriteModal";

// Get initials from name
const getInitials = (name: string) => {
  const names = name.split(" ");
  if (names.length >= 2) {
    return `${names[0][0]}${names[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

// Get random pastel color for avatar
const getAvatarColor = (id: string) => {
  const colors = [
    { bg: "#DBEAFE", text: "#2563EB" },
    { bg: "#D1FAE5", text: "#059669" },
    { bg: "#FEF3C7", text: "#D97706" },
    { bg: "#FCE7F3", text: "#DB2777" },
    { bg: "#E0E7FF", text: "#4F46E5" },
    { bg: "#FED7AA", text: "#EA580C" },
  ];
  const index = parseInt(id) % colors.length;
  return colors[index];
};

export default function FavoriteScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteContact[]>([
    {
      id: "1",
      name: "John Doe",
      phoneNumber: "(555) 123-4567",
      email: "john@example.com",
      nickname: "Dad",
    },
    {
      id: "2",
      name: "Jane Smith",
      phoneNumber: "(555) 987-6543",
      email: "jane@example.com",
    },
    {
      id: "3",
      name: "Michael Johnson",
      email: "michael@example.com",
      nickname: "Mike",
    },
    {
      id: "4",
      name: "Emily Davis",
      phoneNumber: "(555) 456-7890",
      nickname: "Mom",
    },
  ]);

  // Filter favorites based on search
  const filteredFavorites = favorites.filter(
    (fav) =>
      fav.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fav.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fav.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fav.phoneNumber?.includes(searchQuery)
  );

  const handleAddFavorite = (newFavorite: FavoriteContact) => {
    setFavorites([...favorites, newFavorite]);
    Alert.alert("Success", `${newFavorite.name} has been added to your favorites`);
  };

  const handleDeleteFavorite = (id: string) => {
    const favorite = favorites.find((f) => f.id === id);
    Alert.alert(
      "Remove Contact",
      `Are you sure you want to remove ${favorite?.nickname || favorite?.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setFavorites(favorites.filter((f) => f.id !== id));
          },
        },
      ]
    );
  };

  const handleFavoritePress = (favorite: FavoriteContact) => {
    if (isEditMode) return; // Don't open details in edit mode
    
    // Navigate to transfer screen with contact info
    Alert.alert(
      "Send Money",
      `Send money to ${favorite.nickname || favorite.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          onPress: () => {
            // Navigate to transfer screen - pass contact data
            console.log("Transfer to:", favorite);
            // router.push({ pathname: "/transfer", params: { contactId: favorite.id } });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header Section */}
      <View className="px-6 pt-4 pb-5">
        {/* Title with Edit Button */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center flex-1">
            <View className="w-14 h-14 rounded-full bg-[#f0fdf4] items-center justify-center mr-3">
              <AntDesign name="star" size={28} color="#00332d" />
            </View>
            <View>
              <Text className="text-3xl font-extrabold text-primary">
                Favorites
              </Text>
              <Text className="text-gray-500 text-sm mt-0.5">
                {favorites.length} {favorites.length === 1 ? "contact" : "contacts"}
              </Text>
            </View>
          </View>

          {/* Edit Button (Standard iOS/Android position) */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsEditMode(!isEditMode)}
            className="px-3 py-1.5"
          >
            <Text
              className={`font-semibold text-lg ${
                isEditMode ? "text-green-600" : "text-primary"
              }`}
            >
              {isEditMode ? "Done" : "Edit"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View
          className={`flex-row items-center border-2 rounded-2xl px-4 ${
            searchFocused
              ? "border-[#00332d] bg-[#f5fdfc]"
              : "border-gray-300 bg-white"
          }`}
          style={{ height: 52 }}
        >
          <Ionicons
            name="search-outline"
            size={20}
            color={searchFocused ? "#00332d" : "#9CA3AF"}
            style={{ marginRight: 10 }}
          />
          <TextInput
            placeholder="Search contacts..."
            placeholderTextColor="#9CA3AF"
            className="flex-1"
            style={{
              fontSize: 16,
              fontWeight: "500",
              color: "#111827",
              paddingVertical: 0,
            }}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Favorites List */}
      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {filteredFavorites.length > 0 ? (
          <View className="gap-3">
            {filteredFavorites.map((fav) => {
              const avatarColor = getAvatarColor(fav.id);
              return (
                <TouchableOpacity
                  key={fav.id}
                  activeOpacity={0.7}
                  onPress={() => isEditMode ? handleDeleteFavorite(fav.id) : handleFavoritePress(fav)}
                  className={`flex-row items-center bg-white border-2 rounded-2xl p-4 ${
                    isEditMode ? "border-red-200" : "border-gray-200"
                  }`}
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  {/* Avatar with Initials */}
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: avatarColor.bg }}
                  >
                    <Text
                      className="text-lg font-extrabold"
                      style={{ color: avatarColor.text }}
                    >
                      {getInitials(fav.name)}
                    </Text>
                  </View>

                  {/* Contact Info */}
                  <View className="flex-1">
                    <Text className="text-base font-bold text-primary mb-0.5">
                      {fav.nickname || fav.name}
                    </Text>
                    {fav.nickname && (
                      <Text className="text-sm text-gray-600 font-medium mb-1">
                        {fav.name}
                      </Text>
                    )}
                    <View className="flex-row items-center flex-wrap">
                      {fav.phoneNumber && (
                        <View className="flex-row items-center mr-2">
                          <Ionicons
                            name="call-outline"
                            size={12}
                            color="#9CA3AF"
                            style={{ marginRight: 3 }}
                          />
                          <Text className="text-xs text-gray-500 font-medium">
                            {fav.phoneNumber}
                          </Text>
                        </View>
                      )}
                      {fav.email && (
                        <View className="flex-row items-center">
                          <Ionicons
                            name="mail-outline"
                            size={12}
                            color="#9CA3AF"
                            style={{ marginRight: 3 }}
                          />
                          <Text className="text-xs text-gray-500 font-medium">
                            {fav.email}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Action Icon */}
                  {isEditMode ? (
                    <View className="w-8 h-8 rounded-full bg-red-50 items-center justify-center">
                      <Ionicons name="trash-outline" size={18} color="#DC2626" />
                    </View>
                  ) : (
                    <View className="w-8 h-8 rounded-full bg-[#f0fdf4] items-center justify-center">
                      <Ionicons name="chevron-forward" size={18} color="#00332d" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View className="flex-1 items-center justify-center py-20">
            <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
              <Ionicons
                name={searchQuery ? "search-outline" : "people-outline"}
                size={40}
                color="#9CA3AF"
              />
            </View>
            <Text className="text-gray-900 text-lg font-bold text-center mb-2">
              {searchQuery ? "No contacts found" : "No favorites yet"}
            </Text>
            <Text className="text-gray-500 text-base text-center px-8 mb-6">
              {searchQuery
                ? "Try adjusting your search"
                : "Tap + to add your first contact"}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button (FAB) - Standard position */}
      {!isEditMode && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setModalVisible(true)}
          className="absolute bottom-24 right-6 w-14 h-14 bg-[#00332d] rounded-full items-center justify-center shadow-lg"
          style={{
            shadowColor: "#00332d",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      )}

      {/* Add Favorite Modal */}
      <AddFavoriteModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={handleAddFavorite}
      />

      {/* Bottom Navigation */}
      <BottomNav
        items={[
          {
            label: "Home",
            icon: (color) => <Ionicons name="home" size={34} color={color} />,
            onPress: () => router.push("/home"),
          },
          {
            label: "Budget",
            icon: (color) => (
              <MaterialIcons name="account-tree" size={34} color={color} />
            ),
            onPress: () => router.push("/visual_budget"),
          },
          {
            label: "Scan",
            icon: (color) => <AntDesign name="qrcode" size={40} color={color} />,
            onPress: () => console.log("Go Scan"),
            special: true,
          },
          {
            label: "Favorite",
            icon: (color) => <AntDesign name="star" size={34} color={color} />,
            onPress: () => router.push("/favorite"),
            active: true,
          },
          {
            label: "Profile",
            icon: (color) => <Ionicons name="person" size={34} color={color} />,
            onPress: () => router.push("/profile"),
          },
        ]}
      />
    </SafeAreaView>
  );
}