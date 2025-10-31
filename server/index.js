const express = require('express');
const cors = require('cors');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Plaid client
const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Create link token
app.post('/api/plaid/create_link_token', async (req, res) => {
  try {
    const { userId } = req.body;

    const request = {
      user: {
        client_user_id: userId,
      },
      client_name: 'QuickPay',
      products: ['auth', 'transactions'],
      country_codes: ['US'],
      language: 'en',
    };

    const response = await plaidClient.linkTokenCreate(request);
    res.json({ link_token: response.data.link_token });
  } catch (error) {
    console.error('Error creating link token:', error);
    res.status(500).json({ error: error.message });
  }
});

// Exchange public token for access token
app.post('/api/plaid/exchange_public_token', async (req, res) => {
  try {
    const { public_token, userId } = req.body;

    const response = await plaidClient.itemPublicTokenExchange({
      public_token,
    });

    const { access_token, item_id } = response.data;

    // In production, store access_token securely in database
    // For now, we return it to be stored on the client side
    res.json({ 
      access_token,
      item_id
    });
  } catch (error) {
    console.error('Error exchanging public token:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get account balances
app.post('/api/plaid/accounts', async (req, res) => {
  try {
    const { access_token } = req.body;

    const response = await plaidClient.accountsBalanceGet({
      access_token,
    });

    res.json({ accounts: response.data.accounts });
  } catch (error) {
    console.error('Error getting accounts:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get transactions
app.post('/api/plaid/transactions', async (req, res) => {
  try {
    const { access_token, start_date, end_date } = req.body;

    const request = {
      access_token,
      start_date,
      end_date,
      options: {
        count: 100,
        offset: 0,
      },
    };

    const response = await plaidClient.transactionsGet(request);
    
    res.json({ 
      transactions: response.data.transactions,
      accounts: response.data.accounts 
    });
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Remove item (disconnect bank)
app.post('/api/plaid/remove_item', async (req, res) => {
  try {
    const { access_token } = req.body;

    await plaidClient.itemRemove({
      access_token,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error removing item:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Plaid API server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.PLAID_ENV || 'sandbox'}`);
});