import { ScrollView, Text, View, Image } from "react-native";

// Define the type for each transaction item
type Transaction = {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  date: string;
  logo?: any;
}

// Dummy data for transactions
const transactions: Transaction[] = [
  {
    id: "1",
    title: "NETFLIX.COM,SINGAPORE",
    subtitle: "SOURCE: COMMERCE(-$2.00), BOA(-$1.99)",
    amount: -3.99,
    date: "Today",
    logo: require("@/assets/images/netflix_logo.png"),
  },
  {
    id: "2",
    title: "ACH Deposit DIR DEP STATE OF KANSAS",
    subtitle: "",
    amount: 679.17,
    date: "Today",
    logo: undefined,
  },
  {
    id: "3",
    title: "GOOGLE *YouTubePremium",
    subtitle: "SOURCE: COMMERCE(-$1.1), BOA(-$1.09)",
    amount: -2.19,
    date: "Today",
    logo: require("@/assets/images/youtube_premium_logo.png"),
  },
  {
    id: "4",
    title: "NETFLIX.COM,SINGAPORE",
    subtitle: "SOURCE: COMMERCE(-$2.00), BOA(-$1.99)",
    amount: -3.99,
    date: "October 4, 2025",
    logo: require("@/assets/images/netflix_logo.png"),
  },
  {
    id: "5",
    title: "ACH Deposit DIR DEP STATE OF KANSAS",
    subtitle: "",
    amount: 679.17,
    date: "October 4, 2025",
    logo: undefined,
  },
];

export default function TransactionList() {
    // Group transactions by date
    // Reduce let you loop through an array, Acc is accumulator, tx is current transaction
    const groupedTransactions = transactions.reduce((acc : Record<string, Transaction[]>, tx) => { 
        if (!acc[tx.date]) acc[tx.date] = []; // Create group array if not exists
        acc[tx.date].push(tx); // Add transaction to the group
        return acc;
    }, {} );

    return(
        // Scrollable list of transactions
        <ScrollView className="flex-1 px-[12px]">
            {Object.keys(groupedTransactions).map(date => (
                <View key={date} className="mb-[12px]">
                    {/* Date Header */}
                    <Text className="text-normal font-bold text-primary mt-[4px] mb-[8px]">{date}</Text>

                    {/* Render the list of transactions for this date */}
                    {groupedTransactions[date].map((tx) => (
                        <View key={tx.id} className="flex-row items-center bg-white p-[12px] rounded-[8px] mb-[8px] shadow-sm">

                            {/* Transaction logos */}
                            {tx.logo ? (
                                <Image 
                                    source={tx.logo }
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
                            {tx.amount < 0 ? "-" : "+"}${Math.abs(tx.amount).toFixed(2)}
                        </Text>
                    
                    </View>
                    ))}
                </View>
            ))}
        </ScrollView>
    )
}
