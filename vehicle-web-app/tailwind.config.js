/** @type {import('tailwindcss').Config} */
export default {
  
  content: [
    './index.html', 
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
       
        accent: {
          DEFAULT: '#4f46e5',
          50: '#eef2ff',
          700: '#4338ca',
        },
        
      },
      boxShadow: {
        
        pop: '0 8px 30px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
};