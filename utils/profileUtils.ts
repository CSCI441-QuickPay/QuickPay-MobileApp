/**
 * written by: Team QuickPay
 * tested by: Team QuickPay
 * debugged by: Team QuickPay
 * Notes: Contributions were shared, see GitHub history for commit details.
 * Unit Tests for UserSyncService
 */
/**
 * Utility functions for generating profile initials and colors
 */

/**
 * Get initials from a name
 * @param name - Full name of the person
 * @returns Initials (2 characters)
 */
export const getInitials = (name: string): string => {
  if (!name || name.trim() === '') return '?';

  const trimmedName = name.trim();
  const names = trimmedName.split(' ');

  if (names.length >= 2) {
    return `${names[0][0]}${names[1][0]}`.toUpperCase();
  }

  return trimmedName.slice(0, 2).toUpperCase();
};

/**
 * Generate a consistent color based on a name
 * This ensures the same name always gets the same color
 * @param name - Name to generate color for
 * @returns Hex color code
 */
export const getProfileColor = (name: string): string => {
  const colors = [
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#F59E0B', // Amber
    '#10B981', // Green
    '#06B6D4', // Cyan
    '#EF4444', // Red
    '#6366F1', // Indigo
    '#14B8A6', // Teal
    '#F97316', // Orange
  ];

  if (!name || name.trim() === '') {
    return colors[0]; // Default to blue
  }

  // Use character codes to generate a consistent index
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

/**
 * Get a lighter version of the profile color for background
 * @param color - Hex color code
 * @param opacity - Opacity value (0-1), defaults to 0.15
 * @returns RGBA color string
 */
export const getProfileBackgroundColor = (color: string, opacity: number = 0.15): string => {
  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};
