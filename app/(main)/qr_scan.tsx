import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Expo Camera
import {
  CameraView,
  useCameraPermissions,
  scanFromURLAsync,
} from "expo-camera";

import QRCodeModel from "@/models/QRCodeModel";
import * as Haptics from "expo-haptics";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import jsQR from "jsqr";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SCAN_FRAME_SIZE = SCREEN_WIDTH * 0.7;

// ------------------------------------------------------
// Convert gallery image → RGBA pixels for jsQR
// ------------------------------------------------------
async function extractPixels(uri: string) {
  try {
    // 1. Force convert to PNG + resize (HEIC breaks jsQR)
    const manipulated = await manipulateAsync(
      uri,
      [{ resize: { width: 800 } }],
      { format: SaveFormat.PNG, base64: true }
    );

    if (!manipulated.base64) throw new Error("No base64 data");

    // 2. Load image into an HTML Image object
    const img = new Image();
    img.src = "data:image/png;base64," + manipulated.base64;

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    // 3. Draw onto Canvas (Expo Dev Client supports offscreen canvas)
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas 2D context not available");
    }

    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, img.width, img.height);

    return {
      data: imageData.data, // RGBA pixels
      width: img.width,
      height: img.height,
    };
  } catch (err) {
    console.log("extractPixels error:", err);
    throw err;
  }
}

export default function QRScan() {
  const params = useLocalSearchParams();
  const returnTo = params.returnTo as string | undefined;

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) requestPermission();
  }, [permission]);

  useFocusEffect(
    useCallback(() => {
      setScanned(false);
      return () => {};
    }, [])
  );

  if (!permission) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center">
        <Text className="text-gray-400">Requesting camera permission...</Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center px-6">
        <Ionicons name="camera-outline" size={80} color="#ccf8f1" />
        <Text className="text-white text-xl font-bold mt-6">
          Camera Permission Denied
        </Text>
        <Text className="text-gray-400 text-base mt-3 text-center">
          Please enable camera access in settings.
        </Text>

        <TouchableOpacity
          onPress={requestPermission}
          className="mt-8 bg-primary px-8 py-4 rounded-2xl"
        >
          <Text className="text-secondary font-bold text-base">
            Allow Camera
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ------------------------------------------------------
  // CAMERA QR SCAN
  // ------------------------------------------------------
  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const parsedData = QRCodeModel.parseQRData(data);

    if (parsedData && parsedData.type === "quickpay_payment") {
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
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => setScanned(false),
            },
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Invalid QR", "This is not a valid QuickPay QR code.", [
        { text: "Scan Again", onPress: () => setScanned(false) },
      ]);
    }
  };

  // ------------------------------------------------------
  // GALLERY QR SCAN (FIXED)
  // ------------------------------------------------------
  const handleUploadFromGallery = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please allow gallery access.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 1,
      });

      if (result.canceled || !result.assets[0]) return;

      const uri = result.assets[0].uri;

      // NATIVE QR SCAN FROM IMAGE
      const qrResults = await scanFromURLAsync(uri, ["qr"]);

      if (!qrResults || qrResults.length === 0) {
        Alert.alert("Error", "Unable to read QR code from this image.");
        return;
      }

      const data = qrResults[0].data;
      const parsed = QRCodeModel.parseQRData(data);

      if (!parsed || parsed.type !== "quickpay_payment") {
        Alert.alert("Invalid QR", "This is not a valid QuickPay QR code.");
        return;
      }

      router.push({
        pathname: "/send",
        params: { scannedAccountNumber: parsed.accountNumber },
      });
    } catch (err) {
      console.log("QR Scan Error:", err);
      Alert.alert("Error", "Failed to scan QR from image.");
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
          onBarcodeScanned={
            !scanned && cameraReady ? handleBarCodeScanned : undefined
          }
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
            className="flex-1 bg-gray-800 rounded-2xl py-4 items-country"
          >
            <MaterialIcons name="photo-library" size={28} color="#FFFFFF" />
            <Text className="text-white font-semibold mt-2">Upload</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
});
