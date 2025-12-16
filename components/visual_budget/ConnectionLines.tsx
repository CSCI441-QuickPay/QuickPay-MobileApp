/**
 * written by: Team QuickPay
 * tested by: Team QuickPay
 * debugged by: Team QuickPay
 * Notes: Contributions were shared, see GitHub history for commit details.
 * Unit Tests for UserSyncService
 */
/**
 * ConnectionLines.tsx
 * Final: fixes bank→total connectors and single-child artifacts.
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
        if (!category.children?.length) return null;

        // Focus: keep only lines around the focused node
        if (focusedCategoryId) {
          const focused = categories.find(c => c.id === focusedCategoryId);
          const shouldShow =
            category.id === focusedCategoryId ||
            category.children.includes(focusedCategoryId) ||
            category.id === focused?.parentId;
          if (!shouldShow) return null;
        }

        const isMultiChild = category.children.length > 1;

        return category.children.map((childId) => {
          const child = categories.find(c => c.id === childId);
          if (!child) return null;

          const parentPos = getBlockPosition(category.id);
          const childPos  = getBlockPosition(childId);
          const parentSz  = getBlockSize(category.type);
          const childSz   = getBlockSize(child.type);

          const startX = parentPos.x + parentSz.width / 2;
          const startY = parentPos.y + parentSz.height;
          const endX   = childPos.x + childSz.width / 2;
          const endY   = childPos.y;

          const midY   = startY + 35;
          const lineColor = focusedCategoryId === category.id ? category.color : '#6B7280';
          const isFromBank   = category.type === 'bank';
          const isBankToTotal = isFromBank && child.id === 'total';

          const dx = Math.abs(endX - startX);
          // draw horizontal if siblings branch, or if centers differ (route), or bank→total
          const shouldDrawHorizontal = isMultiChild || dx > 6 || isBankToTotal;

          return (
            <View key={`line-${category.id}-${childId}`}>
              {/* vertical down from parent to midY */}
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

              {/* horizontal bus if needed */}
              {shouldDrawHorizontal && (
                <TouchableOpacity
                  onPress={() => onLinePress(category.id, isFromBank)}
                  style={{
                    position: 'absolute',
                    left: Math.min(startX, endX),
                    top: midY - 12,
                    width: Math.max(1, dx),
                    height: 24,
                    justifyContent: 'center',
                  }}
                >
                  <View style={createConnectionLineStyle('horizontal', lineColor, Math.max(1, dx))} />
                </TouchableOpacity>
              )}

              {/* vertical from midY down to the child top */}
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

              {/* arrow tip at child */}
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
