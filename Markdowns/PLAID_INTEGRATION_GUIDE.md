# Plaid Integration Guide

Now that Clerk and Supabase are connected, here's how to integrate Plaid to show user financial data.

## Prerequisites

✅ Clerk authentication working
✅ Supabase database set up with users table
✅ User data syncing to Supabase on signup/login
✅ Plaid credentials in `.env` file

## Overview

The Plaid integration flow:

```
1. User clicks "Link Bank Account"
        ↓
2. Open Plaid Link (modal)
        ↓
3. User selects bank and logs in
        ↓
4. Plaid returns public_token
        ↓
5. Exchange public_token for access_token (backend)
        ↓
6. Store access_token in Supabase
        ↓
7. Fetch account balances & transactions
        ↓
8. Display in app
```

## Implementation Steps

### Step 1: Install Plaid Link SDK

```bash
npm install react-native-plaid-link-sdk
```

### Step 2: Create Link Token Endpoint

You need a backend endpoint to create a Plaid Link token.

**Create**: `backend/src/routes/plaidRoutes.ts`

```typescript
import express from 'express';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

const router = express.Router();

const plaidClient = new PlaidApi(
  new Configuration({
    basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
        'PLAID-SECRET': process.env.PLAID_SECRET,
      },
    },
  })
);

// Create link token
router.post('/create-link-token', async (req, res) => {
  const { userId } = req.body;

  try {
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: 'QuickPay',
      products: ['auth', 'transactions'],
      country_codes: ['US'],
      language: 'en',
    });

    res.json({ link_token: response.data.link_token });
  } catch (error) {
    console.error('Error creating link token:', error);
    res.status(500).json({ error: 'Failed to create link token' });
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

    // Store in Supabase
    await UserModel.updatePlaidInfo(clerkId, accessToken, itemId);

    res.json({ success: true });
  } catch (error) {
    console.error('Error exchanging token:', error);
    res.status(500).json({ error: 'Failed to exchange token' });
  }
});

export default router;
```

### Step 3: Create Plaid Link Component

**Create**: `components/PlaidLink.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, Alert } from 'react-native';
import { usePlaidLink } from 'react-native-plaid-link-sdk';
import { useUser } from '@clerk/clerk-expo';

export default function PlaidLinkButton() {
  const { user } = useUser();
  const [linkToken, setLinkToken] = useState<string | null>(null);

  // Fetch link token from backend
  useEffect(() => {
    async function createLinkToken() {
      try {
        const response = await fetch('YOUR_BACKEND_URL/plaid/create-link-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user?.id }),
        });
        const data = await response.json();
        setLinkToken(data.link_token);
      } catch (error) {
        console.error('Failed to create link token:', error);
      }
    }

    if (user) createLinkToken();
  }, [user]);

  const { open, ready } = usePlaidLink({
    tokenConfig: {
      token: linkToken || '',
    },
    onSuccess: async (success) => {
      // Exchange public token for access token
      try {
        await fetch('YOUR_BACKEND_URL/plaid/exchange-public-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            publicToken: success.publicToken,
            clerkId: user?.id,
          }),
        });

        Alert.alert('Success', 'Bank account linked successfully!');
      } catch (error) {
        console.error('Failed to exchange token:', error);
        Alert.alert('Error', 'Failed to link bank account');
      }
    },
    onExit: (exit) => {
      console.log('Plaid Link exited:', exit);
    },
  });

  return (
    <TouchableOpacity
      onPress={() => open()}
      disabled={!ready}
      className="bg-primary rounded-2xl p-4"
    >
      <Text className="text-white font-bold text-center">
        Link Bank Account
      </Text>
    </TouchableOpacity>
  );
}
```

### Step 4: Fetch Account Balances

**Create**: `services/PlaidService.ts`

```typescript
import UserModel from '@/models/UserModel';

export default class PlaidService {
  static async getAccountBalances(clerkId: string) {
    const user = await UserModel.getByClerkId(clerkId);

    if (!user?.plaidAccessToken) {
      throw new Error('No Plaid account linked');
    }

    const response = await fetch('YOUR_BACKEND_URL/plaid/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken: user.plaidAccessToken }),
    });

    const data = await response.json();
    return data.accounts;
  }

  static async getTransactions(clerkId: string, startDate: string, endDate: string) {
    const user = await UserModel.getByClerkId(clerkId);

    if (!user?.plaidAccessToken) {
      throw new Error('No Plaid account linked');
    }

    const response = await fetch('YOUR_BACKEND_URL/plaid/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accessToken: user.plaidAccessToken,
        startDate,
        endDate,
      }),
    });

    const data = await response.json();
    return data.transactions;
  }
}
```

### Step 5: Backend Endpoints for Data

**Add to**: `backend/src/routes/plaidRoutes.ts`

```typescript
// Get account balances
router.post('/accounts', async (req, res) => {
  const { accessToken } = req.body;

  try {
    const response = await plaidClient.accountsBalanceGet({
      access_token: accessToken,
    });

    res.json({ accounts: response.data.accounts });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

// Get transactions
router.post('/transactions', async (req, res) => {
  const { accessToken, startDate, endDate } = req.body;

  try {
    const response = await plaidClient.transactionsGet({
      access_token: accessToken,
      start_date: startDate,
      end_date: endDate,
    });

    res.json({ transactions: response.data.transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});
```

### Step 6: Display in Home Screen

**Update**: `app/(main)/home.tsx`

```typescript
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import PlaidService from '@/services/PlaidService';
import PlaidLinkButton from '@/components/PlaidLink';

export default function Home() {
  const { user } = useUser();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAccounts() {
      if (!user) return;

      try {
        const data = await PlaidService.getAccountBalances(user.id);
        setAccounts(data);
      } catch (error) {
        console.log('No Plaid account linked yet');
      } finally {
        setLoading(false);
      }
    }

    loadAccounts();
  }, [user]);

  return (
    <View>
      {accounts.length === 0 ? (
        <PlaidLinkButton />
      ) : (
        <View>
          {accounts.map((account) => (
            <View key={account.account_id}>
              <Text>{account.name}</Text>
              <Text>${account.balances.current}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
```

## Testing with Plaid Sandbox

Plaid provides test credentials for Sandbox mode:

**Username**: `user_good`
**Password**: `pass_good`

These credentials will simulate a successful bank connection.

## Data Flow Summary

1. **User clicks "Link Bank Account"**
   - `PlaidLinkButton` component opens Plaid Link

2. **User authenticates with bank**
   - Plaid returns `public_token`

3. **Exchange token on backend**
   - Backend calls Plaid API to exchange `public_token` for `access_token`
   - Backend stores `access_token` in Supabase via `UserModel.updatePlaidInfo()`

4. **Fetch financial data**
   - Use stored `access_token` to call Plaid API
   - Get account balances, transactions, etc.

5. **Display in app**
   - Show balances on home screen
   - Show transactions in transaction list
   - Use for budget calculations

## Security Notes

- **Never store access tokens in app state** - Always fetch from Supabase
- **Use backend for Plaid API calls** - Never call Plaid directly from the app
- **Encrypt sensitive data** - Consider encrypting `plaid_access_token` in Supabase
- **Use HTTPS** - Always use secure connections for API calls

## Next Steps

After implementing Plaid:

1. **Sync transactions regularly** - Set up background sync or webhook
2. **Categorize transactions** - Use Plaid's category data or build your own
3. **Calculate budgets** - Use transaction data for budget tracking
4. **Show insights** - Provide spending trends and financial insights
5. **Enable transfers** - Use Plaid for ACH transfers (requires additional setup)

## Useful Resources

- [Plaid Quickstart](https://plaid.com/docs/quickstart/)
- [React Native Plaid Link SDK](https://github.com/plaid/react-native-plaid-link-sdk)
- [Plaid API Reference](https://plaid.com/docs/api/)
- [Plaid Sandbox Testing](https://plaid.com/docs/sandbox/test-credentials/)

## Common Issues

### "Invalid access token"
- Check that token is stored correctly in Supabase
- Verify token hasn't expired
- Ensure you're using the right Plaid environment

### "Item login required"
- User needs to re-authenticate with their bank
- Use Plaid's Update Mode to refresh connection

### "Rate limit exceeded"
- Plaid has API rate limits
- Implement caching for account data
- Use webhooks for transaction updates instead of polling
