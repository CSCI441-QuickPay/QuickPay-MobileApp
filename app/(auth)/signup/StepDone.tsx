import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function StepDone() {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      className="flex-1 bg-white"
    >
      <View className="flex-1 justify-center items-center px-8">
        {/* Success Icon */}
        <View className="bg-budget-category-light rounded-full p-6 mb-8">
          <Ionicons name="checkmark-circle" size={80} color="#10B981" />
        </View>

        {/* Logo */}
        <Image
          source={require("@/assets/images/icon.png")}
          style={{ width: 100, height: 100, marginBottom: 24 }}
          resizeMode="contain"
        />

        {/* Title */}
        <Text className="text-4xl font-extrabold text-primary mb-3 text-center">
          Account Created!
        </Text>

        {/* Subtitle */}
        <Text className="text-gray-500 text-base text-center mb-10 px-4">
          Welcome to QuickPay! You're all set to start managing your finances.
        </Text>

        {/* Feature Highlights */}
        <View className="w-full mb-10">
          <View className="flex-row items-center mb-4 bg-secondary rounded-block p-4">
            <View className="bg-primary rounded-full p-2 mr-3">
              <Ionicons name="wallet-outline" size={20} color="white" />
            </View>
            <Text className="text-gray-700 text-sm flex-1">
              Track expenses and manage budgets effortlessly
            </Text>
          </View>

          <View className="flex-row items-center mb-4 bg-secondary rounded-block p-4">
            <View className="bg-primary rounded-full p-2 mr-3">
              <Ionicons name="analytics-outline" size={20} color="white" />
            </View>
            <Text className="text-gray-700 text-sm flex-1">
              Get insights with visual budget tracking
            </Text>
          </View>

          <View className="flex-row items-center bg-secondary rounded-block p-4">
            <View className="bg-primary rounded-full p-2 mr-3">
              <Ionicons name="shield-checkmark-outline" size={20} color="white" />
            </View>
            <Text className="text-gray-700 text-sm flex-1">
              Your data is secure and encrypted
            </Text>
          </View>
        </View>

        {/* Go to Dashboard Button */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.replace("/home")}
          className="rounded-2xl overflow-hidden w-full shadow-lg"
          style={{ height: 56 }}
        >
          <LinearGradient
            colors={["#00332d", "#005248"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text className="text-white font-bold text-base tracking-wide">
              Go to Dashboard
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}