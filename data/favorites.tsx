/**
 * favorites.tsx
 * Shared FavoriteContact type (single source of truth)
 */

export interface FavoriteContact {
  id: string;
  // display / user-facing fields
  name?: string; // optional display name
  nickname?: string;
  // bank/account fields (used by DB mapping)
  accountNumber?: string;
  accountHolderName?: string;
  accountHolderProfile?: string;
  // contact fields
  phoneNumber?: string;
  email?: string;
  // metadata
  addedDate?: string;
  lastTransactionDate?: string;
  totalTransactions?: number;
}

/* Optional example data used for development */
export const favoriteContacts: FavoriteContact[] = [
  { id: "1", name: "John Doe", phoneNumber: "(555) 123-4567", nickname: "Dad", addedDate: "2024-01-15" },
  { id: "2", name: "Jane Smith", phoneNumber: "(555) 987-6543", addedDate: "2024-03-22" },
];

export const getFavoritesCount = (): number => favoriteContacts.length;

export const getFavoriteById = (id: string): FavoriteContact | undefined =>
  favoriteContacts.find((fav) => fav.id === id);

export const getRecentFavorites = (limit = 3): FavoriteContact[] =>
  [...favoriteContacts].sort((a, b) => (b.addedDate ? new Date(b.addedDate).getTime() : 0) - (a.addedDate ? new Date(a.addedDate!).getTime() : 0)).slice(0, limit);

export const getMostUsedFavorites = (limit = 3): FavoriteContact[] =>
  [...favoriteContacts].sort((a, b) => (b.totalTransactions || 0) - (a.totalTransactions || 0)).slice(0, limit);