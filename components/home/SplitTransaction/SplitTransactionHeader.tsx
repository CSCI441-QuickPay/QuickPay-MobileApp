import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  title: string;
  subtitle?: string;
  onEdit?: () => void;
  onClose: () => void;
  canEdit?: boolean;
};

export default function SplitTransactionHeader({
  title,
  subtitle,
  onEdit,
  onClose,
  canEdit,
}: Props) {
  return (
    <View className="flex-row items-center justify-between mb-6">
      <View className="flex-1">
        <View className="flex-row items-center">
          <Text className="text-3xl font-bold text-black mr-2">{title}</Text>
          {canEdit ? (
            <TouchableOpacity onPress={onEdit} activeOpacity={0.8}>
              <Ionicons name="create-outline" size={24} color="#00332d" />
            </TouchableOpacity>
          ) : null}
        </View>
        {!!subtitle && <Text className="text-sm text-gray-500 mt-1">{subtitle}</Text>}
      </View>

      <TouchableOpacity onPress={onClose}>
        <Ionicons name="close-circle" size={36} color="#9CA3AF" />
      </TouchableOpacity>
    </View>
  );
}

