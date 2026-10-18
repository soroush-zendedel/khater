module.exports = {
  content: [
    './index.html',
    './about.html',
    './app.html',
    './en/**/*.html',
    './src/**/*.js',
    './js/app/**/*.js',
  ],
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
  plugins: [],
};
