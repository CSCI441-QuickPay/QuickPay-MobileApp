import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

export default function PlaidOnboardingHosted() {
  const { user } = useUser();
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

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
          console.log('✅ Link token received');
          // Automatically open Plaid Link
          openPlaidLink(data.link_token);
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

      // Parse the URL to get public_token
      const parsed = Linking.parse(url);
      const publicToken = parsed.queryParams?.public_token as string;

      if (publicToken) {
        setProcessing(true);
        await handlePublicToken(publicToken);
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, [user]);

  // Open Plaid Hosted Link in system browser
  const openPlaidLink = async (token: string) => {
    try {
      console.log('🔗 Opening Plaid Hosted Link...');

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
      });

      const data = await response.json();
      console.log('📦 Exchange response:', data);

      if (response.ok) {
        console.log('✅ Bank account linked successfully!');
        Alert.alert(
          'Success!',
          'Bank account linked successfully!',
          [{ text: 'Continue', onPress: () => router.replace('/home') }]
        );
      } else {
        throw new Error(data.error || 'Failed to exchange token');
      }
    } catch (error) {
      console.error('❌ Error exchanging token:', error);
      Alert.alert('Error', 'Failed to link bank account');
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

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
      <Text className="text-2xl font-bold text-gray-800 mb-4">Connect Your Bank</Text>
      <Text className="text-gray-600 text-center mb-8">
        Plaid Link should open in your browser. Complete the bank linking process and you'll be redirected back to the app.
      </Text>

      {linkToken && (
        <TouchableOpacity
          onPress={() => openPlaidLink(linkToken)}
          className="bg-[#00332d] px-8 py-4 rounded-lg"
        >
          <Text className="text-white font-semibold text-lg">Open Plaid Link Again</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={() => router.replace('/home')}
        className="mt-4"
      >
        <Text className="text-gray-500">Skip for now</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
