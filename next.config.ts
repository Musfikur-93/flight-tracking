import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── TypeScript ──────────────────────────────────────────────────
  typescript: {
    ignoreBuildErrors: false,
  },

  // ── Image domains for airline logos (future use) ─────────────────
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // ── Turbopack (Next.js 16 default bundler) ───────────────────────
  // An empty turbopack config silences the webpack-vs-turbopack warning.
  // Leaflet SSR-safety is handled via dynamic imports in components.
  turbopack: {},
};

export default nextConfig;
