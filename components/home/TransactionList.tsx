import { filterAndGroupTransactions } from "@/controllers/TransactionController";
import { transactions } from "@/data/transaction";
import { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TransactionActions from "@/components/home/TransactionActions";

type Props = {
  filter: string;
};

export default function TransactionList({ filter }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const groupedTransactions = filterAndGroupTransactions(transactions, filter);

  return (
    <ScrollView className="flex-1 px-[12px]">
      {Object.keys(groupedTransactions).map((date) => (
        <View key={date} className="mb-[12px]">
          <Text className="text-normal font-bold text-primary mt-[4px] mb-[8px]">
            {date}
          </Text>

          {groupedTransactions[date].map((tx) => {
            const splitCount = tx.splitData?.splits?.length ?? 0;
            const isSplit = splitCount > 0;
            const isExpanded = expandedId === tx.id;

            return (
              <View
                key={tx.id}
                className="bg-white p-[12px] rounded-[8px] mb-[8px] shadow-sm"
              >
                <TouchableOpacity
                  className="flex-row items-center"
                  onPress={() => setExpandedId(isExpanded ? null : tx.id)}
                >
                  {tx.logo ? (
                    <Image
                      source={tx.logo}
                      className="w-[46px] h-[46px] rounded-[18px]"
                      resizeMode="contain"
                    />
                  ) : (
                    <View className="w-[46px] h-[46px] rounded-[18px] bg-accent items-center justify-center">
                      <Text className="text-white font-bold">KS</Text>
                    </View>
                  )}

                  <View className="flex-1 ml-[10px]">
                    <View className="flex-row items-center">
                      <Text className="text-[12px] font-semibold text-black">
                        {tx.title}
                      </Text>

                      {/* ✅ Split badge safely using splitCount */}
                      {isSplit && (
                        <View className="ml-2 bg-green-50 rounded-full px-2 py-0.5 flex-row items-center">
                          <Ionicons name="pie-chart" size={10} color="#10B981" />
                          <Text className="text-xs font-semibold text-green-600 ml-1">
                            {splitCount}
                          </Text>
                        </View>
                      )}
                    </View>

                    {tx.subtitle && (
                      <Text className="text-[12px] text-[#666] italic mt-[2px]">
                        {tx.subtitle}
                      </Text>
                    )}
                  </View>

                  <Text
                    className={`text-normal font-bold ${
                      tx.amount < 0 ? "text-red-500" : "text-green-600"
                    }`}
                  >
                    {`${tx.amount < 0 ? "-" : "+"}$${Math.abs(tx.amount).toFixed(2)}`}
                  </Text>
                </TouchableOpacity>

                <TransactionActions visible={isExpanded} transaction={tx} />
              </View>
            );
          })}

        </View>
      ))}
    </ScrollView>
  );
}