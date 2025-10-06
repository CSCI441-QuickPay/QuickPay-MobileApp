import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons} from '@expo/vector-icons'; 
import { router } from 'expo-router';

// Contact component
export default function ContactUs() {
  return (
    <SafeAreaView className="flex-1 bg-primary" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 ml-2">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-normal font-semibold ml-4">QuickPay - Contact Us</Text>
      </View>

      {/* Main Content */}
      <View className="flex-1 items-center px-6">
        {/* Call icon */}
        <View className="bg-gray-500 rounded-full p-7 mt-20 mb-6">
          <Ionicons name="call-outline" size={64} color="white" className="mb-4" />
        </View>

        {/* Contact Info */}
        <Text className="text-white text-subheading font-semibold mb-3">
          Need Help?
        </Text>

        <Text className="text-white text-normal text-center px-4">
          Contact us 24/7 by selecting any channel you prefer below
        </Text>


        {/* Contact Options */}

      <View className="absolute bottom-[50px] w-full px-6 ">
        <TouchableOpacity className="rounded-lg bg-white py-4 mb-3 items-center">
          <Text className="text-[#013A63] font-semibold text-normal"> Chat with Seanglong</Text>
        </TouchableOpacity>

        <TouchableOpacity className="rounded-lg bg-red-800 py-4 mb-3 items-center">
          <Text className="text-white font-semibold text-normal">Facebook Messenger</Text>
        </TouchableOpacity>

        <TouchableOpacity className="rounded-lg bg-red-800 py-4 mb-6 items-center">
          <Text className="text-white font-semibold text-normal">Call Hotline</Text>
        </TouchableOpacity>

        <TouchableOpacity className="rounded-lg border border-white py-4 items-center">
          <Text className="text-white font-semibold text-normal">Leave Us a Review</Text>
        </TouchableOpacity>
        </View>
      </View>

    </SafeAreaView>
  );
}