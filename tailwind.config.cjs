/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
    './composables/**/*.{js,ts}',
    './plugins/**/*.{js,ts}',
    './content/**/*.{md,json}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["VazirMatn", "sans-serif"], // overrides default
      },
    },
  },
  plugins: [],
}
