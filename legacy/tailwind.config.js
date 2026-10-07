/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Ensure this matches your file structure
  ],
  theme: {
    extend: {
      backgroundImage: {
        'bg-gradient-main': 'linear-gradient(151.409deg, rgba(255, 255, 255, 0.4) 0%, rgba(18, 180, 230, 0.4) 50%, rgba(220, 76, 252, 0.4) 100%)',
      },
    },
  },
  plugins: [],
}
