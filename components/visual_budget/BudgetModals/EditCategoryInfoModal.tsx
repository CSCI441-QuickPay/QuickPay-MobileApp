/**
 * written by: Team QuickPay
 * tested by: Team QuickPay
 * debugged by: Team QuickPay
 * Notes: Contributions were shared, see GitHub history for commit details.
 * Unit Tests for UserSyncService
 */
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { availableIcons, availableColors } from '@/constants/budgetConfig';
import { TreeBudgetCategory } from '@/models/BudgetModel';

interface EditCategoryInfoModalProps {
  visible: boolean;
  category: TreeBudgetCategory | null;
  categories: TreeBudgetCategory[];
  onClose: () => void;
  onSave: (updated: { name: string; budget: string; icon: string; color: string }) => void;
  onDelete: () => void;
}

export default function EditCategoryInfoModal({
  visible,
  category,
  categories,
  onClose,
  onSave,
  onDelete,
}: EditCategoryInfoModalProps) {
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [icon, setIcon] = useState('wallet');
  const [color, setColor] = useState('#3B82F6');

  useEffect(() => {
    if (category) {
      setName(category.name);
      setBudget(category.budget.toString());
      setIcon(category.icon);
      setColor(category.color);
    }
  }, [category]);

  const handleSave = () => {
    // Validate category name
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter a category name');
      return;
    }
    if (name.trim().length < 2) {
      Alert.alert('Invalid Input', 'Category name must be at least 2 characters long');
      return;
    }
    if (name.trim().length > 50) {
      Alert.alert('Invalid Input', 'Category name cannot exceed 50 characters');
      return;
    }

    // Validate budget amount
    if (!budget.trim()) {
      Alert.alert('Validation Error', 'Please enter a budget amount');
      return;
    }

    const numericBudget = parseFloat(budget.replace(/,/g, ''));
    if (isNaN(numericBudget)) {
      Alert.alert('Invalid Input', 'Please enter a valid number for budget amount');
      return;
    }
    if (numericBudget < 0) {
      Alert.alert('Invalid Input', 'Budget amount cannot be negative');
      return;
    }
    if (numericBudget > 1000000) {
      Alert.alert('Invalid Input', 'Budget amount cannot exceed $1,000,000');
      return;
    }

    onSave({ name: name.trim(), budget, icon, color });
    onClose();
  };

  if (!category) return null;

  // Get parent category name if exists
  const parentCategory = category.parentId
    ? categories.find(c => c.id === category.parentId)
    : null;

  // Determine if this is a bank, budget block, or category
  const getSubtitle = () => {
    if (category.type === 'bank') {
      return 'Manage your bank account settings';
    } else if (category.type === 'budget' && category.id === 'total') {
      const connectedBanks = categories
        .filter(c => c.type === 'bank' && c.children?.includes('total'))
        .map(c => c.name)
        .join(', ');
      return connectedBanks ? `Connected banks: ${connectedBanks}` : 'Main budget block';
    } else if (parentCategory) {
      return `Sub-category of ${parentCategory.name}`;
    }
    return 'Edit category information';
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 max-h-[85%]">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <View
              className="w-12 h-12 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: '#F3F4F6' }}
            >
              <Ionicons name="create-outline" size={24} color="#00332d" />
            </View>

            <View className="flex-1">
              <Text className="text-xl font-bold text-black">Edit Category</Text>
              <Text className="text-xs text-gray-500 mt-0.5">{getSubtitle()}</Text>
            </View>

            <TouchableOpacity onPress={onClose} className="ml-2">
              <Ionicons name="close-circle" size={32} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View>
            {/* Category Name */}
            <View className="mb-5">
              <Text className="text-base font-semibold text-gray-700 mb-2">Category Name</Text>
              <View className="bg-gray-50 border-2 border-gray-200 rounded-2xl px-5 h-14 justify-center">
                <TextInput
                  placeholder="e.g., Groceries"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={(text) => {
                    // Allow letters, numbers, spaces, and common punctuation
                    const sanitized = text.replace(/[^a-zA-Z0-9\s&'-]/g, '');
                    if (sanitized.length <= 50) {
                      setName(sanitized);
                    }
                  }}
                  maxLength={50}
                />
              </View>
            </View>

            {/* Budget Amount (Editable now) */}
            <View className="mb-5">
              <Text className="text-base font-semibold text-gray-700 mb-2">Budget Amount</Text>
              <View className="flex-row items-center bg-gray-50 border-2 border-gray-200 rounded-2xl px-5 h-14">
                <Text className="text-gray-600 text-xl mr-2">$</Text>
                <TextInput
                  placeholder="0.00"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="decimal-pad"
                  value={budget}
                  onChangeText={(v) => {
                    // Allow digits, one dot, and commas - but only one decimal point
                    let cleaned = v.replace(/[^0-9.,]/g, '');
                    // Ensure only one decimal point
                    const parts = cleaned.split('.');
                    if (parts.length > 2) {
                      cleaned = parts[0] + '.' + parts.slice(1).join('');
                    }
                    // Limit to 2 decimal places
                    if (parts.length === 2 && parts[1].length > 2) {
                      cleaned = parts[0] + '.' + parts[1].substring(0, 2);
                    }
                    setBudget(cleaned);
                  }}
                  maxLength={12}
                />
              </View>
            </View>

            {/* Choose Icon */}
            <View className="mb-8">
              <Text className="text-base font-semibold text-gray-700 mb-3">Choose Icon</Text>
              <View className="bg-gray-50 border border-gray-200 rounded-2xl p-3">
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingVertical: 6, paddingHorizontal: 4 }}
                >
                  {availableIcons.map((i) => {
                    const isActive = icon === i;
                    return (
                      <TouchableOpacity
                        key={i}
                        onPress={() => setIcon(i)}
                        activeOpacity={0.85}
                        style={{
                          alignItems: 'center',
                          marginHorizontal: 8,
                        }}
                      >
                        <View
                          style={{
                            width: 64,
                            height: 64,
                            borderRadius: 20,
                            backgroundColor: isActive ? '#00332d' : '#F3F4F6',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: isActive ? 3 : 1,
                            borderColor: isActive ? '#00332d' : '#E5E7EB',
                          }}
                        >
                          <Ionicons
                            name={i as any}
                            size={28}
                            color={isActive ? '#ccf8f1' : '#6B7280'}
                          />
                        </View>
                        <Text
                          style={{
                            color: isActive ? '#00332d' : '#6B7280',
                            fontSize: 11,
                            marginTop: 6,
                            fontWeight: isActive ? '700' : '500',
                          }}
                          numberOfLines={1}
                        >
                          {i.replace(/[-_]/g, ' ')}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            {/* Choose Color */}
            <View className="mb-8">
            <Text className="text-base font-semibold text-gray-700 mb-3">Choose Color</Text>

            {/* Background container like icon section */}
            <View className="bg-gray-50 border border-gray-200 rounded-2xl p-3">
                <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 6, paddingHorizontal: 2 }}
                >
                {availableColors.map((c) => {
                    const isActive = color === c;
                    return (
                    <TouchableOpacity
                        key={c}
                        onPress={() => setColor(c)}
                        activeOpacity={0.85}
                        style={{
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        backgroundColor: c,
                        marginHorizontal: 6,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: isActive ? 4 : 0,
                        borderColor: isActive ? '#00332d' : 'transparent',
                        }}
                    >
                        {isActive && (
                        <Ionicons name="checkmark-circle" size={28} color="white" />
                        )}
                    </TouchableOpacity>
                    );
                })}
                </ScrollView>
            </View>
            </View>


            {/* Action Buttons */}
            <View className="flex-row gap-2 pb-6">
              {/* Save Button */}
              <TouchableOpacity
                onPress={handleSave}
                activeOpacity={0.8}
                className="flex-1 bg-primary rounded-xl items-center justify-center"
                style={{ height: 44 }}
              >
                <Text className="text-secondary font-semibold text-sm">Save Changes</Text>
              </TouchableOpacity>

              {/* Delete Button
              <TouchableOpacity
                onPress={onDelete}
                activeOpacity={0.8}
                className="flex-1 bg-red-50 border border-red-200 rounded-xl items-center justify-center"
                style={{ height: 44 }}
              >
                <View className="flex-row items-center">
                  <Ionicons name="trash-outline" size={16} color="#DC2626" style={{ marginRight: 4 }} />
                  <Text className="text-red-600 font-semibold text-sm">Delete</Text>
                </View>
              </TouchableOpacity> */}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
