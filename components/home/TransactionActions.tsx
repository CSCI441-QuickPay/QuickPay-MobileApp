import { Transaction } from '@/data/transaction';
import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

// TransactionActions props
type Props = {
    visible: boolean;
    transaction: Transaction; // Added transaction prop
}

// TransactionActions component
export default function TransactionActions({ visible }: Props) {
    if (!visible) return null; // If not visible, render nothing

    return (
    <View className="flex-row justify-center gap-9 mt-4 border-t border-gray-200 pt-3">

        {/* Share button*/} 
        <TouchableOpacity className="items-center">
            <Ionicons name="share-social-outline" size={30} color="black" />
            <Text className="text-xs mt-1">Share</Text>
        </TouchableOpacity>

        {/* Repeat button*/}
        <TouchableOpacity className="items-center">
            <Ionicons name="refresh-circle-outline" size={30} color="black" />
            <Text className="text-xs mt-1">Repeat</Text>
        </TouchableOpacity>

        {/* Split button*/}
        <TouchableOpacity className="items-center">
            <Ionicons name="pie-chart-outline" size={30} color="black" />
            <Text className="text-xs mt-1">Split</Text>
        </TouchableOpacity>

        {/* More button*/}
        <TouchableOpacity className="items-center">
            <Ionicons
            name="ellipsis-horizontal-circle-outline"
            size={30}
            color="black"
            />
            <Text className="text-xs mt-1">More</Text>
        </TouchableOpacity>
    </View>
    );
}