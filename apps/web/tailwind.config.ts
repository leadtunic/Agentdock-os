import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        dock: {
          bg: '#121210',
          surface: '#1c1b18',
          border: '#34312b',
          muted: '#b7ae8f',
          accent: '#978f84'
        }
      }
    }
  },
  plugins: []
};

export default config;
