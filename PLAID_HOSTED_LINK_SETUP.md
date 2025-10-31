# Plaid Hosted Link Integration - Setup Guide

## What Changed

I've implemented Plaid's **Hosted Link** approach, which is much simpler than the WebView implementation. Here's what makes it better:

1. **Plaid hosts the entire UI** on their CDN servers
2. **No complex JavaScript injection** needed
3. **Better mobile compatibility** - Plaid handles all the edge cases
4. **Simpler redirect flow** - Just open a URL and handle the callback

## Files Modified

### 1. Updated Supabase Edge Function
**File**: `supabase/functions/plaid-create-link-token/index.ts`
- Added `redirect_uri: 'quickpay://plaid-oauth-redirect'` parameter
- This tells Plaid where to redirect after OAuth flows

### 2. Created New Hosted Link Screen
**File**: `app/plaid-onboarding-hosted.tsx`
- Uses WebView to open Plaid's hosted URL
- Format: `https://cdn.plaid.com/link/v2/stable/link.html?isWebview=true&token={link_token}`
- Handles OAuth redirects via deep linking
- Detects when user completes flow and exchanges public token

### 3. Updated Routing
**Files**: `app/index.tsx` and `app/(main)/home.tsx`
- Changed redirects from `/plaid-onboarding-web` to `/plaid-onboarding-hosted`

## How It Works

```
1. App fetches link_token from Supabase Edge Function
   ↓
2. App generates Plaid Hosted Link URL:
   https://cdn.plaid.com/link/v2/stable/link.html?isWebview=true&token={link_token}
   ↓
3. Opens URL in WebView - Plaid handles entire UI flow
   ↓
4. User selects bank and logs in on Plaid's servers
   ↓
5. If bank requires OAuth, Plaid redirects to:
   quickpay://plaid-oauth-redirect?oauth_state_id=...
   ↓
6. App catches redirect, WebView continues automatically
   ↓
7. When done, Plaid returns public_token in URL or message
   ↓
8. App exchanges public_token for access_token
   ↓
9. Saved to Supabase database
   ↓
10. User redirected to home screen with real data!
```

## Before Testing: Deploy Updated Edge Function

The Supabase Edge Function has been updated but needs to be deployed. You have two options:

### Option A: Deploy via Supabase CLI (if you have access token)
```bash
cd QuickPay-MobileApp
npx supabase login
npx supabase functions deploy plaid-create-link-token
```

### Option B: Deploy via Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions**
3. Find `plaid-create-link-token`
4. Click **Deploy New Version**
5. Copy the contents of `supabase/functions/plaid-create-link-token/index.ts`
6. Paste and deploy

The only change is adding this line:
```typescript
redirect_uri: 'quickpay://plaid-oauth-redirect',
```

## Testing the Integration

### Step 1: Start the app
```bash
cd QuickPay-MobileApp
npm start
```

### Step 2: Open in Expo Go
- Scan QR code with Expo Go app
- Make sure you're logged in with Clerk

### Step 3: Complete Plaid Flow
1. You should automatically be redirected to the Plaid onboarding screen
2. Plaid's UI will open in a WebView
3. Select a bank (use "Plaid Sandbox" for testing)
4. For sandbox testing, use these credentials:
   - Username: `user_good`
   - Password: `pass_good`
5. Select accounts to link
6. Plaid will return a public_token
7. App will exchange it and save to database
8. You'll see "Bank account linked successfully!"
9. Redirected to home screen with real balance and transactions

### Expected Console Output
```
🔄 Fetching Plaid link token for hosted link...
✅ Hosted Link URL generated
🔗 WebView navigated to: https://cdn.plaid.com/link/v2/stable/link.html?isWebview=true&token=link-sandbox-...
[User completes flow in Plaid UI]
✅ Plaid Link successful, exchanging token...
✅ Bank account linked successfully!
```

## Advantages of Hosted Link

### ✅ Pros
1. **No native build required** - Works in Expo Go
2. **Plaid handles all UI** - No JavaScript injection needed
3. **Better OAuth handling** - Plaid manages redirects
4. **Mobile optimized** - Plaid's UI is responsive
5. **Easier to maintain** - Fewer moving parts

### ⚠️ Considerations
1. Requires internet connection (but so does banking)
2. User sees Plaid's branding (actually a trust signal)
3. WebView must allow third-party cookies

## Troubleshooting

### Issue: WebView shows blank screen
**Solution**: Make sure you deployed the updated Edge Function with `redirect_uri`

### Issue: "Failed to initialize Plaid"
**Solution**: Check your Supabase environment variables:
- `PLAID_CLIENT_ID`
- `PLAID_SECRET`
- `PLAID_ENV` (should be "sandbox" for testing)

### Issue: OAuth redirect not working
**Solution**: Make sure deep linking is configured in `app.config.js`:
```javascript
scheme: "quickpay"
```

### Issue: Token exchange fails
**Solution**: Check the `plaid-exchange-token` Edge Function is deployed and has correct Plaid credentials

## Next Steps After Testing

1. ✅ **Test with sandbox** - Use test credentials
2. ✅ **Verify data shows in home screen** - Check balance and transactions
3. ✅ **Test error cases** - What if user cancels? What if network fails?
4. 📱 **Test on real device** - Sometimes emulators behave differently
5. 🚀 **Apply for Plaid production** - When ready to go live

## Production Checklist

Before going to production:
- [ ] Apply for Plaid production access
- [ ] Update `PLAID_ENV` to "production"
- [ ] Update Plaid credentials to production keys
- [ ] Test with real bank accounts
- [ ] Add error handling for rate limits
- [ ] Set up webhook handlers for account updates
- [ ] Implement token refresh logic

## Summary

This Hosted Link approach is **much simpler and more reliable** than the previous implementations:
- ❌ Native SDK: Required development builds, had Gradle issues
- ❌ WebView with injected JS: Got stuck loading, complex to debug
- ✅ **Hosted Link: Just open a URL, Plaid does the rest!**

All you need to do now is:
1. Deploy the updated Edge Function
2. Run `npm start`
3. Test the flow

It's literally that easy! 🎉
