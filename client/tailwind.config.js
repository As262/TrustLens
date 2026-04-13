export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        clay: {
          50: '#fafaf8',
          100: '#f5f3f0',
          200: '#ede8e2',
          300: '#e2d9ce',
          400: '#d4c5b5',
          500: '#c9b5a0',
          600: '#b39a87',
          700: '#8b7355',
          800: '#6b5546',
          900: '#5a4a3d',
        },
        trust: {
          high: '#10b981',
          medium: '#f59e0b',
          low: '#ef4444',
        },
      },
      boxShadow: {
        'clay-sm': '-2px -2px 5px rgba(255, 255, 255, 0.7), 2px 2px 5px rgba(0, 0, 0, 0.1)',
        'clay-md': '-5px -5px 12px rgba(255, 255, 255, 0.7), 5px 5px 12px rgba(0, 0, 0, 0.1)',
        'clay-lg': '-8px -8px 20px rgba(255, 255, 255, 0.8), 8px 8px 20px rgba(0, 0, 0, 0.15)',
        'clay-inset': 'inset -2px -2px 5px rgba(255, 255, 255, 0.7), inset 2px 2px 5px rgba(0, 0, 0, 0.1)',
      },
      backgroundImage: {
        'gradient-clay': 'linear-gradient(135deg, #f5f3f0 0%, #ede8e2 100%)',
        'gradient-trust-high': 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
        'gradient-trust-medium': 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        'gradient-trust-low': 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
      },
    },
  },
  plugins: [],
};
