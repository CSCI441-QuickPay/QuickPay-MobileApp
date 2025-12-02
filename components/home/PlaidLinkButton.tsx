import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import { create, open, LinkSuccess, LinkExit, LinkLogLevel } from 'react-native-plaid-link-sdk';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

interface PlaidLinkButtonProps {
  clerkId: string;
  onSuccess?: () => void;
  buttonText?: string;
  buttonClassName?: string;
}

export default function PlaidLinkButton({
  clerkId,
  onSuccess,
  buttonText = "Link Bank Account",
  buttonClassName = "bg-primary-600 px-6 py-3 rounded-lg"
}: PlaidLinkButtonProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [linkReady, setLinkReady] = useState(false);

  // Create Plaid Link session when token is available
  useEffect(() => {
    if (linkToken) {
      console.log('🔗 Creating Plaid Link session...');
      const config = {
        token: linkToken,
        logLevel: LinkLogLevel.DEBUG,
      };
      create(config);
      setLinkReady(true);
      setLoading(false);
      console.log('✅ Plaid Link session created');
    }
  }, [linkToken]);

  // Fetch link token from Supabase edge function
  const fetchLinkToken = async () => {
    try {
      setLoading(true);
      setLinkReady(false);
      console.log('🔄 Fetching Plaid link token...');

      const response = await fetch(`${FUNCTIONS_URL}/plaid-create-link-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ clerkId }),
      });

      const data = await response.json();
      console.log('📦 Link token received:', data.link_token?.substring(0, 20) + '...');

      if (data.link_token) {
        setLinkToken(data.link_token);
      } else {
        throw new Error('No link token received');
      }
    } catch (error) {
      console.error('❌ Error fetching link token:', error);
      Alert.alert('Error', 'Failed to initialize Plaid. Please try again.');
      setLoading(false);
    }
  };

  // Handle successful link
  const handleSuccess = async (success: LinkSuccess) => {
    try {
      console.log('✅ Plaid Link successful!');
      console.log('🎫 Public token:', success.publicToken.substring(0, 20) + '...');

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
          clerkId: clerkId,
        }),
      });

      const data = await response.json();
      console.log('📦 Exchange response:', data);

      if (response.ok && data.success) {
        console.log('✅ Bank account linked successfully!');
        Alert.alert(
          'Success!',
          'Your bank account has been linked successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                setLinkToken(null); // Reset link token
                if (onSuccess) onSuccess();
              }
            }
          ]
        );
      } else {
        throw new Error(data.error || 'Token exchange failed');
      }
    } catch (error: any) {
      console.error('❌ Error exchanging token:', error);
      Alert.alert('Error', error.message || 'Failed to link bank account. Please try again.');
    }
  };

  // Handle exit/cancel
  const handleExit = (exit: LinkExit) => {
    console.log('⏭️ Plaid Link exited:', exit);
    setLinkToken(null);
    setLinkReady(false);
  };

  // Open Plaid Link
  const openPlaidLink = async () => {
    if (!linkReady) {
      // Fetch token if not ready
      fetchLinkToken();
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

  return (
    <TouchableOpacity
      onPress={openPlaidLink}
      disabled={loading}
      className={buttonClassName}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text className="text-white font-semibold text-center">{buttonText}</Text>
      )}
    </TouchableOpacity>
  );
}
