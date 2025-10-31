import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { router } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

export default function PlaidOnboardingWeb() {
  const { user } = useUser();
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch link token
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
        if (data.link_token) {
          setLinkToken(data.link_token);
          console.log('✅ Link token received');
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

  // Handle messages from WebView
  const handleWebViewMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('📨 Message from Plaid:', data);

      if (data.type === 'success' && data.publicToken) {
        console.log('✅ Plaid Link successful, exchanging token...');

        // Exchange public token for access token
        const response = await fetch(`${FUNCTIONS_URL}/plaid-exchange-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY!,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            publicToken: data.publicToken,
            clerkId: user?.id,
          }),
        });

        if (response.ok) {
          console.log('✅ Bank account linked successfully!');
          Alert.alert(
            'Success!',
            'Bank account linked successfully!',
            [{ text: 'Continue', onPress: () => router.replace('/home') }]
          );
        } else {
          throw new Error('Failed to exchange token');
        }
      } else if (data.type === 'exit') {
        console.log('⚠️ User exited Plaid Link');
      }
    } catch (error) {
      console.error('❌ Error handling Plaid message:', error);
      Alert.alert('Error', 'Failed to link bank account');
    }
  };

  // HTML that loads Plaid Link
  const plaidHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <script src="https://cdn.plaid.com/link/v2/stable/link.html"></script>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #f5f5f5;
    }
    .container {
      text-align: center;
      padding: 20px;
    }
    .loading {
      color: #666;
      font-size: 16px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="loading">Opening Plaid Link...</div>
  </div>

  <script>
    const linkToken = "${linkToken}";

    if (!linkToken) {
      document.querySelector('.loading').textContent = 'Error: No link token';
    } else {
      const handler = Plaid.create({
        token: linkToken,
        onSuccess: (public_token, metadata) => {
          console.log('Plaid onSuccess', { public_token, metadata });
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'success',
            publicToken: public_token,
            metadata: metadata
          }));
        },
        onExit: (err, metadata) => {
          console.log('Plaid onExit', { err, metadata });
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'exit',
            error: err,
            metadata: metadata
          }));
        },
        onEvent: (eventName, metadata) => {
          console.log('Plaid onEvent', { eventName, metadata });
        }
      });

      // Auto-open Plaid Link when page loads
      setTimeout(() => {
        handler.open();
      }, 100);
    }
  </script>
</body>
</html>
  `;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#00332d" />
        <Text className="text-gray-500 mt-4">Initializing Plaid...</Text>
      </SafeAreaView>
    );
  }

  if (!linkToken) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-red-500">Failed to load Plaid</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <WebView
        source={{ html: plaidHTML }}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
      />
    </SafeAreaView>
  );
}
