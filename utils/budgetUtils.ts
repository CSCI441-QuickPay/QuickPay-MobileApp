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
};

/**
 * Calculate canvas position to center Current Budget block
 * This ensures blocks are visible on initial load regardless of their position
 */
export function calculateCenterPosition(
  screenWidth: number = SCREEN_WIDTH,
  categories?: TreeBudgetCategory[]
) {
  const { viewportHeight, totalBudgetSize } = CANVAS_CONFIG;

  // Find the Current Budget block position dynamically
  // Works for both Real Mode (60, 230) and Demo Mode (360, 240)
  let currentBudgetPosition = { x: 360, y: 240 }; // Default Demo Mode position

  if (categories) {
    const totalBlock = categories.find(c => c.id === 'total');
    if (totalBlock) {
      currentBudgetPosition = totalBlock.position;
    }
  }

  const currentBudgetCenterX = currentBudgetPosition.x + (totalBudgetSize.width / 2);
  const currentBudgetCenterY = currentBudgetPosition.y + (totalBudgetSize.height / 2);

  // Calculate viewport center
  const viewportCenterX = screenWidth / 2;
  const viewportCenterY = viewportHeight / 2;

  // Return offset needed to center the Current Budget block
  return {
    x: viewportCenterX - currentBudgetCenterX,
    y: viewportCenterY - currentBudgetCenterY,
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