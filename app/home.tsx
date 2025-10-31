import BalanceCard from '@/components/home/BalanceCard';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/home/Header';
import TransactionFilter from '@/components/home/TransactionFilter';
import TransactionList from '@/components/home/TransactionList';
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState, useEffect } from 'react';
import { View, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth, useUser } from "@clerk/clerk-expo";
import UserModel from "@/models/UserModel";
import PlaidService from "@/services/PlaidService";

export default function Home() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const [filter, setFilter] = useState("all");
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    loadUserData();
  }, []);

  async function loadUserData() {
    if (!user) return;

    try {
      // Get user data from Firestore
      const userData = await UserModel.get(user.id);
      
      if (userData) {
        setBalance(userData.balance || 0);

        // Load transactions from Plaid
        if (userData.plaidConnections && userData.plaidConnections.length > 0) {
          await loadTransactions(userData.plaidConnections[0].accessToken);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadTransactions(accessToken: string) {
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      const plaidTransactions = await PlaidService.getTransactions(
        accessToken,
        startDate,
        endDate
      );

      // Convert Plaid transactions to app format
      const formattedTransactions = plaidTransactions.map((tx) => ({
        id: tx.id,
        title: tx.name,
        subtitle: tx.merchantName || '',
        amount: -tx.amount, // Plaid uses positive for debit
        date: tx.date,
        category: tx.category?.[0] || 'Other',
      }));

      setTransactions(formattedTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  }

  async function handleLogout() {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
              router.replace("/login");
            } catch (error: any) {
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          }
        }
      ]
    );
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#00332d" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <Header 
        name={user?.firstName || "User"} 
        onSettingPress={handleLogout}
      />
        
      <BalanceCard 
        balance={balance} 
        onRequest={() => console.log("Request Money")} 
        onSend={() => console.log("Send Money")} 
      />

      <TransactionFilter onFilterChange={setFilter} />

      <View className="flex-1 mt-[14px] bg-gray-100">
        <TransactionList filter={filter} transactions={transactions} />
      </View>
      
      <BottomNav
        items={[
          {
            label: "Home",
            icon: (color) => <Ionicons name="home" size={34} color={color} />,
            onPress: () => router.push("/home"),
            active: true,
          },
          {
            label: "Budget",
            icon: (color) => <MaterialIcons name="account-tree" size={34} color={color} />,
            onPress: () => router.push("/visual_budget")
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
            icon: (color) => <Ionicons name="person" size={34} color={color} />,
            onPress: () => router.push("/profile"),
          }
        ]}
      />
    </SafeAreaView>
  );
}