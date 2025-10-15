import { View, Text, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons'; 
import { router } from 'expo-router';

// Contact component
export default function ContactUs() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header Section */}
        <View className="px-6 pt-6 pb-8">
          {/* Back Button */}
          <TouchableOpacity 
            onPress={() => router.back()}
            className="mb-6"
          >
            <Ionicons name="arrow-back" size={28} color="#00332d" />
          </TouchableOpacity>

          {/* Title with Icon */}
          <View className="flex-row items-center mb-6">
            <View className="w-14 h-14 rounded-full bg-[#00332d] items-center justify-center mr-4">
              <Ionicons name="chatbubbles" size={28} color="#ccf8f1" />
            </View>
            <View>
              <Text className="text-3xl font-bold text-[#00332d]">Contact Us</Text>
              <Text className="text-gray-500 text-sm">We're here to help 24/7</Text>
            </View>
          </View>
        </View>

        {/* Main Content */}
        <View className="px-6">
          {/* Info Card */}
          <View className="bg-[#ccf8f1]/20 border-2 border-[#00332d]/10 rounded-2xl p-6 mb-6">
            <View className="items-center mb-4">
              <View className="w-20 h-20 rounded-full bg-[#00332d] items-center justify-center mb-4">
                <Ionicons name="headset" size={40} color="#ccf8f1" />
              </View>
              <Text className="text-2xl font-bold text-[#00332d] mb-2">
                Need Help?
              </Text>
              <Text className="text-gray-600 text-center text-base">
                Choose your preferred contact method below
              </Text>
            </View>
          </View>

          {/* Contact Options */}
          <View>
            <Text className="text-lg font-bold text-[#00332d] mb-4">
              Get In Touch
            </Text>

            {/* Live Chat */}
            <TouchableOpacity 
              className="flex-row items-center bg-white border-2 border-gray-200 rounded-2xl p-4 mb-3 shadow-sm"
              activeOpacity={0.7}
              onPress={() => console.log("Open live chat")}
            >
              <View className="w-12 h-12 rounded-full bg-[#00332d] items-center justify-center mr-4">
                <Ionicons name="chatbubble-ellipses" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-[#00332d] mb-1">
                  Live Chat
                </Text>
                <Text className="text-sm text-gray-500">
                  Chat with our support team
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#00332d" />
            </TouchableOpacity>

            {/* Facebook Messenger */}
            <TouchableOpacity 
              className="flex-row items-center bg-white border-2 border-gray-200 rounded-2xl p-4 mb-3 shadow-sm"
              activeOpacity={0.7}
              onPress={() => Linking.openURL('https://m.me/yourpage')}
            >
              <View className="w-12 h-12 rounded-full bg-[#0084FF] items-center justify-center mr-4">
                <Ionicons name="logo-facebook" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-[#00332d] mb-1">
                  Facebook Messenger
                </Text>
                <Text className="text-sm text-gray-500">
                  Message us on Facebook
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#00332d" />
            </TouchableOpacity>

            {/* Phone Call */}
            <TouchableOpacity 
              className="flex-row items-center bg-white border-2 border-gray-200 rounded-2xl p-4 mb-3 shadow-sm"
              activeOpacity={0.7}
              onPress={() => Linking.openURL('tel:1234567890')}
            >
              <View className="w-12 h-12 rounded-full bg-[#00332d] items-center justify-center mr-4">
                <Ionicons name="call" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-[#00332d] mb-1">
                  Call Hotline
                </Text>
                <Text className="text-sm text-gray-500">
                  +1 (234) 567-890
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#00332d" />
            </TouchableOpacity>

            {/* Email */}
            <TouchableOpacity 
              className="flex-row items-center bg-white border-2 border-gray-200 rounded-2xl p-4 mb-3 shadow-sm"
              activeOpacity={0.7}
              onPress={() => Linking.openURL('mailto:support@quickpay.com')}
            >
              <View className="w-12 h-12 rounded-full bg-[#00332d] items-center justify-center mr-4">
                <Ionicons name="mail" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-[#00332d] mb-1">
                  Email Us
                </Text>
                <Text className="text-sm text-gray-500">
                  support@quickpay.com
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#00332d" />
            </TouchableOpacity>

            {/* Leave Review */}
            <TouchableOpacity 
              className="flex-row items-center bg-white border-2 border-gray-200 rounded-2xl p-4 mb-3 shadow-sm"
              activeOpacity={0.7}
              onPress={() => console.log("Open review form")}
            >
              <View className="w-12 h-12 rounded-full bg-[#00332d] items-center justify-center mr-4">
                <Ionicons name="star" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-[#00332d] mb-1">
                  Leave a Review
                </Text>
                <Text className="text-sm text-gray-500">
                  Share your feedback with us
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#00332d" />
            </TouchableOpacity>
          </View>

          {/* Office Hours Info */}
          <View className="mt-6 p-4 bg-gray-50 rounded-2xl">
            <View className="flex-row items-center mb-2">
              <Ionicons name="time-outline" size={20} color="#00332d" style={{ marginRight: 8 }} />
              <Text className="text-base font-bold text-[#00332d]">
                Support Hours
              </Text>
            </View>
            <Text className="text-sm text-gray-600 ml-7">
              Monday - Friday: 9:00 AM - 6:00 PM
            </Text>
            <Text className="text-sm text-gray-600 ml-7">
              Saturday - Sunday: 10:00 AM - 4:00 PM
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}