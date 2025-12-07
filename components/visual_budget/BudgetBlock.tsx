/**
 * written by: Team QuickPay
 * tested by: Team QuickPay
 * debugged by: Team QuickPay
 * Notes: Contributions were shared, see GitHub history for commit details.
 * Unit Tests for UserSyncService
 */
/**
 * BudgetBlock.tsx
 * Reusable budget block component
 */

import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TreeBudgetCategory } from '@/models/BudgetModel';
import {
  createBlockStyle,
  createIconContainerStyle,
  createMiniButtonStyle,
  getIconSize,
  textStyles,
} from '@/styles/budgetStyles';

interface BudgetBlockProps {
  category: TreeBudgetCategory;
  categories?: TreeBudgetCategory[]; // For calculating remaining budget
  isShaking: boolean;
  isFocused: boolean;
  shakeTransform: any;
  blockPosition: Animated.ValueXY;
  panHandlers: any;
  onPressIn: () => void;
  onPressOut: () => void;
  onPress: () => void;
  onAddChild?: () => void;
  onDelete?: () => void;
}

export default function BudgetBlock({
  category,
  categories,
  isShaking,
  isFocused,
  shakeTransform,
  blockPosition,
  panHandlers,
  onPressIn,
  onPressOut,
  onPress,
  onAddChild,
  onDelete,
}: BudgetBlockProps) {
  const blockStyle = createBlockStyle(category.type, category.color, isFocused);
  const iconContainerStyle = createIconContainerStyle(category.type, category.color);
  const iconSize = getIconSize(category.type);
  const nameStyle = textStyles.blockName(category.type);
  const amountStyle = textStyles.blockAmount(category.type);

  // Calculate display amount
  const calculateDisplayAmount = () => {
    if (category.id === 'total' && categories) {
      // For "Current Budget" node: show UNALLOCATED money from remaining cash
      // Step 1: Calculate total spent across all categories
      const totalSpent = categories
        .filter(c => c.type === 'category')
        .reduce((sum, cat) => sum + cat.spent, 0);

      // Step 2: Calculate remaining cash after spending
      const remainingCash = category.budget - totalSpent;

      // Step 3: Calculate allocated budgets (only count budget - spent for each category)
      // This prevents double-counting money that's already been spent
      const totalAllocated = categories
        .filter(c => c.parentId === 'total' && c.type === 'category')
        .reduce((sum, cat) => {
          // Only count the remaining budget (budget - spent)
          const remaining = cat.budget - cat.spent;
          return sum + remaining;
        }, 0);

      // Step 4: Unallocated = remaining cash - allocated budgets (that haven't been spent)
      return remainingCash - totalAllocated;
    }

    // For categories with children: show remaining budget after children's allocations
    if (category.children && category.children.length > 0 && categories) {
      const childrenBudgetSum = category.children.reduce((sum, childId) => {
        const child = categories.find(c => c.id === childId);
        return sum + (child?.budget || 0);
      }, 0);
      // Remaining = budget - spent - children's allocated budgets
      return category.budget - category.spent - childrenBudgetSum;
    }

    // For regular categories without children: show budget - spent (what's left in that budget)
    return category.budget - category.spent;
  };

  const displayAmount = calculateDisplayAmount();

  // Calculate the denominator for display (total budget before children allocations)
  const calculateTotalForDisplay = () => {
    if (category.id === 'total' && categories) {
      // For Current Budget: show remaining cash as denominator (after all spending)
      const totalSpent = categories
        .filter(c => c.type === 'category')
        .reduce((sum, cat) => sum + cat.spent, 0);
      return category.budget - totalSpent;
    }

    // For all categories (with or without children): show budget - spent
    // This represents the total amount before allocating to children
    return category.budget - category.spent;
  };
  
  const totalForDisplay = calculateTotalForDisplay();

  return (
    <Animated.View
      {...panHandlers}
      style={{
        position: 'absolute',
        left: blockPosition.x,
        top: blockPosition.y,
        transform: [{ rotate: shakeTransform }],
      }}
    >
      <TouchableOpacity
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        activeOpacity={0.9}
        style={blockStyle}
      >
        {/* Mini Add Button */}
        {category.type !== 'bank' && !isShaking && onAddChild && (
          <TouchableOpacity
            onPress={onAddChild}
            style={createMiniButtonStyle('add', category.color)}
          >
            <Ionicons name="add" size={16} color="white" />
          </TouchableOpacity>
        )}

        {/* Mini Delete Button - only show for subcategories (not main budget block) */}
        {category.type === 'category' && category.id !== 'total' && !isShaking && onDelete && (
          <TouchableOpacity
            onPress={onDelete}
            style={createMiniButtonStyle('delete', category.color)}
          >
            <Ionicons name="close" size={14} color="white" />
          </TouchableOpacity>
        )}

        {/* Shake Indicator */}
        {isShaking && (
          <View className="absolute -top-2.5 -right-2.5 w-7 h-7 bg-blue-500 rounded-full items-center justify-center">
            <Ionicons name="close" size={18} color="white" />
          </View>
        )}

        {/* Icon */}
        <View style={iconContainerStyle}>
          <Ionicons name={category.icon as any} size={iconSize} color={category.color} />
        </View>

        {/* Name */}
        <Text style={nameStyle} numberOfLines={1}>
          {category.name}
        </Text>

        {/* Amount Display */}
        {category.type !== 'bank' && (
          <>
            <Text style={{ ...amountStyle, color: '#000000' }}>
              ${displayAmount.toFixed(2)}
            </Text>
            {(category.id === 'total' || (category.children && category.children.length > 0)) && (
              <Text style={textStyles.blockBudget}>
                of ${totalForDisplay.toFixed(2)}
              </Text>
            )}

            {/* Transaction Count Badge */}
            {category.type === 'category' && category.transactions && category.transactions.length > 0 && (
              <View 
                style={{
                  position: 'absolute',
                  bottom: -8,
                  right: -8,
                  backgroundColor: category.color,
                  borderRadius: 12,
                  minWidth: 24,
                  height: 24,
                  paddingHorizontal: 6,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: 'white',
                }}
              >
                <Text style={{ color: 'white', fontSize: 11, fontWeight: 'bold' }}>
                  {category.transactions.length}
                </Text>
              </View>
            )}
          </>
        )}

        {category.type === 'bank' && (
          <Text style={{ ...amountStyle, color: category.color }}>
            ${category.budget.toFixed(2)}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}
