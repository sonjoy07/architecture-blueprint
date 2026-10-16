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
        // Authentic Industrial Graphite Palette (Datadog/Sentry/Grafana)
        canvas: '#0E1015',
        surface: '#161920',
        focus: '#1F232D',
        border: '#252A36',
        borderMuted: '#30363D',
        borderSubtle: '#1C2029',
        inputBg: '#0D0F14',

        // Crisp Typography Hierarchy
        primary: '#E6EDF3',
        secondary: '#8B949E',
        muted: '#484F58',

        // Functional Status Accents
        status: {
          healthy: '#238636',
          healthyText: '#3FB950',
          healthyBg: '#0E2416',
          warning: '#D29922',
          warningText: '#E3B341',
          warningBg: '#2E2208',
          critical: '#DA3633',
          criticalText: '#F85149',
          criticalBg: '#2A1215',
          accent: '#2F81F7',
          accentText: '#58A6FF',
          accentBg: '#0C1C36',
        },
      },
      boxShadow: {
        none: 'none',
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
};

export default config;
