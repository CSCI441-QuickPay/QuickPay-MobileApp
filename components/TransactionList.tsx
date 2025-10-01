import { Transaction, transactions } from "@/data/transaction";
import { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import TransactionActions from "./TransactionActions";


function formatDateLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10); // YYYY-MM-DD

  if (dateStr === todayStr) {
    return "Today";
  }

  // Format manually instead of relying on JS Date
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Helper : parse transaction date into date object
function parseDate(dateStr: string): Date | null {
    // Expecting dateStr in "YYYY-MM-DD" format
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return null;
  // month - 1 because JS Date months are 0-based
  return new Date(year, month - 1, day);
}
// Define props
type Props = {
    filter: string; // Filter string to filter transactions
}

export default function TransactionList({ filter }: Props) {
    // State to manage expanded transaction details 
    const [expandedIds, setExpandedIds] = useState<string | null>(null);

     // Today's date (normalized to midnight for comparison)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Default to all transactions
    const filteredTransactions = transactions.filter((tx) =>{
        const txDate = parseDate(tx.date);
        if (!txDate) return true; // keep parsing if failed

        // Normalize transaction date (ignore time)
        const txDay = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate());

        if (filter === "week"){
            // Start of week is Sunday
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            
            // End of week is 6 days after start
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);

            return txDay >= startOfWeek && txDay <= endOfWeek; // This week
        } else if (filter === "last_week"){
            const startOfLastWeek = new Date(today);
            startOfLastWeek.setDate(today.getDate() - today.getDay() - 7); // Last week start

            // End of week is 6 days after start
            const endOfLastWeek = new Date(startOfLastWeek);
            endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);

            return txDay >= startOfLastWeek && txDay <= endOfLastWeek; // Last week
        } else if (filter === "last_month"){

            // Last month is month before current month
            const lastMonth = today.getMonth() - 1;
            const year = lastMonth < 0 ? today.getFullYear() - 1 : today.getFullYear();
            const month = lastMonth < 0 ? 11 : lastMonth; // Wrap around to December if needed
            return (
                txDay.getMonth() === month &&
                txDay.getFullYear() === year
            ); // Last month
        } else {
            return true; // All transactions (default)
            
        }
    } );

    // Sort transactions by date descending (most recent first)
    const sortedTransctions = [...filteredTransactions].sort((a, b) => {
        const dateA = parseDate(a.date); // Convert to Date object
        const dateB = parseDate(b.date); // Convert to Date object
        if (!dateA || !dateB) return 0; // keep original order if parsing fails
        return dateB.getTime() - dateA.getTime(); // Descending order
    });
    // Group transactions by date
    // Reduce let you loop through an array, Acc is accumulator, tx is current transaction
    const groupedTransactions = sortedTransctions.reduce((acc : Record<string, Transaction[]>, tx) => { 
        const label = formatDateLabel(tx.date); // convert ISO -> label
        if (!acc[label]) acc[label] = []; // Create group array if not exists
        acc[label].push(tx); // Add transaction to the group
        return acc;
    }, {});

    return(
        // Scrollable list of transactions
        <ScrollView className="flex-1 px-[12px]">
            {Object.keys(groupedTransactions).map(date => (
                <View key={date} className="mb-[12px]">
                    {/* Date Header */}
                    <Text className="text-normal font-bold text-primary mt-[4px] mb-[8px]">{date}</Text>

                    {/* Render the list of transactions for this date */}
                    {groupedTransactions[date].map((tx) => {
                        // Check if this transaction is expanded
                        const isExpanded = expandedIds === tx.id;

                        return (
                            <View key={tx.id} className=" bg-white p-[12px] rounded-[8px] mb-[8px] shadow-sm">
                             
                             {/* Toggle expand/collapse */}
                              <TouchableOpacity className="flex-row items-center"
                              onPress={() => setExpandedIds(isExpanded ? null : tx.id)} > 
                                {/* Transaction logos */}
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
                                    <Text className="text-[12px] font-semibold text-black">{tx.title}</Text>
                                    {/* Only show subtitle if it exists */}
                                    {tx.subtitle ? <Text className="text-[12px] text-[#666] italic mt-[2px]">{tx.subtitle}</Text> : null}
                                </View>

                                {/* Transaction amount */}
                                <Text className={`text-normal font-bold ${tx.amount < 0 ? "text-red-500" : "text-green-600"}`}>
                                    {`${tx.amount < 0 ? "-" : "+"}$${Math.abs(tx.amount).toFixed(2)}`}
                                </Text>
                              </TouchableOpacity>

                              {/* Expanded transaction actions */}
                              <TransactionActions visible={isExpanded} transaction={tx} />

                            </View>

                            
                        )}
                    )}
                </View>
            ))}
        </ScrollView>
    )
}
