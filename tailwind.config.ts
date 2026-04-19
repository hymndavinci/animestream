import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        }
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top, rgba(244,114,182,0.18), transparent 30%), radial-gradient(circle at 20% 20%, rgba(56,189,248,0.12), transparent 24%), linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 45%)"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(244,114,182,0.1), 0 20px 60px -24px rgba(56,189,248,0.45)"
      }
    }
  },
  plugins: []
};

export default config;
