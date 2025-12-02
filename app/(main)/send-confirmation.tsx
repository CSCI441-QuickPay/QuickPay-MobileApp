import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

export default function SendConfirmation() {
  const params = useLocalSearchParams();
  const amount = params.amount as string;
  const recipientName = params.recipientName as string;
  const recipientAccount = params.recipientAccount as string;
  const recipientColor = (params.recipientColor as string) || '#10B981';

  const scaleAnim = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    // Success haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Animate checkmark
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Fade in content
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      delay: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#10B981]" edges={['top', 'bottom']}>
      <LinearGradient
        colors={['#10B981', '#059669']}
        className="flex-1"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Success Icon */}
        <View className="flex-1 items-center justify-center px-6">
          <Animated.View
            style={{
              transform: [{ scale: scaleAnim }],
            }}
          >
            <View className="w-28 h-28 rounded-full bg-white items-center justify-center mb-8">
              <Ionicons name="checkmark" size={64} color="#10B981" />
            </View>
          </Animated.View>

          <Animated.View
            style={{ opacity: fadeAnim }}
            className="items-center w-full"
          >
            <Text className="text-white text-3xl font-bold mb-2">
              Payment Sent!
            </Text>

            <Text className="text-white/80 text-lg text-center mb-8">
              ${parseFloat(amount || '0').toFixed(2)} sent successfully
            </Text>

            {/* Recipient Info */}
            <View className="bg-white/20 rounded-3xl p-6 w-full mb-8">
              <View className="items-center">
                <Text className="text-white/60 text-sm mb-2">Sent to</Text>
                <Text className="text-white text-xl font-bold mb-1">
                  {recipientName}
                </Text>
                <Text className="text-white/80 text-sm">
                  {recipientAccount}
                </Text>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Action Buttons */}
        <Animated.View
          style={{ opacity: fadeAnim }}
          className="px-6 pb-6"
        >
          <TouchableOpacity
            onPress={() => router.replace('/home')}
            className="rounded-2xl overflow-hidden mb-3"
            activeOpacity={0.85}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <LinearGradient
              colors={['#FFFFFF', '#F3F4F6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              className="py-5 items-center justify-center"
            >
              <Text className="text-[#10B981] font-bold text-lg">
                Done
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace('/send')}
            className="bg-white/20 rounded-2xl py-4 px-6 border border-white/30"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold text-base text-center">
              Send Another Payment
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
}