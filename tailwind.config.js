/** @type {import('tailwindcss').Config} */
module.exports = {
  // Dark mode via a `dark` class on <html> (see the no-flash script in index.html).
  darkMode: 'class',

  // Scan every file that can contain Tailwind classes so the production build is purged
  // down to only what we use (keeps dist/styles.css tiny for the Lighthouse budget).
  content: [
    './index.html',
    './privacy.html',
    './404.html',
    './src/**/*.js',
  ],

  theme: {
    extend: {
      // Fresh teal + mint palette (modern, calm, trustworthy).
      // Tuned for >=4.5:1 text contrast in both themes.
      colors: {
        teal: {
          300: '#2DD4BF', // dark-mode accents / primary (dark)
          400: '#14B8A6', // bright accent (decorative art only — fails text contrast)
          500: '#0B8276', // gradient end for buttons (AA-safe with white text)
          600: '#0F766E', // primary actions / links (light)
          700: '#115E59', // hover / pressed, in-text links
        },
        // "sand" keys are retained as names but now hold the mint scale, so
        // existing utility classes across the markup keep working.
        sand: {
          50: '#F4FAF9', // light page background (mint-tinted)
          100: '#FFFFFF', // card surfaces (light) — crisp white
          200: '#D9F1EE', // soft mint: section bands, borders, chips
        },
        ink: {
          700: '#4B6A68', // muted body text (light)
          900: '#12302F', // body text (light)
        },
        night: {
          800: '#122A29', // card surfaces (dark)
          900: '#0B1D1C', // dark page background
        },
        cloud: {
          50: '#E6F4F2', // body text (dark)
          200: '#9BBDB9', // muted body text (dark)
        },
      },

      // Fraunces for headings, Inter for body/UI. Font files are self-hosted and preloaded.
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      // 18px base body size per the design direction.
      fontSize: {
        base: ['1.125rem', { lineHeight: '1.65' }],
      },

      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },

      boxShadow: {
        soft: '0 10px 30px -10px rgba(15, 118, 110, 0.18)',
        'soft-lg': '0 18px 44px -14px rgba(15, 118, 110, 0.30)',
      },

      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-18px)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },

      animation: {
        float: 'float 16s ease-in-out infinite',
        'float-slow': 'float 20s ease-in-out infinite reverse',
      },
    },
  },

  plugins: [],
};
