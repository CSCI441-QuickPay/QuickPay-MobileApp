import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { availableIcons, availableColors } from '@/data/budget';

interface AddCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string, budget: string, icon: string, color: string) => void;
  parentName?: string | null;
}

export default function AddCategoryModal({
  visible,
  onClose,
  onSave,
  parentName,
}: AddCategoryModalProps) {
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [icon, setIcon] = useState('wallet');
  const [color, setColor] = useState('#3B82F6');

  const handleSave = () => {
    if (!name.trim() || !budget.trim()) return;
    onSave(name, budget, icon, color);
    setName('');
    setBudget('');
    setIcon('wallet');
    setColor('#3B82F6');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 max-h-[85%]">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-3xl font-bold text-black">Add Category</Text>
              {parentName && (
                <Text className="text-sm text-gray-500 mt-1">Under: {parentName}</Text>
              )}
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={36} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Category Name */}
            <View className="mb-5">
              <Text className="text-base font-semibold text-gray-700 mb-2">Category Name</Text>
              <View className="bg-gray-50 border-2 border-gray-200 rounded-2xl px-5 h-14 justify-center">
                <TextInput
                  placeholder="e.g., Entertainment"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            {/* Budget Amount */}
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
                        // Allow digits, one dot, and commas (which we strip later anyway)
                        const cleaned = v.replace(/[^0-9.,]/g, '');
                        setBudget(cleaned);
                    }}
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


            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSave}
              activeOpacity={0.8}
              className="bg-primary rounded-2xl py-4 items-center mb-4"
            >
              <Text className="text-secondary font-bold text-xl">Add Category</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
