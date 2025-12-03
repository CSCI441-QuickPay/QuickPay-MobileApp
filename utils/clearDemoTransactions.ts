/**
 * Utility to clear demo mode transactions from AsyncStorage
 *
 * Demo transactions are created when sending payments in Demo Mode.
 * They are stored in AsyncStorage with key '@demo_transactions'.
 *
 * This utility allows clearing those transactions without affecting:
 * - Mock transactions from data/transaction.tsx
 * - Real Plaid transactions from API
 * - Database transactions
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const DEMO_TRANSACTIONS_KEY = '@demo_transactions';

export interface ClearDemoResult {
  success: boolean;
  clearedCount: number;
  error?: string;
}

/**
 * Clear all demo mode transactions from AsyncStorage
 */
export async function clearDemoTransactions(): Promise<ClearDemoResult> {
  try {
    // Get current demo transactions
    const stored = await AsyncStorage.getItem(DEMO_TRANSACTIONS_KEY);

    if (!stored) {
      return {
        success: true,
        clearedCount: 0,
      };
    }

    const transactions = JSON.parse(stored);
    const count = Array.isArray(transactions) ? transactions.length : 0;

    // Clear the transactions
    await AsyncStorage.removeItem(DEMO_TRANSACTIONS_KEY);

    console.log(`✅ Cleared ${count} demo transaction(s) from AsyncStorage`);

    return {
      success: true,
      clearedCount: count,
    };
  } catch (error: any) {
    console.error('❌ Error clearing demo transactions:', error);
    return {
      success: false,
      clearedCount: 0,
      error: error.message || 'Failed to clear demo transactions',
    };
  }
}

/**
 * Get count of demo transactions without clearing them
 */
export async function getDemoTransactionCount(): Promise<number> {
  try {
    const stored = await AsyncStorage.getItem(DEMO_TRANSACTIONS_KEY);
    if (!stored) return 0;

    const transactions = JSON.parse(stored);
    return Array.isArray(transactions) ? transactions.length : 0;
  } catch (error) {
    console.error('Error getting demo transaction count:', error);
    return 0;
  }
}
