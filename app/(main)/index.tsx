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