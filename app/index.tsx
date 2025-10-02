import BalanceCard from '@/components/BalanceCard';
import BottomNav from '@/components/ButtomNav';
import Header from '@/components/Header';
import TransactionFilter from '@/components/TransactionFilter';
import TransactionList from '@/components/TransactionList';
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        
        {/* Header */}
        <Header 
          name="Emily" 
          onSettingPress={() => console.log("Go to Settings")} 
        />
        
        {/* Balance Card */}
        <BalanceCard 
          balance={1234.00} 
          onRequest={() => console.log("Request Money")} 
          onSend={() => console.log("Send Money")} 
        />

        {/* Transaction Filter */}
        <TransactionFilter />

        {/* Main content area */}
        <View className="flex-1 mt-[14px] bg-gray-100">
          <TransactionList />
        </View>
      
      {/* Bottom Navigation */}
      <BottomNav
        items={[
          {
            label: "Home",
            icon: (color) => <Ionicons name="home" size={34} color={color} />,
            onPress: () => router.push("/"),
            active: true,
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
          },
          {
            label: "Profile",
            icon: (color) => <Ionicons name="person-outline" size={34} color={color} />,
            onPress: () => router.push("/profile"),
          }
        ]}
      />
    </SafeAreaView>
  );
}
