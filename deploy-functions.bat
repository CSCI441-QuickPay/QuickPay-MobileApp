@echo off
echo ================================
echo Deploying Supabase Functions
echo ================================
echo.

echo Step 1: Installing Supabase CLI (if not installed)...
where supabase >nul 2>nul
if %errorlevel% neq 0 (
    echo Supabase CLI not found. Installing via Scoop...
    echo Please ensure Scoop is installed: https://scoop.sh/
    scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
    scoop install supabase
) else (
    echo Supabase CLI is already installed.
)

echo.
echo Step 2: Linking to Supabase project...
supabase link --project-ref orptfearwcypftrjkoaa

echo.
echo Step 3: Deploying functions...
supabase functions deploy plaid-create-link-token
supabase functions deploy plaid-exchange-token
supabase functions deploy plaid-get-accounts
supabase functions deploy plaid-get-transactions

echo.
echo ================================
echo Deployment Complete!
echo ================================
echo.
echo Next step: Set environment variables in Supabase dashboard
echo Go to: https://supabase.com/dashboard/project/orptfearwcypftrjkoaa/settings/functions
pause
