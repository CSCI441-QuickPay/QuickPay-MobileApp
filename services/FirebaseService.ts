import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import UserModel, { User } from '../models/UserModel';

class FirebaseService {
  /**
   * Sign up new user
   */
  static async signUp(
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string,
    phoneNumber?: string
  ): Promise<{ user: FirebaseUser; userData: User }> {
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update display name
      await updateProfile(firebaseUser, {
        displayName: `${firstName} ${lastName}`
      });

      // Create user document in Firestore
      const userData = await UserModel.createUser({
        userID: firebaseUser.uid,
        firstName,
        lastName,
        email,
        phoneNumber
      });

      console.log('✅ User signed up successfully:', email);
      return { user: firebaseUser, userData };
    } catch (error: any) {
      console.error('❌ Sign up error:', error.message);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign in existing user
   */
  static async signIn(email: string, password: string): Promise<FirebaseUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ User signed in successfully:', email);
      return userCredential.user;
    } catch (error: any) {
      console.error('❌ Sign in error:', error.message);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
      console.log('✅ User signed out successfully');
    } catch (error: any) {
      console.error('❌ Sign out error:', error.message);
      throw error;
    }
  }

  /**
   * Send password reset email
   */
  static async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('✅ Password reset email sent to:', email);
    } catch (error: any) {
      console.error('❌ Password reset error:', error.message);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Get current user
   */
  static getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  /**
   * Get current user ID
   */
  static getCurrentUserID(): string | null {
    return auth.currentUser?.uid || null;
  }

  /**
   * Handle Firebase Auth errors
   */
  private static handleAuthError(error: any): Error {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return new Error('This email is already registered.');
      case 'auth/invalid-email':
        return new Error('Invalid email address.');
      case 'auth/weak-password':
        return new Error('Password should be at least 6 characters.');
      case 'auth/user-not-found':
        return new Error('No account found with this email.');
      case 'auth/wrong-password':
        return new Error('Incorrect password.');
      case 'auth/too-many-requests':
        return new Error('Too many attempts. Please try again later.');
      default:
        return new Error(error.message || 'An error occurred. Please try again.');
    }
  }
}

export default FirebaseService;