import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import FavoriteModel, { Favorite } from '@/models/FavoriteModel';
import { RecipientInfo } from '@/services/PaymentService';
import UserModel from '@/models/UserModel';
import { getProfileColor } from '@/utils/profileUtils';

interface FavoritesModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectFavorite: (recipient: RecipientInfo) => void;
}

export default function FavoritesModal({
  visible,
  onClose,
  onSelectFavorite,
}: FavoritesModalProps) {
  const { user } = useUser();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<Favorite[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadFavorites();
    }
  }, [visible, user]);

  useEffect(() => {
    filterFavorites();
  }, [searchQuery, favorites]);

  const loadFavorites = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Get database user ID from Clerk ID
      const dbUser = await UserModel.getByClerkId(user.id);
      if (!dbUser?.id) {
        setFavorites([]);
        setIsLoading(false);
        return;
      }

      const data = await FavoriteModel.getByUserId(dbUser.id);
      setFavorites(data);
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterFavorites = () => {
    if (!searchQuery.trim()) {
      setFilteredFavorites(favorites);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = favorites.filter((fav) => {
      const name = fav.accountHolderName?.toLowerCase() || '';
      const nickname = fav.nickname?.toLowerCase() || '';
      const accountNumber = fav.accountNumber || '';

      return (
        name.includes(query) ||
        nickname.includes(query) ||
        accountNumber.includes(query)
      );
    });

    setFilteredFavorites(filtered);
  };

  const handleSelectFavorite = (favorite: Favorite) => {
    const profileColor = getProfileColor(favorite.accountHolderName || 'User');

    const recipient: RecipientInfo = {
      accountNumber: favorite.accountNumber,
      firstName: favorite.accountHolderName?.split(' ')[0],
      lastName: favorite.accountHolderName?.split(' ').slice(1).join(' '),
      profilePicture: profileColor,
      email: '', // Not available from favorites
    };

    onSelectFavorite(recipient);
    onClose();
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const getDisplayName = (favorite: Favorite) => {
    return favorite.nickname || favorite.accountHolderName || favorite.accountNumber;
  };

  const renderFavorite = ({ item }: { item: Favorite }) => {
    const profileColor = getProfileColor(item.accountHolderName || 'User');

    return (
      <TouchableOpacity
        onPress={() => handleSelectFavorite(item)}
        className="py-4 border-b border-gray-100"
        activeOpacity={0.7}
      >
        <View className="flex-row items-center">
          <View
            className="w-12 h-12 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: profileColor }}
          >
            <Text className="text-white font-bold text-lg">
              {getInitials(item.accountHolderName)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900">
              {getDisplayName(item)}
            </Text>
            {item.nickname && item.accountHolderName && (
              <Text className="text-sm text-gray-600">{item.accountHolderName}</Text>
            )}
            <View className="flex-row items-center mt-0.5">
              <Ionicons name="wallet-outline" size={14} color="#6B7280" style={{ marginRight: 4 }} />
              <Text className="text-sm text-gray-500">{item.accountNumber}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View className="items-center justify-center py-12">
      <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
        <Ionicons name="star-outline" size={40} color="#9CA3AF" />
      </View>
      <Text className="text-lg font-semibold text-gray-900 mb-1">No favorites yet</Text>
      <Text className="text-sm text-gray-500 text-center px-8">
        Add favorite contacts for quick payments
      </Text>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable
        className="flex-1 bg-black/50 justify-end"
        onPress={onClose}
        activeOpacity={1}
      >
        <Pressable
          className="bg-white rounded-t-3xl max-h-[85%]"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Handle bar */}
          <View className="items-center py-3">
            <View className="w-12 h-1 bg-gray-300 rounded-full" />
          </View>

          {/* Header */}
          <View className="px-6 pb-3">
            <Text className="text-xl font-bold text-gray-900 mb-3">Favorites</Text>

            {/* Search bar */}
            {favorites.length > 0 && (
              <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-3">
                <Ionicons name="search" size={20} color="#9CA3AF" />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search favorites..."
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-2 text-base text-gray-900"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {/* Favorites list */}
          {isLoading ? (
            <View className="items-center justify-center py-12">
              <ActivityIndicator size="large" color="#00332d" />
            </View>
          ) : (
            <FlatList
              data={filteredFavorites}
              renderItem={renderFavorite}
              keyExtractor={(item) => item.id!}
              contentContainerStyle={{ paddingHorizontal: 24 }}
              ListEmptyComponent={
                searchQuery ? (
                  <View className="items-center justify-center py-12">
                    <Text className="text-gray-500">No matching favorites</Text>
                  </View>
                ) : (
                  renderEmpty()
                )
              }
              showsVerticalScrollIndicator={false}
            />
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
