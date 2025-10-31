// Quick test script to check if Supabase functions are deployed
// Run this with: node test-plaid-api.js

const SUPABASE_URL = "https://orptfearwcypftrjkoaa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ycHRmZWFyd2N5cGZ0cmprb2FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MzY2MjAsImV4cCI6MjA3NzQxMjYyMH0.KJK1E_KamDPyRoL383fd6h_fiuVTweacjomAW4RgDlA";
const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

async function testPlaidCreateLinkToken() {
  console.log("🧪 Testing plaid-create-link-token endpoint...");
  console.log("📡 URL:", `${FUNCTIONS_URL}/plaid-create-link-token`);

  try {
    const response = await fetch(`${FUNCTIONS_URL}/plaid-create-link-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ clerkId: 'test-user-123' }),
    });

    console.log("📥 Response status:", response.status);
    const data = await response.json();
    console.log("📊 Response data:", JSON.stringify(data, null, 2));

    if (response.status === 404) {
      console.log("\n❌ ERROR: Function not found!");
      console.log("This means the Supabase Edge Functions are NOT deployed yet.");
      console.log("\nYou need to deploy them first:");
      console.log("1. Run: deploy-functions.bat");
      console.log("2. OR deploy manually via Supabase Dashboard");
      console.log("3. See PLAID_SETUP_INSTRUCTIONS.txt for details");
      return false;
    }

    if (response.status === 500 && data.error) {
      console.log("\n⚠️  Function exists but returned an error:");
      console.log("Error:", data.error);

      if (data.error.includes("PLAID_CLIENT_ID") || data.error.includes("environment")) {
        console.log("\n❌ ERROR: Environment variables not set!");
        console.log("\nYou need to set these in Supabase Dashboard:");
        console.log("Go to: https://supabase.com/dashboard/project/orptfearwcypftrjkoaa/settings/functions");
        console.log("\nAdd these secrets:");
        console.log("- PLAID_CLIENT_ID");
        console.log("- PLAID_SECRET");
        console.log("- PLAID_ENV");
        console.log("- SUPABASE_URL");
        console.log("- SUPABASE_ANON_KEY");
      }
      return false;
    }

    if (data.link_token) {
      console.log("\n✅ SUCCESS! Function is working!");
      console.log("Link token received:", data.link_token.substring(0, 20) + "...");
      return true;
    }

    console.log("\n⚠️  Unexpected response");
    return false;

  } catch (error) {
    console.log("\n❌ ERROR:", error.message);
    console.log("\nPossible causes:");
    console.log("1. Functions not deployed");
    console.log("2. Network/internet issue");
    console.log("3. Supabase project issue");
    return false;
  }
}

async function main() {
  console.log("================================================================================");
  console.log("QUICKPAY PLAID API TEST");
  console.log("================================================================================\n");

  const success = await testPlaidCreateLinkToken();

  console.log("\n================================================================================");
  if (success) {
    console.log("✅ ALL TESTS PASSED! Your Plaid integration is ready!");
    console.log("\nNext steps:");
    console.log("1. Run your Expo app: npx expo start");
    console.log("2. Try linking a bank account");
    console.log("3. Use Plaid sandbox credentials:");
    console.log("   Username: user_good");
    console.log("   Password: pass_good");
  } else {
    console.log("❌ TESTS FAILED! Please fix the issues above.");
    console.log("\nSee PLAID_SETUP_INSTRUCTIONS.txt for help.");
  }
  console.log("================================================================================\n");
}

main();
