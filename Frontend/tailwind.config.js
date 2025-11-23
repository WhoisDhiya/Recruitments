/** @type {import('tailwindcss').Config} */
module.exports = {
  // CRITICAL: This line tells Tailwind to scan all your source files (.js, .ts, .jsx, .tsx) 
  // inside the src/ folder, which is where your Homepage.tsx lives.
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{ts,tsx,js,jsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
