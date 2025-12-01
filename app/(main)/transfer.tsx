import axios from "axios";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Button, KeyboardAvoidingView, Platform, Text, TextInput, View } from "react-native";

/**
 * Minimal Transfer screen — minimal code only, no UI layout changes elsewhere.
 * - Expects params: contactId, contactName
 * - POSTS to BACKEND_URL with { amount: cents, currency, favoriteId, favoriteName }
 * - Opens returned session.url in system browser
 *
 * Update BACKEND_URL for local device/emulator:
 *  - Local host for iOS simulator: http://localhost:4242/create-checkout-session
 *  - Android emulator: http://10.0.2.2:4242/create-checkout-session
 *  - Deployed: https://your-domain/create-checkout-session
 */

const BACKEND_URL = "http://localhost:4242/create-checkout-session"; // <-- update as needed

export default function TransferScreen() {
  const params = useLocalSearchParams() as { contactId?: string; contactName?: string };
  const contactId = params.contactId;
  const contactName = params.contactName;

  const router = useRouter();
  const [amountText, setAmountText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!contactId) {
      Alert.alert("No recipient", "No contact was selected");
      router.replace("/favorite");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactId]);

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
      const resp = await axios.post(BACKEND_URL, {
        amount: cents,
        currency: "usd",
        favoriteId: contactId,
        favoriteName: contactName,
      });

      const url = resp.data?.url;
      if (!url) {
        throw new Error(resp.data?.error || "No checkout URL returned from backend");
      }

      Linking.openURL(url);
    } catch (err: any) {
      console.error("Checkout session error:", err);
      const msg = err?.response?.data?.error || err?.message || "Failed to create checkout session";
      Alert.alert("Payment error", String(msg));
    } finally {
      setLoading(false);
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
    </KeyboardAvoidingView>
  );
}