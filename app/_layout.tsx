// app/_layout.tsx
import React from "react";
import { ClerkProvider } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";
import { Slot } from "expo-router";
import { LogBox } from "react-native";
import { DemoModeProvider } from "@/contexts/DemoModeContext";
import "../global.css";

// Suppress specific warnings
LogBox.ignoreLogs([
  'useInsertionEffect must not schedule updates',
]);

// Suppress console warnings for useInsertionEffect
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes?.('useInsertionEffect')) {
    return;
  }
  originalWarn(...args);
};

const originalError = console.error;
console.error = (...args) => {
  if (args[0]?.includes?.('useInsertionEffect')) {
    return;
  }
  originalError(...args);
};

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
      <DemoModeProvider>
        <Slot />
      </DemoModeProvider>
    </ClerkProvider>
  );
}
