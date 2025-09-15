import BalanceCard from '@/components/BalanceCard';
import BottomNav from '@/components/ButtomNav';
import Header from '@/components/Header';
import TransactionFilter from '@/components/TransactionFilter';
import TransactionList from '@/components/TransactionList';
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { View } from "react-native";

export default function Home() {
  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <Header 
        name="SokSreng" 
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
      <View className="flex-1 mt-[14px]">
        <TransactionList />
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
            icon: (color) => <AntDesign name="star" size={24} color={color} />,
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
