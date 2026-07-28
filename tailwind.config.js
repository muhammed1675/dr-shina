export default {
  darkMode: 'selector',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: {
        '2xl': '1280px'
      }
    },
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        popover: 'var(--popover)',
        'popover-foreground': 'var(--popover-foreground)',
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        secondary: 'var(--secondary)',
        'secondary-foreground': 'var(--secondary-foreground)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        destructive: 'var(--destructive)',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        sidebar: 'var(--sidebar)',
        'sidebar-foreground': 'var(--sidebar-foreground)',
        'destructive-foreground': 'var(--destructive-foreground)',
        cream: '#FFF7EC',
        ink: '#111111',
        subtle: '#666666',
        line: '#E8E8E8',
        teal: {
          DEFAULT: '#21AEC0',
          dark: '#1698A7'
        },
        success: '#5CB85C'
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Lato', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'monospace']
      },
      maxWidth: {
        content: '80rem'
      },
      boxShadow: {
        card: '0 1px 2px rgba(17,17,17,0.04), 0 8px 24px rgba(17,17,17,0.05)',
        lift: '0 12px 40px rgba(17,17,17,0.10)'
      },
      keyframes: {
        kenburns: {
          '0%': { transform: 'scale(1) translate3d(0,0,0)' },
          '100%': { transform: 'scale(1.12) translate3d(0,-1%,0)' }
        }
      },
      animation: {
        kenburns: 'kenburns 22s ease-out forwards'
      }
    }
  }
}