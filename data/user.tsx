/**
 * user.tsx
 * Static user data and configuration
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
    bankName: 'Chase Checking',
    cardType: 'debit',
    last4: '4567',
    balance: 2450.50,
    isActive: true,
    color: '#3B82F6',
    icon: 'card-outline',
  },
  {
    id: 'card2',
    bankName: 'Bank of America Savings',
    cardType: 'savings',
    last4: '8901',
    balance: 5200.00,
    isActive: true,
    color: '#10B981',
    icon: 'wallet-outline',
  },
  {
    id: 'card3',
    bankName: 'Wells Fargo Credit',
    cardType: 'credit',
    last4: '2345',
    balance: 1500.00,
    isActive: true,
    color: '#F59E0B',
    icon: 'card',
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