/**
 * written by: Team QuickPay
 * tested by: Team QuickPay
 * debugged by: Team QuickPay
 * Notes: Contributions were shared, see GitHub history for commit details.
 * Unit Tests for UserSyncService
 */
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FocusButtons({ onReset, onAdd }: { onReset: () => void; onAdd: () => void }) {
  return (
    <>
      {/* Left button */}
      <View style={{ position: 'absolute', top: 16, left: 16, zIndex: 20 }}>
        <TouchableOpacity onPress={onReset} className="bg-primary rounded-full p-3 shadow-lg" activeOpacity={0.8}>
          <Ionicons name="locate" size={24} color="#ccf8f1" />
        </TouchableOpacity>
      </View>

      {/* Right button */}
      <View style={{ position: 'absolute', top: 16, right: 16, zIndex: 20 }}>
        <TouchableOpacity
          onPress={onAdd}
          className="bg-primary rounded-2xl px-5 py-3 flex-row items-center shadow-lg"
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle" size={22} color="#ccf8f1" />
          <Text className="text-secondary font-bold text-sm ml-2">Add</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
