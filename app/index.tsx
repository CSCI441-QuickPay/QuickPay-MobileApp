import BottomNav from '@/components/ButtomNav';
import Header from '@/components/Header';
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";

export default function Home() {
  return (

    // Main container
    <View style={{ flex: 1 }}> {/* Flex 1 to take full height */}
      {/* Header */}
      <Header 
        name="Sok Sreng" 
        onSettingPress={() => console.log("Go to Settings")} 
      />
      {/* Main content area */}
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Home Page</Text>
      </View>

      {/* Bottom Navigation */}
      <BottomNav
        items={[
          {
            label: "Home",
            icon: (color) => <Ionicons name="home" size={24} color={color} />,
            onPress: () => console.log("Go Home"),
            active: true,
          },
          {
            label: "Budget",
            icon: (color) => <MaterialIcons name="account-tree" size={24} color={color} />,
            onPress: () => console.log("Go Budget"),
          },
          {
            label: "Scan",
            icon: (color) => <AntDesign name="qrcode" size={28} color={color} />,
            onPress: () => console.log("Go Scan"),
            special: true,
            
          },
          {
            label: "Favorite",
            icon: (color) => <AntDesign name="staro" size={24} color={color} />,
            onPress: () => console.log("Go Favorite"),
          },
          {
            label: "Profile",
            icon: (color) => <Ionicons name="person-outline" size={24} color={color} />,
            onPress: () => console.log("Go Profile"),
          },
        ]}
      />
    </View>
  );
}
