/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep pine — primary brand green, rooted in Northern Pakistan's forests
        pine: {
          50: "#f1f6f3",
          100: "#dcebe3",
          200: "#bad7c8",
          300: "#8dbaa5",
          400: "#5d9680",
          500: "#3e7863",
          600: "#2f604f",
          700: "#284d41",
          800: "#223e35",
          900: "#1d332d",
          950: "#0f1e1a",
        },
        // Sage — muted mid green for secondary surfaces & tags
        sage: {
          50: "#f5f7f4",
          100: "#e7ede3",
          200: "#cfdcc8",
          300: "#adc2a1",
          400: "#87a377",
          500: "#688556",
          600: "#516a43",
          700: "#425537",
          800: "#37452f",
          900: "#2f3b29",
        },
        // Mist — cool stone-grey neutrals for backgrounds & text
        mist: {
          50: "#f7f8f8",
          100: "#eef0f0",
          200: "#dbe0e0",
          300: "#bcc6c6",
          400: "#96a4a4",
          500: "#788787",
          600: "#606e6e",
          700: "#4f5a5a",
          800: "#434c4c",
          900: "#3b4242",
          950: "#252a2a",
        },
        // Sun — warm sunlight accent for CTAs & highlights
        sun: {
          50: "#fdf7ed",
          100: "#f8e9cc",
          200: "#f0d095",
          300: "#e9b65f",
          400: "#e3a13c",
          500: "#d9861f",
          600: "#bf6817",
          700: "#9e4d16",
          800: "#813e18",
          900: "#6a3417",
        },
        // Clay — earthy terracotta for occasional editorial contrast
        clay: {
          400: "#cd7a52",
          500: "#bd6138",
          600: "#a34d2c",
        },

        // ── Vibrant-nature (matches the bento landing) ────────────────────
        // Abyss — dark forest darks with clear layering (page → card → raised)
        abyss: {
          50: "#eef2ef",
          100: "#cfd8d2",
          200: "#a6b5ab",
          300: "#748a7d",
          400: "#4c6354",
          500: "#33463b",
          600: "#28362d",
          700: "#1e2a23",
          800: "#18211b", // inputs / raised panels
          900: "#111813", // card surfaces
          950: "#070b08", // page background
        },
        // Glacier — lime / green highlight (primary accent, matches landing)
        glacier: {
          50: "#f7fee7",
          100: "#ecfccb",
          200: "#d9f99d",
          300: "#bef264",
          400: "#a3e635", // neon lime — primary accent
          500: "#84cc16",
          600: "#65a30d",
          700: "#4d7c0f",
          800: "#3f6212",
          900: "#365314",
        },
        // Sand — warm counter-accent (the warm in cold-meets-warm)
        sand: {
          100: "#f8eeda",
          200: "#f1ddbd",
          300: "#e9c99b", // warm sand
          400: "#dcb076",
          500: "#c9945a",
          600: "#a9743f",
        },
        // Night — dark forest canvas for the vibrant bento landing
        night: {
          950: "#070b08",
          900: "#0b110d",
          850: "#0f1712",
          800: "#141f18",
          700: "#1c2a22",
          600: "#26362c",
        },
        // Apricot — Hunza's apricot orchards & autumn poplars (dashboard warm accent)
        apricot: {
          50: "#fdf4e9",
          100: "#f9e3c7",
          200: "#f2c78e",
          300: "#eab063",
          400: "#e5983f",
          500: "#d67d28",
          600: "#b5611d",
          700: "#8f4a1a",
        },
        // Frost — warm off-white light-section neutrals
        frost: {
          50: "#f3f1ea", // off-white
          100: "#ece9df",
          200: "#dbd8ca",
          300: "#c1bdac",
          400: "#9c9989",
          500: "#767368",
          600: "#57554d",
          700: "#43413b",
          800: "#302f2b",
          900: "#22211e",
        },
      },
      fontFamily: {
        // Unified on Poppins (rounded & friendly) to match the bento landing.
        display: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        accent: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        // Soft, low, single-source shadows — not drop shadows on everything
        card: '0 12px 32px -12px rgba(29, 51, 45, 0.18)',
        lift: '0 24px 48px -20px rgba(29, 51, 45, 0.28)',
        inset: 'inset 0 1px 0 0 rgba(255,255,255,0.06)',
      },
      keyframes: {
        'reveal-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slow-zoom': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.08)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'glacier-pulse': {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.05)' },
        },
      },
      animation: {
        'reveal-up': 'reveal-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 0.6s ease-out both',
        'slow-zoom': 'slow-zoom 12s ease-out forwards',
        marquee: 'marquee 34s linear infinite',
        'marquee-slow': 'marquee 60s linear infinite',
        'marquee-reverse': 'marquee-reverse 40s linear infinite',
        'glacier-pulse': 'glacier-pulse 6s ease-in-out infinite',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
