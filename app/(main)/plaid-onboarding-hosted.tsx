/**
 * Plaid Onboarding Screen (Hosted Link Method)
 *
 * This screen handles bank account linking using Plaid's hosted link.
 * Users can either:
 * 1. Connect their bank account via Plaid
 * 2. Skip for now and go directly to home screen
 *
 * Features:
 * - Fetches Plaid Link token from backend
 * - Opens Plaid in system browser
 * - Handles deep link callback from Plaid
 * - Exchanges public token for access token
 * - Saves skip preference if user chooses to skip
 */

import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

// AsyncStorage key for tracking if user skipped Plaid onboarding
const PLAID_SKIP_KEY = "plaid_onboarding_skipped";

export default function PlaidOnboardingHosted() {
  const { user } = useUser();
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [hasAutoOpened, setHasAutoOpened] = useState(false); // Prevent auto-opening

  // Fetch link token on mount
  useEffect(() => {
    async function fetchLinkToken() {
      if (!user) return;

      try {
        console.log('🔄 Fetching Plaid link token...');
        const response = await fetch(`${FUNCTIONS_URL}/plaid-create-link-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY!,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ clerkId: user.id }),
        });

        const data = await response.json();
        console.log('📦 Response from server:', data);

        if (data.link_token) {
          setLinkToken(data.link_token);
          console.log('✅ Link token received - waiting for user to click button');
          // IMPORTANT: Do NOT auto-open Plaid
        } else {
          throw new Error(data.error || 'No link token received');
        }
      } catch (error) {
        console.error('❌ Failed to create link token:', error);
        Alert.alert('Error', 'Failed to initialize Plaid');
      } finally {
        setLoading(false);
      }
    }

    fetchLinkToken();
  }, [user]);

  // Listen for deep link redirect from Plaid
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const url = event.url;
      console.log('📨 Deep link received:', url);

      // Check if this is a Plaid callback
      if (!url.includes('plaid-callback')) {
        console.log('⏭️ Not a Plaid callback, ignoring');
        return;
      }

      // Parse the URL to get public_token
      const parsed = Linking.parse(url);
      console.log('📋 Parsed URL:', JSON.stringify(parsed, null, 2));

      const publicToken = parsed.queryParams?.public_token as string;

      if (publicToken) {
        console.log('🎫 Public token found:', publicToken.substring(0, 20) + '...');
        setProcessing(true);
        await handlePublicToken(publicToken);
      } else {
        console.log('❌ No public token in URL');
        console.log('Query params:', parsed.queryParams);
      }
    };

    // Check initial URL (in case the app was opened from the callback)
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('📲 App opened with URL:', url);
        handleDeepLink({ url });
      }
    });

    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, [user]);

  // Open Plaid Hosted Link in system browser
  const openPlaidLink = async (token: string) => {
    try {
      console.log('🔗 USER CLICKED: Opening Plaid Hosted Link...');

      // Create redirect URI for your app
      const redirectUri = Linking.createURL('plaid-callback');
      console.log('📍 Redirect URI:', redirectUri);

      // Plaid Hosted Link URL (NOT webview)
      const hostedUrl = `https://cdn.plaid.com/link/v2/stable/link.html?token=${token}&redirect_uri=${encodeURIComponent(redirectUri)}`;

      console.log('🌐 Opening browser with URL:', hostedUrl);

      // Open in system browser
      const canOpen = await Linking.canOpenURL(hostedUrl);
      if (canOpen) {
        await Linking.openURL(hostedUrl);
        console.log('✅ Browser opened successfully');
      } else {
        throw new Error('Cannot open URL');
      }
    } catch (error) {
      console.error('❌ Error opening Plaid Link:', error);
      Alert.alert('Error', 'Failed to open Plaid Link');
    }
  };

  const handlePublicToken = async (publicToken: string) => {
    try {
      console.log('✅ Received public token, exchanging...');
      console.log('📋 User ID:', user?.id);

      // Add timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(`${FUNCTIONS_URL}/plaid-exchange-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          publicToken: publicToken,
          clerkId: user?.id,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();
      console.log('📦 Exchange response:', data);
      console.log('📊 Response status:', response.status);

      if (response.ok && data.success) {
        console.log('✅ Bank account linked successfully!');
        Alert.alert(
          'Success!',
          'Bank account linked successfully!',
          [{ text: 'Continue', onPress: () => router.replace('/home') }]
        );
      } else {
        const errorMsg = data.error || 'Failed to exchange token';
        console.error('❌ Exchange failed:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('❌ Error exchanging token:', error);

      let errorMessage = 'Failed to link bank account';
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out. Please try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Error', errorMessage, [
        { text: 'Try Again', onPress: () => setProcessing(false) },
        { text: 'Cancel', style: 'cancel', onPress: () => setProcessing(false) }
      ]);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#00332d" />
        <Text className="text-gray-500 mt-4">Initializing Plaid...</Text>
      </SafeAreaView>
    );
  }

  if (processing) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#00332d" />
        <Text className="text-gray-500 mt-4">Linking your bank account...</Text>
      </SafeAreaView>
    );
  }

  // Test callback handler (for debugging)
  const testCallback = async () => {
    const testUrl = await Linking.getInitialURL();
    console.log('🧪 Testing with current URL:', testUrl);
    if (testUrl) {
      console.log('Triggering handleDeepLink manually...');
      // You can paste a test URL here if needed
    }
  };

  // Manual token submission (for testing when deep link fails)
  const handleManualToken = async () => {
    if (!manualToken.trim()) {
      Alert.alert('Error', 'Please enter a public token');
      return;
    }
    console.log('🔧 Manual token submission:', manualToken.substring(0, 20) + '...');
    setProcessing(true);
    await handlePublicToken(manualToken.trim());
  };

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
      <Text className="text-2xl font-bold text-gray-800 mb-4">Connect Your Bank</Text>
      <Text className="text-gray-600 text-center mb-8">
        Click the button below to open Plaid and connect your bank account.
      </Text>

      {linkToken && (
        <>
          <TouchableOpacity
            onPress={() => openPlaidLink(linkToken)}
            className="bg-[#00332d] px-8 py-4 rounded-lg w-full"
          >
            <Text className="text-white font-semibold text-lg text-center">Connect Bank Account</Text>
          </TouchableOpacity>

          {/* Debug section */}
          <View className="w-full mt-8 pt-8 border-t border-gray-200">
            <Text className="text-sm text-gray-500 mb-2 text-center">Debug Tools</Text>

            <TouchableOpacity
              onPress={testCallback}
              className="bg-gray-300 px-6 py-3 rounded-lg mb-3"
            >
              <Text className="text-gray-700 font-medium text-center">Check Current URL</Text>
            </TouchableOpacity>

            <Text className="text-xs text-gray-500 mb-2 text-center">
              If deep link fails, paste public_token here:
            </Text>
            <TextInput
              value={manualToken}
              onChangeText={setManualToken}
              placeholder="public-sandbox-..."
              className="border border-gray-300 rounded-lg px-4 py-3 mb-3 text-sm"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={handleManualToken}
              className="bg-blue-500 px-6 py-3 rounded-lg mb-3"
            >
              <Text className="text-white font-medium text-center">Submit Token Manually</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <TouchableOpacity
        onPress={async () => {
          // Save skip preference in AsyncStorage
          if (user) {
            const skipKey = `${PLAID_SKIP_KEY}_${user.id}`;
            await AsyncStorage.setItem(skipKey, "true");
            console.log("⏭️ User skipped Plaid onboarding - saved to AsyncStorage");
          }
          // Navigate to home
          router.replace('/home');
        }}
        className="mt-6"
      >
        <Text className="text-gray-500 underline">Skip for now</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
