import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        surface: 'var(--surface)',
        'surface-foreground': 'var(--surface-foreground)',
        'surface-border': 'var(--surface-border)',
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        muted: 'var(--muted)',
        danger: 'var(--danger)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-card': 'var(--bg-card)',
        accent: 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        'text-secondary': 'var(--text-secondary)',
        'border-subtle': 'var(--border-subtle)',
      },
    },
  },
  plugins: [],
};
export default config;
