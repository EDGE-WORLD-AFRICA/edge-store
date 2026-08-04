/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      cnter: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px"
      }
    },
    extend: {
      colors: {
        border: "hsl(var(--edge-border) / <alpha-value>)",
        input: "hsl(var(--edge-input) / <alpha-value>)",
        ring: "hsl(var(--edge-ring) / <alpha-value>)",
        background: "hsl(var(--edge-background) / <alpha-value>)",
        foreground: "hsl(var(--edge-foreground) / <alpha-value>)",
        muted: {
          DEFAULT: "hsl(var(--edge-muted) / <alpha-value>)",
          foreground: "hsl(var(--edge-muted-foreground) / <alpha-value>)"
        },
        card: {
          DEFAULT: "hsl(var(--edge-card) / <alpha-value>)",
          foreground: "hsl(var(--edge-card-foreground) / <alpha-value>)"
        },
        surface: {
          DEFAULT: "hsl(var(--edge-surface) / <alpha-value>)",
          foreground: "hsl(var(--edge-surface-foreground) / <alpha-value>)"
        },
        primary: {
          DEFAULT: "hsl(var(--edge-primary) / <alpha-value>)",
          foreground: "hsl(var(--edge-primary-foreground) / <alpha-value>)",
          soft: "hsl(var(--edge-primary-soft) / <alpha-value>)",
          strong: "hsl(var(--edge-primary-strong) / <alpha-value>)"
        },
        secondary: {
          DEFAULT: "hsl(var(--edge-secondary) / <alpha-value>)",
          foreground: "hsl(var(--edge-secondary) / <alpha-value>)",
          soft: "hsl(var(--edge-secondary-soft) / <alpha-value>)",
          strong: "hsl(var(--edge-secondary-strong) / <alpha-value>)"
        },
        accent: {
          DEFAULT: "hsl(var(--edge-accent) / <alpha-value>)",
          foreground: "hsl(var(--edge-accent-foreground) / <alpha-value>)"
        },
        danger: {
          DEFAULT: "hsl(var(--edge-danger) / <alpha-value>)",
          foreground: "hsl(var(--edge-danger-foreground) / <alpha-value>)"
        },
        warning: {
          DEFAULT: "hsl(var(--edge-warning) / <alpha-value>)",
          foreground: "hsl(var(--edge-warning-foreground) / <alpha-value>)"
        },
        success: {
          DEFAULT: "hsl(var(--edge-success) / <alpha-value>)",
          foreground: "hsl(var(--edge-success-foreground) / <alpha-value>)"
        },
        default: {
          DEFAULT: "hsl(var(--edge-default) / <alpha-value>)",
          foreground: "hsl(var(--edge-default-foreground) / <alpha-value>)",
          soft: "hsl(var(--edge-default-soft) / <alpha-value>)",
          strong: "hsl(var(--edge-default-strong) / <alpha-value>)",
        },
        info: {
          DEFAULT: "hsl(var(--edge-info) / <alpha-value>)",
          foreground: "hsl(var(--edge-info-foreground) / <alpha-value>)",
          soft: "hsl(var(--edge-info-soft) / <alpha-value>)",
          strong: "hsl(var(--edge-info-strong) / <alpha-value>)",
        }
      },
      borderRadius: {
        lg: "var(--edge-radius)",
        md: "calc(var(--edge-radius) - 2px)",
        sm: "calc(var(--edge-radius) - 4px)",
        xs: "calc(var(--edge-radius) - 6px)"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"]
      }
    },
  },
  plugins: [],
}

