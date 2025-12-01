import axios from "axios";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Button, KeyboardAvoidingView, Platform, Text, TextInput, View } from "react-native";

/**
 * Transfer screen (no-webhook flow)
 *
 * NOTE: BACKEND_BASE resolves correctly for Android emulator (10.0.2.2)
 * - iOS simulator / local web: http://localhost:4242
 * - Android emulator (AVD):   http://10.0.2.2:4242
 * - Physical device:          http://<your-host-ip>:4242
 *
 * Also: if you're testing in Expo Go, deep links (quickpay://...) won't open the Expo Go app.
 * Use a dev client or a standalone build to test automatic return via quickpay://...
 */

const HOST_PORT = 4242;

// Dev-friendly host resolution
const getBackendBase = () => {
  // if running on Android emulator (classic AVD), use 10.0.2.2 to reach host machine
  if (Platform.OS === "android") {
    return `http://10.0.2.2:${HOST_PORT}`;
  }
  // iOS simulator (and desktop web) can use localhost
  return `http://localhost:${HOST_PORT}`;
};

const BACKEND_BASE = getBackendBase();
const api = axios.create({
  baseURL: BACKEND_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

const CREATE_URL = `/create-checkout-session`;
const VERIFY_URL = `/verify-checkout-session`;

export default function TransferScreen() {
  const params = useLocalSearchParams() as { contactId?: string; contactName?: string };
  const contactId = params.contactId;
  const contactName = params.contactName;

  const router = useRouter();
  const [amountText, setAmountText] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!contactId) {
      Alert.alert("No recipient", "No contact was selected");
      router.replace("/favorite");
    }

    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleDeepLink(url);
    });

    (async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) handleDeepLink(initialUrl);
    })();

    return () => {
      subscription.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const parseAmountToCents = (text: string): number | null => {
    const cleaned = text.replace(/[^0-9.]/g, "");
    const num = parseFloat(cleaned);
    if (isNaN(num) || num <= 0) return null;
    return Math.round(num * 100);
  };

  const handlePay = async () => {
    const cents = parseAmountToCents(amountText);
    if (!cents) {
      Alert.alert("Invalid amount", "Please enter a valid amount (e.g., 5.00).");
      return;
    }

    try {
      setLoading(true);

      // Provide a deep link return_url so Stripe redirects back into the app after payment
      const returnUrlScheme = "quickpay://transfer/success"; // app.json should include "scheme": "quickpay"

      const resp = await api.post(CREATE_URL, {
        amount: cents,
        currency: "usd",
        favoriteId: contactId,
        favoriteName: contactName,
        return_url: returnUrlScheme,
      });

      const url = resp.data?.url;
      if (!url) {
        throw new Error(resp.data?.error || "No checkout URL returned from backend");
      }

      // Open Stripe Checkout in system browser
      Linking.openURL(url);
    } catch (err: any) {
      console.error("Checkout session error:", err?.response || err?.message || err);
      const msg = err?.response?.data?.error || err?.message || "Failed to create checkout session";
      Alert.alert("Payment error", String(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleDeepLink = async (url: string) => {
    try {
      if (!url) return;
      const parsed = Linking.parse(url);
      const sessionId = (parsed.queryParams && (parsed.queryParams as any).session_id) || (parsed.queryParams && (parsed.queryParams as any).sessionId);
      if (!sessionId) return;

      setVerifying(true);
      const resp = await api.get(`${VERIFY_URL}?session_id=${encodeURIComponent(sessionId)}`);
      const payment_status = resp.data?.payment_status;
      if (payment_status === "paid") {
        Alert.alert("Payment success", "Payment was successful — transfer completed.");
        // TODO: mark in-app state / DB if needed, then navigate
        router.replace("/home");
      } else {
        Alert.alert("Payment not completed", `Payment status: ${payment_status}`);
      }
    } catch (err) {
      console.error("Error verifying session:", err);
      Alert.alert("Verification error", "Failed to verify payment session");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, padding: 16, justifyContent: "center" }}>
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: "600" }}>Send money to</Text>
        <Text style={{ fontSize: 22, fontWeight: "700", marginTop: 8 }}>{contactName || "Recipient"}</Text>
      </View>

      <Text style={{ marginBottom: 8 }}>Amount (USD)</Text>
      <TextInput
        placeholder="e.g. 5.00"
        keyboardType="decimal-pad"
        value={amountText}
        onChangeText={setAmountText}
        style={{
          borderWidth: 1,
          borderColor: "#ddd",
          padding: 12,
          borderRadius: 8,
          marginBottom: 16,
          fontSize: 16,
        }}
      />

      {loading ? <ActivityIndicator /> : <Button title={`Pay ${amountText ? `$${amountText}` : ""}`} onPress={handlePay} />}

      <View style={{ height: 12 }} />

      <Button title="Back" color="#666" onPress={() => router.back()} />

      {verifying && (
        <View style={{ marginTop: 16 }}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8, textAlign: "center" }}>Verifying payment...</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}