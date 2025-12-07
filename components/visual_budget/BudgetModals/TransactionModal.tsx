/**
 * written by: Team QuickPay
 * tested by: Team QuickPay
 * debugged by: Team QuickPay
 * Notes: Contributions were shared, see GitHub history for commit details.
 * Unit Tests for UserSyncService
 */
import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { TreeBudgetCategory } from '@/models/BudgetModel';

interface TransactionModalProps {
  visible: boolean;
  category: TreeBudgetCategory | null;
  categories: TreeBudgetCategory[];
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function TransactionModal({
  visible,
  category,
  categories,
  onClose,
  onEdit,
  onDelete,
}: TransactionModalProps) {
  if (!visible || !category) return null;

  // Check if delete button should be shown
  const canDelete = category.type !== 'bank' && category.id !== 'total';

  // Check if edit button should be shown
  const canEdit = category.type !== 'bank' && category.id !== 'total';

  const remaining = category.budget - category.spent;
  const progress =
    category.budget > 0 ? Math.min((category.spent / category.budget) * 100, 100) : 0;

  // Get parent category name if exists
  const parentCategory = category.parentId
    ? categories.find(c => c.id === category.parentId)
    : null;

  // Determine subtitle based on category type
  const getSubtitle = () => {
    if (category.type === 'bank') {
      return 'Bank account overview';
    } else if (category.type === 'budget' && category.id === 'total') {
      const connectedBanks = categories
        .filter(c => c.type === 'bank' && c.children?.includes('total'))
        .map(c => c.name)
        .join(', ');
      return connectedBanks ? `Connected banks: ${connectedBanks}` : 'Main budget block';
    } else if (parentCategory) {
      return `Sub-category of ${parentCategory.name}`;
    }
    return 'Category overview';
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 max-h-[85%]">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            {/* Icon on the left */}
            <View
              className="w-12 h-12 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: category.color + '20' }}
            >
              <Ionicons name={category.icon as any} size={24} color={category.color} />
            </View>

            {/* Title and subtitle */}
            <View className="flex-1">
              <Text className="text-xl font-bold text-black">{category.name}</Text>
              <Text className="text-xs text-gray-500 mt-0.5">{getSubtitle()}</Text>
            </View>

            {/* Close button */}
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} className="ml-2">
              <Ionicons name="close-circle" size={32} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Budget Summary */}
          <View className="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-200">
            <View className="flex-row justify-between mb-2">
              <Text className="text-base text-gray-700">Budget</Text>
              <Text className="text-base font-semibold text-gray-800">
                ${category.budget.toFixed(2)}
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-base text-gray-700">Spent</Text>
              <Text className="text-base font-semibold text-red-600">
                ${category.spent.toFixed(2)}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-base text-gray-700">Remaining</Text>
              <Text className="text-base font-semibold text-green-600">
                ${remaining.toFixed(2)}
              </Text>
            </View>
            {/* Progress Bar */}
            <View className="h-2 bg-gray-200 rounded-full mt-4 overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  backgroundColor: category.color,
                }}
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-2 mb-6">
            {/* Edit Button - Only show for editable categories */}
            {canEdit && (
              <TouchableOpacity
                onPress={onEdit}
                activeOpacity={0.85}
                className="flex-1 bg-primary rounded-xl items-center justify-center"
                style={{ height: 44 }}
              >
                <View className="flex-row items-center">
                  <Ionicons name="create-outline" size={16} color="#ccf8f1" style={{ marginRight: 6 }} />
                  <Text className="text-secondary font-semibold text-sm">Edit</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Delete Button - Only show for deletable categories */}
            {canDelete && (
              <TouchableOpacity
                onPress={onDelete}
                activeOpacity={0.9}
                className="flex-1 rounded-xl bg-red-50 border border-red-200 items-center justify-center"
                style={{ height: 44 }}
              >
                <View className="flex-row items-center">
                  <Ionicons name="trash-outline" size={16} color="#DC2626" style={{ marginRight: 6 }} />
                  <Text className="text-red-600 font-semibold text-sm">Delete</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Transactions */}
          <Text className="text-lg font-bold text-gray-800 mb-3">Transactions</Text>
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="max-h-72"
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {category.transactions && category.transactions.length > 0 ? (
              category.transactions.map((t) => (
                <View
                  key={t.id}
                  className="flex-row justify-between items-center mb-3 bg-gray-50 rounded-2xl p-3 border border-gray-100"
                >
                  <View className="flex-row items-center">
                    <View
                    className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                    style={{
                        backgroundColor: t.type === 'expense' ? '#FEE2E2' : '#D1FAE5',
                    }}
                    >
                    <Feather
                        name={t.type === 'expense' ? 'arrow-down-right' : 'arrow-up-right'}
                        size={22}
                        color={t.type === 'expense' ? '#EF4444' : '#10B981'}
                    />
                    </View>

                    <View>
                      <Text className="text-sm font-semibold text-black">{t.description}</Text>
                      {t.merchant && (
                        <Text className="text-xs text-gray-500">{t.merchant}</Text>
                      )}
                      <Text className="text-xs text-gray-400">
                        {new Date(t.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                  </View>

                  <Text
                    className="text-sm font-bold"
                    style={{ color: t.type === 'expense' ? '#EF4444' : '#10B981' }}
                  >
                    {t.type === 'expense' ? '-' : '+'}${t.amount.toFixed(2)}
                  </Text>
                </View>
              ))
            ) : (
              <View className="items-center justify-center py-10">
                <Ionicons name="receipt-outline" size={42} color="#9CA3AF" />
                <Text className="text-sm text-gray-500 mt-2">No transactions yet</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
