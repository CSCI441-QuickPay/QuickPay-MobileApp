// models/FavoriteModel.ts
import { supabase } from '@/config/supabaseConfig';

export interface Favorite {
  id?: string;
  userId: string;
  accountNumber: string;
  nickname?: string;
  accountHolderName?: string;
  accountHolderProfile?: string;
  createdAt?: Date;
}

interface DBFavorite {
  id: string;
  user_id: string;
  account_number: string;
  nickname?: string;
  created_at: string;
}

export default class FavoriteModel {
  private static toFavorite(dbFav: DBFavorite): Favorite {
    return {
      id: dbFav.id,
      userId: dbFav.user_id,
      accountNumber: dbFav.account_number,
      nickname: dbFav.nickname,
      createdAt: new Date(dbFav.created_at),
    };
  }

  /**
   * Fetch account holder details by account number
   * Returns the user's name and profile picture if found
   */
  static async getAccountHolderByAccountNumber(accountNumber: string): Promise<{ name: string; profilePicture?: string } | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('first_name, last_name, profile_picture')
        .eq('account_number', accountNumber)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return {
        name: `${data.first_name} ${data.last_name}`.trim(),
        profilePicture: data.profile_picture,
      };
    } catch (err) {
      console.error('L Error fetching account holder:', err);
      throw err;
    }
  }

  /**
   * Create a new favorite using account number
   * Automatically fetches and returns account holder details
   */
  static async create(userId: string, accountNumber: string, nickname?: string): Promise<Favorite> {
    try {
      // First verify the account exists
      const accountHolder = await this.getAccountHolderByAccountNumber(accountNumber);
      if (!accountHolder) {
        throw new Error('Account number not found');
      }

      const { data, error } = await supabase
        .from('favorites')
        .insert({
          user_id: userId,
          account_number: accountNumber,
          nickname: nickname,
        })
        .select()
        .single();

      if (error) throw error;

      const favorite = this.toFavorite(data as DBFavorite);
      // Enrich with account holder details
      favorite.accountHolderName = accountHolder.name;
      favorite.accountHolderProfile = accountHolder.profilePicture;

      return favorite;
    } catch (err) {
      console.error('L Error creating favorite:', err);
      throw err;
    }
  }

  /**
   * Get all favorites for a user with enriched account holder details
   */
  static async getByUserId(userId: string): Promise<Favorite[]> {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enrich each favorite with account holder details
      const favorites = await Promise.all(
        (data as DBFavorite[]).map(async (dbFav) => {
          const favorite = this.toFavorite(dbFav);
          const accountHolder = await this.getAccountHolderByAccountNumber(dbFav.account_number);
          if (accountHolder) {
            favorite.accountHolderName = accountHolder.name;
            favorite.accountHolderProfile = accountHolder.profilePicture;
          }
          return favorite;
        })
      );

      return favorites;
    } catch (err) {
      console.error('L Error fetching favorites:', err);
      throw err;
    }
  }

  /**
   * Get a single favorite by ID with enriched account holder details
   */
  static async get(id: string): Promise<Favorite | null> {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      const favorite = this.toFavorite(data as DBFavorite);
      const accountHolder = await this.getAccountHolderByAccountNumber(data.account_number);
      if (accountHolder) {
        favorite.accountHolderName = accountHolder.name;
        favorite.accountHolderProfile = accountHolder.profilePicture;
      }

      return favorite;
    } catch (err) {
      console.error('L Error fetching favorite:', err);
      throw err;
    }
  }

  /**
   * Update the nickname for a favorite
   */
  static async updateNickname(id: string, nickname: string): Promise<Favorite> {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .update({ nickname })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const favorite = this.toFavorite(data as DBFavorite);
      const accountHolder = await this.getAccountHolderByAccountNumber(data.account_number);
      if (accountHolder) {
        favorite.accountHolderName = accountHolder.name;
        favorite.accountHolderProfile = accountHolder.profilePicture;
      }

      return favorite;
    } catch (err) {
      console.error('L Error updating favorite nickname:', err);
      throw err;
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('L Error deleting favorite:', err);
      throw err;
    }
  }

  /**
   * Check if an account number is already favorited by a user
   */
  static async isFavorite(userId: string, accountNumber: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('account_number', accountNumber)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return false;
        throw error;
      }

      return !!data;
    } catch (err) {
      console.error('L Error checking favorite status:', err);
      throw err;
    }
  }

  /**
   * Get favorite by account number for a specific user
   */
  static async getByAccountNumber(userId: string, accountNumber: string): Promise<Favorite | null> {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userId)
        .eq('account_number', accountNumber)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      const favorite = this.toFavorite(data as DBFavorite);
      const accountHolder = await this.getAccountHolderByAccountNumber(data.account_number);
      if (accountHolder) {
        favorite.accountHolderName = accountHolder.name;
        favorite.accountHolderProfile = accountHolder.profilePicture;
      }

      return favorite;
    } catch (err) {
      console.error('L Error fetching favorite by account number:', err);
      throw err;
    }
  }
}
