/**
 * written by: Team QuickPay
 * tested by: Team QuickPay
 * debugged by: Team QuickPay
 * Notes: Contributions were shared, see GitHub history for commit details.
 * Unit Tests for UserSyncService
 */
import { View, Text, TouchableOpacity} from "react-native";
import { Ionicons } from "@expo/vector-icons";       

//Define type for ProfileOption props

export type ProfileOptionProps = {
    label: string;
    icon: keyof typeof Ionicons.glyphMap; // Ensure icon is a valid Ionicons name, it was string before, changed to keyof typeof Ionicons.glyphMap (number of icon name)
    onPress: () => void;
}

//ProfileOption component

export default function ProfileOption({ label, icon, onPress }: ProfileOptionProps) {
    return(
        <TouchableOpacity onPress = {onPress}
        className= "flex-row items-center justify-between border border-gray-300 rounded-full p-4 mb-2 w-[377px] h-[62px] bg-white">

            {/* Icon and Label Section */}
            <View className= "flex-row items-center">
                <Ionicons name={icon} size={36} color="black" />
                <Text className="font-medium ml-3 text-normal">{label}</Text>
            </View>

            {/* Arrow Icon */}
            <Ionicons name="chevron-forward" size={36} color="gray" />

        </TouchableOpacity>
    );


}
