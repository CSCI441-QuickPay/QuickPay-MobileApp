import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
// Import icons from Expo vector icons
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";

// Define the type for balance card props
type BalanceCardProps = {
  balance: number; // User's balance amount
  onRequest: () => void; // Callback when Request button is pressed
  onSend: () => void; // Callback when Send button is pressed
};

// Balance card component
export default function BalanceCard ({ balance, onRequest, onSend }: BalanceCardProps) {

    // State to manage balance visibility
    const [hidden, setHidden] = useState(false);
    
    return(
        <View style={styles.card}>
            {/* Balance Section */}
            <View style={styles.balanceSection}>
                <Text style={styles.balanceText}>
                    ${" "}
                    {/* If hidden, show dots. If not, format the balance */}
                    {hidden
                        ? "•••••"
                        : balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </Text>

                {/* Toggle visibility button */}
                <TouchableOpacity onPress={() => setHidden(!hidden)}>
                    <Ionicons 
                        name={hidden ? "eye-off" : "eye"} // Toggle between eye and eye-off icons
                        size={24} 
                        color="#00332d" 
                        style={{ marginLeft: 25 }}
                    />
                </TouchableOpacity>
            </View>
            
            {/* Action Buttons  */}

            <View style={styles.action}>
                {/* Request Button */}
                <TouchableOpacity style={styles.actionBtn} onPress={onRequest}>
                    <MaterialIcons name="request-page" size={24} color="#ccf8f1" />
                    <Text style={styles.actionText}>Request</Text>
                </TouchableOpacity>

                {/* devider line btween two buttons */}
                <View style={styles.divider} />

                {/* Send Button */}
                <TouchableOpacity style={styles.actionBtn} onPress={onSend}>
                    <Feather name="send" size={24} color="#ccf8f1" />
                    <Text style={styles.actionText}>Send</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

//State to manage balance visibility
const styles = StyleSheet.create({
    card: {
        backgroundColor: "#ccf8f1", // Light green background
        borderRadius: 12,
        overflow: "hidden",
        margin: 16,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    balanceSection: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
    }, 
    balanceText: {
        fontSize: 22,
        fontWeight: "700",
        color: "#00332d",
    },
    action: {
        flexDirection: "row",
        backgroundColor: "#00332d",
    },
    actionBtn: {
    flex: 1,                   
    flexDirection: "row",       // icon + text side by side
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
    actionText: {
    color: "#ccf8f1",           
    fontSize: 16,
    marginLeft: 6,              
    fontWeight: "500",
  },
    divider: {
    width: 1,
    backgroundColor: "#ccf8f1", 
    opacity: 0.3,               // make it subtle
  },
})