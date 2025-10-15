// models/UserModel.ts
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
  increment,
} from 'firebase/firestore';

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
}

export default class UserModel {
  private static COLLECTION = 'users';
  static createUser: any;

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
        ...userData,
        createdAt: serverTimestamp() as FieldValue,
        updatedAt: serverTimestamp() as FieldValue,
      };
      await setDoc(userRef, newUser);
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
    } catch (err) {
      console.error('❌ Error deleting user:', err);
      throw err;
    }
  }

  /** Update balance safely (optionally increment) */
  static async updateBalance(
    uid: string,
    newBalance?: number,
    incrementAmount?: number
  ): Promise<void> {
    try {
      const userRef = doc(db, this.COLLECTION, uid);
      const updateData: any = { updatedAt: serverTimestamp() };
      if (typeof newBalance === 'number') updateData.balance = newBalance;
      if (typeof incrementAmount === 'number') updateData.balance = increment(incrementAmount);
      await updateDoc(userRef, updateData);
    } catch (err) {
      console.error('❌ Error updating balance:', err);
      throw err;
    }
  }
}
