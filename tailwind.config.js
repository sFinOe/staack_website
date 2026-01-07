/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'poker-green': {
          DEFAULT: '#0d5c3d',
          dark: '#094a31',
          light: '#0f6d49',
        },
        'poker-gold': {
          DEFAULT: '#c9a227',
          light: '#d4b33d',
        },
        'bg-light': '#f7f8fa',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(13, 92, 61, 0.08)',
        'card-hover': '0 12px 32px -4px rgba(13, 92, 61, 0.12)',
        'phone': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'phone-hover': '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
}
