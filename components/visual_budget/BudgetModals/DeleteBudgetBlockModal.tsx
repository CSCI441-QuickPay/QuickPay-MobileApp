/**
 * written by: Team QuickPay
 * tested by: Team QuickPay
 * debugged by: Team QuickPay
 * Notes: Contributions were shared, see GitHub history for commit details.
 * Unit Tests for UserSyncService
 */
import React from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TreeBudgetCategory } from '@/models/BudgetModel';

type Props = {
  visible: boolean;
  category: TreeBudgetCategory | null;
  descendants: TreeBudgetCategory[];
  totalRemaining: number;
  parentCategory: TreeBudgetCategory | null;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function DeleteBudgetBlockModal({
  visible,
  category,
  descendants,
  totalRemaining,
  parentCategory,
  onConfirm,
  onCancel,
}: Props) {
  if (!category) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View className="flex-1 bg-black/60 justify-center items-center p-6">
        <View className="bg-white rounded-3xl w-full max-w-md max-h-[80%]">
          {/* Header */}
          <View className="p-6 border-b border-gray-200">
            <View className="flex-row items-center mb-2">
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: category.color + '20' }}
              >
                <Ionicons name={category.icon as any} size={24} color={category.color} />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-900">Delete "{category.name}"?</Text>
                <Text className="text-sm text-gray-500 mt-1">This action cannot be undone</Text>
              </View>
            </View>
          </View>

          {/* Descendants List */}
          {descendants.length > 0 && (
            <View className="p-6">
              <Text className="text-base font-semibold text-gray-700 mb-3">
                This will also delete {descendants.length} sub-{descendants.length === 1 ? 'category' : 'categories'}:
              </Text>
              <ScrollView className="max-h-64" showsVerticalScrollIndicator={false}>
                {descendants.map((desc) => (
                  <View
                    key={desc.id}
                    className="bg-gray-50 rounded-2xl p-4 mb-2 border border-gray-200"
                  >
                    <View className="flex-row items-center">
                      <View
                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: desc.color + '20' }}
                      >
                        <Ionicons name={desc.icon as any} size={20} color={desc.color} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-gray-900">{desc.name}</Text>
                        <View className="flex-row items-center mt-1">
                          <Text className="text-xs text-gray-500">Budget: ${desc.budget.toFixed(2)}</Text>
                          <Text className="text-xs text-gray-400 mx-2">•</Text>
                          <Text className="text-xs text-red-600">Spent: ${desc.spent.toFixed(2)}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Balance Return Info */}
          {totalRemaining > 0 && parentCategory && (
            <View className="px-6 py-4 bg-green-50 border-t border-b border-green-200">
              <View className="flex-row items-center">
                <Ionicons name="arrow-undo" size={20} color="#10B981" />
                <Text className="ml-2 text-sm font-semibold text-green-700">
                  ${totalRemaining.toFixed(2)} will be returned to {parentCategory.name}
                </Text>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View className="flex-row p-6 gap-3">
            <TouchableOpacity
              onPress={onCancel}
              className="flex-1 bg-gray-100 rounded-2xl py-4 items-center"
              activeOpacity={0.8}
            >
              <Text className="text-gray-700 font-semibold text-base">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              className="flex-1 bg-red-500 rounded-2xl py-4 items-center"
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold text-base">Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
