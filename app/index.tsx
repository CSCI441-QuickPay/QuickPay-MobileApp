// app/index.tsx
import { Redirect } from "expo-router";
<<<<<<< HEAD
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
=======
import { useAuth } from "@clerk/clerk-expo";
import { View, ActivityIndicator } from "react-native";
>>>>>>> 45d9a714e81b3475ae962d37f2dc76ef076231d8

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();

<<<<<<< HEAD
  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563eb" />
=======
  // Show loading while checking auth
  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#00332d" />
>>>>>>> 45d9a714e81b3475ae962d37f2dc76ef076231d8
      </View>
    );
  }

<<<<<<< HEAD
  return isSignedIn ? <Redirect href="/home" /> : <Redirect href="/login" />;
}
=======
  // Redirect based on auth state
  return isSignedIn ? <Redirect href="/home" /> : <Redirect href="/login" />;
}
>>>>>>> 45d9a714e81b3475ae962d37f2dc76ef076231d8
