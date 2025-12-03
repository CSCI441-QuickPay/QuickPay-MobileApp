import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

// Expo Camera (NEW API for SDK 53)
import { CameraView, useCameraPermissions } from "expo-camera";

import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import BottomNav from "@/components/BottomNav";
import { AntDesign } from "@expo/vector-icons";
import QRCodeModel from "@/models/QRCodeModel";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SCAN_FRAME_SIZE = SCREEN_WIDTH * 0.7;

export default function QRScan() {
  const params = useLocalSearchParams();
  const returnTo = params.returnTo as string | undefined;

  // NEW CAMERA PERMISSION HANDLER REQUIRED BY SDK 53
  const [permission, requestPermission] = useCameraPermissions();

  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  // Ask for permissions
  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) requestPermission();
  }, [permission]);

  // Loading screen until permission exists
  if (!permission) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center">
        <Text className="text-gray-400">Requesting camera permission...</Text>
      </SafeAreaView>
    );
  }

  // If denied
  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center px-6">
        <Ionicons name="camera-outline" size={80} color="#ccf8f1" />
        <Text className="text-white text-xl font-bold mt-6">Camera Permission Denied</Text>
        <Text className="text-gray-400 text-base mt-3 text-center">
          Please enable camera access in settings.
        </Text>

        <TouchableOpacity
          onPress={requestPermission}
          className="mt-8 bg-primary px-8 py-4 rounded-2xl"
        >
          <Text className="text-secondary font-bold text-base">Allow Camera</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ---------------------------
  // QR SCAN HANDLER
  // ---------------------------
  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const parsedData = QRCodeModel.parseQRData(data);

    if (parsedData && parsedData.type === "quickpay_payment") {
      // Works with your app logic
      if (returnTo === "send") {
        router.replace({
          pathname: "/send",
          params: { scannedAccountNumber: parsedData.accountNumber },
        });
      } else {
        Alert.alert(
          "Payment QR Code Scanned",
          `Account: ${parsedData.accountNumber}\n${
            parsedData.amount ? `Amount: $${parsedData.amount.toFixed(2)}` : ""
          }`,
          [
            { text: "Cancel", style: "cancel", onPress: () => setScanned(false) },
            {
              text: "Send Payment",
              onPress: () =>
                router.push({
                  pathname: "/send",
                  params: { scannedAccountNumber: parsedData.accountNumber },
                }),
            },
          ]
        );
      }
    } else {
      // Invalid QR
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Invalid QR", "This is not a valid QuickPay QR code.", [
        { text: "Scan Again", onPress: () => setScanned(false) },
      ]);
    }
  };

  // ---------------------------
  // Upload from Gallery
  // ---------------------------
  const handleUploadFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please allow gallery access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      Alert.alert("Coming Soon", "Image QR scanning will be added.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      {/* HEADER */}
      <View className="px-6 py-4 bg-gray-900">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Scan QR Code</Text>
          <View className="w-10" />
        </View>
      </View>

      {/* CAMERA */}
      <View className="flex-1 items-center justify-center">
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          enableTorch={flashOn}
          onCameraReady={() => setCameraReady(true)}
          mode="picture"
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={!scanned && cameraReady ? handleBarCodeScanned : undefined}
        />

        {/* FRAME */}
        <View style={styles.overlay}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>

        {/* INSTRUCTIONS */}
        <View className="absolute bottom-48 px-6">
          <View className="bg-black/60 rounded-2xl px-5 py-3">
            <Text className="text-white text-center font-semibold">
              Position the QR code within the frame
            </Text>
          </View>
        </View>
      </View>

      {/* BUTTONS */}
      <View className="px-6 pb-6 bg-gray-900">
        <View className="flex-row justify-center gap-4 mb-6">
          {/* FLASH */}
          <TouchableOpacity
            onPress={() => setFlashOn((prev) => !prev)}
            className={`flex-1 rounded-2xl py-4 items-center ${
              flashOn ? "bg-yellow-500" : "bg-gray-800"
            }`}
          >
            <Ionicons
              name={flashOn ? "flash" : "flash-outline"}
              size={28}
              color="#FFFFFF"
            />
            <Text className="text-white font-semibold mt-2">
              {flashOn ? "Flash On" : "Flash Off"}
            </Text>
          </TouchableOpacity>

          {/* UPLOAD */}
          <TouchableOpacity
            onPress={handleUploadFromGallery}
            className="flex-1 bg-gray-800 rounded-2xl py-4 items-center"
          >
            <MaterialIcons name="photo-library" size={28} color="#FFFFFF" />
            <Text className="text-white font-semibold mt-2">Upload</Text>
          </TouchableOpacity>
        </View>
      </View>

    </SafeAreaView>
  );
}

// STYLES (UNCHANGED)
const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  scanFrame: {
    width: SCAN_FRAME_SIZE,
    height: SCAN_FRAME_SIZE,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "#00FFD1",
    borderWidth: 4,
  },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
});
