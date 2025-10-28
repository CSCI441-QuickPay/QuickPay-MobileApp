import { View, Text } from 'react-native';

export default function SplitSummary({
  total, people, amountPerPerson, received,
}: { total: number; people: number; amountPerPerson: number; received: number; }) {
  return (
    <View className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 mb-5">
      <Row label="Total Amount" value={`$${total.toFixed(2)}`} />
      <Row label="Number of People" value={String(people)} />
      <Row label="Amount per Person" value={`$${amountPerPerson.toFixed(2)}`} />
      <View className="border-t border-gray-300 my-2" />
      <Row label="Received" value={`$${received.toFixed(2)} / $${total.toFixed(2)}`} highlight />
    </View>
  );
}

function Row({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View className="flex-row justify-between items-center mb-1">
      <Text className={`text-sm ${highlight ? 'font-bold text-gray-700' : 'text-gray-600'}`}>{label}</Text>
      <Text className={`text-sm ${highlight ? 'text-primary font-bold' : 'text-black font-semibold'}`}>{value}</Text>
    </View>
  );
}

