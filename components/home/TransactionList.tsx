import { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TransactionActions from "@/components/home/TransactionActions";
import { transactions, Transaction } from "@/data/transaction";
import { userCards } from "@/data/user";

type Props = {
  filters: {
    timeFilter: string;
    bankFilter: string;
    sortType: string;
  };
  transactions?: Transaction[];
};

// Helper function to filter by time
function filterByTime(transactions: Transaction[], timeFilter: string): Transaction[] {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  return transactions.filter((tx) => {
    const txDate = new Date(tx.date);
    switch (timeFilter) {
      case "week":
        return txDate >= oneWeekAgo;
      case "last_week":
        return txDate >= twoWeeksAgo && txDate < oneWeekAgo;
      case "last_month":
        return txDate >= oneMonthAgo;
      case "all":
      default:
        return true;
    }
  });
}

// Helper function to filter by bank
function filterByBank(transactions: Transaction[], bankFilter: string): Transaction[] {
  if (bankFilter === "all") return transactions;

  const bankMap: { [key: string]: string[] } = {
    chase: ["COMMERCE", "Chase"],
    boa: ["BOA", "Bank of America"],
    wells: ["Wells Fargo", "WELLS"],
    citi: ["Citi", "CITI"],
  };

  const bankKeywords = bankMap[bankFilter] || [];
  
  return transactions.filter((tx) => {
    const subtitle = tx.subtitle?.toUpperCase() || "";
    return bankKeywords.some((keyword) => subtitle.includes(keyword.toUpperCase()));
  });
}

// Helper function to sort transactions
function sortTransactions(transactions: Transaction[], sortType: string): Transaction[] {
  const sorted = [...transactions];
  
  switch (sortType) {
    case "date_asc":
      return sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    case "date_desc":
      return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    case "amount_asc":
      return sorted.sort((a, b) => a.amount - b.amount);
    case "amount_desc":
      return sorted.sort((a, b) => b.amount - a.amount);
    default:
      return sorted;
  }
}

// Group transactions by date
function groupTransactionsByDate(transactions: Transaction[]): { [key: string]: Transaction[] } {
  const groups: { [key: string]: Transaction[] } = {};
  
  transactions.forEach((tx) => {
    const date = new Date(tx.date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let dateKey: string;
    if (date.toDateString() === today.toDateString()) {
      dateKey = "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = "Yesterday";
    } else {
      dateKey = date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(tx);
  });

  return groups;
}

export default function TransactionList({ filters, transactions: transactionsProp }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Use provided transactions or default to mock data
  const transactionsData = transactionsProp || transactions;

  // Apply all filters
  let filteredTransactions = transactionsData;
  filteredTransactions = filterByTime(filteredTransactions, filters.timeFilter);
  filteredTransactions = filterByBank(filteredTransactions, filters.bankFilter);
  filteredTransactions = sortTransactions(filteredTransactions, filters.sortType);

  const groupedTransactions = groupTransactionsByDate(filteredTransactions);

  return (
    <ScrollView 
      className="flex-1" 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
    >
      {Object.keys(groupedTransactions).map((date) => (
        <View key={date} className="mb-4">
          {/* Date Header */}
          <Text className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide">
            {date}
          </Text>

          {/* Transactions */}
          <View className="gap-2">
            {groupedTransactions[date].map((tx) => {
              const splitCount = tx.splitData?.splits?.length ?? 0;
              const isSplit = splitCount > 0;
              const isExpanded = expandedId === tx.id;
              const isIncome = tx.amount > 0;

              return (
                <View
                  key={tx.id}
                  className="bg-white rounded-2xl overflow-hidden border-2 border-gray-200"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                >
                  {/* Transaction Row */}
                  <TouchableOpacity
                    className="flex-row items-center p-4"
                    onPress={() => setExpandedId(isExpanded ? null : tx.id)}
                    activeOpacity={0.7}
                  >
                    {/* Icon/Logo */}
                    {tx.logo ? (
                      <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mr-3 overflow-hidden">
                        <Image
                          source={tx.logo}
                          className="w-full h-full"
                          resizeMode="contain"
                        />
                      </View>
                    ) : (
                      <View
                        className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${
                          isIncome ? "bg-green-50" : "bg-red-50"
                        }`}
                      >
                        <Ionicons
                          name={isIncome ? "arrow-down" : "arrow-up"}
                          size={20}
                          color={isIncome ? "#10B981" : "#EF4444"}
                        />
                      </View>
                    )}

                    {/* Transaction Info */}
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <Text
                          className="text-base font-bold text-gray-900 flex-1"
                          numberOfLines={1}
                        >
                          {tx.title}
                        </Text>

                        {/* Split Badge */}
                        {isSplit && (
                          <View className="ml-2 bg-green-50 rounded-full px-2 py-1 flex-row items-center border border-green-200">
                            <Ionicons
                              name="people"
                              size={12}
                              color="#10B981"
                            />
                            <Text className="text-xs font-bold text-green-600 ml-1">
                              {splitCount}
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Subtitle */}
                      {tx.subtitle && (
                        <Text
                          className="text-xs text-gray-500 font-medium"
                          numberOfLines={1}
                        >
                          {tx.subtitle}
                        </Text>
                      )}
                    </View>

                    {/* Amount */}
                    <View className="items-end ml-3">
                      <Text
                        className={`text-lg font-bold ${
                          isIncome ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isIncome ? "+" : "-"}${Math.abs(tx.amount).toFixed(2)}
                      </Text>

                      {/* Split Status */}
                      {isSplit && tx.splitData && (
                        <View className="bg-amber-50 px-2 py-0.5 rounded mt-1">
                          <Text className="text-xs text-amber-700 font-semibold">
                            {tx.splitData.splits.filter((s) => s.isPaid).length}/
                            {splitCount} paid
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Expand Indicator */}
                    <Ionicons
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={20}
                      color="#9CA3AF"
                      style={{ marginLeft: 8 }}
                    />
                  </TouchableOpacity>

                  {/* Transaction Actions */}
                  <TransactionActions
                    visible={isExpanded}
                    transaction={tx}
                  />
                </View>
              );
            })}
          </View>
        </View>
      ))}

      {/* Empty State */}
      {Object.keys(groupedTransactions).length === 0 && (
        <View className="items-center justify-center py-20">
          <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
            <Ionicons name="receipt-outline" size={40} color="#9CA3AF" />
          </View>
          <Text className="text-gray-900 text-lg font-bold text-center mb-2">
            No transactions found
          </Text>
          <Text className="text-gray-500 text-base text-center px-8">
            Try adjusting your filters
          </Text>
        </View>
      )}
    </ScrollView>
  );
}