// models/BankAccountModel.ts
import { supabase } from '@/config/supabaseConfig';

export type AccountType = 'checking' | 'savings' | 'credit' | 'investment' | 'loan' | 'other';

export interface BankAccount {
  id?: string;
  userId: string;
  plaidAccountId?: string;
  accountName: string;
  accountType: AccountType;
  balance: number;
  availableBalance?: number;
  currency: string;
  mask?: string; // last 4 digits
  institutionName?: string;
  isPrimary: boolean;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DBBankAccount {
  id: string;
  user_id: string;
  plaid_account_id?: string;
  account_name: string;
  account_type: string;
  balance: number;
  available_balance?: number;
  currency: string;
  mask?: string;
  institution_name?: string;
  is_primary: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default class BankAccountModel {
  /** Convert database row to BankAccount object */
  private static toBankAccount(dbAccount: DBBankAccount): BankAccount {
    return {
      id: dbAccount.id,
      userId: dbAccount.user_id,
      plaidAccountId: dbAccount.plaid_account_id,
      accountName: dbAccount.account_name,
      accountType: dbAccount.account_type as AccountType,
      balance: Number(dbAccount.balance),
      availableBalance: dbAccount.available_balance ? Number(dbAccount.available_balance) : undefined,
      currency: dbAccount.currency,
      mask: dbAccount.mask,
      institutionName: dbAccount.institution_name,
      isPrimary: dbAccount.is_primary,
      isActive: dbAccount.is_active,
      createdAt: new Date(dbAccount.created_at),
      updatedAt: new Date(dbAccount.updated_at),
    };
  }

  /** Create a new bank account */
  static async create(accountData: Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<BankAccount> {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .insert({
          user_id: accountData.userId,
          plaid_account_id: accountData.plaidAccountId,
          account_name: accountData.accountName,
          account_type: accountData.accountType,
          balance: accountData.balance,
          available_balance: accountData.availableBalance,
          currency: accountData.currency,
          mask: accountData.mask,
          institution_name: accountData.institutionName,
          is_primary: accountData.isPrimary,
          is_active: accountData.isActive,
        })
        .select()
        .single();

      if (error) throw error;
      return this.toBankAccount(data as DBBankAccount);
    } catch (err) {
      console.error('L Error creating bank account:', err);
      throw err;
    }
  }

  /** Get all bank accounts for a user */
  static async getByUserId(userId: string, activeOnly: boolean = true): Promise<BankAccount[]> {
    try {
      let query = supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', userId)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false });

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data as DBBankAccount[]).map(this.toBankAccount);
    } catch (err) {
      console.error('L Error fetching bank accounts:', err);
      throw err;
    }
  }

  /** Get a single bank account by ID */
  static async get(id: string): Promise<BankAccount | null> {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return this.toBankAccount(data as DBBankAccount);
    } catch (err) {
      console.error('L Error fetching bank account:', err);
      throw err;
    }
  }

  /** Get bank account by Plaid account ID */
  static async getByPlaidAccountId(plaidAccountId: string): Promise<BankAccount | null> {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('plaid_account_id', plaidAccountId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return this.toBankAccount(data as DBBankAccount);
    } catch (err) {
      console.error('L Error fetching bank account by Plaid ID:', err);
      throw err;
    }
  }

  /** Get primary bank account for a user */
  static async getPrimary(userId: string): Promise<BankAccount | null> {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_primary', true)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return this.toBankAccount(data as DBBankAccount);
    } catch (err) {
      console.error('L Error fetching primary account:', err);
      throw err;
    }
  }

  /** Update bank account */
  static async update(id: string, accountData: Partial<BankAccount>): Promise<BankAccount> {
    try {
      const updateData: any = {};

      if (accountData.accountName !== undefined) updateData.account_name = accountData.accountName;
      if (accountData.accountType !== undefined) updateData.account_type = accountData.accountType;
      if (accountData.balance !== undefined) updateData.balance = accountData.balance;
      if (accountData.availableBalance !== undefined) updateData.available_balance = accountData.availableBalance;
      if (accountData.currency !== undefined) updateData.currency = accountData.currency;
      if (accountData.mask !== undefined) updateData.mask = accountData.mask;
      if (accountData.institutionName !== undefined) updateData.institution_name = accountData.institutionName;
      if (accountData.isPrimary !== undefined) updateData.is_primary = accountData.isPrimary;
      if (accountData.isActive !== undefined) updateData.is_active = accountData.isActive;

      const { data, error } = await supabase
        .from('bank_accounts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return this.toBankAccount(data as DBBankAccount);
    } catch (err) {
      console.error('L Error updating bank account:', err);
      throw err;
    }
  }

  /** Set primary account (unsets other primary accounts for the user) */
  static async setPrimary(id: string, userId: string): Promise<BankAccount> {
    try {
      // First, unset all primary accounts for this user
      await supabase
        .from('bank_accounts')
        .update({ is_primary: false })
        .eq('user_id', userId);

      // Then set this one as primary
      const { data, error } = await supabase
        .from('bank_accounts')
        .update({ is_primary: true })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return this.toBankAccount(data as DBBankAccount);
    } catch (err) {
      console.error('L Error setting primary account:', err);
      throw err;
    }
  }

  /** Update balance */
  static async updateBalance(id: string, newBalance: number, availableBalance?: number): Promise<BankAccount> {
    try {
      const updateData: any = { balance: newBalance };
      if (availableBalance !== undefined) {
        updateData.available_balance = availableBalance;
      }

      const { data, error } = await supabase
        .from('bank_accounts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return this.toBankAccount(data as DBBankAccount);
    } catch (err) {
      console.error('L Error updating balance:', err);
      throw err;
    }
  }

  /** Soft delete (deactivate) bank account */
  static async deactivate(id: string): Promise<BankAccount> {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return this.toBankAccount(data as DBBankAccount);
    } catch (err) {
      console.error('L Error deactivating bank account:', err);
      throw err;
    }
  }

  /** Hard delete bank account */
  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('L Error deleting bank account:', err);
      throw err;
    }
  }

  /** Get total balance across all accounts for a user */
  static async getTotalBalance(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('balance')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) throw error;

      const total = (data as DBBankAccount[]).reduce((sum, account) => sum + Number(account.balance), 0);
      return total;
    } catch (err) {
      console.error('L Error calculating total balance:', err);
      throw err;
    }
  }
}
