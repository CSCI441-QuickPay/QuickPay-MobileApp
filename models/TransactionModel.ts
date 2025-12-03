// models/TransactionModel.ts
import { supabase } from '@/config/supabaseConfig';

export type TransactionType = 'debit' | 'credit' | 'transfer';

export type SplitPerson = {
  name?: string;
  email?: string;
  phoneNumber?: string;
  amount: number;
  isPaid: boolean;
  plaidLinkToken?: string; // Token for recipient to link their bank via Plaid
};

export type SplitData = {
  code: string;
  numberOfPeople: number;
  splits: SplitPerson[];
};

export interface Transaction {
  id?: string;
  userId: string;
  bankAccountId?: string;
  plaidTransactionId?: string;
  amount: number;
  transactionType: TransactionType;
  category?: string;
  merchantName?: string;
  description: string;
  transactionDate: Date;
  pending: boolean;
  // Frontend display fields
  title: string;
  subtitle?: string;
  icon?: string;
  logo?: string; // URL or path to logo image
  // Split transaction support
  splitData?: SplitData;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DBTransaction {
  id: string;
  user_id: string;
  bank_account_id?: string;
  plaid_transaction_id?: string;
  amount: number;
  transaction_type: string;
  category?: string;
  merchant_name?: string;
  description: string;
  transaction_date: string;
  pending: boolean;
  title: string;
  subtitle?: string;
  icon?: string;
  logo?: string;
  split_data?: any; // JSON field
  created_at: string;
  updated_at: string;
}

export default class TransactionModel {
  private static toTransaction(dbTxn: DBTransaction): Transaction {
    return {
      id: dbTxn.id,
      userId: dbTxn.user_id,
      bankAccountId: dbTxn.bank_account_id,
      plaidTransactionId: dbTxn.plaid_transaction_id,
      amount: Number(dbTxn.amount),
      transactionType: dbTxn.transaction_type as TransactionType,
      category: dbTxn.category,
      merchantName: dbTxn.merchant_name,
      description: dbTxn.description,
      transactionDate: new Date(dbTxn.transaction_date),
      pending: dbTxn.pending,
      title: dbTxn.title,
      subtitle: dbTxn.subtitle,
      icon: dbTxn.icon,
      logo: dbTxn.logo,
      splitData: dbTxn.split_data ? JSON.parse(dbTxn.split_data) : undefined,
      createdAt: new Date(dbTxn.created_at),
      updatedAt: new Date(dbTxn.updated_at),
    };
  }

  static async create(txnData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: txnData.userId,
          bank_account_id: txnData.bankAccountId,
          plaid_transaction_id: txnData.plaidTransactionId,
          amount: txnData.amount,
          transaction_type: txnData.transactionType,
          category: txnData.category,
          merchant_name: txnData.merchantName,
          description: txnData.description,
          transaction_date: txnData.transactionDate.toISOString().split('T')[0],
          pending: txnData.pending,
          title: txnData.title,
          subtitle: txnData.subtitle,
          icon: txnData.icon,
          logo: txnData.logo,
          split_data: txnData.splitData ? JSON.stringify(txnData.splitData) : null,
        })
        .select()
        .single();

      if (error) throw error;
      return this.toTransaction(data as DBTransaction);
    } catch (err) {
      console.error('L Error creating transaction:', err);
      throw err;
    }
  }

  static async getByUserId(userId: string, limit: number = 50, offset: number = 0): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('transaction_date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return (data as DBTransaction[]).map(this.toTransaction);
    } catch (err) {
      console.error('L Error fetching transactions:', err);
      throw err;
    }
  }

  static async getByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('transaction_date', startDate.toISOString().split('T')[0])
        .lte('transaction_date', endDate.toISOString().split('T')[0])
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      return (data as DBTransaction[]).map(this.toTransaction);
    } catch (err) {
      console.error('L Error fetching transactions by date range:', err);
      throw err;
    }
  }

  static async getByBankAccount(bankAccountId: string, limit: number = 50): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('bank_account_id', bankAccountId)
        .order('transaction_date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data as DBTransaction[]).map(this.toTransaction);
    } catch (err) {
      console.error('L Error fetching transactions by bank account:', err);
      throw err;
    }
  }

  static async get(id: string): Promise<Transaction | null> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return this.toTransaction(data as DBTransaction);
    } catch (err) {
      console.error('L Error fetching transaction:', err);
      throw err;
    }
  }

  static async update(id: string, txnData: Partial<Transaction>): Promise<Transaction> {
    try {
      const updateData: any = {};

      if (txnData.amount !== undefined) updateData.amount = txnData.amount;
      if (txnData.transactionType !== undefined) updateData.transaction_type = txnData.transactionType;
      if (txnData.category !== undefined) updateData.category = txnData.category;
      if (txnData.merchantName !== undefined) updateData.merchant_name = txnData.merchantName;
      if (txnData.description !== undefined) updateData.description = txnData.description;
      if (txnData.transactionDate !== undefined) updateData.transaction_date = txnData.transactionDate.toISOString().split('T')[0];
      if (txnData.pending !== undefined) updateData.pending = txnData.pending;
      if (txnData.title !== undefined) updateData.title = txnData.title;
      if (txnData.subtitle !== undefined) updateData.subtitle = txnData.subtitle;
      if (txnData.icon !== undefined) updateData.icon = txnData.icon;
      if (txnData.logo !== undefined) updateData.logo = txnData.logo;
      if (txnData.splitData !== undefined) updateData.split_data = JSON.stringify(txnData.splitData);

      const { data, error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return this.toTransaction(data as DBTransaction);
    } catch (err) {
      console.error('L Error updating transaction:', err);
      throw err;
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('L Error deleting transaction:', err);
      throw err;
    }
  }

  static async getTotalsByCategory(userId: string, startDate: Date, endDate: Date): Promise<{ category: string; total: number }[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('category, amount')
        .eq('user_id', userId)
        .gte('transaction_date', startDate.toISOString().split('T')[0])
        .lte('transaction_date', endDate.toISOString().split('T')[0]);

      if (error) throw error;

      const categoryTotals: { [key: string]: number } = {};
      (data as DBTransaction[]).forEach(txn => {
        const cat = txn.category || 'Uncategorized';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(txn.amount);
      });

      return Object.entries(categoryTotals).map(([category, total]) => ({ category, total }));
    } catch (err) {
      console.error('L Error getting totals by category:', err);
      throw err;
    }
  }

  /**
   * Create a split transaction with multiple recipients
   * Generates a unique code and sends payment links to recipients
   */
  static async createSplitTransaction(
    txnData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'splitData'>,
    splits: Omit<SplitPerson, 'isPaid' | 'plaidLinkToken'>[]
  ): Promise<Transaction> {
    try {
      // Generate unique split code
      const splitCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const splitData: SplitData = {
        code: splitCode,
        numberOfPeople: splits.length,
        splits: splits.map(split => ({
          ...split,
          isPaid: false,
          plaidLinkToken: undefined, // Will be generated when recipient accesses the link
        })),
      };

      const transaction = await this.create({
        ...txnData,
        splitData,
      });

      // TODO: Send email/SMS to recipients with payment link
      // Each recipient will receive a link like: /split-payment/{transactionId}/{splitCode}

      return transaction;
    } catch (err) {
      console.error('L Error creating split transaction:', err);
      throw err;
    }
  }

  /**
   * Update split person payment status
   */
  static async updateSplitPaymentStatus(
    transactionId: string,
    personEmail: string,
    isPaid: boolean
  ): Promise<Transaction> {
    try {
      const transaction = await this.get(transactionId);
      if (!transaction || !transaction.splitData) {
        throw new Error('Transaction not found or not a split transaction');
      }

      const updatedSplits = transaction.splitData.splits.map(split => {
        if (split.email === personEmail) {
          return { ...split, isPaid };
        }
        return split;
      });

      return await this.update(transactionId, {
        splitData: {
          ...transaction.splitData,
          splits: updatedSplits,
        },
      });
    } catch (err) {
      console.error('L Error updating split payment status:', err);
      throw err;
    }
  }

  /**
   * Get all split transactions for a user
   */
  static async getSplitTransactions(userId: string): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .not('split_data', 'is', null)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      return (data as DBTransaction[]).map(this.toTransaction);
    } catch (err) {
      console.error('L Error fetching split transactions:', err);
      throw err;
    }
  }
}
