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

export interface User {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profilePicture?: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  verified: boolean;
  clerkId?: string;
  plaidConnections?: PlaidConnectionData[];
}

export default class UserModel {
  private static COLLECTION = 'users';

  /** Create a new user */
  static async create(uid: string, userData: Partial<User>): Promise<void> {
    try {
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
    } catch (err) {
      console.error('❌ Error creating user:', err);
      throw err;
    }
  }

  /** Get user by UID */
  static async get(uid: string): Promise<User | null> {
    try {
      const userRef = doc(db, this.COLLECTION, uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return null;

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
    } catch (err) {
      console.error('❌ Error fetching user:', err);
      throw err;
    }
  }

  /** Update user fields */
  static async update(uid: string, userData: Partial<User>): Promise<void> {
    try {
      const userRef = doc(db, this.COLLECTION, uid);
      await updateDoc(userRef, {
        ...userData,
        updatedAt: serverTimestamp(),
      });
      console.log('✅ User updated:', uid);
    } catch (err) {
      console.error('❌ Error updating user:', err);
      throw err;
    }
  }

  /** Delete user */
  static async delete(uid: string): Promise<void> {
    try {
      const userRef = doc(db, this.COLLECTION, uid);
      await deleteDoc(userRef);
      console.log('✅ User deleted:', uid);
    } catch (err) {
      console.error('❌ Error deleting user:', err);
      throw err;
    }
  }

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
    } catch (err) {
      console.error('❌ Error updating balance:', err);
      throw err;
    }
  }
}