import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#07080a',
        carbon: '#0f1116',
        panel: '#14171e',
        'panel-2': '#1a1e26',
        line: '#242833',
        'line-bright': '#353a47',
        ash: '#6b7180',
        dust: '#8a8f98',
        off: '#d6d9de',
        white: '#f0f2f5',
        signal: '#b6ff3b',
        'signal-dim': '#6d9925',
        hazard: '#ff8a1f',
        rust: '#b8472e',
        cyan: '#4dd0ff',
        warn: '#f6c542',
        error: '#ff3b30',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        block: ['var(--font-block)', 'sans-serif'],
        terminal: ['var(--font-terminal)', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
