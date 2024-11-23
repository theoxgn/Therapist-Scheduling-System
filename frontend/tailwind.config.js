module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        keyframes: {
          'slide-up': {
            '0%': { transform: 'translateY(100%)' },
            '100%': { transform: 'translateY(0)' }
          }
        },
        animation: {
          'slide-up': 'slide-up 0.3s ease-out'
        }
      }
    },
    plugins: [],
  }