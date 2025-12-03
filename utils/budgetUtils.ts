/**
 * budgetUtils.ts
 * Utility functions for budget canvas and block management
 */

import { Dimensions } from 'react-native';
import { TreeBudgetCategory } from '@/models/BudgetModel';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Canvas configuration
export const CANVAS_CONFIG = {
  viewportHeight: 450,
  totalBudgetPosition: { x: 360, y: 240 },
  totalBudgetSize: { width: 150, height: 130 },
  blockWidth: 150, // Standard block width for offset calculations
};

/**
 * Calculate canvas position to center Current Budget block
 *
 * This ensures the Current Budget block is always centered in the visible viewport,
 * regardless of:
 * - How many bank blocks exist above it
 * - How wide the canvas is (due to horizontal spacing of banks)
 * - Whether in Demo Mode or Real Mode
 *
 * The calculation accounts for the current scale (zoom level) and adds a two block-widths
 * right offset to ensure proper visual centering when multiple banks shift the layout.
 */
export function calculateCenterPosition(
  screenWidth: number = SCREEN_WIDTH,
  categories?: TreeBudgetCategory[],
  scale: number = 0.5 // Default scale from BudgetPlayground
) {
  const { viewportHeight, totalBudgetSize, blockWidth } = CANVAS_CONFIG;

  // Find the Current Budget block position dynamically
  let currentBudgetPosition = { x: 360, y: 240 }; // Default fallback

  if (categories) {
    const totalBlock = categories.find(c => c.id === 'total');
    if (totalBlock) {
      currentBudgetPosition = totalBlock.position;
    }
  }

  // Calculate the center point of the Current Budget block
  const currentBudgetCenterX = currentBudgetPosition.x + (totalBudgetSize.width / 2);
  const currentBudgetCenterY = currentBudgetPosition.y + (totalBudgetSize.height / 2);

  // Calculate viewport center
  // Position Current Budget at top-center by using 1/3 of viewport height instead of center
  const viewportCenterX = screenWidth / 2;
  const viewportTopCenter = viewportHeight / 3; // Position at top third for better visibility

  // Account for scale when calculating the offset
  // When scaled, the block's visual position changes, so we need to adjust the pan accordingly
  const scaledCenterX = currentBudgetCenterX * scale;
  const scaledCenterY = currentBudgetCenterY * scale;

  // Add two block-widths offset to the right (negative value pans canvas left, showing right side)
  // This compensates for the layout when multiple bank blocks shift the canvas
  const rightOffset = -(blockWidth * 2 * scale);

  // Return the pan offset needed to position Current Budget at top-center of viewport
  return {
    x: viewportCenterX - scaledCenterX + rightOffset,
    y: viewportTopCenter - scaledCenterY,
  };
}

/**
 * Check if a category is a descendant of another
 */
export function isDescendantOf(
  categories: TreeBudgetCategory[],
  parentCategory: TreeBudgetCategory,
  targetId: string
): boolean {
  if (parentCategory.children.includes(targetId)) return true;
  
  for (const childId of parentCategory.children) {
    const child = categories.find(c => c.id === childId);
    if (child && isDescendantOf(categories, child, targetId)) return true;
  }
  
  return false;
}

/**
 * Get all descendants of a category (recursive)
 */
export function getAllDescendants(
  categories: TreeBudgetCategory[],
  categoryId: string
): string[] {
  const category = categories.find(c => c.id === categoryId);
  if (!category) return [];
  
  const descendants: string[] = [];
  
  function collectDescendants(catId: string) {
    const cat = categories.find(c => c.id === catId);
    if (!cat) return;
    
    descendants.push(catId);
    cat.children.forEach(childId => collectDescendants(childId));
  }
  
  category.children.forEach(childId => collectDescendants(childId));
  
  return descendants;
}

/**
 * Check if category should be visible in focus mode
 */
export function shouldShowInFocusMode(
  categories: TreeBudgetCategory[],
  category: TreeBudgetCategory,
  focusedCategoryId: string,
  showAllDescendants: boolean
): boolean {
  const focusedCategory = categories.find(c => c.id === focusedCategoryId);
  if (!focusedCategory) return false;
  
  const isParent = category.id === focusedCategoryId;
  const isGrandparent = category.id === focusedCategory.parentId;
  
  if (isParent || isGrandparent) return true;
  
  if (showAllDescendants) {
    // Check if it's any descendant
    const allDescendants = getAllDescendants(categories, focusedCategoryId);
    return allDescendants.includes(category.id);
  } else {
    // Only show direct children
    return focusedCategory.children.includes(category.id);
  }
}

/**
 * Get block position from animated value or fallback
 */
export function getBlockPosition(
  blockPositions: { [key: string]: any },
  categories: TreeBudgetCategory[],
  categoryId: string
): { x: number; y: number } {
  const animatedValue = blockPositions[categoryId];
  
  if (animatedValue) {
    return {
      x: animatedValue.x._value || 0,
      y: animatedValue.y._value || 0,
    };
  }
  
  const category = categories.find(c => c.id === categoryId);
  return category ? category.position : { x: 0, y: 0 };
}

/**
 * Calculate focus position for a specific category
 */
export function calculateFocusPosition(
  category: TreeBudgetCategory,
  screenWidth: number = SCREEN_WIDTH
) {
  const targetX = (screenWidth / 2) - category.position.x - 75;
  const targetY = (CANVAS_CONFIG.viewportHeight / 2) - category.position.y - 65;
  
  return { x: targetX, y: targetY };
}