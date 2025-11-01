/**
 * Integration Tests for Authentication Flow
 *
 * These tests verify the complete authentication flow from signup/login
 * through Clerk to user synchronization with Supabase database.
 *
 * Integration Test Scope:
 * - Complete signup flow (Clerk + Supabase sync)
 * - Complete login flow (Clerk + Supabase sync)
 * - User data consistency between Clerk and Supabase
 * - Error handling across the authentication stack
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
      expect(UserModel.create).toHaveBeenCalledWith(
        'clerk_newuser_123',
        expect.objectContaining({
          email: 'newuser@example.com',
          firstName: 'Alice',
          lastName: 'Johnson',
          phoneNumber: '+1234567890',
          profilePicture: 'https://img.clerk.com/alice.jpg',
          balance: 0,
          isActive: true,
          verified: false,
        })
      );

      // Assert: Verify lookup methods were called
      expect(UserModel.getByClerkId).toHaveBeenCalledWith('clerk_newuser_123');
      expect(UserModel.getByEmail).toHaveBeenCalledWith('newuser@example.com');
    });

    /**
     * Test: Should handle signup with minimal information
     * Expected: Create user with only required fields (email, clerkId)
     */
    it('should handle signup with minimal user information', async () => {
      // Arrange: Clerk user with only required fields
      const minimalClerkUser = {
        id: 'clerk_minimal_456',
        primaryEmailAddress: {
          emailAddress: 'minimal@example.com',
        },
        // No optional fields
      };

      // Mock database operations
      (UserModel.getByClerkId as jest.Mock).mockResolvedValue(null);
      (UserModel.getByEmail as jest.Mock).mockResolvedValue(null);
      (UserModel.create as jest.Mock).mockResolvedValue({
        id: 2,
        clerk_id: 'clerk_minimal_456',
        email: 'minimal@example.com',
      });

      // Act: Sync minimal user
      await UserSyncService.syncCurrentUser(minimalClerkUser);

      // Assert: User created with undefined optional fields
      expect(UserModel.create).toHaveBeenCalledWith(
        'clerk_minimal_456',
        expect.objectContaining({
          email: 'minimal@example.com',
          firstName: undefined,
          lastName: undefined,
          phoneNumber: undefined,
          profilePicture: undefined,
        })
      );
    });

    /**
     * Test: Should handle concurrent signup attempts (race condition)
     * Expected: Gracefully handle duplicate user creation
     */
    it('should handle race condition during signup', async () => {
      // Arrange: Simulate race condition
      // - First check: user doesn't exist
      // - By time we create: another process already created user
      const clerkUser = {
        id: 'clerk_race_789',
        primaryEmailAddress: {
          emailAddress: 'race@example.com',
        },
        firstName: 'Race',
        lastName: 'Condition',
      };

      (UserModel.getByClerkId as jest.Mock).mockResolvedValue(null);
      (UserModel.getByEmail as jest.Mock).mockResolvedValue(null);

      // Simulate duplicate key error (PostgreSQL error code 23505)
      const duplicateError = new Error('duplicate key value violates unique constraint');
      (duplicateError as any).code = '23505';
      (UserModel.create as jest.Mock).mockRejectedValue(duplicateError);

      // Act & Assert: Should not throw error
      await expect(
        UserSyncService.syncCurrentUser(clerkUser)
      ).resolves.not.toThrow();

      // Assert: Attempted to create user
      expect(UserModel.create).toHaveBeenCalled();
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
      expect(UserModel.update).toHaveBeenCalledWith(
        'clerk_existing_abc',
        expect.objectContaining({
          firstName: 'Bob',
          lastName: 'Smith',
          phoneNumber: undefined,
          profilePicture: 'https://img.clerk.com/bob_new.jpg', // Updated
        })
      );

      // Assert: Create should NOT be called for existing user
      expect(UserModel.create).not.toHaveBeenCalled();
    });

    /**
     * Test: Should use email fallback for user lookup
     * Expected: Find user by email if Clerk ID lookup fails
     */
    it('should find user by email when Clerk ID lookup fails', async () => {
      // Arrange: User exists but Clerk ID lookup fails
      const clerkUser = {
        id: 'clerk_email_fallback',
        primaryEmailAddress: {
          emailAddress: 'fallback@example.com',
        },
        firstName: 'Fallback',
      };

      // Clerk ID lookup fails
      (UserModel.getByClerkId as jest.Mock).mockResolvedValue(null);

      // Email lookup succeeds
      const userByEmail = {
        id: 4,
        clerk_id: 'clerk_email_fallback',
        email: 'fallback@example.com',
        firstName: 'Old Name',
      };
      (UserModel.getByEmail as jest.Mock).mockResolvedValue(userByEmail);

      // Act: Sync user
      await UserSyncService.syncCurrentUser(clerkUser);

      // Assert: Both lookup methods should be called
      expect(UserModel.getByClerkId).toHaveBeenCalled();
      expect(UserModel.getByEmail).toHaveBeenCalled();

      // Assert: Update should be called (not create)
      expect(UserModel.update).toHaveBeenCalled();
      expect(UserModel.create).not.toHaveBeenCalled();
    });
  });

  /**
   * Test Suite: Data Consistency
   * Tests that user data stays consistent across systems
   */
  describe('Data Consistency Between Clerk and Supabase', () => {
    /**
     * Test: User profile updates should sync correctly
     * Expected: Changes in Clerk reflected in Supabase
     */
    it('should sync profile updates from Clerk to Supabase', async () => {
      // Arrange: User updates profile in Clerk
      const updatedClerkUser = {
        id: 'clerk_update_test',
        primaryEmailAddress: {
          emailAddress: 'update@example.com',
        },
        firstName: 'Updated',
        lastName: 'Name',
        primaryPhoneNumber: {
          phoneNumber: '+9999999999',
        },
        imageUrl: 'https://img.clerk.com/new_avatar.jpg',
      };

      // Mock existing user with old data
      const oldUser = {
        id: 5,
        clerk_id: 'clerk_update_test',
        email: 'update@example.com',
        firstName: 'Old',
        lastName: 'Name',
        phoneNumber: '+1111111111',
        profilePicture: 'https://img.clerk.com/old_avatar.jpg',
      };
      (UserModel.getByClerkId as jest.Mock).mockResolvedValue(oldUser);

      // Act: Sync updated data
      await UserSyncService.syncCurrentUser(updatedClerkUser);

      // Assert: All fields should be updated
      expect(UserModel.update).toHaveBeenCalledWith(
        'clerk_update_test',
        expect.objectContaining({
          firstName: 'Updated',
          lastName: 'Name',
          phoneNumber: '+9999999999',
          profilePicture: 'https://img.clerk.com/new_avatar.jpg',
        })
      );
    });

    /**
     * Test: Email should not be updated (immutable after creation)
     * Expected: Update call should not include email field
     */
    it('should not update email field (immutable)', async () => {
      // Arrange: User with email
      const clerkUser = {
        id: 'clerk_immutable_test',
        primaryEmailAddress: {
          emailAddress: 'changed@example.com', // Different email
        },
        firstName: 'Test',
      };

      const existingUser = {
        id: 6,
        clerk_id: 'clerk_immutable_test',
        email: 'original@example.com', // Original email
        firstName: 'Test',
      };
      (UserModel.getByClerkId as jest.Mock).mockResolvedValue(existingUser);

      // Act: Sync user
      await UserSyncService.syncCurrentUser(clerkUser);

      // Assert: Update should not include email field
      const updateCall = (UserModel.update as jest.Mock).mock.calls[0];
      expect(updateCall[1]).not.toHaveProperty('email');
    });
  });

  /**
   * Test Suite: Error Handling
   * Tests error scenarios across the authentication flow
   */
  describe('Error Handling Across Auth Flow', () => {
    /**
     * Test: Should handle Clerk authentication failures
     * Expected: Error propagated to user interface
     */
    it('should handle missing Clerk user data', async () => {
      // Act & Assert: Null user should throw error
      await expect(
        UserSyncService.syncCurrentUser(null)
      ).rejects.toThrow('No Clerk user data available');
    });

    /**
     * Test: Should handle database connection failures
     * Expected: Database errors propagated for proper error handling
     */
    it('should handle database connection failures', async () => {
      // Arrange: Simulate database connection error
      const clerkUser = {
        id: 'clerk_db_error',
        primaryEmailAddress: {
          emailAddress: 'dberror@example.com',
        },
      };

      const dbError = new Error('Connection to database failed');
      (UserModel.getByClerkId as jest.Mock).mockRejectedValue(dbError);

      // Act & Assert: Database error should propagate
      await expect(
        UserSyncService.syncCurrentUser(clerkUser)
      ).rejects.toThrow('Connection to database failed');
    });

    /**
     * Test: Should handle invalid email format
     * Expected: Error during user creation if email is invalid
     */
    it('should handle invalid email format', async () => {
      // Arrange: User with invalid email
      const clerkUser = {
        id: 'clerk_invalid_email',
        primaryEmailAddress: {
          emailAddress: 'not-an-email', // Invalid format
        },
        firstName: 'Invalid',
      };

      (UserModel.getByClerkId as jest.Mock).mockResolvedValue(null);
      (UserModel.getByEmail as jest.Mock).mockResolvedValue(null);

      // Simulate database validation error
      const validationError = new Error('Invalid email format');
      (UserModel.create as jest.Mock).mockRejectedValue(validationError);

      // Act & Assert: Should propagate validation error
      await expect(
        UserSyncService.syncCurrentUser(clerkUser)
      ).rejects.toThrow('Invalid email format');
    });
  });
});

/**
 * Integration Test Results Summary
 *
 * These tests verify that the complete authentication flow:
 * ✓ Successfully creates new users (Clerk -> Supabase)
 * ✓ Successfully logs in existing users
 * ✓ Syncs updated profile data
 * ✓ Handles minimal user information
 * ✓ Gracefully handles race conditions
 * ✓ Uses email fallback for user lookup
 * ✓ Maintains data consistency
 * ✓ Preserves immutable fields (email)
 * ✓ Properly propagates errors
 * ✓ Handles database failures
 * ✓ Validates user input
 *
 * Coverage: Complete auth flow from Clerk to Supabase
 *
 * Note: For complete E2E testing with real Clerk and Supabase APIs,
 * use a testing environment with test accounts and run Detox/Maestro E2E tests.
 */
