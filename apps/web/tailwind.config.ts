import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-plex-sans)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['var(--font-plex-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '13px' }],
        xs: ['11px', { lineHeight: '15px' }],
        sm: ['12px', { lineHeight: '16px' }],
        base: ['13px', { lineHeight: '18px' }],
        md: ['14px', { lineHeight: '20px' }],
        lg: ['15px', { lineHeight: '22px' }],
        xl: ['16px', { lineHeight: '24px' }],
      },
      borderRadius: {
        none: '0px',
        xs: '2px',
        sm: '3px',
        DEFAULT: '3px',
        md: '4px',
        lg: '6px',
      },
      colors: {
        // Enterprise Clean Light Theme Palette (Stripe/Datadog/GitHub Light)
        canvas: '#F8FAFC',
        surface: '#FFFFFF',
        surfaceSubtle: '#F1F5F9',
        focus: '#E2E8F0',
        border: '#E2E8F0',
        borderMuted: '#CBD5E1',
        borderSubtle: '#F1F5F9',
        inputBg: '#FFFFFF',

        // Typography Hierarchy (High Contrast Slate)
        primary: '#0F172A',
        secondary: '#475569',
        muted: '#94A3B8',

        // Functional Status Accents
        status: {
          healthy: '#16A34A',
          healthyText: '#15803D',
          healthyBg: '#DCFCE7',
          warning: '#D97706',
          warningText: '#B45309',
          warningBg: '#FEF3C7',
          critical: '#DC2626',
          criticalText: '#B91C1C',
          criticalBg: '#FEE2E2',
          accent: '#2563EB',
          accentText: '#1D4ED8',
          accentBg: '#EFF6FF',
        },
      },
      boxShadow: {
        none: 'none',
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};

export default config;
