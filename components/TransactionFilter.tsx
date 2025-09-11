import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {Ionicons, FontAwesome5, Feather} from "@expo/vector-icons";

// Define the type for transaction filter props
type FilterButtonProps = {
    label: string; // Label for the filter button
    icon: React.ReactNode; // Icon for the filter button
    onPress?: () => void; // Callback when the button is pressed
}

// Transaction filter button component
function FilterButton({ label, icon, onPress }: FilterButtonProps) {
    return (
        <TouchableOpacity style={styles.filterButton} onPress={onPress}>
            {icon}
            <Text style={styles.filterLabel}>{label}</Text>
            <Ionicons name="chevron-down" size={16} color="#00332d"/>
        </TouchableOpacity>
    )
}

// Main TransactionFilter component
export default function TransactionFilter() {
    return (
        <View style={styles.container}>
            {/* Title */}
            <Text style={styles.title}>Transactions</Text>

            {/* Filter Buttons */}
            <View style={styles.buttons}>
                <FilterButton
                    label = "Recent"
                    icon = {<Ionicons name="time-outline" size={16} color="#00332d" />}
                    onPress = {() => console.log("Filter by recent")}
                />

                <FilterButton
                    label = "Categories"
                    icon = {<FontAwesome5 name="th-large" size={16} color="#00332d" />}
                    onPress = {() => console.log("Filter by categories")}
                />

                <FilterButton
                    label = "Sort"
                    icon = {<Feather name="sliders" size={16} color="#00332d" />}
                    onPress = {() => console.log("Sort transactions")}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#00332d",
    marginBottom: 12,
  },
  buttons: {
    flexDirection: "row",
    gap: 3, 
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#00332d",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  filterLabel: {
    marginHorizontal: 6,
    fontSize: 14,
    color: "#00332d",
  },
});
