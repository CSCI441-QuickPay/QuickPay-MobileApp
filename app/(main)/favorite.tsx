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
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNav from "@/components/BottomNav";
import AddFavoriteModal, { FavoriteContact } from "@/components/favorite/AddFavoriteModal";
import EditFavoriteModal from "@/components/favorite/EditFavoriteModal";
import FavoriteModel from "@/models/FavoriteModel";
import UserModel from "@/models/UserModel";
import { getInitials, getProfileColor } from "@/utils/profileUtils";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { favoriteContacts } from "@/data/favorites";

export default function FavoriteScreen() {
  const { user } = useUser();
  const { isDemoMode } = useDemoMode();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState<FavoriteContact | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteContact[]>([]);
  const [loading, setLoading] = useState(true);

  // Load favorites from database
  useEffect(() => {
    loadFavorites();
  }, [user, isDemoMode]);

  const loadFavorites = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log(`🔍 Favorites: isDemoMode = ${isDemoMode}`);

      // Get database user UUID from Clerk ID
      const dbUser = await UserModel.getByClerkId(user.id);
      if (!dbUser || !dbUser.id) {
        console.error("User not found in database");
        return;
      }

      // Load favorites from database
      const dbFavorites = await FavoriteModel.getByUserId(dbUser.id);

      // Map to FavoriteContact format
      const mappedFavorites: FavoriteContact[] = dbFavorites.map(fav => ({
        id: fav.id!,
        accountNumber: fav.accountNumber,
        accountHolderName: fav.accountHolderName,
        accountHolderProfile: fav.accountHolderProfile,
        nickname: fav.nickname,
      }));

      // If Demo Mode is ON, merge real favorites + mock favorites
      if (isDemoMode) {
        console.log("🎭 Demo Mode ON - Merging real + mock favorites");

        // Convert mock favorites to match FavoriteContact format used in this component
        // Load cached nicknames from AsyncStorage for each mock favorite
        const mockFavorites: FavoriteContact[] = await Promise.all(
          favoriteContacts.map(async (contact) => {
            const mockId = `mock-${contact.id}`;
            const cacheKey = `mock_favorite_nickname_${mockId}`;
            const cachedNickname = await AsyncStorage.getItem(cacheKey);

            return {
              id: mockId, // Prefix to avoid ID conflicts
              accountNumber: contact.accountNumber,
              accountHolderName: contact.name,
              accountHolderProfile: undefined,
              nickname: cachedNickname || contact.nickname, // Use cached nickname if available
            };
          })
        );

        // Merge: real favorites + mock favorites
        const allFavorites = [...mappedFavorites, ...mockFavorites];
        console.log(`✅ Demo Mode: Total favorites = ${allFavorites.length} (${mappedFavorites.length} real + ${mockFavorites.length} mock)`);
        setFavorites(allFavorites);
      } else {
        // Real Mode - only show database favorites
        console.log(`📊 Real Mode: Showing ${mappedFavorites.length} database favorites only`);
        setFavorites(mappedFavorites);
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
      Alert.alert("Error", "Failed to load favorites");
    } finally {
      setLoading(false);
    }
  };

  // Filter favorites based on search
  const filteredFavorites = favorites.filter(
    (fav) =>
      fav.accountHolderName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fav.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fav.accountNumber?.includes(searchQuery)
  );

  const handleAddFavorite = async (newFavorite: FavoriteContact) => {
    // Reload favorites from database to get the fresh list
    await loadFavorites();
    Alert.alert("Success", `${newFavorite.accountHolderName} has been added to your favorites`);
  };

  const handleUpdateFavorite = async (updatedFavorite: FavoriteContact) => {
    // Reload favorites from database
    await loadFavorites();
    Alert.alert("Success", `${updatedFavorite.accountHolderName} has been updated`);
  };

  const handleDeleteFavorite = async (id: string) => {
    const favorite = favorites.find((f) => f.id === id);

    // Prevent deletion of mock favorites
    if (id.startsWith("mock-")) {
      Alert.alert(
        "Cannot Delete",
        "This is a demo account and cannot be deleted. Turn off Demo Mode to manage real accounts only."
      );
      return;
    }

    Alert.alert(
      "Remove Favorite",
      `Are you sure you want to remove ${favorite?.nickname || favorite?.accountHolderName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await FavoriteModel.delete(id);
              await loadFavorites();
              Alert.alert("Success", "Account removed from favorites");
            } catch (error) {
              console.error("Error deleting favorite:", error);
              Alert.alert("Error", "Failed to delete favorite");
            }
          },
        },
      ]
    );
  };

  const handleFavoritePress = (favorite: FavoriteContact) => {
    if (isEditMode) {
      // Edit mode: Open edit modal
      setEditingContact(favorite);
      setEditModalVisible(true);
    } else {
      // Normal mode: Navigate to transfer/send money screen
      Alert.alert(
        "Send Money",
        `Send money to ${favorite.nickname || favorite.accountHolderName}?`,
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
    }
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
                {favorites.length} {favorites.length === 1 ? "account" : "accounts"}
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
        {loading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#00332d" />
            <Text className="text-gray-500 text-base mt-4">Loading favorites...</Text>
          </View>
        ) : filteredFavorites.length > 0 ? (
          <View className="gap-3">
            {filteredFavorites.map((fav) => {
              const profileColor = getProfileColor(fav.accountHolderName || "User");
              const initials = getInitials(fav.accountHolderName || "?");

              return (
                <TouchableOpacity
                  key={fav.id}
                  activeOpacity={0.7}
                  onPress={() => handleFavoritePress(fav)}
                  className={`flex-row items-center bg-white border-2 rounded-2xl p-4 ${
                    isEditMode ? "border-[#00332d]" : "border-gray-200"
                  }`}
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  {/* Avatar with Initials - Consistent Color Scheme */}
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: profileColor }}
                  >
                    <Text className="text-lg font-extrabold text-white">
                      {initials}
                    </Text>
                  </View>

                  {/* Contact Info */}
                  <View className="flex-1">
                    <Text className="text-base font-bold text-primary mb-0.5">
                      {fav.nickname || fav.accountHolderName}
                    </Text>
                    {fav.nickname && (
                      <Text className="text-sm text-gray-600 font-medium mb-1">
                        {fav.accountHolderName}
                      </Text>
                    )}
                    <View className="flex-row items-center">
                      <Ionicons
                        name="card-outline"
                        size={12}
                        color="#9CA3AF"
                        style={{ marginRight: 3 }}
                      />
                      <Text className="text-xs text-gray-500 font-medium">
                        {fav.accountNumber}
                      </Text>
                    </View>
                  </View>

                  {/* Action Icon */}
                  {isEditMode ? (
                    <View className="w-8 h-8 rounded-full bg-[#f0fdf4] items-center justify-center">
                      <Ionicons name="create-outline" size={18} color="#00332d" />
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

      {/* Edit Favorite Modal */}
      <EditFavoriteModal
        visible={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setEditingContact(null);
        }}
        onUpdate={handleUpdateFavorite}
        onDelete={handleDeleteFavorite}
        contact={editingContact}
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
