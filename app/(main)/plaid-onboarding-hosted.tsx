/**
 * Plaid Onboarding Screen (In-App SDK Method)
 *
 * This screen handles bank account linking using Plaid's React Native SDK.
 * Users can either:
 * 1. Connect their bank account via Plaid (opens in-app modal)
 * 2. Skip for now and go directly to home screen
 *
 * Features:
 * - Fetches Plaid Link token from backend
 * - Opens Plaid modal inside the app (no browser needed!)
 * - Exchanges public token for access token automatically
 * - Saves skip preference if user chooses to skip
 */

import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create, open, dismissLink, LinkSuccess, LinkExit, LinkLogLevel } from 'react-native-plaid-link-sdk';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

export default function PlaidOnboardingHosted() {
  const { user } = useUser();
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [linkReady, setLinkReady] = useState(false);

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
        console.log('📦 Link token received:', data.link_token?.substring(0, 20) + '...');

        if (data.link_token) {
          setLinkToken(data.link_token);
        } else {
          throw new Error(data.error || 'No link token received');
        }
      } catch (error) {
        console.error('❌ Failed to create link token:', error);
        Alert.alert('Error', 'Failed to initialize Plaid. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchLinkToken();
  }, [user]);

  // Create Plaid Link session when token is available
  useEffect(() => {
    if (linkToken) {
      console.log('🔗 Creating Plaid Link session...');
      const config = {
        token: linkToken,
        // Enable verbose logging for debugging
        logLevel: LinkLogLevel.DEBUG,
      };
      create(config);
      setLinkReady(true);
      console.log('✅ Plaid Link session created');
    }
  }, [linkToken]);

  // Handle successful Plaid link
  const handleSuccess = async (success: LinkSuccess) => {
    try {
      console.log('✅ Plaid Link successful!');
      console.log('🎫 Public token:', success.publicToken.substring(0, 20) + '...');

      setProcessing(true);

      // Exchange public token for access token
      const response = await fetch(`${FUNCTIONS_URL}/plaid-exchange-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          publicToken: success.publicToken,
          clerkId: user?.id,
        }),
      });

      const data = await response.json();
      console.log('📦 Exchange response:', data);

      if (response.ok && data.success) {
        console.log('✅ Bank account linked successfully!');
        Alert.alert(
          'Success!',
          'Your bank account has been linked successfully!',
          [{ text: 'Continue', onPress: () => router.replace('/home') }]
        );
      } else {
        throw new Error(data.error || 'Token exchange failed');
      }
    } catch (error: any) {
      console.error('❌ Error exchanging token:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to link bank account. Please try again.',
        [{ text: 'OK', onPress: () => setProcessing(false) }]
      );
    }
  };

  // Handle exit/cancel
  const handleExit = (exit: LinkExit) => {
    console.log('⏭️ Plaid Link exited:', exit);
    setProcessing(false);

    if (exit.error) {
      console.error('❌ Plaid error:', exit.error);
      Alert.alert('Error', exit.error.displayMessage || 'An error occurred. Please try again.');
    }
  };

  // Open Plaid Link
  const openPlaidLink = async () => {
    if (!linkReady) {
      Alert.alert('Please wait', 'Plaid is still loading...');
      return;
    }

    try {
      console.log('🚀 Opening Plaid Link...');
      const result = await open({
        onSuccess: handleSuccess,
        onExit: handleExit,
      });
      console.log('📋 Plaid Link opened with result:', result);
    } catch (error) {
      console.error('❌ Error opening Plaid Link:', error);
      Alert.alert('Error', 'Failed to open Plaid. Please try again.');
    }
  };

  // Skip Plaid onboarding
  const handleSkip = async () => {
    if (user) {
      const skipKey = `plaid_onboarding_skipped_${user.id}`;
      await AsyncStorage.setItem(skipKey, "true");
      console.log("⏭️ User skipped Plaid onboarding");
    }
    router.replace('/home');
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
        Securely link your bank account to get started with QuickPay.
      </Text>

      <TouchableOpacity
        onPress={openPlaidLink}
        disabled={!linkReady}
        className={`px-8 py-4 rounded-lg w-full ${linkReady ? 'bg-[#00332d]' : 'bg-gray-300'}`}
      >
        <Text className="text-white font-semibold text-lg text-center">
          Connect Bank Account
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleSkip} className="mt-6">
        <Text className="text-gray-500 underline">Skip for now</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
