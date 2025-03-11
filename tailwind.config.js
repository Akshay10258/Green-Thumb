/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        smooch: ['Smooch Sans', 'sans-serif'],
      },
      colors: {
        'spotify-green': '#1DB954',
        'spotify-black': '#191414',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleDown: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(0.95)' },
        },
        typing: {
          '0%': { width: '0%' }, // Start with 0% width
          '100%': { width: '100%' }, // End with 100% width
        },
        blinkCaret: {
          '0%, 100%': { 'border-color': 'transparent' },
          '50%': { 'border-color': '#1DB954' }, // Spotify green color
        },
      },
      animation: {
        fadeIn: 'fadeIn 1.5s ease-out',
        scaleDown: 'scaleDown 0.3s ease-out',
        typing: 'typing 1s steps(20, end), blinkCaret 0.75s step-end infinite', // Reduced to 1s
        typingDelay: 'typing 1s steps(20, end) 1s, blinkCaret 0.75s step-end infinite 1s', // Reduced delay to 1s
      },
    },
  },
  plugins: [],
};