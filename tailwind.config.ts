import type { Config } from 'tailwindcss';
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B2A6F',        // أزرق حبري للنصوص والعناوين
        brand: { DEFAULT: '#1D5BFF', dark: '#1445C9', light: '#6F98FF' },
        sky: '#E8F0FF',        // خلفيات خفيفة
        mist: '#F6F9FF',
        line: '#D5E1FB',       // الخطوط والحدود
        mute: '#5B6B8C',       // نص ثانوي
      },
      fontFamily: { sans: ['"IBM Plex Sans Arabic"', 'system-ui', 'Segoe UI', 'Tahoma', 'sans-serif'] },
    },
  },
  plugins: [],
} satisfies Config;
