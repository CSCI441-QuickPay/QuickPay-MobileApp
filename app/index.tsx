import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";

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

  // Load login state on app start
  useEffect(() => {
    AsyncStorage.getItem("isLoggedIn").then((value) => {
      setIsLoggedIn(value === "true");
    });
  }, []);

  // Still checking storage (avoid flicker)
  if (isLoggedIn === null) return null;

  // Redirect based on stored login state
  return isLoggedIn ? <Redirect href="/home" /> : <Redirect href="/login" />;
}
