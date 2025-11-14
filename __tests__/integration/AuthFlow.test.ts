/**
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
  });
});

/**
 * Integration Test Results Summary
 *
 * These tests verify that the complete authentication flow:
 * ✓ Successfully creates new users (Clerk -> Supabase)
 * ✓ Successfully logs in existing users and syncs data
 *
 * Coverage: Complete auth flow from Clerk to Supabase
 *
 * Note: For complete E2E testing with real Clerk and Supabase APIs,
 * use a testing environment with test accounts and run Detox/Maestro E2E tests.
 */
