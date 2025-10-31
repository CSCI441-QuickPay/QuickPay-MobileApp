import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { PlaidLink, LinkSuccess, LinkExit } from 'react-native-plaid-link-sdk';
import PlaidService from '@/services/PlaidService';
import UserModel from '@/models/UserModel';

export default function BankOnboarding() {
  const { user } = useUser();
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    createLinkToken();
  }, []);

  const createLinkToken = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const token = await PlaidService.createLinkToken(user.id);
      setLinkToken(token);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to initialize bank connection. Please try again.');
      console.error('Link token error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = async (success: LinkSuccess) => {
    if (!user) return;

    setLoading(true);
    try {
      // Exchange public token for access token
      const accessToken = await PlaidService.exchangePublicToken(
        success.publicToken,
        user.id
      );

      // Get account data
      const accounts = await PlaidService.getAccounts(accessToken);
      
      if (accounts.length > 0) {
        // Calculate total balance
        const totalBalance = accounts.reduce(
          (sum, acc) => sum + (acc.balances.current || 0),
          0
        );

        // Save to Firestore
        await UserModel.addPlaidConnection(user.id, {
          accessToken,
          itemId: success.metadata.institution?.institution_id || '',
          institutionId: success.metadata.institution?.institution_id || '',
          institutionName: success.metadata.institution?.name || 'Unknown Bank',
          connectedAt: new Date(),
          accounts: accounts.map(acc => ({
            id: acc.id,
            name: acc.name,
            mask: acc.mask,
            type: acc.type,
            subtype: acc.subtype,
            balance: acc.balances.current,
          })),
        });

        // Update user balance
        await UserModel.updateBalance(user.id, totalBalance);

        Alert.alert(
          'Success!',
          'Your bank account has been connected successfully.',
          [{ text: 'OK', onPress: () => router.replace('/home') }]
        );
      }
    } catch (error: any) {
      console.error('Bank connection error:', error);
      Alert.alert('Error', 'Failed to connect bank account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExit = (exit: LinkExit) => {
    console.log('Plaid Link exited:', exit);
    if (exit.error) {
      Alert.alert('Connection Failed', exit.error.message);
    }
  };

  const skipForNow = () => {
    Alert.alert(
      'Skip Bank Connection',
      'You can connect your bank account later from the profile section.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Skip', onPress: () => router.replace('/home') }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-8 justify-center">
        {/* Icon */}
        <View className="items-center mb-8">
          <View className="w-32 h-32 rounded-full bg-[#00332d] items-center justify-center shadow-lg mb-6">
            <Ionicons name="card-outline" size={64} color="#ccf8f1" />
          </View>
          
          <Text className="text-4xl font-bold text-[#00332d] mb-3 text-center">
            Connect Your Bank
          </Text>
          <Text className="text-gray-600 text-center text-base px-4">
            Securely link your bank account to get started with QuickPay. We use bank-level security to protect your data.
          </Text>
        </View>

        {/* Features */}
        <View className="mb-8 space-y-4">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-4">
              <Ionicons name="shield-checkmark" size={20} color="#10B981" />
            </View>
            <Text className="text-gray-700 flex-1">Bank-level 256-bit encryption</Text>
          </View>
          
          <View className="flex-row items-center mt-4">
            <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-4">
              <Ionicons name="eye-off" size={20} color="#3B82F6" />
            </View>
            <Text className="text-gray-700 flex-1">We never see your banking credentials</Text>
          </View>
          
          <View className="flex-row items-center mt-4">
            <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center mr-4">
              <Ionicons name="flash" size={20} color="#8B5CF6" />
            </View>
            <Text className="text-gray-700 flex-1">Instant balance and transaction sync</Text>
          </View>
        </View>

        {/* Connect Button */}
        {linkToken && !loading ? (
          <PlaidLink
            tokenConfig={{ token: linkToken }}
            onSuccess={handleSuccess}
            onExit={handleExit}
          >
            <TouchableOpacity
              activeOpacity={0.85}
              className="rounded-2xl overflow-hidden shadow-lg mb-4"
              style={{ height: 64 }}
            >
              <LinearGradient
                colors={["#00332d", "#005248"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}
              >
                <Ionicons name="link" size={24} color="white" style={{ marginRight: 12 }} />
                <Text className="text-white font-bold text-xl">
                  Connect Bank Account
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </PlaidLink>
        ) : (
          <View className="rounded-2xl bg-gray-100 h-16 items-center justify-center mb-4">
            <ActivityIndicator size="large" color="#00332d" />
          </View>
        )}

        {/* Skip Button */}
        <TouchableOpacity
          onPress={skipForNow}
          className="items-center py-4"
          disabled={loading}
        >
          <Text className="text-gray-600 text-base font-medium">
            Skip for now
          </Text>
        </TouchableOpacity>
      </View>

      {/* Powered by Plaid */}
      <View className="items-center pb-6">
        <Text className="text-gray-400 text-sm">Powered by Plaid</Text>
      </View>
    </SafeAreaView>
  );
}