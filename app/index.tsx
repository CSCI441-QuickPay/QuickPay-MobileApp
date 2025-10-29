import { Redirect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();

  // Show loading while checking auth
  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#00332d" />
      </View>
    );
  }

  // Redirect based on auth state
  return isSignedIn ? <Redirect href="/home" /> : <Redirect href="/login" />;
}