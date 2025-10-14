import { 
  collection,
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

export interface User {
  userID: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  profileImage?: string;
  createdAt?: any;
  updatedAt?: any;
}

class UserModel {
  static collectionName = 'users';

  /**
   * Create a new user in Firestore
   */
  static async createUser(userData: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    try {
      const userRef = doc(db, this.collectionName, userData.userID);
      const newUser: User = {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(userRef, newUser);
      console.log('✅ User created successfully:', userData.userID);
      return newUser;
    } catch (error) {
      console.error('❌ Error creating user:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  static async getUserByID(userID: string): Promise<User | null> {
    try {
      const userRef = doc(db, this.collectionName, userID);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return { userID: userSnap.id, ...userSnap.data() } as User;
      }
      
      console.log('⚠️ User not found:', userID);
      return null;
    } catch (error) {
      console.error('❌ Error getting user:', error);
      throw error;
    }
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('email', '==', email)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        return { userID: userDoc.id, ...userDoc.data() } as User;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error getting user by email:', error);
      throw error;
    }
  }

  /**
   * Update user information
   */
  static async updateUser(
    userID: string, 
    updates: Partial<Omit<User, 'userID' | 'createdAt'>>
  ): Promise<User | null> {
    try {
      const userRef = doc(db, this.collectionName, userID);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(userRef, updateData);
      console.log('✅ User updated successfully:', userID);
      
      return this.getUserByID(userID);
    } catch (error) {
      console.error('❌ Error updating user:', error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(userID: string): Promise<void> {
    try {
      const userRef = doc(db, this.collectionName, userID);
      await deleteDoc(userRef);
      console.log('✅ User deleted successfully:', userID);
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Check if user exists
   */
  static async userExists(userID: string): Promise<boolean> {
    try {
      const user = await this.getUserByID(userID);
      return user !== null;
    } catch (error) {
      console.error('❌ Error checking user existence:', error);
      return false;
    }
  }
}

export default UserModel;