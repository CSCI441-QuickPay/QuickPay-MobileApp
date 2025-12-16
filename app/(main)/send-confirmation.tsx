/**
 * written by: Team QuickPay
 * tested by: Team QuickPay
 * debugged by: Team QuickPay
 * Notes: Contributions were shared, see GitHub history for commit details.
 * Unit Tests for UserSyncService
 */
import React, { useEffect, useRef } from 'react';
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

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

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

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      delay: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <LinearGradient
      colors={['#10B981', '#059669']}
      style={{ flex: 1 }}     // FULL SCREEN
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* SafeAreaView INSIDE so gradient goes behind notch */}
      <SafeAreaView style={{ flex: 1 }}>
        
        {/* Main Content */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <View
              style={{
                width: 112,
                height: 112,
                borderRadius: 56,
                backgroundColor: '#FFFFFF',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 32,
              }}
            >
              <Ionicons name="checkmark" size={64} color="#10B981" />
            </View>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim, alignItems: 'center', width: '100%' }}>
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 32,
                fontWeight: 'bold',
                marginBottom: 8,
                textAlign: 'center',
              }}
            >
              Payment Sent!
            </Text>

            <Text
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: 20,
                textAlign: 'center',
                marginBottom: 32,
              }}
            >
              ${parseFloat(amount || '0').toFixed(2)} sent successfully
            </Text>

            {/* Recipient Box */}
            <View
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 24,
                padding: 24,
                width: '100%',
                marginBottom: 32,
              }}
            >
              <View style={{ alignItems: 'center' }}>
                <Text
                  style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: 14,
                    marginBottom: 8,
                  }}
                >
                  Sent to
                </Text>
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 20,
                    fontWeight: 'bold',
                    marginBottom: 4,
                    textAlign: 'center',
                  }}
                >
                  {recipientName}
                </Text>

                <Text
                  style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: 14,
                    textAlign: 'center',
                  }}
                >
                  {recipientAccount}
                </Text>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Buttons */}
        <Animated.View style={{ opacity: fadeAnim, paddingHorizontal: 24, paddingBottom: 24 }}>
          <TouchableOpacity
            onPress={() => router.replace('/home')}
            style={{
              borderRadius: 16,
              overflow: 'hidden',
              marginBottom: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 5,
            }}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#FFFFFF', '#F3F4F6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{ paddingVertical: 20, alignItems: 'center' }}
            >
              <Text style={{ color: '#10B981', fontWeight: 'bold', fontSize: 18 }}>Done</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace('/send')}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 16,
              paddingVertical: 16,
              paddingHorizontal: 24,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.3)',
            }}
            activeOpacity={0.8}
          >
            <Text
              style={{
                color: '#FFFFFF',
                fontWeight: '600',
                fontSize: 16,
                textAlign: 'center',
              }}
            >
              Send Another Payment
            </Text>
          </TouchableOpacity>
        </Animated.View>

      </SafeAreaView>
    </LinearGradient>
  );
}
