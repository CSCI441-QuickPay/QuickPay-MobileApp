/**
 * ConnectionLines.tsx
 * Component for rendering connection lines between budget blocks
 */

import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { TreeBudgetCategory } from '@/models/BudgetModel';
import { createConnectionLineStyle, createArrowStyle } from '@/styles/budgetStyles';
import { getBlockSize } from '@/controllers/BudgetController';

interface ConnectionLinesProps {
  categories: TreeBudgetCategory[];
  focusedCategoryId: string | null;
  getBlockPosition: (id: string) => { x: number; y: number };
  onLinePress: (categoryId: string, showAllDescendants?: boolean) => void;
}

export default function ConnectionLines({
  categories,
  focusedCategoryId,
  getBlockPosition,
  onLinePress,
}: ConnectionLinesProps) {
  return (
    <>
      {categories.map((category) => {
        if (category.children.length === 0) return null;

        // Skip if not in focus view
        if (focusedCategoryId) {
          const focusedCategory = categories.find(c => c.id === focusedCategoryId);
          const shouldShow = 
            category.id === focusedCategoryId ||
            category.children.includes(focusedCategoryId) ||
            category.id === focusedCategory?.parentId;
          
          if (!shouldShow) return null;
        }

        return category.children.map((childId) => {
          const child = categories.find(c => c.id === childId);
          if (!child) return null;

          const parentPos = getBlockPosition(category.id);
          const childPos = getBlockPosition(childId);
          const parentSize = getBlockSize(category.type);
          const childSize = getBlockSize(child.type);

          const startX = parentPos.x + (parentSize.width / 2);
          const startY = parentPos.y + parentSize.height;
          const endX = childPos.x + (childSize.width / 2);
          const endY = childPos.y;
          const midY = startY + 35;

          const lineColor = focusedCategoryId === category.id ? category.color : '#6B7280';
          
          // Check if parent is a bank to enable "show all descendants" mode
          const isFromBank = category.type === 'bank';

          return (
            <View key={`line-${category.id}-${childId}`}>
              {/* Vertical from parent */}
              <TouchableOpacity
                onPress={() => onLinePress(category.id, isFromBank)}
                style={{
                  position: 'absolute',
                  left: startX - 15,
                  top: startY,
                  width: 30,
                  height: 35,
                  alignItems: 'center',
                }}
              >
                <View style={createConnectionLineStyle('vertical', lineColor, 35)} />
              </TouchableOpacity>

              {/* Horizontal */}
              <TouchableOpacity
                onPress={() => onLinePress(category.id, isFromBank)}
                style={{
                  position: 'absolute',
                  left: Math.min(startX, endX),
                  top: midY - 12,
                  width: Math.abs(endX - startX),
                  height: 24,
                  justifyContent: 'center',
                }}
              >
                <View style={createConnectionLineStyle('horizontal', lineColor, Math.abs(endX - startX))} />
              </TouchableOpacity>

              {/* Vertical to child */}
              <TouchableOpacity
                onPress={() => onLinePress(category.id, isFromBank)}
                style={{
                  position: 'absolute',
                  left: endX - 15,
                  top: midY,
                  width: 30,
                  height: endY - midY,
                  alignItems: 'center',
                }}
              >
                <View style={createConnectionLineStyle('vertical', lineColor, endY - midY)} />
              </TouchableOpacity>

              {/* Arrow */}
              <View 
                style={{
                  ...createArrowStyle(lineColor),
                  left: endX - 6,
                  top: endY - 12,
                }}
              />
            </View>
          );
        });
      })}
    </>
  );
}