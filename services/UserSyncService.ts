// services/UserSyncService.ts
import UserModel from '@/models/UserModel';

export interface ClerkUserData {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profilePicture?: string;
}

export default class UserSyncService {
  /**
   * Create or update user in Supabase from Clerk data
   * Call this after successful Clerk signup/login
   */
  static async syncUserToSupabase(userData: ClerkUserData): Promise<void> {
    try {
      console.log('🔄 Syncing user to Supabase...', userData.email);

      // Check if user already exists by Clerk ID
      let existingUser = await UserModel.getByClerkId(userData.clerkId);

      // If not found by Clerk ID, check by email (in case of duplicate signup)
      if (!existingUser) {
        existingUser = await UserModel.getByEmail(userData.email);
      }

      if (existingUser) {
        console.log('✅ User already exists in Supabase:', existingUser.email);
        // Update user data
        await UserModel.update(userData.clerkId, {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phoneNumber: userData.phoneNumber,
          profilePicture: userData.profilePicture,
        } as any);
        console.log('✅ User updated in Supabase');
      } else {
        // Create new user in Supabase
        try {
          const newUser = await UserModel.create(userData.clerkId, {
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phoneNumber: userData.phoneNumber,
            profilePicture: userData.profilePicture,
            balance: 0,
            isActive: true,
            verified: false,
          } as any);

          console.log('✅ New user created in Supabase:', newUser.email);
        } catch (createError: any) {
          // Handle duplicate key error gracefully
          if (createError?.code === '23505') {
            console.log('⚠️ User already exists (duplicate key), fetching existing user...');
            existingUser = await UserModel.getByEmail(userData.email);
            if (existingUser) {
              console.log('✅ Found existing user, updating...');
              await UserModel.update(userData.clerkId, {
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                phoneNumber: userData.phoneNumber,
                profilePicture: userData.profilePicture,
              } as any);
            }
          } else {
            throw createError;
          }
        }
      }
    } catch (error: any) {
      // Only log non-duplicate errors
      if (error?.code !== '23505') {
        console.error('❌ Failed to sync user:', error);
      }
      // Don't throw error - allow user to continue even if sync fails
      console.log('⚠️ Continuing despite sync error...');
    }
  }

  /**
   * Helper to get current Clerk user data in the right format
   */
  static getClerkUserData(clerkUser: any): ClerkUserData | null {
    if (!clerkUser) return null;

    return {
      clerkId: clerkUser.id,
      email: clerkUser.primaryEmailAddress?.emailAddress || '',
      firstName: clerkUser.firstName || undefined,
      lastName: clerkUser.lastName || undefined,
      phoneNumber: clerkUser.primaryPhoneNumber?.phoneNumber || undefined,
      profilePicture: clerkUser.imageUrl || undefined,
    };
  }

  /**
   * Hook-based sync - use this in components after Clerk auth
   */
  static async syncCurrentUser(clerkUser: any): Promise<void> {
    const userData = this.getClerkUserData(clerkUser);
    if (!userData) {
      throw new Error('No Clerk user data available');
    }

    await this.syncUserToSupabase(userData);
  }
}
