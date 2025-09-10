import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Define the type for each navigation item
type NavItem = {
  label: string;
  icon: (color: string) => React.ReactNode; // Returns an icon component
  onPress: () => void;
  active?: boolean; // Change color if active
  special?: boolean; // Special styling for the Scan button
};

// Bottom navigation component
const BottomNav = ({ items }: { items: NavItem[] }) => {
  return (
    <View style={styles.container}>
      {items.map((item, index) => {
        // Default color for icon, White if active, dark green otherwise
        const color = item.active ? "#000" : "#555"; // white if active, dark green otherwise

        // Special styling for the Scan button
        if (item.special) {
          return (
            <TouchableOpacity
              key = {index}
              style = {styles.specialItem} //Floating style, can find below
              onPress = {item.onPress}
            >
              {/* Special icon color for the Scan button */}
              {item.icon("#ccf8f1")}
              {/* Special label color for the Scan button */}
              <Text style={[styles.label, { color: "#ccf8f1" }]}>{item.label}</Text>
            </TouchableOpacity>
          )
        }
        //Regular Nav items
      return(
        <TouchableOpacity
          key={index}
          style={styles.item}
          onPress={item.onPress}
        >
          {item.icon(color)}
          <Text style={[styles.label, { color }]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      );
  })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#ccf8f1", 
    paddingVertical: 8,
  },
  item: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 6,
  },
  label: {
    fontSize: 12,
    marginTop: 4,
  },
  specialItem: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00332d",
    padding: 16,
    borderRadius: 20,
    marginTop: -20, // to make it overlap the nav bar (move it upwards)
  }
});

export default BottomNav;
