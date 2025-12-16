/**
 * written by: Team QuickPay
 * tested by: Team QuickPay
 * debugged by: Team QuickPay
 * Notes: Contributions were shared, see GitHub history for commit details.
 * Unit Tests for UserSyncService
 */
/**
 * Utility to clear old demo transactions with invalid dates
 * This should be called once on app startup to clean up corrupted demo transaction data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const DEMO_TRANSACTIONS_KEY = '@demo_transactions';
const CLEANUP_FLAG_KEY = '@demo_transactions_cleaned_v1';

export async function clearOldDemoTransactions() {
  try {
    // Check if we've already cleaned up
    const alreadyCleaned = await AsyncStorage.getItem(CLEANUP_FLAG_KEY);
    if (alreadyCleaned === 'true') {
      return; // Already cleaned, skip
    }

    // Get current demo transactions
    const stored = await AsyncStorage.getItem(DEMO_TRANSACTIONS_KEY);
    if (!stored) {
      // No transactions to clean
      await AsyncStorage.setItem(CLEANUP_FLAG_KEY, 'true');
      return;
    }

    const transactions = JSON.parse(stored);

    // Filter out transactions with invalid dates (full ISO timestamps)
    const validTransactions = transactions.filter((tx: any) => {
      // Check if date is in correct format (YYYY-MM-DD)
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      const isValidFormat = datePattern.test(tx.date);

      // Also check if the date can be parsed without becoming invalid
      const date = new Date(tx.date);
      const isValidDate = !isNaN(date.getTime());

      return isValidFormat && isValidDate;
    });

    // Save cleaned transactions back
    if (validTransactions.length < transactions.length) {
      console.log(`🧹 Cleaned ${transactions.length - validTransactions.length} invalid demo transactions`);
      await AsyncStorage.setItem(DEMO_TRANSACTIONS_KEY, JSON.stringify(validTransactions));
    }

    // Mark as cleaned so we don't repeat this
    await AsyncStorage.setItem(CLEANUP_FLAG_KEY, 'true');

  } catch (err) {
    console.error('Error clearing old demo transactions:', err);
  }
}

/**
 * Force clear ALL demo transactions (useful for testing)
 */
export async function clearAllDemoTransactions() {
  try {
    await AsyncStorage.removeItem(DEMO_TRANSACTIONS_KEY);
    await AsyncStorage.removeItem(CLEANUP_FLAG_KEY);
    console.log('✅ All demo transactions cleared');
  } catch (err) {
    console.error('Error clearing all demo transactions:', err);
  }
}
