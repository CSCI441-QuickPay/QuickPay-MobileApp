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
import { router } from "expo-router";
import { Camera, CameraView } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import BottomNav from "@/components/BottomNav";
import { AntDesign } from "@expo/vector-icons";
import QRCodeModel from "@/models/QRCodeModel";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SCAN_FRAME_SIZE = SCREEN_WIDTH * 0.7;

export default function QRScan() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = ({ data }: { type: string; data: string }) => {
    setScanned(true);

    // Try to parse the QR code data
    const parsedData = QRCodeModel.parseQRData(data);

    if (parsedData && parsedData.type === 'quickpay_payment') {
      // Valid QuickPay QR code
      Alert.alert(
        "Payment QR Code Scanned",
        `Account: ${parsedData.accountNumber}\n${
          parsedData.amount ? `Amount: $${parsedData.amount.toFixed(2)}\n` : ''
        }${parsedData.description ? `Description: ${parsedData.description}` : ''}`,
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => setScanned(false),
          },
          {
            text: "Proceed to Payment",
            onPress: () => {
              // TODO: Navigate to payment confirmation page
              setScanned(false);
              Alert.alert("Payment", "Payment flow will be implemented here");
            },
          },
        ]
      );
    } else {
      // Invalid or unrecognized QR code
      Alert.alert(
        "Invalid QR Code",
        "This QR code is not a valid QuickPay payment code. Please scan a QuickPay QR code.",
        [
          {
            text: "Scan Again",
            onPress: () => setScanned(false),
          },
        ]
      );
    }
  };

  const handleUploadFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library to upload QR codes."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        // Here you would implement QR code scanning from the image
        // For now, just show a message
        Alert.alert("Image Selected", "QR code scanning from image will be implemented.");
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image from gallery.");
    }
  };

  const toggleFlash = () => {
    setFlashOn((prev) => !prev);
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Requesting camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900">
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="camera-outline" size={80} color="#ccf8f1" />
          <Text className="text-white text-xl font-bold mt-6 text-center">
            Camera Permission Denied
          </Text>
          <Text className="text-gray-400 text-base mt-3 text-center">
            Please enable camera access in your device settings to scan QR codes.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-8 bg-primary px-8 py-4 rounded-2xl"
          >
            <Text className="text-secondary font-bold text-base">Go Back</Text>
          </TouchableOpacity>
        </View>
        <BottomNav
          items={[
            {
              label: "Home",
              icon: (color) => <Ionicons name="home" size={34} color={color} />,
              onPress: () => router.push("/home"),
            },
            {
              label: "Budget",
              icon: (color) => (
                <MaterialIcons name="account-tree" size={34} color={color} />
              ),
              onPress: () => router.push("/visual_budget"),
            },
            {
              label: "Scan",
              icon: (color) => <AntDesign name="qrcode" size={40} color={color} />,
              onPress: () => router.push("/qr_scan"),
              special: true,
              active: true,
            },
            {
              label: "Favorite",
              icon: (color) => <AntDesign name="star" size={34} color={color} />,
              onPress: () => router.push("/favorite"),
            },
            {
              label: "Profile",
              icon: (color) => <Ionicons name="person" size={34} color={color} />,
              onPress: () => router.push("/profile"),
            },
          ]}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900" edges={["top"]}>
      {/* Header */}
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

      {/* Camera View */}
      <View className="flex-1 items-center justify-center">
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          enableTorch={flashOn}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        />

        {/* Scan Frame Overlay */}
        <View style={styles.overlay}>
          <View style={styles.scanFrame}>
            {/* Corner brackets */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>

        {/* Instructions */}
        <View className="absolute bottom-48 px-6">
          <View className="bg-black/60 rounded-2xl px-5 py-3">
            <Text className="text-white text-center font-semibold text-base">
              Position the QR code within the frame
            </Text>
          </View>
        </View>
      </View>

      {/* Control Buttons */}
      <View className="px-6 pb-6 bg-gray-900">
        <View className="flex-row justify-center gap-4 mb-6">
          {/* Flash Button */}
          <TouchableOpacity
            onPress={toggleFlash}
            className={`flex-1 rounded-2xl py-4 items-center ${
              flashOn ? "bg-yellow-500" : "bg-gray-800"
            }`}
            activeOpacity={0.8}
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

          {/* Upload Button */}
          <TouchableOpacity
            onPress={handleUploadFromGallery}
            className="flex-1 bg-gray-800 rounded-2xl py-4 items-center"
            activeOpacity={0.8}
          >
            <MaterialIcons name="photo-library" size={28} color="#FFFFFF" />
            <Text className="text-white font-semibold mt-2">Upload</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Navigation */}
      <BottomNav
        items={[
          {
            label: "Home",
            icon: (color) => <Ionicons name="home" size={34} color={color} />,
            onPress: () => router.push("/home"),
          },
          {
            label: "Budget",
            icon: (color) => (
              <MaterialIcons name="account-tree" size={34} color={color} />
            ),
            onPress: () => router.push("/visual_budget"),
          },
          {
            label: "Scan",
            icon: (color) => <AntDesign name="qrcode" size={40} color={color} />,
            onPress: () => router.push("/qr_scan"),
            special: true,
            active: true,
          },
          {
            label: "Favorite",
            icon: (color) => <AntDesign name="star" size={34} color={color} />,
            onPress: () => router.push("/favorite"),
          },
          {
            label: "Profile",
            icon: (color) => <Ionicons name="person" size={34} color={color} />,
            onPress: () => router.push("/profile"),
          },
        ]}
      />
    </SafeAreaView>
  );
}

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
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 12,
  },
});
