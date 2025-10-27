/**
 * budgetStyles.ts
 * Reusable style objects for budget components
 */

import { ViewStyle, TextStyle } from 'react-native';
import { BudgetType } from '@/models/BudgetModel';

/**
 * Get block dimensions based on type
 */
export function getBlockDimensions(type: BudgetType) {
  const dimensions = {
    bank: { width: 140, height: 110 },
    budget: { width: 150, height: 130 },
    category: { width: 130, height: 120 },
  };
  return dimensions[type];
}

/**
 * Get block border radius
 */
export function getBlockBorderRadius(type: BudgetType): number {
  return type === 'bank' ? 16 : 20;
}

/**
 * Get icon size based on block type
 */
export function getIconSize(type: BudgetType): number {
  return type === 'bank' ? 22 : 28;
}

/**
 * Get icon container size
 */
export function getIconContainerSize(type: BudgetType) {
  return type === 'bank' ? 40 : 50;
}

/**
 * Create block style
 */
export function createBlockStyle(
  type: BudgetType,
  color: string,
  isFocused: boolean = false
): ViewStyle {
  const dimensions = getBlockDimensions(type);
  const borderRadius = getBlockBorderRadius(type);

  return {
    width: dimensions.width,
    height: dimensions.height,
    backgroundColor: isFocused ? `${color}15` : '#FFFFFF',
    borderRadius,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: type === 'bank' ? 2 : isFocused ? 3 : 2,
    borderColor: color,
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  };
}

/**
 * Create icon container style
 */
export function createIconContainerStyle(
  type: BudgetType,
  color: string
): ViewStyle {
  const size = getIconContainerSize(type);
  const borderRadius = type === 'bank' ? 10 : 14;

  return {
    width: size,
    height: size,
    borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: type === 'bank' ? 6 : 8,
    backgroundColor: `${color}20`,
  };
}

/**
 * Create mini button style
 */
export function createMiniButtonStyle(
  type: 'add' | 'delete',
  color: string
): ViewStyle {
  const baseStyle: ViewStyle = {
    position: 'absolute',
    width: type === 'add' ? 26 : 24,
    height: type === 'add' ? 26 : 24,
    borderRadius: type === 'add' ? 13 : 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  };

  if (type === 'add') {
    return {
      ...baseStyle,
      top: -8,
      right: -8,
      backgroundColor: color,
    };
  } else {
    return {
      ...baseStyle,
      top: -8,
      left: -8,
      backgroundColor: '#EF4444',
      opacity: 0.7,
    };
  }
}

/**
 * Create connection line style
 */
export function createConnectionLineStyle(
  orientation: 'vertical' | 'horizontal',
  color: string,
  length?: number
): ViewStyle {
  const baseStyle: ViewStyle = {
    position: 'absolute',
    backgroundColor: color,
    borderRadius: 2,
  };

  if (orientation === 'vertical') {
    return {
      ...baseStyle,
      width: 3,
      height: length || 35,
    };
  } else {
    return {
      ...baseStyle,
      width: length || 100,
      height: 3,
    };
  }
}

/**
 * Create arrow style
 */
export function createArrowStyle(color: string): ViewStyle {
  return {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: color,
  };
}

/**
 * Text styles
 */
export const textStyles = {
  blockName: (type: BudgetType): TextStyle => ({
    fontSize: type === 'bank' ? 11 : 13,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 3,
  }),
  blockAmount: (type: BudgetType): TextStyle => ({
    fontSize: type === 'budget' ? 20 : type === 'bank' ? 16 : 17,
    fontWeight: 'bold',
    color: type === 'bank' ? undefined : '#000000',
  }),
  blockBudget: {
    fontSize: 10,
    color: '#9CA3AF',
  },
};

/**
 * Canvas dimensions
 */
export const canvasDimensions = {
  width: (screenWidth: number) => screenWidth * 3,
  height: 1200, // Increased for more bottom space
};

/**
 * Zoom constraints
 */
export const zoomConstraints = {
  min: 0.3,
  max: 1.5,
  default: 0.5,
  step: 0.1,
};

/**
 * Animation durations
 */
export const animationDurations = {
  shake: 50,
  spring: { tension: 50, friction: 10 },
  longPress: 500,
};