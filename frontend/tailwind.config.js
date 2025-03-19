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
          },
          'fade-in': {
            '0%': { opacity: '0', transform: 'translate(-50%, 10px)' },
            '100%': { opacity: '1', transform: 'translate(-50%, 0)' }
          }
        },
        animation: {
          'slide-up': 'slide-up 0.3s ease-out',
          'fade-in': 'fade-in 0.2s ease-out forwards'
        }
      }
    },
    plugins: [],
  }