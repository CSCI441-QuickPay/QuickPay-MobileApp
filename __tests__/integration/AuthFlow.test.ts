/**
 * written by: Team QuickPay
 * tested by: Team QuickPay
 * debugged by: Team QuickPay
 * Notes: Contributions were shared, see GitHub history for commit details.
 * Integration Tests for Authentication Flow
 *
 * These tests verify the complete authentication flow from signup/login
 * through Clerk to user synchronization with Supabase database.
 *
 * Integration Test Scope:
 * - Complete signup flow (Clerk + Supabase sync)
 * - Complete login flow (Clerk + Supabase sync)
 *
 * Note: These tests mock external services (Clerk, Supabase) since
 * integration tests typically don't hit real APIs in CI/CD environments.
 * For end-to-end testing with real APIs, use E2E test framework like Detox.
 */

import UserSyncService, { ClerkUserData } from '../../services/UserSyncService';
import UserModel from '../../models/UserModel';

// Mock external dependencies
jest.mock('../../models/UserModel');
jest.mock('@clerk/clerk-expo');

describe('Authentication Flow Integration Tests', () => {
  // Clean up before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test Suite: Complete Signup Flow
   * Tests the entire process from user signup through data persistence
   */
  describe('Complete Signup Flow', () => {
    /**
     * Test: New user signup should create records in both Clerk and Supabase
     *
     * Flow:
     * 1. User completes signup form in app
     * 2. App calls Clerk API to create authentication account
     * 3. Clerk returns user object with ID and details
     * 4. App calls UserSyncService to create Supabase record
     * 5. User can now access the app with complete profile
     *
     * Expected: User exists in database with correct initial values
     */
    it('should complete full signup flow: Clerk -> Supabase sync', async () => {
      // Arrange: Simulate Clerk signup success
      const clerkUser = {
        id: 'clerk_newuser_123',
        primaryEmailAddress: {
          emailAddress: 'newuser@example.com',
        },
        firstName: 'Alice',
        lastName: 'Johnson',
        primaryPhoneNumber: {
          phoneNumber: '+1234567890',
        },
        imageUrl: 'https://img.clerk.com/alice.jpg',
      };

      // Mock that user doesn't exist yet (new signup)
      (UserModel.getByClerkId as jest.Mock).mockResolvedValue(null);
      (UserModel.getByEmail as jest.Mock).mockResolvedValue(null);

      // Mock successful user creation in Supabase
      const createdUser = {
        id: 1,
        clerk_id: 'clerk_newuser_123',
        email: 'newuser@example.com',
        firstName: 'Alice',
        lastName: 'Johnson',
        phoneNumber: '+1234567890',
        profilePicture: 'https://img.clerk.com/alice.jpg',
        balance: 0,
        isActive: true,
        verified: false,
        created_at: new Date().toISOString(),
      };
      (UserModel.create as jest.Mock).mockResolvedValue(createdUser);

      // Act: Simulate complete signup flow
      await UserSyncService.syncCurrentUser(clerkUser);

      // Assert: Verify user was created in Supabase
      // Note: profilePicture is intentionally NOT synced from Clerk
      expect(UserModel.create).toHaveBeenCalledWith(
        'clerk_newuser_123',
        expect.objectContaining({
          email: 'newuser@example.com',
          firstName: 'Alice',
          lastName: 'Johnson',
          phoneNumber: '+1234567890',
          balance: 0,
          isActive: true,
          verified: false,
        })
      );

      // Assert: Verify lookup methods were called
      expect(UserModel.getByClerkId).toHaveBeenCalledWith('clerk_newuser_123');
      expect(UserModel.getByEmail).toHaveBeenCalledWith('newuser@example.com');
    });
  });

  /**
   * Test Suite: Complete Login Flow
   * Tests returning user login and data synchronization
   */
  describe('Complete Login Flow', () => {
    /**
     * Test: Existing user login should sync updated data
     *
     * Flow:
     * 1. User enters credentials
     * 2. Clerk authenticates and returns user object
     * 3. App syncs any updated fields to Supabase
     * 4. User accesses app with current data
     *
     * Expected: Existing user data updated in database
     */
    it('should complete full login flow: Clerk -> Supabase update', async () => {
      // Arrange: Simulate existing user logging in
      const clerkUser = {
        id: 'clerk_existing_abc',
        primaryEmailAddress: {
          emailAddress: 'existing@example.com',
        },
        firstName: 'Bob',
        lastName: 'Smith',
        phoneNumber: null,
        imageUrl: 'https://img.clerk.com/bob_new.jpg', // Updated profile pic
      };

      // Mock existing user in database (old data)
      const existingUser = {
        id: 3,
        clerk_id: 'clerk_existing_abc',
        email: 'existing@example.com',
        firstName: 'Bob',
        lastName: 'Smith',
        phoneNumber: null,
        profilePicture: 'https://img.clerk.com/bob_old.jpg', // Old picture
      };
      (UserModel.getByClerkId as jest.Mock).mockResolvedValue(existingUser);

      // Act: Sync on login
      await UserSyncService.syncCurrentUser(clerkUser);

      // Assert: User data should be updated
      // Note: profilePicture is intentionally NOT synced during login
      expect(UserModel.update).toHaveBeenCalledWith(
        'clerk_existing_abc',
        expect.objectContaining({
          firstName: 'Bob',
          lastName: 'Smith',
          phoneNumber: undefined,
        })
      );

      // Assert: Create should NOT be called for existing user
      expect(UserModel.create).not.toHaveBeenCalled();
    });
  });

  /**
   * Test Suite: Account Recovery Flow
   * Tests user found by email when Clerk ID lookup fails
   */
  describe('Account Recovery Flow', () => {
    /**
     * Test: Should handle user found by email instead of Clerk ID
     *
     * Flow:
     * 1. User attempts to login (maybe after device reset or using different auth method)
     * 2. Clerk ID lookup returns null (new Clerk session)
     * 3. System falls back to email lookup and finds existing user
     * 4. System updates the user record with new Clerk ID
     *
     * Expected: User account linked to new Clerk session, no duplicate created
     */
    it('should sync existing user found by email when Clerk ID is not found', async () => {
      // Arrange: Simulate user with new Clerk session but existing email
      const clerkUser = {
        id: 'clerk_new_session_xyz',
        primaryEmailAddress: {
          emailAddress: 'existing.user@example.com',
        },
        firstName: 'Charlie',
        lastName: 'Brown',
        primaryPhoneNumber: {
          phoneNumber: '+1555123456',
        },
        imageUrl: 'https://img.clerk.com/charlie.jpg',
      };

      // Mock that Clerk ID lookup fails (new session)
      (UserModel.getByClerkId as jest.Mock).mockResolvedValue(null);

      // But email lookup finds existing user
      const existingUserByEmail = {
        id: 5,
        clerk_id: 'clerk_old_session_456', // Old Clerk session
        email: 'existing.user@example.com',
        firstName: 'Charlie',
        lastName: 'Brown',
        phoneNumber: '+1555123456',
      };
      (UserModel.getByEmail as jest.Mock).mockResolvedValue(existingUserByEmail);

      // Act: Sync user (should update, not create)
      await UserSyncService.syncCurrentUser(clerkUser);

      // Assert: Should update existing user with new Clerk ID
      expect(UserModel.update).toHaveBeenCalledWith(
        'clerk_new_session_xyz',
        expect.objectContaining({
          firstName: 'Charlie',
          lastName: 'Brown',
          phoneNumber: '+1555123456',
        })
      );

      // Assert: Should NOT create a duplicate user
      expect(UserModel.create).not.toHaveBeenCalled();

      // Assert: Both lookup methods should be called
      expect(UserModel.getByClerkId).toHaveBeenCalledWith('clerk_new_session_xyz');
      expect(UserModel.getByEmail).toHaveBeenCalledWith('existing.user@example.com');
    });
  });
});

/**
 * Integration Test Results Summary
 *
 * These tests verify that the complete authentication flow:
 * ✓ Successfully creates new users (Clerk -> Supabase)
 * ✓ Successfully logs in existing users and syncs data
 * ✓ Handles account recovery when user is found by email (fallback lookup)
 *
 * Coverage: Complete auth flow from Clerk to Supabase including edge cases
 *
 * Note: For complete E2E testing with real Clerk and Supabase APIs,
 * use a testing environment with test accounts and run Detox/Maestro E2E tests.
 */
