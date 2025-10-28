import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Text, TouchableOpacity, View, Share, Alert } from 'react-native';
import { SplitTransactionModal } from './SplitTransaction';

type Props = {
  visible: boolean;
  transaction: any;
};

export default function TransactionActions({ visible, transaction }: Props) {
  const [splitModalVisible, setSplitModalVisible] = useState(false);

  if (!visible) return null;

  const isSplit = transaction.splitData && transaction.splitData.splits && transaction.splitData.splits.length > 0;
  const canSplit = transaction.amount < 0; // Only expenses can be split

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${transaction.title}\n$${Math.abs(transaction.amount).toFixed(2)}`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleSplit = () => {
    if (!canSplit) {
      Alert.alert(
        'Cannot Split',
        'Only expenses (red transactions) can be split with others.'
      );
      return;
    }
    setSplitModalVisible(true);
  };

  return (
    <>
      <View className="flex-row items-center justify-around px-4 py-4 border-t border-gray-100 bg-white">
        {/* Share */}
        <TouchableOpacity 
          onPress={handleShare}
          className="items-center justify-center"
          activeOpacity={0.7}
          style={{ width: 70 }}
        >
          <View className="w-11 h-11 rounded-full bg-gray-50 items-center justify-center mb-1">
            <Ionicons name="share-social-outline" size={20} color="#6B7280" />
          </View>
          <Text className="text-xs text-gray-600 font-medium">Share</Text>
        </TouchableOpacity>

        {/* Repeat */}
        <TouchableOpacity 
          onPress={() => console.log('Repeat')}
          className="items-center justify-center"
          activeOpacity={0.7}
          style={{ width: 70 }}
        >
          <View className="w-11 h-11 rounded-full bg-gray-50 items-center justify-center mb-1">
            <Ionicons name="refresh-outline" size={20} color="#6B7280" />
          </View>
          <Text className="text-xs text-gray-600 font-medium">Repeat</Text>
        </TouchableOpacity>

        {/* Split - Green outline ONLY if already split */}
        <TouchableOpacity 
          onPress={handleSplit}
          className="items-center justify-center"
          activeOpacity={0.7}
          style={{ width: 70 }}
          disabled={!canSplit}
        >
          <View 
            className="w-11 h-11 rounded-full items-center justify-center mb-1"
            style={{
              backgroundColor: isSplit ? '#F0FDF4' : '#F9FAFB',
              borderWidth: isSplit ? 2 : 0,
              borderColor: isSplit ? '#10B981' : 'transparent',
            }}
          >
            <Ionicons 
              name="pie-chart-outline" 
              size={20} 
              color={isSplit ? '#10B981' : (canSplit ? '#6B7280' : '#D1D5DB')}
            />
          </View>
          <Text 
            className="text-xs font-medium"
            style={{ 
              color: isSplit ? '#10B981' : (canSplit ? '#6B7280' : '#D1D5DB')
            }}
          >
            Split
          </Text>
        </TouchableOpacity>

        {/* More */}
        <TouchableOpacity 
          onPress={() => console.log('More')}
          className="items-center justify-center"
          activeOpacity={0.7}
          style={{ width: 70 }}
        >
          <View className="w-11 h-11 rounded-full bg-gray-50 items-center justify-center mb-1">
            <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
          </View>
          <Text className="text-xs text-gray-600 font-medium">More</Text>
        </TouchableOpacity>
      </View>

      <SplitTransactionModal
        visible={splitModalVisible}
        onClose={() => setSplitModalVisible(false)}
        transaction={transaction}
      />
    </>
  );
}