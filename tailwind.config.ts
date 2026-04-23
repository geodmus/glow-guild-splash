import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      colors: {
        // ── Brand anchors ──────────────────────────────
        "gg-cyan":     "#00c8d4",
        "gg-cyan-ink": "#007a82",
        "gg-magenta":  "#cc2d8f",

        // ── Surfaces ───────────────────────────────────
        "gg-ink":   "#0a0a0b",
        "gg-ink-2": "#121214",
        "gg-ink-3": "#1a1a1d",
        "gg-ink-4": "#242428",
        "gg-line":  "#2a2a2f",
        "gg-line-2":"#3a3a42",

        // ── Text ───────────────────────────────────────
        "gg-text":    "#f4f4f5",
        "gg-text-2":  "#a8a8b0",
        "gg-text-3":  "#6b6b74",
        "gg-text-inv":"#0a0a0b",

        // ── Semantic ───────────────────────────────────
        "gg-success": "#3ad29f",
        "gg-warn":    "#f5b544",
        "gg-error":   "#ff5a5a",

        // ── shadcn/ui compatibility ────────────────────
        border:     "hsl(var(--border))",
        input:      "hsl(var(--input))",
        ring:       "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },

      fontFamily: {
        display: ["Geist", "Neue Haas Grotesk Display Pro", "ui-sans-serif", "system-ui", "sans-serif"],
        body:    ["Geist", "ui-sans-serif", "system-ui", "sans-serif"],
        mono:    ["Geist Mono", "ui-monospace", "monospace"],
      },

      fontSize: {
        "gg-xs":   ["clamp(0.75rem,0.72rem + 0.15vw,0.8125rem)", { lineHeight: "1.5" }],
        "gg-sm":   ["clamp(0.875rem,0.85rem + 0.15vw,0.9375rem)", { lineHeight: "1.5" }],
        "gg-base": ["clamp(1rem,0.97rem + 0.15vw,1.0625rem)", { lineHeight: "1.5" }],
        "gg-lg":   ["clamp(1.125rem,1.08rem + 0.25vw,1.25rem)", { lineHeight: "1.3" }],
        "gg-xl":   ["clamp(1.5rem,1.4rem + 0.5vw,1.75rem)", { lineHeight: "1.2" }],
        "gg-2xl":  ["clamp(2rem,1.8rem + 1vw,2.5rem)", { lineHeight: "1.05" }],
        "gg-3xl":  ["clamp(2.75rem,2.4rem + 1.8vw,3.75rem)", { lineHeight: "1.0" }],
        "gg-4xl":  ["clamp(4rem,3.2rem + 4vw,6.5rem)", { lineHeight: "1.0" }],
      },

      spacing: {
        "1":  "4px",
        "2":  "8px",
        "3":  "12px",
        "4":  "16px",
        "5":  "20px",
        "6":  "24px",
        "7":  "28px",
        "8":  "32px",
        "9":  "36px",
        "10": "40px",
        "11": "44px",
        "12": "48px",
        "14": "56px",
        "16": "64px",
        "20": "80px",
        "24": "96px",
        "32": "128px",
      },

      borderRadius: {
        "gg-sm": "2px",
        "gg-md": "4px",
        "gg-lg": "6px",
        sm:   "2px",
        DEFAULT: "4px",
        md:   "4px",
        lg:   "6px",
        xl:   "10px",
        full: "999px",
        // shadcn compat
        "shadcn-sm": "calc(var(--radius) - 4px)",
        "shadcn-md": "calc(var(--radius) - 2px)",
        "shadcn-lg": "var(--radius)",
      },

      boxShadow: {
        "glow-cyan":    "0 0 0 1px rgba(0,200,212,0.4), 0 0 24px -4px rgba(0,200,212,0.25)",
        "glow-magenta": "0 0 0 1px rgba(204,45,143,0.5), 0 0 28px -4px rgba(204,45,143,0.3)",
        "lift":         "0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px -8px rgba(0,0,0,0.6)",
      },

      transitionTimingFunction: {
        "gg":    "cubic-bezier(0.2,0.8,0.2,1)",
        "gg-in": "cubic-bezier(0.4,0,1,1)",
      },

      transitionDuration: {
        "fast": "120ms",
        "base": "220ms",
        "slow": "420ms",
        "hero": "900ms",
      },

      letterSpacing: {
        "gg-tight": "-0.02em",
        "gg-wide": "0.04em",
        "gg-wider": "0.08em",
      },

      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "line-grow": {
          "0%":   { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
        "pulse-cyan": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(0,200,212,0.4)" },
          "50%":      { boxShadow: "0 0 0 6px rgba(0,200,212,0)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
      },

      animation: {
        "fade-up":       "fade-up 0.6s cubic-bezier(0.2,0.8,0.2,1) both",
        "fade-up-slow":  "fade-up 0.9s cubic-bezier(0.2,0.8,0.2,1) both",
        "fade-in":       "fade-in 0.4s cubic-bezier(0.2,0.8,0.2,1) both",
        "line-grow":     "line-grow 0.6s cubic-bezier(0.2,0.8,0.2,1) both",
        "pulse-cyan":    "pulse-cyan 2s ease-in-out infinite",
        "accordion-down":"accordion-down 0.2s ease-out",
        "accordion-up":  "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
