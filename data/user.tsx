/**
 * written by: Team QuickPay
 * tested by: Team QuickPay
 * debugged by: Team QuickPay
 * Notes: Contributions were shared, see GitHub history for commit details.
 * Unit Tests for UserSyncService
 */
/**
 * ============================================
 * MOCK DATA - FOR DEMO MODE ONLY
 * ============================================
 *
 * This file contains mock user data used when Demo Mode is enabled.
 * Do not delete - this data is used for testing and demonstrations.
 *
 * To enable Demo Mode: Toggle setting in Profile page
 */

export interface UserStats {
  activeCards: number;
  totalFavorites: number;
  totalTransactions: number;
  totalBudgetCategories: number;
}

export interface UserCard {
  id: string;
  bankName: string;
  cardType: 'credit' | 'debit' | 'savings';
  last4: string;
  balance: number;
  isActive: boolean;
  color: string;
  icon: string;
}

/**
 * User's active bank cards
 */
export const userCards: UserCard[] = [
  {
    id: 'card1',
    bankName: 'Chase',
    cardType: 'debit',
    last4: '4567',
    balance: 550.00,  // Synced with budget.tsx bank1
    isActive: true,
    color: '#3B82F6',
    icon: 'card',
  },
  {
    id: 'card2',
    bankName: 'Wells Fargo',
    cardType: 'savings',
    last4: '8901',
    balance: 450.00,  // Synced with budget.tsx bank2
    isActive: true,
    color: '#10B981',
    icon: 'business',
  },
  {
    id: 'card3',
    bankName: 'Bank of America',
    cardType: 'savings',
    last4: '2345',
    balance: 200.17,  // Synced with budget.tsx bank3
    isActive: true,
    color: '#F59E0B',
    icon: 'card-outline',
  },
  {
    id: 'card4',
    bankName: 'Citi',
    cardType: 'credit',
    last4: '6789',
    balance: 148.00,  // Synced with budget.tsx bank4
    isActive: true,
    color: '#8B5CF6',
    icon: 'wallet-outline',
  },
];


/**
 * Calculate user statistics dynamically
 * This function should be used to get real-time stats
 */
export const getUserStats = (favoritesCount: number): UserStats => {
  return {
    activeCards: userCards.filter(card => card.isActive).length,
    totalFavorites: favoritesCount,
    totalTransactions: 0, // Will be calculated from transactions
    totalBudgetCategories: 0, // Will be calculated from budget categories
  };
};

/**
 * User profile settings
 */
export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  security: {
    biometrics: boolean;
    twoFactor: boolean;
  };
  preferences: {
    currency: string;
    language: string;
    theme: 'light' | 'dark' | 'auto';
  };
}

export const defaultUserSettings: UserSettings = {
  notifications: {
    email: true,
    push: true,
    sms: false,
  },
  security: {
    biometrics: true,
    twoFactor: false,
  },
  preferences: {
    currency: 'USD',
    language: 'en',
    theme: 'light',
  },
};
