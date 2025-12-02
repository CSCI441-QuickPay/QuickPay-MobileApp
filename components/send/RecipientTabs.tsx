import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import ManualRecipientInput from './ManualRecipientInput';
import FavoritesRecipientList from './FavoritesRecipientList';
import QRRecipientSelector from './QRRecipientSelector';
import { RecipientInfo } from '@/services/PaymentService';

type TabType = 'manual' | 'favorites' | 'qr';

interface RecipientTabsProps {
  onRecipientSelect: (recipient: RecipientInfo) => void;
  selectedTab: TabType;
  onTabChange: (tab: TabType) => void;
  currentAccountNumber: string;
}

export default function RecipientTabs({
  onRecipientSelect,
  selectedTab,
  onTabChange,
  currentAccountNumber,
}: RecipientTabsProps) {
  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'manual', label: 'Manual', icon: 'pencil' },
    { id: 'favorites', label: 'Favorites', icon: 'star' },
    { id: 'qr', label: 'Scan QR', icon: 'qr-code' },
  ];

  return (
    <View className="flex-1">
      {/* Tab bar */}
      <View className="flex-row border-b border-gray-200 bg-white px-6">
        {tabs.map((tab) => {
          const isActive = selectedTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onTabChange(tab.id)}
              className="flex-1 py-4"
              activeOpacity={0.7}
            >
              <View className="items-center">
                <Text
                  className={`text-sm font-semibold ${
                    isActive ? 'text-[#00332d]' : 'text-gray-500'
                  }`}
                >
                  {tab.label}
                </Text>
                {isActive && (
                  <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00332d]" />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tab content */}
      <View className="flex-1">
        {selectedTab === 'manual' && (
          <ManualRecipientInput
            onRecipientSelect={onRecipientSelect}
            currentAccountNumber={currentAccountNumber}
          />
        )}

        {selectedTab === 'favorites' && (
          <FavoritesRecipientList onRecipientSelect={onRecipientSelect} />
        )}

        {selectedTab === 'qr' && <QRRecipientSelector />}
      </View>
    </View>
  );
}
