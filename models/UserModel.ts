<<<<<<< HEAD
// models/UserModel.ts
import { supabase } from '@/config/supabaseConfig';
=======
import { db } from '@/config/firebaseConfig';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  FieldValue,
} from 'firestore';

export interface PlaidConnectionData {
  accessToken: string;
  itemId: string;
  institutionId: string;
  institutionName: string;
  connectedAt: Date;
  accounts: Array<{
    id: string;
    name: string;
    mask: string;
    type: string;
    subtype: string;
    balance: number;
  }>;
}
>>>>>>> 45d9a714e81b3475ae962d37f2dc76ef076231d8

export interface User {
  id?: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profilePicture?: string;
  balance: number;
<<<<<<< HEAD
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
=======
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  verified: boolean;
  clerkId?: string;
  plaidConnections?: PlaidConnectionData[];
}

export default class UserModel {
  private static COLLECTION = 'users';
>>>>>>> 45d9a714e81b3475ae962d37f2dc76ef076231d8

  /** Create a new user */
  static async create(clerkId: string, userData: Partial<User>): Promise<User> {
    try {
<<<<<<< HEAD
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
=======
      const userRef = doc(db, this.COLLECTION, uid);
      const newUser = {
        uid,
        balance: 0,
        isActive: true,
        verified: false,
        phoneNumber: userData.phoneNumber ?? '',
        profilePicture: userData.profilePicture ?? '',
        plaidConnections: [],
        ...userData,
        createdAt: serverTimestamp() as FieldValue,
        updatedAt: serverTimestamp() as FieldValue,
      };
      await setDoc(userRef, newUser);
      console.log('✅ User created in Firestore:', uid);
>>>>>>> 45d9a714e81b3475ae962d37f2dc76ef076231d8
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

<<<<<<< HEAD
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
=======
      const data = userSnap.data();
      return {
        uid: data.uid,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber ?? '',
        profilePicture: data.profilePicture ?? '',
        balance: data.balance,
        isActive: data.isActive,
        verified: data.verified,
        clerkId: data.clerkId,
        plaidConnections: data.plaidConnections || [],
        createdAt: (data.createdAt as Timestamp).toDate(),
        updatedAt: (data.updatedAt as Timestamp).toDate(),
      };
>>>>>>> 45d9a714e81b3475ae962d37f2dc76ef076231d8
    } catch (err) {
      console.error('❌ Error fetching user:', err);
      throw err;
    }
  }

  /** Update user fields by Clerk ID */
  static async update(clerkId: string, userData: Partial<User>): Promise<User> {
    try {
<<<<<<< HEAD
      const updateData: any = {};

      if (userData.email) updateData.email = userData.email;
      if (userData.firstName !== undefined) updateData.first_name = userData.firstName;
      if (userData.lastName !== undefined) updateData.last_name = userData.lastName;
      if (userData.phoneNumber !== undefined) updateData.phone_number = userData.phoneNumber;
      if (userData.profilePicture !== undefined) updateData.profile_picture = userData.profilePicture;
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
=======
      const userRef = doc(db, this.COLLECTION, uid);
      await updateDoc(userRef, {
        ...userData,
        updatedAt: serverTimestamp(),
      });
      console.log('✅ User updated:', uid);
>>>>>>> 45d9a714e81b3475ae962d37f2dc76ef076231d8
    } catch (err) {
      console.error('❌ Error updating user:', err);
      throw err;
    }
  }

  /** Delete user by Clerk ID */
  static async delete(clerkId: string): Promise<void> {
    try {
<<<<<<< HEAD
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('clerk_id', clerkId);

      if (error) throw error;
=======
      const userRef = doc(db, this.COLLECTION, uid);
      await deleteDoc(userRef);
      console.log('✅ User deleted:', uid);
>>>>>>> 45d9a714e81b3475ae962d37f2dc76ef076231d8
    } catch (err) {
      console.error('❌ Error deleting user:', err);
      throw err;
    }
  }

<<<<<<< HEAD
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
=======
  /** Add Plaid connection */
  static async addPlaidConnection(
    uid: string,
    connectionData: PlaidConnectionData
  ): Promise<void> {
    try {
      const user = await this.get(uid);
      if (!user) throw new Error('User not found');

      const connections = user.plaidConnections || [];
      connections.push(connectionData);

      await this.update(uid, { plaidConnections: connections });
      console.log('✅ Plaid connection added for user:', uid);
    } catch (err) {
      console.error('❌ Error adding Plaid connection:', err);
      throw err;
    }
  }

  /** Remove Plaid connection */
  static async removePlaidConnection(uid: string, itemId: string): Promise<void> {
    try {
      const user = await this.get(uid);
      if (!user) throw new Error('User not found');

      const connections = (user.plaidConnections || []).filter(
        (conn) => conn.itemId !== itemId
      );

      await this.update(uid, { plaidConnections: connections });
      console.log('✅ Plaid connection removed for user:', uid);
    } catch (err) {
      console.error('❌ Error removing Plaid connection:', err);
      throw err;
    }
  }

  /** Update account balance from Plaid */
  static async updateBalance(uid: string, newBalance: number): Promise<void> {
    try {
      await this.update(uid, { balance: newBalance });
      console.log('✅ Balance updated for user:', uid, '- New balance:', newBalance);
>>>>>>> 45d9a714e81b3475ae962d37f2dc76ef076231d8
    } catch (err) {
      console.error('❌ Error updating balance:', err);
      throw err;
    }
  }
<<<<<<< HEAD

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
}
=======
}
>>>>>>> 45d9a714e81b3475ae962d37f2dc76ef076231d8
