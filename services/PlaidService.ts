import { Alert } from 'react-native';

export interface PlaidAccount {
  id: string;
  name: string;
  mask: string;
  type: string;
  subtype: string;
  balances: {
    available: number | null;
    current: number;
    limit: number | null;
  };
}

export interface PlaidTransaction {
  id: string;
  accountId: string;
  amount: number;
  date: string;
  name: string;
  merchantName?: string;
  category?: string[];
  pending: boolean;
}

class PlaidService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
  }

  /**
   * Create a link token for Plaid Link
   */
  async createLinkToken(userId: string): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/api/plaid/create_link_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create link token');
      }

      return data.link_token;
    } catch (error: any) {
      console.error('❌ Error creating link token:', error);
      throw new Error(error.message || 'Failed to connect to Plaid');
    }
  }

  /**
   * Exchange public token for access token
   */
  async exchangePublicToken(publicToken: string, userId: string): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/api/plaid/exchange_public_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          public_token: publicToken,
          userId 
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to exchange token');
      }

      return data.access_token;
    } catch (error: any) {
      console.error('❌ Error exchanging public token:', error);
      throw new Error(error.message || 'Failed to complete bank connection');
    }
  }

  /**
   * Get account balances
   */
  async getAccounts(accessToken: string): Promise<PlaidAccount[]> {
    try {
      const response = await fetch(`${this.apiUrl}/api/plaid/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ access_token: accessToken }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get accounts');
      }

      return data.accounts;
    } catch (error: any) {
      console.error('❌ Error getting accounts:', error);
      throw new Error(error.message || 'Failed to fetch account data');
    }
  }

  /**
   * Get transactions
   */
  async getTransactions(
    accessToken: string,
    startDate: string,
    endDate: string
  ): Promise<PlaidTransaction[]> {
    try {
      const response = await fetch(`${this.apiUrl}/api/plaid/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          access_token: accessToken,
          start_date: startDate,
          end_date: endDate
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get transactions');
      }

      return data.transactions;
    } catch (error: any) {
      console.error('❌ Error getting transactions:', error);
      throw new Error(error.message || 'Failed to fetch transactions');
    }
  }

  /**
   * Remove bank connection
   */
  async removeItem(accessToken: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/api/plaid/remove_item`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ access_token: accessToken }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove bank connection');
      }
    } catch (error: any) {
      console.error('❌ Error removing item:', error);
      throw new Error(error.message || 'Failed to disconnect bank');
    }
  }
}

export default new PlaidService();