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