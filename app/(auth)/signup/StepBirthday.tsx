/**
 * written by: Team QuickPay
 * tested by: Team QuickPay
 * debugged by: Team QuickPay
 * Notes: Contributions were shared, see GitHub history for commit details.
 * Unit Tests for UserSyncService
 */
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function StepBirthday({ onNext, onBack, cachedData }: any) {
  const [month, setMonth] = useState(cachedData?.birthday ? String(cachedData.birthday.getMonth() + 1).padStart(2, '0') : "");
  const [day, setDay] = useState(cachedData?.birthday ? String(cachedData.birthday.getDate()).padStart(2, '0') : "");
  const [year, setYear] = useState(cachedData?.birthday ? String(cachedData.birthday.getFullYear()) : "");
  const [monthFocused, setMonthFocused] = useState(false);
  const [dayFocused, setDayFocused] = useState(false);
  const [yearFocused, setYearFocused] = useState(false);
  const [error, setError] = useState("");
  
  const dayInputRef = useRef<TextInput>(null);
  const yearInputRef = useRef<TextInput>(null);

  const validateDate = () => {
    setError("");

    if (!month || !day || !year) {
      setError("Please enter your complete date of birth");
      return false;
    }

    const m = parseInt(month);
    const d = parseInt(day);
    const y = parseInt(year);
    
    // Check valid ranges
    if (m < 1 || m > 12) {
      setError("Invalid month. Please enter a value between 01-12");
      return false;
    }
    
    // Days in each month
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    
    // Check for leap year
    const isLeapYear = (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
    if (isLeapYear) {
      daysInMonth[1] = 29;
    }
    
    if (d < 1 || d > daysInMonth[m - 1]) {
      setError(`Invalid day for ${getMonthName(m)}. Please enter a value between 01-${daysInMonth[m - 1]}`);
      return false;
    }
    
    const currentYear = new Date().getFullYear();
    if (y < 1900) {
      setError("Year must be 1900 or later");
      return false;
    }
    
    if (y > currentYear) {
      setError("Year cannot be in the future");
      return false;
    }
    
    // Check if user is at least 18 years old
    const birthDate = new Date(y, m - 1, d);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
    
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }
    
    if (age < 18) {
      setError("You must be at least 18 years old to create an account");
      return false;
    }
    
    // Validate the date is actually valid (e.g., not Feb 30)
    const testDate = new Date(y, m - 1, d);
    if (testDate.getMonth() !== m - 1 || testDate.getDate() !== d || testDate.getFullYear() !== y) {
      setError("Invalid date. Please check your entry");
      return false;
    }
    
    return true;
  };

  const getMonthName = (monthNum: number) => {
    const months = ["January", "February", "March", "April", "May", "June", 
                    "July", "August", "September", "October", "November", "December"];
    return months[monthNum - 1];
  };

  const handleContinue = () => {
    if (validateDate()) {
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      onNext({ birthday: date });
    }
  };

  const handleBack = () => {
    if (month && day && year && validateDate()) {
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      onBack({ birthday: date });
    } else {
      onBack();
    }
  };

  const handleMonthChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    setMonth(numericText);
    setError("");
    
    if (numericText.length === 2) {
      dayInputRef.current?.focus();
    }
  };

  const handleMonthBlur = () => {
    setMonthFocused(false);
    if (month.length === 1) {
      setMonth(month.padStart(2, '0'));
    }
  };

  const handleMonthSubmit = () => {
    if (month.length === 1) {
      setMonth(month.padStart(2, '0'));
    }
    dayInputRef.current?.focus();
  };

  const handleDayChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    setDay(numericText);
    setError("");
    
    if (numericText.length === 2) {
      yearInputRef.current?.focus();
    }
  };

  const handleDayFocus = () => {
    setDayFocused(true);
    if (month.length === 1) {
      setMonth(month.padStart(2, '0'));
    }
  };

  const handleDayBlur = () => {
    setDayFocused(false);
    if (day.length === 1) {
      setDay(day.padStart(2, '0'));
    }
  };

  const handleDaySubmit = () => {
    if (day.length === 1) {
      setDay(day.padStart(2, '0'));
    }
    yearInputRef.current?.focus();
  };

  const handleYearChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    setYear(numericText);
    setError("");
  };

  const handleYearFocus = () => {
    setYearFocused(true);
    if (day.length === 1) {
      setDay(day.padStart(2, '0'));
    }
  };

  const handleYearSubmit = () => {
    if (month && day && year.length === 4) {
      handleContinue();
    }
  };

  const isComplete = month.length === 2 && day.length === 2 && year.length === 4;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-white"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="justify-center px-8">
            {/* Header */}
            <View className="items-center mb-8">
              <View className="bg-[#f0fdf4] rounded-full p-4 mb-4">
                <Ionicons name="calendar-outline" size={48} color="#00332d" />
              </View>
              <Text className="text-4xl font-extrabold text-primary mb-3 text-center">
                When's your birthday?
              </Text>
              <Text className="text-gray-500 text-base text-center">
                We need to verify you're 18 or older
              </Text>
            </View>

            {/* Birthday Inputs */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-3">
                Date of Birth
              </Text>
              
              <View className="flex-row justify-between mb-2">
                {/* Month Input */}
                <View className="flex-1 mr-2">
                  <Text className="text-xs text-gray-500 mb-1 text-center">Month</Text>
                  <View
                    className={`flex-row items-center border-2 rounded-2xl px-4 ${
                      monthFocused
                        ? "border-[#00332d] bg-[#f5fdfc]"
                        : error && !month
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300 bg-white"
                    }`}
                    style={{ height: 56 }}
                  >
                    <TextInput
                      placeholder="MM"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="number-pad"
                      maxLength={2}
                      value={month}
                      onChangeText={handleMonthChange}
                      onFocus={() => setMonthFocused(true)}
                      onBlur={handleMonthBlur}
                      returnKeyType="next"
                      onSubmitEditing={handleMonthSubmit}
                      style={{ flex: 1, color: "#111827", fontSize: 18, textAlign: "center", fontWeight: "600" }}
                    />
                  </View>
                </View>

                {/* Day Input */}
                <View className="flex-1 mx-1">
                  <Text className="text-xs text-gray-500 mb-1 text-center">Day</Text>
                  <View
                    className={`flex-row items-center border-2 rounded-2xl px-4 ${
                      dayFocused
                        ? "border-[#00332d] bg-[#f5fdfc]"
                        : error && !day
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300 bg-white"
                    }`}
                    style={{ height: 56 }}
                  >
                    <TextInput
                      ref={dayInputRef}
                      placeholder="DD"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="number-pad"
                      maxLength={2}
                      value={day}
                      onChangeText={handleDayChange}
                      onFocus={handleDayFocus}
                      onBlur={handleDayBlur}
                      returnKeyType="next"
                      onSubmitEditing={handleDaySubmit}
                      style={{ flex: 1, color: "#111827", fontSize: 18, textAlign: "center", fontWeight: "600" }}
                    />
                  </View>
                </View>

                {/* Year Input */}
                <View className="flex-1 ml-2">
                  <Text className="text-xs text-gray-500 mb-1 text-center">Year</Text>
                  <View
                    className={`flex-row items-center border-2 rounded-2xl px-4 ${
                      yearFocused
                        ? "border-[#00332d] bg-[#f5fdfc]"
                        : error && !year
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300 bg-white"
                    }`}
                    style={{ height: 56 }}
                  >
                    <TextInput
                      ref={yearInputRef}
                      placeholder="YYYY"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="number-pad"
                      maxLength={4}
                      value={year}
                      onChangeText={handleYearChange}
                      onFocus={handleYearFocus}
                      onBlur={() => setYearFocused(false)}
                      returnKeyType="done"
                      onSubmitEditing={handleYearSubmit}
                      style={{ flex: 1, color: "#111827", fontSize: 18, textAlign: "center", fontWeight: "600" }}
                    />
                  </View>
                </View>
              </View>

              {/* Error Message */}
              {error ? (
                <View className="bg-red-50 rounded-2xl px-4 py-3 mt-3 flex-row items-start">
                  <Ionicons name="alert-circle" size={20} color="#EF4444" style={{ marginTop: 1, marginRight: 8 }} />
                  <Text className="text-sm text-red-600 flex-1">
                    {error}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Info Box */}
            <View className="bg-blue-50 rounded-2xl px-4 py-3 mb-8 flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#3B82F6" style={{ marginTop: 2, marginRight: 8 }} />
              <Text className="text-sm text-blue-700 flex-1">
                Your birthday is kept private and secure. We use it to verify your age.
              </Text>
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleContinue}
              disabled={!isComplete}
              className="rounded-2xl overflow-hidden shadow-lg mb-6"
              style={{ height: 56, opacity: !isComplete ? 0.5 : 1 }}
            >
              <LinearGradient
                colors={["#00332d", "#005248"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
              >
                <Text className="text-white font-bold text-base tracking-wide">
                  Continue
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Back Button */}
            <TouchableOpacity onPress={handleBack} className="items-center py-3">
              <Text className="text-primary text-base font-semibold">
                Back
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
