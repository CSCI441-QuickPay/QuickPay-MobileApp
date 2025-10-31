<<<<<<< HEAD
// app/_layout.tsx
import React from "react";
import { ClerkProvider } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";
import { Slot } from "expo-router";
import "../global.css";

const tokenCache = {
  getToken: (key: string) => SecureStore.getItemAsync(key),
  saveToken: (key: string, value: string) =>
    SecureStore.setItemAsync(key, value),
};

const PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout() {
  if (!PUBLISHABLE_KEY) {
    console.error(
      "❌ Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env — the app cannot authenticate."
    );
    // Return an empty view instead of a string
    return null;
  }

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <Slot />
    </ClerkProvider>
  );
}
=======
import { Stack } from "expo-router";
import '../global.css';
import ClerkAuthProvider from "@/providers/ClerkProvider";

export default function RootLayout() {
  return (
    <ClerkAuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ title: "Home" }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ClerkAuthProvider>
  );
}
>>>>>>> 45d9a714e81b3475ae962d37f2dc76ef076231d8
