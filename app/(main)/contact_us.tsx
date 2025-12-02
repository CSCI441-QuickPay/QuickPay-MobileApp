import { View, Text, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons'; 
import { router } from 'expo-router';

// Contact component
export default function ContactUs() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Static Header Section */}
      <View className="px-6 pt-4 pb-5">
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-6"
        >
          <Ionicons name="arrow-back" size={28} color="#00332d" />
        </TouchableOpacity>

        {/* Title with Icon */}
        <View className="flex-row items-center mb-6">
          <View className="w-14 h-14 rounded-full bg-[#f0fdf4] items-center justify-center mr-3">
            <Ionicons name="chatbubbles" size={28} color="#00332d" />
          </View>
          <View>
            <Text className="text-3xl font-extrabold text-primary">Contact Us</Text>
            <Text className="text-gray-500 text-sm mt-0.5">We're here to help 24/7</Text>
          </View>
        </View>
      </View>

      {/* Scrollable Content */}
      <View
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Main Content */}
        <View>
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
            <Text className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide">
              Get In Touch
            </Text>

            <View className="gap-2">
              {/* Live Chat */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => console.log("Open live chat")}
                className="flex-row items-center bg-white border-2 border-gray-200 rounded-2xl p-4"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <View className="w-10 h-10 rounded-full bg-green-50 items-center justify-center mr-3">
                  <Ionicons name="chatbubble-ellipses-outline" size={20} color="#10B981" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">
                    Live Chat
                  </Text>
                  <Text className="text-xs text-gray-500 mt-0.5">
                    Chat with our support team
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>

              {/* Facebook Messenger */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => Linking.openURL('https://m.me/yourpage')}
                className="flex-row items-center bg-white border-2 border-gray-200 rounded-2xl p-4"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-3">
                  <Ionicons name="logo-facebook" size={20} color="#3B82F6" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">
                    Facebook Messenger
                  </Text>
                  <Text className="text-xs text-gray-500 mt-0.5">
                    Message us on Facebook
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>

              {/* Phone Call */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => Linking.openURL('tel:1234567890')}
                className="flex-row items-center bg-white border-2 border-gray-200 rounded-2xl p-4"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <View className="w-10 h-10 rounded-full bg-purple-50 items-center justify-center mr-3">
                  <Ionicons name="call-outline" size={20} color="#8B5CF6" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">
                    Call Hotline
                  </Text>
                  <Text className="text-xs text-gray-500 mt-0.5">
                    +1 (234) 567-890
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>

              {/* Email */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => Linking.openURL('mailto:support@quickpay.com')}
                className="flex-row items-center bg-white border-2 border-gray-200 rounded-2xl p-4"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <View className="w-10 h-10 rounded-full bg-orange-50 items-center justify-center mr-3">
                  <Ionicons name="mail-outline" size={20} color="#F97316" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">
                    Email Us
                  </Text>
                  <Text className="text-xs text-gray-500 mt-0.5">
                    support@quickpay.com
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>

              {/* Leave Review */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => console.log("Open review form")}
                className="flex-row items-center bg-white border-2 border-gray-200 rounded-2xl p-4"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <View className="w-10 h-10 rounded-full bg-amber-50 items-center justify-center mr-3">
                  <Ionicons name="star-outline" size={20} color="#F59E0B" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">
                    Leave a Review
                  </Text>
                  <Text className="text-xs text-gray-500 mt-0.5">
                    Share your feedback with us
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
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
      </View>
    </SafeAreaView>
  );
}