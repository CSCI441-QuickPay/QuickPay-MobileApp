/**
 * Clear Demo Mode AsyncStorage transactions
 * This removes the transactions created from test payments in Demo Mode
 */

const fs = require('fs');
const path = require('path');

console.log('\n🧹 Clearing Demo Mode Transactions\n');
console.log('═'.repeat(60));

// Note: AsyncStorage is device-specific and can't be cleared via Node.js
// The transactions are stored on the device, not in the database

console.log('\n⚠️  AsyncStorage Demo Transactions Cannot Be Cleared Via Script\n');
console.log('Demo mode transactions are stored in AsyncStorage on your device.');
console.log('They are NOT in the Supabase database.\n');

console.log('To clear demo transactions, you have 3 options:\n');
console.log('1. In the app: Toggle Demo Mode OFF, then back ON');
console.log('2. In the app: Clear app data/cache from device settings');
console.log('3. Add a "Clear Demo Data" button in the app settings\n');

console.log('The transactions you want to keep (mock data + Plaid) are:');
console.log('  - Mock transactions from data/transaction.tsx');
console.log('  - Real Plaid transactions fetched from API');
console.log('  - These will remain after clearing AsyncStorage\n');

console.log('Would you like me to add a utility function to clear demo');
console.log('transactions from within the app? (Y/n)\n');

console.log('═'.repeat(60));
console.log('\n');
