/**
 * UserSyncService.ts
 *
 * Service responsible for synchronizing user data between Clerk (authentication provider)
 * and Supabase (application database). This ensures that user information is consistent
 * across both systems.
 *
 * Key Responsibilities:
 * - Create new user records in Supabase after Clerk signup
 * - Update existing user records when Clerk data changes
 * - Handle duplicate user scenarios gracefully
 * - Transform Clerk user objects into application-compatible format
 *
 * Flow:
 * 1. User authenticates with Clerk (signup/login)
 * 2. App calls syncUserToSupabase() with Clerk user data
 * 3. Service checks if user exists in Supabase (by Clerk ID or email)
 * 4. Creates new user or updates existing user in Supabase
 * 5. Returns success or handles errors gracefully
 */

import { useUser } from '@clerk/clerk-expo';
import UserModel from '@/models/UserModel';

/**
 * Interface defining the structure of user data from Clerk authentication service
 * This serves as the transfer object between Clerk and Supabase
 */
export interface ClerkUserData {
  clerkId: string;           // Unique identifier from Clerk
  email: string;              // User's primary email address
  firstName?: string;         // Optional first name
  lastName?: string;          // Optional last name
  phoneNumber?: string;       // Optional phone number
  profilePicture?: string;    // Optional profile image URL
}

/**
 * UserSyncService - Handles synchronization of user data between Clerk and Supabase
 *
 * This service is critical for maintaining data consistency across authentication
 * and application layers. It ensures every authenticated user has a corresponding
 * record in the application database with up-to-date information.
 */
export default class UserSyncService {
  /**
   * Synchronizes user data from Clerk to Supabase database
   *
   * This method performs an "upsert" operation - it creates a new user if they don't exist,
   * or updates an existing user if they do. This is the core synchronization logic.
   *
   * Algorithm:
   * 1. Check if user exists in Supabase by Clerk ID (primary lookup)
   * 2. If not found, check by email (fallback for data mismatches)
   * 3. If user exists, update their information to match Clerk
   * 4. If user doesn't exist, create new record with default values
   * 5. Handle duplicate key errors gracefully (race conditions)
   *
   * @param userData - User information from Clerk authentication
   * @throws Error if sync fails (except for duplicate key errors which are handled)
   * @returns Promise<void> - Resolves when sync is complete
   *
   * Usage:
   *   await UserSyncService.syncUserToSupabase({
   *     clerkId: user.id,
   *     email: user.email,
   *     firstName: user.firstName
   *   });
   */
  static async syncUserToSupabase(userData: ClerkUserData): Promise<void> {
    try {
      console.log('🔄 Syncing user to Supabase...', userData.email);

      // Step 1: Check if user already exists by Clerk ID (most reliable identifier)
      let existingUser = await UserModel.getByClerkId(userData.clerkId);

      // Step 2: Fallback - If not found by Clerk ID, check by email
      // This handles edge cases where Clerk ID might be missing in old records
      if (!existingUser) {
        existingUser = await UserModel.getByEmail(userData.email);
      }

      // Step 3: Update existing user or create new one
      if (existingUser) {
        console.log('✅ User already exists in Supabase:', existingUser.email);

        // Update user data to keep it in sync with Clerk
        // Only update fields that might change (not email or clerkId)
        await UserModel.update(userData.clerkId, {
          firstName: userData.firstName,
          lastName: userData.lastName,
          phoneNumber: userData.phoneNumber,
          profilePicture: userData.profilePicture,
        } as any);

        console.log('✅ User data updated in Supabase');
      } else {
        // Create new user in Supabase with default values
        const newUser = await UserModel.create(userData.clerkId, {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phoneNumber: userData.phoneNumber,
          profilePicture: userData.profilePicture,
          balance: 0,           // Initialize with zero balance
          isActive: true,       // New users are active by default
          verified: false,      // Email verification status (handled separately)
        } as any);

        console.log('✅ New user created in Supabase:', newUser.email);
      }
    } catch (error: any) {
      // Handle PostgreSQL duplicate key constraint violation (code 23505)
      // This can occur in race conditions when multiple requests try to create the same user
      if (error?.code === '23505') {
        console.log('ℹ️  User already exists in database (duplicate key detected)');
        console.log('✅ Continuing with existing account');
        return; // Don't throw error, just continue - this is not a failure scenario
      }

      // For all other errors, log and re-throw
      console.error('❌ Error syncing user to Supabase:', error);
      throw error;
    }
  }

  /**
   * Transforms Clerk user object into ClerkUserData format
   *
   * This helper method extracts relevant user information from Clerk's user object
   * and converts it into the standardized format used by our application.
   *
   * Clerk user objects have a complex nested structure with multiple fields.
   * This method normalizes that structure into our simpler ClerkUserData interface.
   *
   * @param clerkUser - The user object from Clerk's authentication system
   * @returns ClerkUserData object or null if clerkUser is null/undefined
   *
   * Example:
   *   const { user } = useUser(); // Get Clerk user from hook
   *   const userData = UserSyncService.getClerkUserData(user);
   */
  static getClerkUserData(clerkUser: any): ClerkUserData | null {
    // Guard clause - return null if no user data provided
    if (!clerkUser) return null;

    // Extract and transform Clerk user data into our format
    return {
      clerkId: clerkUser.id,                                              // Clerk's unique user ID
      email: clerkUser.primaryEmailAddress?.emailAddress || '',           // Primary email (required)
      firstName: clerkUser.firstName || undefined,                        // Optional first name
      lastName: clerkUser.lastName || undefined,                          // Optional last name
      phoneNumber: clerkUser.primaryPhoneNumber?.phoneNumber || undefined, // Optional phone
      profilePicture: clerkUser.imageUrl || undefined,                    // Optional profile image URL
    };
  }

  /**
   * Synchronizes the currently authenticated Clerk user to Supabase
   *
   * This is a convenience method that combines getClerkUserData() and syncUserToSupabase()
   * into a single call. Use this in React components after Clerk authentication completes.
   *
   * @param clerkUser - The Clerk user object (typically from useUser() hook)
   * @throws Error if no user data is available or sync fails
   * @returns Promise<void> - Resolves when sync is complete
   *
   * Usage in component:
   *   const { user } = useUser();
   *   await UserSyncService.syncCurrentUser(user);
   */
  static async syncCurrentUser(clerkUser: any): Promise<void> {
    // Transform Clerk user object into our format
    const userData = this.getClerkUserData(clerkUser);

    // Validate that we have user data
    if (!userData) {
      throw new Error('No Clerk user data available');
    }

    // Perform the actual sync operation
    await this.syncUserToSupabase(userData);
  }
}
