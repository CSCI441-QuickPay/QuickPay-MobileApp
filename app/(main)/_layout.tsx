import { Stack, Redirect } from "expo-router";
import { SignedIn, SignedOut } from "@clerk/clerk-expo";

export default function MainLayout() {
  return (
    <>
      <SignedIn>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ title: "Home" }} />
        </Stack>
      </SignedIn>

      <SignedOut>
        <Redirect href="/login" />
      </SignedOut>
    </>
  );
}
