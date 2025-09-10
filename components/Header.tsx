import react from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type HeaderProps = {
  name: string;
  onSettingPress: () => void;  // Callback when setting button is pressed
};

// Header component
export default function Header({ name, onSettingPress }: HeaderProps) {
    return (
        <View style={styles.container}>
            {/* Profile Image */}
            <Image 
                source={require('@/assets/images/avatar.jpg')}
                style={styles.avatar}
            />
            {/* Greeting Text */}
            <Text style={styles.text}>
                Welcome Back, {"\n"}
                <Text style={styles.name}>{name}!</Text>
            </Text>

            {/* Settings Button */}
            <TouchableOpacity onPress={onSettingPress}>
                <Ionicons name="settings-outline" size={24} color="#000" marginRight = {12} />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#fff",
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderColor: "black",
        borderWidth: 1,
    },
    text: {
        flex: 1,
        fontSize: 16,
        marginLeft: 12,
        fontWeight: "400",
    },
    name: {
        fontWeight: "700",
        fontSize: 25,
    }
})