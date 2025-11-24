/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        // Colores originales del frontend (usando HSL variables)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { // Restauramos el primary original del frontend
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        // Colores de la landing page (añadidos con prefijo 'landing-')
        "landing-primary": "#3C4DFF",
        "landing-primary-focus": "#3341CF",
        "landing-background-dark": "#0A101A",
        "landing-card-dark": "rgba(22, 28, 39, 0.5)",
        "landing-text-dark-primary": "#FFFFFF",
        "landing-text-dark-secondary": "#AFAFAF",
        "landing-border-dark": "rgba(255, 255, 255, 0.07)",
        
        // Alias para compatibilidad con las clases existentes en el HTML de las tarjetas
        "border-dark": "rgba(255, 255, 255, 0.07)",
        "text-dark-primary": "#FFFFFF",
        "text-dark-secondary": "#AFAFAF",
      },
      fontFamily: {
        "display": ["Inter", "Noto Sans", "sans-serif"],
        "mono": ["Roboto Mono", "monospace"],
        "sans": ["Roboto", "sans-serif"],
      },
      borderRadius: {
        "DEFAULT": "0.5rem", // De la landing
        "lg": "0.75rem",     // Ambos lo tenían
        "xl": "1rem",        // De la landing
        "2xl": "1.5rem",       // De la landing
        "full": "9999px",      // De la landing
        "md": 'calc(var(--radius) - 2px)', // Del frontend
        "sm": 'calc(var(--radius) - 4px)', // Del frontend
      },
      boxShadow: {
        'primary-glow': '0 0 25px -5px theme(colors.landing-primary), 0 0 15px -10px theme(colors.landing-primary)', // Usando landing-primary
        'glow-primary': '0 0 20px -2px hsl(var(--primary-glow) / 0.4)',
        'glow-destructive': '0 0 20px -2px hsl(var(--destructive-glow) / 0.4)',
        'glow-warning': '0 0 20px -2px hsl(var(--warning-glow) / 0.4)',
        'glow-success': '0 0 20px -2px hsl(var(--success-glow) / 0.4)',
        'sm-light': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'md-light': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      },
      keyframes: {
        'fade-in': {
          'from': { opacity: 0, transform: 'translateY(10px)' },
          'to': { opacity: 1, transform: 'translateY(0)' },
        },
         'fade-in-scale': {
          'from': { opacity: 0, transform: 'scale(0.95)' },
          'to': { opacity: 1, transform: 'scale(1)' },
        },
        'marquee-infinite': {
          'from': { transform: 'translateX(0%)' },
          'to': { transform: 'translateX(-100%)' },
        },
        'marquee-infinite-2': {
          'from': { transform: 'translateX(100%)' },
          'to': { transform: 'translateX(0%)' },
        },
        'pulse-glow': {
            '0%, 100%': { opacity: 0.7, transform: 'scale(1)' },
            '50%': { opacity: 1, transform: 'scale(1.05)' },
        },
        'float': {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-20px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'fade-in-scale': 'fade-in-scale 0.3s ease-out forwards',
        'marquee-infinite': 'marquee-infinite 25s linear infinite',
        'marquee-infinite-2': 'marquee-infinite-2 25s linear infinite',
        'pulse-glow': 'pulse-glow 5s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/container-queries')],
};