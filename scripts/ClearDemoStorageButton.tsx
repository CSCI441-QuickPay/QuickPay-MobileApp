/**
 * Temporary Component to Clear Demo AsyncStorage Transactions
 *
 * Usage:
 * 1. Import this component in any page (e.g., profile page or home page)
 * 2. Add <ClearDemoStorageButton /> to the render
 * 3. Tap the button to clear demo transactions
 * 4. Remove this component after clearing
 */

import React, { useState } from 'react';
import { TouchableOpacity, Text, Alert, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ClearDemoStorageButton() {
  const [isClearing, setIsClearing] = useState(false);

  const clearDemoTransactions = async () => {
    try {
      setIsClearing(true);

      // Get current count
      const stored = await AsyncStorage.getItem('@demo_transactions');
      const count = stored ? JSON.parse(stored).length : 0;

      if (count === 0) {
        Alert.alert('No Demo Transactions', 'No demo transactions found in AsyncStorage.');
        setIsClearing(false);
        return;
      }

      // Clear demo transactions
      await AsyncStorage.removeItem('@demo_transactions');

      Alert.alert(
        'Success!',
        `Cleared ${count} demo transaction(s) from AsyncStorage.\n\nReload the app to see changes.`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Optionally force reload
              console.log('✅ Demo transactions cleared!');
            }
          }
        ]
      );

      setIsClearing(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to clear demo transactions');
      setIsClearing(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TouchableOpacity
        onPress={clearDemoTransactions}
        disabled={isClearing}
        style={{
          backgroundColor: '#EF4444',
          padding: 16,
          borderRadius: 12,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
          {isClearing ? 'Clearing...' : 'Clear Demo Transactions (AsyncStorage)'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
