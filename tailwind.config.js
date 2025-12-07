/**
 * written by: Team QuickPay
 * tested by: Team QuickPay
 * debugged by: Team QuickPay
 * Notes: Contributions were shared, see GitHub history for commit details.
 * Unit Tests for UserSyncService
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [ "./App.tsx", "./components/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#00332d",   // dark green
        secondary: "#ccf8f1", // light teal/green
        accent: "#ff9800",    // orange fallback logo
        
        // Budget-specific colors
        'budget-bank': {
          DEFAULT: '#3B82F6',
          light: '#DBEAFE',
        },
        'budget-total': {
          DEFAULT: '#1F2937',
          light: '#F3F4F6',
        },
        'budget-category': {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
        },
      },
      fontSize: {
        small: 12,
        normal: 18,
        subheading: 24,
      },
      // Budget-specific spacing
      spacing: {
        'canvas-width': '600%',
        'canvas-height': '900px',
        'block-bank-w': '140px',
        'block-bank-h': '110px',
        'block-budget-w': '150px',
        'block-budget-h': '130px',
        'block-category-w': '130px',
        'block-category-h': '120px',
      },
      // Budget-specific border radius
      borderRadius: {
        'block': '16px',
        'block-lg': '20px',
      },
    },
  },
  plugins: [],
}
