import { filterAndGroupTransactions } from "@/controllers/TransactionController";
import { transactions } from "@/data/transaction";
import { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import TransactionActions from "@/components/home/TransactionActions";


// Define props for filtering
type Props = {
  filter: string; // "week", "last_week", "last_month", "all"
};

export default function TransactionList({ filter }: Props) {
  // State to manage expanded transaction details
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Get grouped transactions from presenter (controller)
  const groupedTransactions = filterAndGroupTransactions(transactions, filter);

  return (
    // Scrollable list of transactions
    <ScrollView className="flex-1 px-[12px]">
      {Object.keys(groupedTransactions).map((date) => (
        <View key={date} className="mb-[12px]">
          {/* Date Header */}
          <Text className="text-normal font-bold text-primary mt-[4px] mb-[8px]">
            {date}
          </Text>

          {/* Render each transaction under this date */}
          {groupedTransactions[date].map((tx) => {
            const isExpanded = expandedId === tx.id;

            return (
              <View
                key={tx.id}
                className="bg-white p-[12px] rounded-[8px] mb-[8px] shadow-sm"
              >
                {/* Toggle expand/collapse */}
                <TouchableOpacity
                  className="flex-row items-center"
                  onPress={() => setExpandedId(isExpanded ? null : tx.id)}
                >
                  {/* Transaction logo */}
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

                  {/* Transaction title + subtitle */}
                  <View className="flex-1 ml-[10px]">
                    <Text className="text-[12px] font-semibold text-black">
                      {tx.title}
                    </Text>
                    {/* Only show subtitle if it exists */}
                    {tx.subtitle ? (
                      <Text className="text-[12px] text-[#666] italic mt-[2px]">
                        {tx.subtitle}
                      </Text>
                    ) : null}
                  </View>

                  {/* Transaction amount */}
                  <Text
                    className={`text-normal font-bold ${
                      tx.amount < 0 ? "text-red-500" : "text-green-600"
                    }`}
                  >
                    {`${tx.amount < 0 ? "-" : "+"}$${Math.abs(tx.amount).toFixed(2)}`}
                  </Text>
                </TouchableOpacity>

                {/* Expanded transaction actions */}
                <TransactionActions visible={isExpanded} transaction={tx} />
              </View>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}
