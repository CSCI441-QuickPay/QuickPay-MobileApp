import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SplitShareSection({ code, onShare }: { code: string; onShare: () => void }) {
  return (
    <View className="mb-5">
      <Text className="text-base font-semibold text-gray-700 mb-2">Share Code</Text>
      <View className="bg-gray-50 border-2 border-gray-200 rounded-2xl px-5 h-14 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-primary tracking-widest">{code}</Text>
        <TouchableOpacity onPress={onShare} className="bg-primary rounded-xl px-3 py-1.5" activeOpacity={0.8}>
          <Ionicons name="share-social" size={18} color="#ccf8f1" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
