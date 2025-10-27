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

        {/* Mini Delete Button */}
        {category.type === 'category' && !isShaking && onDelete && (
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
              ${category.spent}
            </Text>
            <Text style={textStyles.blockBudget}>
              of ${category.budget}
            </Text>
            
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
            ${category.budget}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}