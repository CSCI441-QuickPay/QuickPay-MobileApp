import "dotenv/config";

export default {
  expo: {
    name: "QuickPay",
    slug: "quickpay",
    scheme: "quickpay",
    version: "1.0.0",
    orientation: "portrait",
    android: {
      package: "com.anonymous.quickpay",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },
    ios: {
      bundleIdentifier: "com.anonymous.quickpay"
    },
    extra: {
      clerkPublishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
      eas: {
        projectId: "7f9681d1-7965-4173-ac04-1a3842879307"
      }
    },
  },
};