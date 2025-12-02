/**
 * ============================================
 * MOCK DATA - FOR DEMO MODE ONLY
 * ============================================
 *
 * This file contains mock favorites data used when Demo Mode is enabled.
 * Do not delete - this data is used for testing and demonstrations.
 *
 * To enable Demo Mode: Toggle setting in Profile page
 */

export interface FavoriteContact {
  id: string;
  name: string;
  accountNumber: string;
  nickname?: string;
  addedDate: string;
  lastTransactionDate?: string;
  totalTransactions?: number;
}

/**
 * Default favorite contacts
 * This data is shared across favorite.tsx, profile.tsx, and transfer features
 */
export const favoriteContacts: FavoriteContact[] = [
  {
    id: "1",
    name: "John Doe",
    accountNumber: "4532123456",
    nickname: "Dad",
    addedDate: "2024-01-15",
    totalTransactions: 12,
    lastTransactionDate: "2025-10-20",
  },
  {
    id: "2",
    name: "Jane Smith",
    accountNumber: "4532987654",
    addedDate: "2024-03-22",
    totalTransactions: 8,
    lastTransactionDate: "2025-10-15",
  },
  {
    id: "3",
    name: "Michael Johnson",
    accountNumber: "4532456789",
    nickname: "Mike",
    addedDate: "2024-06-10",
    totalTransactions: 5,
    lastTransactionDate: "2025-09-30",
  },
  {
    id: "4",
    name: "Emily Davis",
    accountNumber: "4532678901",
    nickname: "Mom",
    addedDate: "2024-01-20",
    totalTransactions: 15,
    lastTransactionDate: "2025-10-25",
  },
];

/**
 * Get total favorites count
 */
export const getFavoritesCount = (): number => {
  return favoriteContacts.length;
};

/**
 * Get favorite by ID
 */
export const getFavoriteById = (id: string): FavoriteContact | undefined => {
  return favoriteContacts.find(fav => fav.id === id);
};

/**
 * Get recent favorites (last 3 added)
 */
export const getRecentFavorites = (limit: number = 3): FavoriteContact[] => {
  return [...favoriteContacts]
    .sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime())
    .slice(0, limit);
};

/**
 * Get most used favorites (by transaction count)
 */
export const getMostUsedFavorites = (limit: number = 3): FavoriteContact[] => {
  return [...favoriteContacts]
    .sort((a, b) => (b.totalTransactions || 0) - (a.totalTransactions || 0))
    .slice(0, limit);
};