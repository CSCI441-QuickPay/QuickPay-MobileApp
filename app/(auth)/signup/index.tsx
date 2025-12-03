import React, { useState, useRef, useMemo, useEffect } from "react";
import { View, Animated, Easing } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";

import StepName from "./StepName";
import StepBirthday from "./StepBirthday";
import StepPhone from "./StepPhone";
import StepEmail from "./StepEmail";
import StepPassword from "./StepPassword";
import StepDone from "./StepDone";

export default function SignupFlow() {
  const { isLoaded, isSignedIn } = useAuth();
  const [page, setPage] = useState(0);
  const [signupData, setSignupData] = useState({});
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Redirect if already signed in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/home");
    }
  }, [isLoaded, isSignedIn]);

  // Enhanced animation for transitions
  const animateTo = (callback: () => void, direction: "forward" | "backward" = "forward") => {
    const slideValue = direction === "forward" ? -20 : 20;

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: slideValue,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback();
      slideAnim.setValue(-slideValue);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const nextPage = (data?: any) => {
    animateTo(() => {
      if (data) setSignupData((prev) => ({ ...prev, ...data }));
      setPage((p) => Math.min(p + 1, steps.length - 1));
    }, "forward");
  };

  const prevPage = (data?: any) => {
    animateTo(() => {
      if (data) setSignupData((prev) => ({ ...prev, ...data }));
      setPage((p) => Math.max(p - 1, 0));
    }, "backward");
  };

  const steps = useMemo(() => {
    return [
      <StepName key="1" onNext={nextPage} cachedData={signupData} />,
      <StepBirthday key="2" onNext={nextPage} onBack={prevPage} cachedData={signupData} />,
      <StepPhone key="3" onNext={nextPage} onBack={prevPage} cachedData={signupData} />,
      <StepEmail key="4" onNext={nextPage} onBack={prevPage} cachedData={signupData} />,
      <StepPassword
        key="5"
        onNext={nextPage}
        onBack={prevPage}
        signupData={signupData}
        cachedData={signupData}
      />,
      <StepDone key="6" />,
    ];
  }, [signupData]);

  const progressPercentage = ((page + 1) / steps.length) * 100;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        }}
      >
        {steps[page]}
      </Animated.View>

      {/* Progress indicator - only show if not on the final "Done" screen */}
      {page < steps.length - 1 && (
        <View className="absolute bottom-0 w-full">
          {/* Progress bar background */}
          <View className="h-1 bg-gray-200">
            <Animated.View
              style={{
                height: 4,
                width: `${progressPercentage}%`,
              }}
            >
              <LinearGradient
                colors={["#00332d", "#005248"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ flex: 1 }}
              />
            </Animated.View>
          </View>

          {/* Step indicator dots */}
          <View className="flex-row justify-center items-center py-3 bg-white">
            <View className="flex-row items-center">
              {steps.slice(0, -1).map((_, index) => (
                <View key={index} className="flex-row items-center">
                  <View
                    className={`w-2 h-2 rounded-full ${
                      index <= page ? "bg-primary" : "bg-gray-300"
                    }`}
                  />
                  {index < steps.length - 2 && (
                    <View
                      className={`w-8 h-[2px] ${
                        index < page ? "bg-primary" : "bg-gray-300"
                      }`}
                    />
                  )}
                </View>
              ))}
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}