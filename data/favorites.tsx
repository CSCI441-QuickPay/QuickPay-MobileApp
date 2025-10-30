/**
 * favorites.tsx
 * Static favorites data - synced across the app
 */

export interface FavoriteContact {
  id: string;
  name: string;
  phoneNumber?: string;
  email?: string;
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
    phoneNumber: "(555) 123-4567",
    email: "john@example.com",
    nickname: "Dad",
    addedDate: "2024-01-15",
    totalTransactions: 12,
    lastTransactionDate: "2025-10-20",
  },
  {
    id: "2",
    name: "Jane Smith",
    phoneNumber: "(555) 987-6543",
    email: "jane@example.com",
    addedDate: "2024-03-22",
    totalTransactions: 8,
    lastTransactionDate: "2025-10-15",
  },
  {
    id: "3",
    name: "Michael Johnson",
    email: "michael@example.com",
    nickname: "Mike",
    addedDate: "2024-06-10",
    totalTransactions: 5,
    lastTransactionDate: "2025-09-30",
  },
  {
    id: "4",
    name: "Emily Davis",
    phoneNumber: "(555) 456-7890",
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