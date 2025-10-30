import "dotenv/config";

export default {
  expo: {
    name: "QuickPay",
    slug: "quickpay",
    scheme: "quickpay", 
    extra: {
      clerkPublishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    },
  },
};