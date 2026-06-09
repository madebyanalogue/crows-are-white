/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        wire: {
          bg: '#e8e6e3',
          surface: '#ffffff',
          border: '#b8b2aa',
          muted: '#524f4b',
          faint: '#8a847c',
          ink: '#0c0a09',
        },
      },
      maxWidth: {
        site: '88rem',
        nav: '100rem',
      },
      spacing: {
        section: '7rem',
        'section-lg': '9rem',
      },
    },
  },
  plugins: [],
}
