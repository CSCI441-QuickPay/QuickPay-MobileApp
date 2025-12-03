import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import { FavoriteModel, Favorite } from '@/models/FavoriteModel';
import { RecipientInfo } from '@/services/PaymentService';

interface FavoritesRecipientListProps {
  onRecipientSelect: (recipient: RecipientInfo) => void;
}

export default function FavoritesRecipientList({
  onRecipientSelect,
}: FavoritesRecipientListProps) {
  const { user } = useUser();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<Favorite[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, [user]);

  useEffect(() => {
    filterFavorites();
  }, [searchQuery, favorites]);

  const loadFavorites = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const data = await FavoriteModel.getByUserId(user.id);
      setFavorites(data);
    } catch (error) {
      console.error('Error loading favorites:', error);
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
    const recipient: RecipientInfo = {
      accountNumber: favorite.accountNumber,
      firstName: favorite.accountHolderName?.split(' ')[0],
      lastName: favorite.accountHolderName?.split(' ').slice(1).join(' '),
      profilePicture: favorite.accountHolderProfile,
      email: '', // Not available from favorites
    };

    onRecipientSelect(recipient);
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

  const renderFavorite = ({ item }: { item: Favorite }) => (
    <TouchableOpacity
      onPress={() => handleSelectFavorite(item)}
      className="py-4 border-b border-gray-100"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        <View className="w-12 h-12 rounded-full bg-[#00332d] items-center justify-center mr-3">
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
          <Text className="text-sm text-gray-500 mt-0.5">
            {item.accountNumber}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View className="items-center justify-center py-12">
      <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
        <Ionicons name="people-outline" size={40} color="#9CA3AF" />
      </View>
      <Text className="text-lg font-semibold text-gray-900 mb-1">
        No favorites yet
      </Text>
      <Text className="text-sm text-gray-500 text-center px-8">
        Add favorite contacts from your transaction history
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View className="items-center justify-center py-12">
        <ActivityIndicator size="large" color="#00332d" />
      </View>
    );
  }

  return (
    <View className="flex-1 px-6">
      {/* Search bar */}
      {favorites.length > 0 && (
        <View className="pt-4 pb-2">
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
        </View>
      )}

      {/* Favorites list */}
      <FlatList
        data={filteredFavorites}
        renderItem={renderFavorite}
        keyExtractor={(item) => item.id!}
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
    </View>
  );
}
