@echo off
REM ═══════════════════════════════════════════════════════════════════════
REM   QuickPay Data Collection Testing Script
REM ═══════════════════════════════════════════════════════════════════════
REM
REM   This script helps you test data collection functionality
REM
REM ═══════════════════════════════════════════════════════════════════════

echo.
echo ╔═══════════════════════════════════════════════════════════════════╗
echo ║         QuickPay Data Collection Testing                         ║
echo ╚═══════════════════════════════════════════════════════════════════╝
echo.

:MENU
echo Please select an option:
echo.
echo   1. View Data Collection Analysis
echo   2. Export Data Collection Analysis to JSON
echo   3. Export User Data (requires Clerk ID)
echo   4. View Help
echo   5. Exit
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto ANALYZE
if "%choice%"=="2" goto ANALYZE_EXPORT
if "%choice%"=="3" goto EXPORT_USER
if "%choice%"=="4" goto HELP
if "%choice%"=="5" goto END

echo Invalid choice. Please try again.
echo.
goto MENU

:ANALYZE
echo.
echo ═══════════════════════════════════════════════════════════════════
echo   Running Data Collection Analysis...
echo ═══════════════════════════════════════════════════════════════════
echo.
node scripts/analyze-data-collection.js
echo.
pause
goto MENU

:ANALYZE_EXPORT
echo.
echo ═══════════════════════════════════════════════════════════════════
echo   Exporting Data Collection Analysis to JSON...
echo ═══════════════════════════════════════════════════════════════════
echo.
node scripts/analyze-data-collection.js --export
echo.
echo File saved to: data-exports/data-collection-analysis-*.json
echo.
pause
goto MENU

:EXPORT_USER
echo.
echo ═══════════════════════════════════════════════════════════════════
echo   Export User Data (GDPR Compliance)
echo ═══════════════════════════════════════════════════════════════════
echo.
echo You need a Clerk User ID to export data.
echo Example: user_2a1b2c3d4e5f6g7h8i9j
echo.
set /p clerkid="Enter Clerk ID (or 'back' to return): "

if "%clerkid%"=="back" goto MENU
if "%clerkid%"=="" (
    echo Error: Clerk ID cannot be empty
    echo.
    goto EXPORT_USER
)

echo.
echo Exporting data for user: %clerkid%
echo.
node scripts/export-user-data.js %clerkid%
echo.
echo File saved to: data-exports/user-data-*.json
echo.
pause
goto MENU

:HELP
echo.
echo ═══════════════════════════════════════════════════════════════════
echo   HELP - How to Use This Script
echo ═══════════════════════════════════════════════════════════════════
echo.
echo OPTION 1: View Data Collection Analysis
echo   - Shows all 7 data collection points
echo   - Lists 5 storage locations
echo   - Documents 4 external services
echo   - Shows 6 security measures
echo   - Displays compliance information
echo   - Output: Console only
echo.
echo OPTION 2: Export Analysis to JSON
echo   - Same as Option 1 but saves to JSON file
echo   - Output: data-exports/data-collection-analysis-*.json
echo.
echo OPTION 3: Export User Data
echo   - Exports all data for a specific user (GDPR compliance)
echo   - Required: Clerk User ID
echo   - Output: data-exports/user-data-*.json
echo   - Includes: profile, favorites, metadata
echo.
echo HOW TO GET CLERK USER ID:
echo   1. Open the QuickPay app
echo   2. Check Profile screen OR
echo   3. Go to Clerk Dashboard (clerk.com) and find user
echo   4. Format: user_2a1b2c3d4e5f6g7h8i9j
echo.
echo EXAMPLE USAGE:
echo   Option 3 with ID: user_2a1b2c3d4e5f6g7h8i9j
echo   Creates: data-exports/user-data-user_2a1b...-1699123456789.json
echo.
pause
goto MENU

:END
echo.
echo Thank you for using QuickPay Data Collection Testing!
echo.
exit /b 0
