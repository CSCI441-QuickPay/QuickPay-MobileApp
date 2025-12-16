/**
 * written by: Team QuickPay
 * tested by: Team QuickPay
 * debugged by: Team QuickPay
 * Notes: Contributions were shared, see GitHub history for commit details.
 * Unit Tests for UserSyncService
 */
import { Redirect } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

export default function MainIndex() {
  const { isSignedIn } = useAuth();

  // If user is signed in, redirect to home
  // Otherwise, this shouldn't be reached (auth layout should handle it)
  if (isSignedIn) {
    return <Redirect href="/(main)/home" />;
  }

  // Fallback redirect to auth if somehow reached without being signed in
  return <Redirect href="/(auth)/login" />;
}
