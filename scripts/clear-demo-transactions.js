/**
 * Clear AsyncStorage demo transactions
 * Run with: node scripts/clear-demo-transactions.js
 *
 * This clears the demo transactions that were created when sending money in Demo Mode.
 * These are stored in AsyncStorage and causing "Invalid Date" issues.
 */

const AsyncStorage = require('@react-native-async-storage/async-storage');

async function clearDemoTransactions() {
  console.log('🧹 Clearing Demo Transactions from AsyncStorage\n');

  try {
    const DEMO_TRANSACTIONS_KEY = '@demo_transactions';

    // Get current demo transactions
    const stored = await AsyncStorage.getItem(DEMO_TRANSACTIONS_KEY);

    if (!stored) {
      console.log('✅ No demo transactions found in AsyncStorage');
      console.log('   Nothing to clear.\n');
      return;
    }

    const transactions = JSON.parse(stored);
    console.log(`Found ${transactions.length} demo transaction(s):\n`);

    transactions.forEach((tx, index) => {
      console.log(`${index + 1}. ${tx.title || tx.description}`);
      console.log(`   Amount: $${Math.abs(tx.amount)}`);
      console.log(`   Date: ${tx.date}`);
      console.log(`   ID: ${tx.id}\n`);
    });

    // Clear the transactions
    await AsyncStorage.removeItem(DEMO_TRANSACTIONS_KEY);

    console.log('✅ Demo transactions cleared from AsyncStorage!\n');
    console.log('Next time you open the app in Demo Mode, you will see:');
    console.log('- Plaid transactions (if Plaid is linked)');
    console.log('- QuickPay transactions from database');
    console.log('- Mock transactions from data/transaction.tsx');
    console.log('- But NO old demo transactions with invalid dates\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error('\n⚠️  Note: This script needs to run in React Native environment.');
    console.error('   You can clear demo transactions by:');
    console.error('   1. In the app, go to Settings/Profile');
    console.error('   2. Toggle Demo Mode OFF, then ON again');
    console.error('   3. Or manually clear app data/cache\n');
  }

  console.log('✨ Done!\n');
}

clearDemoTransactions().then(() => {
  process.exit(0);
});
