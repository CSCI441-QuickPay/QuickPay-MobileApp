/**
 * written by: Team QuickPay
 * tested by: Team QuickPay
 * debugged by: Team QuickPay
 * Notes: Contributions were shared, see GitHub history for commit details.
 * Unit Tests for UserSyncService
 */
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  title: string;
  subtitle?: string;
  onEdit?: () => void;
  onClose: () => void;
  canEdit?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBgColor?: string;
};

export default function SplitTransactionHeader({
  title,
  subtitle,
  onEdit,
  onClose,
  canEdit,
  icon = 'pie-chart-outline',
  iconColor = '#00332d',
  iconBgColor = '#F3F4F6',
}: Props) {
  return (
    <View className="flex-row items-center justify-between mb-6">
      {/* Icon on the left */}
      <View
        className="w-12 h-12 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: iconBgColor }}
      >
        <Ionicons name={icon} size={24} color={iconColor} />
      </View>

      {/* Title and subtitle */}
      <View className="flex-1">
        <View className="flex-row items-center">
          <Text className="text-xl font-bold text-black mr-2">{title}</Text>
          {canEdit && (
            <TouchableOpacity onPress={onEdit} activeOpacity={0.8} className="ml-1">
              <Ionicons name="create-outline" size={18} color="#00332d" />
            </TouchableOpacity>
          )}
        </View>
        {!!subtitle && <Text className="text-xs text-gray-500 mt-0.5">{subtitle}</Text>}
      </View>

      {/* Close button */}
      <TouchableOpacity onPress={onClose} className="ml-2">
        <Ionicons name="close-circle" size={32} color="#9CA3AF" />
      </TouchableOpacity>
    </View>
  );
}

