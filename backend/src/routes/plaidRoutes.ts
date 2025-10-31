import express from 'express';
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const router = express.Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

// Initialize Plaid client
const plaidClient = new PlaidApi(
  new Configuration({
    basePath: PlaidEnvironments[process.env.EXPO_PUBLIC_PLAID_ENV || 'sandbox'],
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.EXPO_PUBLIC_PLAID_CLIENT_ID,
        'PLAID-SECRET': process.env.EXPO_PUBLIC_PLAID_SECRET,
      },
    },
  })
);

// Create link token
router.post('/create-link-token', async (req, res) => {
  const { clerkId } = req.body;

  try {
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: clerkId },
      client_name: 'QuickPay',
      products: [Products.Auth, Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
    });

    res.json({ link_token: response.data.link_token });
  } catch (error: any) {
    console.error('Error creating link token:', error);
    res.status(500).json({ error: 'Failed to create link token', details: error.message });
  }
});

// Exchange public token for access token
router.post('/exchange-public-token', async (req, res) => {
  const { publicToken, clerkId } = req.body;

  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;

    // Store in Supabase directly
    const { error } = await supabase
      .from('users')
      .update({
        plaid_access_token: accessToken,
        plaid_item_id: itemId,
        plaid_linked_at: new Date().toISOString(),
      })
      .eq('clerk_id', clerkId);

    if (error) throw error;

    res.json({ success: true, itemId });
  } catch (error: any) {
    console.error('Error exchanging token:', error);
    res.status(500).json({ error: 'Failed to exchange token', details: error.message });
  }
});

// Get account balances
router.post('/accounts', async (req, res) => {
  const { clerkId } = req.body;

  try {
    // Get user from Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('plaid_access_token')
      .eq('clerk_id', clerkId)
      .single();

    if (userError || !user?.plaid_access_token) {
      return res.status(404).json({ error: 'No Plaid account linked' });
    }

    const response = await plaidClient.accountsBalanceGet({
      access_token: user.plaid_access_token,
    });

    res.json({ accounts: response.data.accounts });
  } catch (error: any) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Failed to fetch accounts', details: error.message });
  }
});

// Get transactions
router.post('/transactions', async (req, res) => {
  const { clerkId, startDate, endDate } = req.body;

  try {
    // Get user from Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('plaid_access_token')
      .eq('clerk_id', clerkId)
      .single();

    if (userError || !user?.plaid_access_token) {
      return res.status(404).json({ error: 'No Plaid account linked' });
    }

    const response = await plaidClient.transactionsGet({
      access_token: user.plaid_access_token,
      start_date: startDate,
      end_date: endDate,
    });

    res.json({ transactions: response.data.transactions, accounts: response.data.accounts });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions', details: error.message });
  }
});

export default router;
