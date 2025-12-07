/**
 * written by: Team QuickPay
 * tested by: Team QuickPay
 * debugged by: Team QuickPay
 * Notes: Contributions were shared, see GitHub history for commit details.
 * Unit Tests for UserSyncService
 */
/**
 * app/index.tsx
 *
 * Entry point and routing logic for the QuickPay app.
 *
 * Routing Flow:
 * 1. Check if user is authenticated (Clerk)
 * 2. If not authenticated → Redirect to /login
 * 3. If authenticated → Always redirect to /home
 *
 * Note: Home screen will handle Plaid onboarding flow internally
 * This ensures users always reach the home screen first
 */

import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "@clerk/clerk-expo";

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();

  // Show loading spinner while checking authentication
  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // Not authenticated → redirect to login
  if (!isSignedIn) {
    return <Redirect href="/login" />;
  }

  // User is authenticated → redirect to home
  // Home screen will handle Plaid onboarding if needed
  return <Redirect href="/home" />;
}
