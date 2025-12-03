import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import * as Haptics from 'expo-haptics';

import BankSourceCard from '@/components/send/BankSourceCard';
import BankSourceSelector, { BankOption } from '@/components/send/BankSourceSelector';
import RecipientInput from '@/components/send/RecipientInput';
import FavoritesModal from '@/components/send/FavoritesModal';
import { PaymentSource, PaymentService, RecipientInfo } from '@/services/PaymentService';
import UserModel from '@/models/UserModel';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { banks as mockBanks } from '@/data/budget';
import { fetchPlaidAccounts, PlaidAccount } from '@/services/PlaidService';

// Helper function to generate consistent color for recipient
const generateRecipientColor = (accountNumber: string): string => {
  const colors = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#6366F1'
  ];
  
  // Use account number to generate consistent index
  let hash = 0;
  for (let i = 0; i < accountNumber.length; i++) {
    hash = accountNumber.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export default function SendMoney() {
  const { user } = useUser();
  const params = useLocalSearchParams();
  const { isDemoMode } = useDemoMode();

  // Bank sources state
  const [sources, setSources] = useState<PaymentSource[]>([]);
  const [showBankSelector, setShowBankSelector] = useState(false);
  const [availableBanks, setAvailableBanks] = useState<PlaidAccount[]>([]);
  const [quickPayBalance, setQuickPayBalance] = useState(0);
  const [currentUserAccountNumber, setCurrentUserAccountNumber] = useState('');

  // Recipient state
  const [recipientInfo, setRecipientInfo] = useState<RecipientInfo | null>(null);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);

  // UI state
  const [description, setDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Load user's banks and QuickPay balance on mount
  useEffect(() => {
    loadBankSources();
  }, [user, isDemoMode]);

  const loadBankSources = async () => {
    if (!user) return;

    try {
      // Get user's QuickPay balance and account number
      const dbUser = await UserModel.getByClerkId(user.id);
      if (dbUser) {
        setQuickPayBalance(dbUser.balance);
        setCurrentUserAccountNumber(dbUser.accountNumber || '');
      }

      if (isDemoMode) {
        // Demo Mode: Use mock bank sources
        console.log('🎭 Demo Mode - Using mock bank sources');
        // Don't load real banks in demo mode
        setAvailableBanks([]);

        // Auto-add QuickPay balance as first source if it has funds
        if (dbUser && dbUser.balance > 0) {
          setSources([
            {
              id: 'quickpay',
              type: 'quickpay',
              name: 'QuickPay Balance',
              amount: 0,
              balance: dbUser.balance,
            },
          ]);
        }
      } else {
        // Real Mode: Get linked bank accounts from Plaid
        console.log('💳 Real Mode - Fetching Plaid bank accounts');
        try {
          const plaidAccounts = await fetchPlaidAccounts(user.id);
          console.log(`✅ Fetched ${plaidAccounts.length} Plaid accounts`);
          setAvailableBanks(plaidAccounts);
        } catch (error) {
          console.error('❌ Error fetching Plaid accounts:', error);
          setAvailableBanks([]);
        }

        // Auto-add QuickPay balance as first source if it has funds
        if (dbUser && dbUser.balance > 0 && sources.length === 0) {
          setSources([
            {
              id: 'quickpay',
              type: 'quickpay',
              name: 'QuickPay Balance',
              amount: 0,
              balance: dbUser.balance,
            },
          ]);
        }
      }
    } catch (error) {
      console.error('Error loading bank sources:', error);
      // Don't show error alert if just no banks found
      if (error && typeof error === 'object' && 'code' in error) {
        console.error('Database error:', error);
      }
    }
  };

  const handleAddBankSource = (bank: BankOption) => {
    setSources([
      ...sources,
      {
        id: bank.id,
        type: bank.type,
        name: bank.name,
        amount: 0,
        balance: bank.balance,
      },
    ]);
  };

  const handleUpdateAmount = (sourceId: string, amount: number) => {
    setSources(sources.map((s) => (s.id === sourceId ? { ...s, amount } : s)));
  };

  const handleRemoveSource = (sourceId: string) => {
    setSources(sources.filter((s) => s.id !== sourceId));
  };

  const handleRecipientSelect = (recipient: RecipientInfo | null) => {
    setRecipientInfo(recipient);
  };

  // Calculate total amount
  const totalAmount = useMemo(
    () => sources.reduce((sum, s) => sum + s.amount, 0),
    [sources]
  );

  // Get consistent recipient color
  const recipientColor = useMemo(() => {
    if (!recipientInfo) return 'rgba(255,255,255,0.1)';
    return recipientInfo.profilePicture || generateRecipientColor(recipientInfo.accountNumber);
  }, [recipientInfo]);

  const handleSendPayment = async () => {
    // Validation
    if (!recipientInfo) {
      Alert.alert('Error', 'Please select a recipient');
      return;
    }

    if (sources.length === 0) {
      Alert.alert('Error', 'Please add at least one payment source');
      return;
    }

    if (totalAmount <= 0) {
      Alert.alert('Error', 'Total amount must be greater than $0');
      return;
    }

    // Check sufficient funds
    const validation = PaymentService.validateSources(sources);
    if (!validation.isValid) {
      Alert.alert('Insufficient Funds', validation.message || '');
      return;
    }

    // Confirm payment
    Alert.alert(
      'Confirm Payment',
      `Send $${totalAmount.toFixed(2)} to ${
        recipientInfo.firstName && recipientInfo.lastName
          ? `${recipientInfo.firstName} ${recipientInfo.lastName}`
          : recipientInfo.accountNumber
      }?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          style: 'default',
          onPress: processPayment,
        },
      ]
    );
  };

  const processPayment = async () => {
    if (!user || !recipientInfo) return;

    try {
      setIsProcessing(true);

      const recipientFullName = recipientInfo.firstName && recipientInfo.lastName
        ? `${recipientInfo.firstName} ${recipientInfo.lastName}`
        : recipientInfo.email;

      // Process payment with Demo Mode flag
      await PaymentService.processPayment(
        {
          senderId: user.id,
          recipientAccountNumber: recipientInfo.accountNumber,
          sources,
          totalAmount,
          description: description || undefined,
        },
        isDemoMode,
        recipientFullName
      );

      // Success - Navigate to confirmation page with recipient color
      router.replace({
        pathname: '/send-confirmation',
        params: {
          amount: totalAmount.toFixed(2),
          recipientName: recipientFullName,
          recipientAccount: recipientInfo.accountNumber,
          recipientColor: recipientColor,
          isDemoMode: isDemoMode.toString(),
        },
      });
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Payment Failed', error.message || 'Failed to process payment');
      setIsProcessing(false);
    }
  };

  // Prepare bank options for demo mode
  const getMockBankOptions = (): BankOption[] => {
    return mockBanks.map((bank) => ({
      id: bank.id,
      type: 'bank' as const,
      name: bank.name,
      balance: bank.budget || 0,
      accountType: 'checking',
      mask: '****',
    }));
  };

  const alreadySelectedIds = sources.map((s) => s.id);
  const bankOptionsForSelector = isDemoMode
    ? getMockBankOptions()
    : availableBanks.map((b) => ({
        id: b.account_id,
        type: 'bank' as const,
        name: b.name,
        balance: b.balances.available || b.balances.current || 0,
        accountType: b.subtype,
        mask: b.account_id.slice(-4), // Last 4 characters of account_id as mask
      }));

  return (
    <SafeAreaView className="flex-1 bg-[#00332d]" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center bg-[#00332d]">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-lg font-semibold text-white">
            Send Money
          </Text>
          <View className="w-7" />
        </View>

        {/* Icon Header */}
        <View className="items-center pt-6 pb-8 bg-[#00332d]">
          {recipientInfo ? (
            <View
              className="w-24 h-24 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: recipientColor }}
            >
              <Text className="text-white text-4xl font-bold">
                {recipientInfo.firstName?.[0]?.toUpperCase() || '?'}
                {recipientInfo.lastName?.[0]?.toUpperCase() || ''}
              </Text>
            </View>
          ) : (
            <View className="w-24 h-24 rounded-full items-center justify-center mb-4 bg-white/10">
              <Ionicons name="arrow-up-circle" size={56} color="white" />
            </View>
          )}
          {recipientInfo ? (
            <Text className="text-white text-base">
              Send to <Text className="font-bold">{recipientInfo.firstName} {recipientInfo.lastName}</Text>
            </Text>
          ) : (
            <Text className="text-white/60 text-sm">SEND PAYMENT</Text>
          )}
        </View>

        {/* White Content Container - Fills remaining space */}
        <View className="flex-1 bg-white rounded-t-3xl">
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
          >
            <View className="px-6 pt-6 flex-1">
              {/* Section 1: Recipient */}
              <View className="mb-6">
                <Text className="text-base font-semibold text-gray-900 mb-3">
                  Send To
                </Text>
                <RecipientInput
                  onRecipientSelect={handleRecipientSelect}
                  onOpenFavorites={() => setShowFavoritesModal(true)}
                  currentAccountNumber={currentUserAccountNumber}
                  scannedAccountNumber={params.scannedAccountNumber as string | undefined}
                  selectedRecipient={recipientInfo}
                />
              </View>

              {/* Section 2: Payment Sources */}
              <View className="mb-6">
                <Text className="text-base font-semibold text-gray-900 mb-3">
                  Payment Sources
                </Text>

                {sources.map((source) => (
                  <BankSourceCard
                    key={source.id}
                    source={source}
                    onUpdateAmount={(amount) => handleUpdateAmount(source.id, amount)}
                    onRemove={() => handleRemoveSource(source.id)}
                  />
                ))}

                {/* Add another source button */}
                <TouchableOpacity
                  onPress={() => setShowBankSelector(true)}
                  className="border-2 border-dashed border-gray-300 rounded-2xl py-4 items-center justify-center"
                  activeOpacity={0.7}
                >
                  <Ionicons name="add-circle-outline" size={24} color="#00332d" />
                  <Text className="text-[#00332d] font-semibold mt-1">
                    Add Another Source
                  </Text>
                </TouchableOpacity>

                {/* Total amount */}
                {totalAmount > 0 && (
                  <View className="mt-4 bg-[#00332d]/5 rounded-2xl p-4">
                    <Text className="text-sm text-gray-600 mb-1">Total Amount</Text>
                    <Text className="text-3xl font-bold text-[#00332d]">
                      ${totalAmount.toFixed(2)}
                    </Text>
                  </View>
                )}
              </View>

              {/* Section 3: Optional Description */}
              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Add a Note (Optional)
                </Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="What's this for?"
                  placeholderTextColor="#9CA3AF"
                  className="border border-gray-200 rounded-2xl px-4 py-3 text-base text-gray-900"
                  multiline
                  maxLength={200}
                />
              </View>
            </View>
          </ScrollView>

          {/* Send button - Fixed at bottom */}
          <View className="bg-white px-6 py-5 border-t border-gray-100">
            <TouchableOpacity
              onPress={handleSendPayment}
              disabled={isProcessing || !recipientInfo || totalAmount <= 0}
              className="bg-[#00332d] rounded-2xl py-5 flex-row items-center justify-center"
              style={{
                shadowColor: '#00332d',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isProcessing || !recipientInfo || totalAmount <= 0 ? 0 : 0.3,
                shadowRadius: 8,
                elevation: 8,
                opacity: isProcessing || !recipientInfo || totalAmount <= 0 ? 0.4 : 1,
              }}
              activeOpacity={0.85}
            >
              {isProcessing ? (
                <View className="flex-row items-center">
                  <ActivityIndicator color="white" size="small" style={{ marginRight: 8 }} />
                  <Text className="text-white font-bold text-lg">
                    Processing...
                  </Text>
                </View>
              ) : (
                <Text className="text-white font-bold text-lg text-center">
                  Send ${totalAmount.toFixed(2)}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
          

        {/* Bank selector modal */}
        <BankSourceSelector
          visible={showBankSelector}
          onClose={() => setShowBankSelector(false)}
          onSelectBank={handleAddBankSource}
          availableBanks={bankOptionsForSelector}
          quickPayBalance={quickPayBalance}
          alreadySelectedIds={alreadySelectedIds}
        />

        {/* Favorites modal */}
        <FavoritesModal
          visible={showFavoritesModal}
          onClose={() => setShowFavoritesModal(false)}
          onSelectFavorite={handleRecipientSelect}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}