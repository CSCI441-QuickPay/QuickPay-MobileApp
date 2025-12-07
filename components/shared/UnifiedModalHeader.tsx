/**
 * written by: Team QuickPay
 * tested by: Team QuickPay
 * debugged by: Team QuickPay
 * Notes: Contributions were shared, see GitHub history for commit details.
 * Unit Tests for UserSyncService
 */
import React from 'react';
import { View, Text, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface UnifiedModalHeaderProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  onEdit?: () => void;
  canEdit?: boolean;
  // Icon/Logo options - only one should be provided
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBgColor?: string;
  logo?: ImageSourcePropType;
  // Or custom icon component
  customIcon?: React.ReactNode;
}

export default function UnifiedModalHeader({
  title,
  subtitle,
  onClose,
  onEdit,
  canEdit,
  icon = 'document-text-outline',
  iconColor = '#00332d',
  iconBgColor = '#F3F4F6',
  logo,
  customIcon,
}: UnifiedModalHeaderProps) {
  return (
    <View className="flex-row items-center justify-between mb-6">
      {/* Icon/Logo Section */}
      {logo && (
        <Image source={logo} style={{ width: 48, height: 48, borderRadius: 12, marginRight: 12 }} />
      )}
      {icon && !logo && !customIcon && (
        <View
          className="w-12 h-12 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: iconBgColor }}
        >
          <Ionicons name={icon} size={24} color={iconColor} />
        </View>
      )}
      {customIcon && !logo && !icon && (
        <View className="mr-3">
          {customIcon}
        </View>
      )}

      {/* Title and Subtitle */}
      <View className="flex-1">
        <View className="flex-row items-center">
          <Text className="text-xl font-bold text-black mr-2" numberOfLines={1}>
            {title}
          </Text>
          {canEdit && onEdit && (
            <TouchableOpacity onPress={onEdit} activeOpacity={0.8} className="ml-1">
              <Ionicons name="create-outline" size={18} color="#00332d" />
            </TouchableOpacity>
          )}
        </View>
        {subtitle && (
          <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      {/* Close Button */}
      <TouchableOpacity onPress={onClose} activeOpacity={0.7} className="ml-2">
        <Ionicons name="close-circle" size={32} color="#9CA3AF" />
      </TouchableOpacity>
    </View>
  );
}
