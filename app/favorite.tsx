import BottomNav from "@/components/BottomNav";
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

// Dummy favorite data
const favorites = [
  {
    id: 1,
    name: "John Doe",
    account: "XXX XXX XXX | USD",
    image: require("@/assets/images/andrew.jpeg"),
  },
  {
    id: 2,
    name: "Jane Smith",
    account: "XXX XXX XXX | USD",
    image: require("@/assets/images/andrew.jpeg"),
  },
  {
    id: 3,
    name: "Michael Johnson",
    account: "XXX XXX XXX | USD",
    image: require("@/assets/images/andrew.jpeg"),
  },
  {
    id: 4,
    name: "Emily Davis",
    account: "XXX XXX XXX | USD",
    image: require("@/assets/images/andrew.jpeg"),
  },
  {
    id: 5,
    name: "David Wilson",
    account: "XXX XXX XXX | USD",
    image: require("@/assets/images/andrew.jpeg"),
  },
  {
    id: 6,
    name: "Sarah Brown",
    account: "XXX XXX XXX | USD",
    image: require("@/assets/images/andrew.jpeg"),
  },
];

// Favorite Screen Component
export default function FavoriteScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  // Filter favorites based on search
  const filteredFavorites = favorites.filter(fav =>
    fav.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header Section */}
      <View className="px-6 pt-6 pb-4">
        {/* Title with Icon */}
        <View className="flex-row items-center mb-6">
          <View className="w-14 h-14 rounded-full bg-[#00332d] items-center justify-center mr-4">
            <AntDesign name="star" size={28} color="#ccf8f1" />
          </View>
          <View>
            <Text className="text-3xl font-bold text-[#00332d]">Favorites</Text>
            <Text className="text-gray-500 text-sm">Quick access to your contacts</Text>
          </View>
        </View>

        {/* Search Bar with Add Button */}
        <View className="flex-row items-center" style={{ gap: 12 }}>
          <View 
            className={`flex-1 flex-row items-center border-2 rounded-xl px-4 ${
              searchFocused ? 'border-[#00332d] bg-[#ccf8f1]/10' : 'border-gray-300 bg-white'
            }`}
            style={{ minHeight: 52 }}
          >
            <Ionicons 
              name="search-outline" 
              size={22} 
              color={searchFocused ? "#00332d" : "#9CA3AF"} 
              style={{ marginRight: 8 }}
            />
            <TextInput
              placeholder="Search favorites..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 text-base text-gray-900"
              style={{ paddingVertical: 0, paddingHorizontal: 0, height: 52 }}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              textAlignVertical="center"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Add New Favorite Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => console.log("Add new favorite")}
            className="w-[52px] h-[52px] bg-[#00332d] rounded-xl items-center justify-center shadow-lg"
          >
            <Ionicons name="add" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Favorites List */}
      <ScrollView 
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {filteredFavorites.length > 0 ? (
          filteredFavorites.map((fav) => (
            <TouchableOpacity
              key={fav.id}
              activeOpacity={0.7}
              className="flex-row items-center bg-white border-2 border-gray-200 rounded-2xl p-4 mb-3 shadow-sm"
              style={{ minHeight: 80 }}
            >
              {/* Profile Image */}
              <View className="w-14 h-14 rounded-full border-2 border-[#00332d] mr-4 overflow-hidden">
                <Image
                  source={fav.image}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>

              {/* Name and Account Info */}
              <View className="flex-1">
                <Text className="text-lg font-bold text-[#00332d] mb-1">
                  {fav.name}
                </Text>
                <Text className="text-sm text-gray-500">
                  {fav.account}
                </Text>
              </View>

              {/* Arrow Icon */}
              <Ionicons name="chevron-forward" size={24} color="#00332d" />
            </TouchableOpacity>
          ))
        ) : (
          <View className="flex-1 items-center justify-center py-20">
            <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
              <Ionicons name="search-outline" size={40} color="#9CA3AF" />
            </View>
            <Text className="text-gray-500 text-base text-center">
              No favorites found
            </Text>
            <Text className="text-gray-400 text-sm text-center mt-2">
              Try adjusting your search
            </Text>
          </View>
        )}
      </ScrollView>

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
            icon: (color) => <MaterialIcons name="account-tree" size={34} color={color} />,
            onPress: () => console.log("Go Budget"),
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
            icon: (color) => <Ionicons name="person-outline" size={34} color={color} />,
            onPress: () => router.push("/profile"),
          },
        ]}
      />
    </SafeAreaView>
  );
}