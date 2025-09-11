import { Image, ImageSourcePropType, ScrollView, StyleSheet, Text, View } from "react-native";

// Define the type for each transaction item
type Transaction = {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  date: string;
  logo?: ImageSourcePropType;
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
        <ScrollView style={styles.container}>
            {Object.keys(groupedTransactions).map(date => (
                <View key={date} style={styles.dateGroup}>
                    {/* Date Header */}
                    <Text style={styles.date}>{date}</Text>

                    {/* Render the list of transactions for this date */}
                    {groupedTransactions[date].map((tx) => (
                        <View key={tx.id} style={styles.card}>

                            {/* Transaction logos */}
                            {tx.logo ? (
                                <Image 
                                    source={tx.logo }
                                    style={styles.logo}
                                    resizeMode = "contain"
                                />
                            ) : (
                                <View style = {styles.fallbackLogo}>
                                    <Text style = {styles.fallbackText}>KS</Text>
                                </View>
                            )}
                        
                        {/* Transaction title + subtitle */}
                        
                        <View style={{ flex: 1, marginLeft: 10 }}>
                            <Text style = {styles.title}>{tx.title}</Text>
                            {tx.subtitle ? <Text style = {styles.subtitle}>{tx.subtitle}</Text> : null}
                        </View>

                        {/* Transaction amount */}
                        <Text style = {[styles.amount, { color: tx.amount < 0 ? "red" : "green" }]}>
                            {tx.amount < 0 ? "-" : "+"}${Math.abs(tx.amount).toFixed(2)}
                        </Text>
                    
                    </View>
                    ))}
                </View>
            ))}
        </ScrollView>
    )
}

    // Styles for the component
const styles = StyleSheet.create({
    container :{
        flex: 1,
        paddingHorizontal: 12,
    },
    dateGroup: {
        marginBottom: 12,
    },
    date: {
        fontSize: 16,
        fontWeight: "700",
        color: "#00332d",
        marginTop: 4,
        marginBottom: 8,
    },
    card: {
        flexDirection: "row", // logo , text and amount in a row
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    logo: {
        width: 46,
        height: 46,
        borderRadius: 18,
    },
    fallbackLogo: {
        width: 46,
        height: 46,
        borderRadius: 18,
        backgroundColor: "#ff9800",
        alignItems: "center",
        justifyContent: "center",
    },
    fallbackText: {
        color: "#fff",
        fontWeight: "700",
    },
    title:{
        fontSize: 14,
        fontWeight: "600",
        color: "#000",
    },
    subtitle: {
        fontSize: 12,
        color: "#666",
    },
    amount: {
        fontSize: 15,
        fontWeight: "700",
    },


})