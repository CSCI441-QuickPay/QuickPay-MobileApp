/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.tsx", "./components/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
        colors: {
          primary: "#00332d",   // dark green
          secondary: "#ccf8f1", // light teal/green
          accent: "#ff9800",    // orange fallback logo
      },
    },
  },
  plugins: [],
}