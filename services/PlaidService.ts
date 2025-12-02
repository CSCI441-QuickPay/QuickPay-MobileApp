/**
 * PlaidService.ts
 *
 * Service for integrating with Plaid API to access banking data.
 * Plaid is a financial services API that allows applications to connect with users'
 * bank accounts to retrieve transactions, account balances, and other financial data.
 *
 * Architecture:
 * - Mobile App (this service) → Supabase Edge Functions → Plaid API
 * - Edge functions act as a secure backend proxy to keep Plaid credentials safe
 * - User's Plaid access token is stored in Supabase database
 *
 * Key Features:
 * - Fetch bank account information (name, type, balances)
 * - Fetch transaction history with date range filtering
 * - Transform Plaid data into app-friendly format
 * - Check if user has linked their bank account
 *
 * Security:
 * - Plaid credentials never exposed to mobile app
 * - All Plaid API calls routed through secure edge functions
 * - Access tokens stored securely in Supabase
 */

// Configuration: Supabase connection details from environment variables
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

/**
 * Interface representing a single transaction from Plaid
 * Transactions represent money moving in or out of an account
 */
export interface PlaidTransaction {
  transaction_id: string;      // Unique identifier from Plaid
  account_id: string;           // Which account this transaction belongs to
  amount: number;               // Transaction amount (negative = money spent, positive = money received)
  date: string;                 // Transaction date (YYYY-MM-DD format)
  name: string;                 // Transaction description from bank
  merchant_name?: string;       // Name of merchant (if available)
  category?: string[];          // Plaid's categorization (e.g., ["Food and Drink", "Restaurants"])
  pending: boolean;             // Whether transaction is still pending or completed
  payment_channel: string;      // How payment was made (online, in store, etc.)
}

/**
 * Interface representing a bank account from Plaid
 * Each user can have multiple accounts (checking, savings, credit cards, etc.)
 */
export interface PlaidAccount {
  account_id: string;           // Unique identifier from Plaid
  name: string;                 // User-friendly account name (e.g., "Plaid Checking")
  official_name?: string;       // Official name from bank (e.g., "Plaid Gold Standard 0% Interest Checking")
  type: string;                 // Account type (depository, credit, loan, investment)
  subtype: string;              // More specific type (checking, savings, credit card, etc.)
  balances: {                   // Current balance information
    available?: number;         // Available balance (what you can spend)
    current?: number;           // Current balance (total in account)
    limit?: number;             // Credit limit (for credit accounts)
  };
}

/**
 * Response structure when fetching transactions
 * Includes both transactions and account info for context
 */
export interface PlaidTransactionsResponse {
  transactions: PlaidTransaction[];  // Array of transaction objects
  accounts: PlaidAccount[];          // Array of account objects (for reference)
}

/**
 * Fetch transactions from Plaid via Supabase Edge Function
 */
export async function fetchPlaidTransactions(
  clerkId: string,
  startDate?: string,
  endDate?: string
): Promise<PlaidTransactionsResponse> {
  try {
    // Default to last 30 days if no dates provided
    const end = endDate || new Date().toISOString().split('T')[0];
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    console.log('=� Fetching Plaid transactions:', { clerkId, start, end });

    const response = await fetch(`${FUNCTIONS_URL}/plaid-get-transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        clerkId,
        startDate: start,
        endDate: end,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch transactions');
    }

    const data = await response.json();
    console.log(' Plaid transactions fetched:', data.transactions?.length || 0);

    return data;
  } catch (error) {
    console.error('L Error fetching Plaid transactions:', error);
    throw error;
  }
}

/**
 * Fetch accounts from Plaid via Supabase Edge Function
 */
export async function fetchPlaidAccounts(clerkId: string): Promise<PlaidAccount[]> {
  try {
    console.log('=� Fetching Plaid accounts:', clerkId);

    const response = await fetch(`${FUNCTIONS_URL}/plaid-get-accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ clerkId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch accounts');
    }

    const data = await response.json();
    console.log(' Plaid accounts fetched:', data.accounts?.length || 0);

    return data.accounts || [];
  } catch (error) {
    console.error('L Error fetching Plaid accounts:', error);
    throw error;
  }
}

/**
 * Calculate total balance from all accounts
 */
export function calculateTotalBalance(accounts: PlaidAccount[]): number {
  return accounts.reduce((total, account) => {
    const balance = account.balances.current || account.balances.available || 0;
    return total + balance;
  }, 0);
}

/**
 * Transform Plaid transaction to app transaction format
 *
 * Note: Plaid uses positive amounts for money OUT (expenses) and negative for money IN (income)
 * We flip this to match typical accounting: negative for expenses, positive for income
 */
export function transformPlaidTransaction(plaidTx: PlaidTransaction, accounts: PlaidAccount[]) {
  const account = accounts.find(acc => acc.account_id === plaidTx.account_id);

  // Plaid: positive = money out, negative = money in
  // App:   negative = money out, positive = money in
  // So we flip the sign
  const appAmount = -plaidTx.amount;

  return {
    id: plaidTx.transaction_id,
    title: plaidTx.merchant_name || plaidTx.name,
    amount: appAmount, // Now properly negative for expenses, positive for income
    date: plaidTx.date,
    type: appAmount < 0 ? 'expense' : 'income',
    category: plaidTx.category?.[0] || 'Other',
    bank: account?.name || 'Unknown Bank',
    status: plaidTx.pending ? 'pending' : 'completed',
    description: plaidTx.name,
    subtitle: `${account?.name || 'Unknown Bank'}`, // Add bank name as subtitle
  };
}

/**
 * Check if user has Plaid linked
 */
export async function isPlaidLinked(clerkId: string): Promise<boolean> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/users?clerk_id=eq.${clerkId}&select=plaid_access_token`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
    });

    if (!response.ok) return false;

    const data = await response.json();
    return data[0]?.plaid_access_token != null;
  } catch (error) {
    console.error('Error checking Plaid link status:', error);
    return false;
  }
}
