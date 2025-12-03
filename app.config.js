import "dotenv/config";

export default {
  expo: {
    name: "QuickPay",
    slug: "quickpay",
    scheme: "quickpay",
    version: "1.0.0",
    orientation: "portrait",
    owner: "seththarohour",
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
      "eas": {
        "projectId": "9e19f686-2e17-4c88-83d5-f294adbb5f19"
      },
    },
  },
};