import { loadClassicScripts } from './script-loader.js';

const tailwindUrl = new URL('../js/tailwindcss.js', import.meta.url).href;
await loadClassicScripts([tailwindUrl]);

window.tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Vazirmatn', 'sans-serif'],
      },
      colors: {
        brand: {
          red: '#d91e18',
          dark: '#0f172a',
        },
      },
    },
  },
};
