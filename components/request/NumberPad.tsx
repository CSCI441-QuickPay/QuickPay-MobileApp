/**
 * written by: Team QuickPay
 * tested by: Team QuickPay
 * debugged by: Team QuickPay
 * Notes: Contributions were shared, see GitHub history for commit details.
 * Unit Tests for UserSyncService
 */
import { View, Text, TouchableOpacity } from "react-native";

export default function NumberPad({ onPressNumber, onDelete }: { onPressNumber: (n: string) => void; onDelete: () => void; }) {
  const nums = ["1","2","3","4","5","6","7","8","9",".","0"];

  return (
    <View className="w-full px-8 mt-6">
      <View className="flex-row justify-between flex-wrap">
        {nums.map((n) => (
          <TouchableOpacity
            key={n}
            onPress={() => onPressNumber(n)}
            className="w-1/3 py-5 items-center justify-center"
          >
            <Text className="text-3xl text-white font-semibold">{n}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          onPress={onDelete}
          className="w-1/3 py-5 items-center justify-center"
        >
          <Text className="text-3xl text-white font-semibold">⌫</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
