/**
 * Debug script to log transaction data from Plaid
 *
 * Add this import to home.tsx to see transaction data:
 * import '@/scripts/log-transactions';
 */

// This will be called from home.tsx after fetching transactions
export function logTransactionData(plaidTransactions: any[], transformedTransactions: any[]) {
  console.log('\n========== PLAID TRANSACTION DATA ==========');
  console.log('Raw Plaid Transactions:', JSON.stringify(plaidTransactions.slice(0, 5), null, 2));
  console.log('\n========== TRANSFORMED TRANSACTION DATA ==========');
  console.log('Transformed Transactions:', JSON.stringify(transformedTransactions.slice(0, 5), null, 2));
  console.log('\n============================================\n');
}
