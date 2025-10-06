import BottomNav from "@/components/BottomNav";
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
    name: "John Doe",
    account: "XXX XXX XXX | USD",
    image: require("@/assets/images/andrew.jpeg"),
  },
  {
    id: 3,
    name: "John Doe",
    account: "XXX XXX XXX | USD",
    image: require("@/assets/images/andrew.jpeg"),
  },
  {
    id: 4,
    name: "John Doe",
    account: "XXX XXX XXX | USD",
    image: require("@/assets/images/andrew.jpeg"),
  },
  {
    id: 5,
    name: "John Doe",
    account: "XXX XXX XXX | USD",
    image: require("@/assets/images/andrew.jpeg"),
  },
  {
    id: 6,
    name: "John Doe",
    account: "XXX XXX XXX | USD",
    image: require("@/assets/images/andrew.jpeg"),
  },
];

// Favorite Screen Component
export default function FavoriteScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="px-5 pt-4">
        <Text className="text-subheading font-semibold text-black">Favorites</Text>
      </View>

      {/* Favorites List */}
      <ScrollView className="px-4 mt-3 ">
        {favorites.map((fav) => (
          <TouchableOpacity
            key={fav.id}
            className="flex-row items-center bg-gray-100 rounded-lg p-3 mb-3 w-[386px] h-[72px]"
          >
            <Image
              source={fav.image}
              className="w-12 h-12 rounded-full mr-4"
            />
            <View>

              {/* Name and Account Info */}
              <Text className="text-normal font-semibold text-[#0A2F23]">
                {fav.name}
              </Text>
              <Text className="text-small italic text-gray-600">{fav.account}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* BottomNav */}
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
