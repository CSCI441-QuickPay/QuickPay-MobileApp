// models/UserModel.ts
import { supabase } from '@/config/supabaseConfig';

export interface User {
  id?: string;
  clerkId: string;
  email: string;
  accountNumber: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profilePicture?: string;
  balance: number;
  createdAt?: Date;
  updatedAt?: Date;
  isActive: boolean;
  verified: boolean;
  plaidAccessToken?: string;
  plaidItemId?: string;
  plaidLinkedAt?: Date;
}

interface DBUser {
  id: string;
  clerk_id: string;
  email: string;
  account_number: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  profile_picture?: string;
  balance: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  verified: boolean;
  plaid_access_token?: string;
  plaid_item_id?: string;
  plaid_linked_at?: string;
}

export default class UserModel {
  /** Convert database row to User object */
  private static toUser(dbUser: DBUser): User {
    return {
      id: dbUser.id,
      clerkId: dbUser.clerk_id,
      email: dbUser.email,
      accountNumber: dbUser.account_number,
      firstName: dbUser.first_name,
      lastName: dbUser.last_name,
      phoneNumber: dbUser.phone_number,
      profilePicture: dbUser.profile_picture,
      balance: Number(dbUser.balance),
      isActive: dbUser.is_active,
      verified: dbUser.verified,
      plaidAccessToken: dbUser.plaid_access_token,
      plaidItemId: dbUser.plaid_item_id,
      plaidLinkedAt: dbUser.plaid_linked_at ? new Date(dbUser.plaid_linked_at) : undefined,
      createdAt: new Date(dbUser.created_at),
      updatedAt: new Date(dbUser.updated_at),
    };
  }

  /** Create a new user */
  static async create(clerkId: string, userData: Partial<User>): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          clerk_id: clerkId,
          email: userData.email!,
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone_number: userData.phoneNumber,
          profile_picture: userData.profilePicture,
          balance: userData.balance ?? 0,
          is_active: userData.isActive ?? true,
          verified: userData.verified ?? false,
        })
        .select()
        .single();

      if (error) throw error;
      return this.toUser(data as DBUser);
    } catch (err) {
      console.error('❌ Error creating user:', err);
      throw err;
    }
  }

  /** Get user by Clerk ID */
  static async getByClerkId(clerkId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_id', clerkId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return this.toUser(data as DBUser);
    } catch (err) {
      console.error('❌ Error fetching user by Clerk ID:', err);
      throw err;
    }
  }

  /** Get user by email */
  static async getByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return this.toUser(data as DBUser);
    } catch (err) {
      console.error('❌ Error fetching user by email:', err);
      throw err;
    }
  }

  /** Get user by database ID */
  static async get(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return this.toUser(data as DBUser);
    } catch (err) {
      console.error('❌ Error fetching user:', err);
      throw err;
    }
  }

  /** Update user fields by Clerk ID */
  static async update(clerkId: string, userData: Partial<User>): Promise<User> {
    try {
      const updateData: any = {};

      if (userData.email) updateData.email = userData.email;
      if (userData.firstName !== undefined) updateData.first_name = userData.firstName;
      if (userData.lastName !== undefined) updateData.last_name = userData.lastName;
      if (userData.phoneNumber !== undefined) updateData.phone_number = userData.phoneNumber;

      if (userData.balance !== undefined) updateData.balance = userData.balance;
      if (userData.isActive !== undefined) updateData.is_active = userData.isActive;
      if (userData.verified !== undefined) updateData.verified = userData.verified;
      if (userData.plaidAccessToken !== undefined) updateData.plaid_access_token = userData.plaidAccessToken;
      if (userData.plaidItemId !== undefined) updateData.plaid_item_id = userData.plaidItemId;
      if (userData.plaidLinkedAt !== undefined) updateData.plaid_linked_at = userData.plaidLinkedAt?.toISOString();

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('clerk_id', clerkId)
        .select()
        .single();

      if (error) throw error;
      return this.toUser(data as DBUser);
    } catch (err) {
      console.error('❌ Error updating user:', err);
      throw err;
    }
  }

  /** Delete user by Clerk ID */
  static async delete(clerkId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('clerk_id', clerkId);

      if (error) throw error;
    } catch (err) {
      console.error('❌ Error deleting user:', err);
      throw err;
    }
  }

  /** Update balance safely */
  static async updateBalance(
    clerkId: string,
    newBalance?: number,
    incrementAmount?: number
  ): Promise<User> {
    try {
      if (incrementAmount !== undefined) {
        // For increment, we need to fetch current balance first
        const user = await this.getByClerkId(clerkId);
        if (!user) throw new Error('User not found');

        newBalance = user.balance + incrementAmount;
      }

      if (newBalance === undefined) {
        throw new Error('Either newBalance or incrementAmount must be provided');
      }

      const { data, error } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('clerk_id', clerkId)
        .select()
        .single();

      if (error) throw error;
      return this.toUser(data as DBUser);
    } catch (err) {
      console.error('❌ Error updating balance:', err);
      throw err;
    }
  }

  /** Update Plaid information */
  static async updatePlaidInfo(
    clerkId: string,
    accessToken: string,
    itemId: string
  ): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          plaid_access_token: accessToken,
          plaid_item_id: itemId,
          plaid_linked_at: new Date().toISOString(),
        })
        .eq('clerk_id', clerkId)
        .select()
        .single();

      if (error) throw error;
      return this.toUser(data as DBUser);
    } catch (err) {
      console.error('❌ Error updating Plaid info:', err);
      throw err;
    }
  }

  /** Get user by account number */
  static async getByAccountNumber(accountNumber: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('account_number', accountNumber)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return this.toUser(data as DBUser);
    } catch (err) {
      console.error('❌ Error fetching user by account number:', err);
      throw err;
    }
  }
}
