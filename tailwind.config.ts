import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Aviation Dark Cockpit Backgrounds ──────────────────────────────
        cockpit: {
          deepest: "#070B14",
          dark:    "#0B0F19",
          panel:   "#111827",
          surface: "#1A2235",
          border:  "#1E2D42",
        },
        // ── Neon Accent Palette ────────────────────────────────────────────
        radar: {
          cyan:    "#00F0FF",
          "cyan-dim": "#06B6D4",
          amber:   "#F59E0B",
          emerald: "#10B981",
          red:     "#EF4444",
          violet:  "#8B5CF6",
          slate:   "#64748B",
        },
      },
      fontFamily: {
        sans:  ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono:  ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      backgroundImage: {
        "radar-grid":
          "linear-gradient(rgba(0,240,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.04) 1px, transparent 1px)",
        "cockpit-gradient":
          "radial-gradient(ellipse at 50% 0%, rgba(0,240,255,0.07) 0%, transparent 60%), linear-gradient(180deg, #070B14 0%, #0B0F19 100%)",
        "glass-gradient":
          "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
      },
      backgroundSize: {
        "radar-grid": "48px 48px",
      },
      boxShadow: {
        "radar-glow":     "0 0 20px rgba(0, 240, 255, 0.25), 0 0 40px rgba(0, 240, 255, 0.10)",
        "amber-glow":     "0 0 20px rgba(245, 158, 11, 0.30), 0 0 40px rgba(245, 158, 11, 0.12)",
        "emerald-glow":   "0 0 16px rgba(16, 185, 129, 0.30)",
        "red-strobe":     "0 0 20px rgba(239, 68, 68, 0.50), 0 0 60px rgba(239, 68, 68, 0.25)",
        "glass-card":     "0 8px 32px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.06)",
        "glass-card-hover": "0 12px 48px rgba(0,0,0,0.65), inset 0 1px 0 rgba(0,240,255,0.15), 0 0 24px rgba(0,240,255,0.08)",
        "inner-glow":     "inset 0 0 24px rgba(0, 240, 255, 0.08)",
      },
      dropShadow: {
        "radar-cyan":  ["0 0 6px rgba(0,240,255,0.80)", "0 0 14px rgba(0,240,255,0.40)"],
        "radar-amber": ["0 0 6px rgba(245,158,11,0.80)", "0 0 14px rgba(245,158,11,0.40)"],
        "radar-red":   ["0 0 8px rgba(239,68,68,0.90)", "0 0 20px rgba(239,68,68,0.50)"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      animation: {
        "radar-sweep":   "radarSweep 4s linear infinite",
        "pulse-slow":    "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "beacon-ring":   "beaconRing 1.5s ease-out infinite",
        "strobe-red":    "strobeRed 0.8s ease-in-out infinite",
        "ticker-up":     "tickerUp 0.3s ease-out forwards",
        "slide-in-right":"slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in":       "fadeIn 0.25s ease-out forwards",
        "spin-slow":     "spin 8s linear infinite",
        "altitude-rise": "altitudeRise 1.2s ease-out forwards",
      },
      keyframes: {
        radarSweep: {
          "0%":   { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        beaconRing: {
          "0%":   { transform: "scale(0.8)", opacity: "1" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
        strobeRed: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.2" },
        },
        tickerUp: {
          "0%":   { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)",   opacity: "1" },
        },
        slideInRight: {
          "0%":   { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)",    opacity: "1" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        altitudeRise: {
          "0%":   { height: "0%" },
          "100%": { height: "var(--alt-pct)" },
        },
      },
      transitionTimingFunction: {
        cockpit: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
