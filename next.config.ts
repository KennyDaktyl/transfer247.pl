import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Photos come from the shared Django backend's /media/ — in production
// api.dowieziemycie.pl, locally whatever NEXT_PUBLIC_API_BASE_URL points at.
const apiBase = new URL(process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000");

const nextConfig: NextConfig = {
  // Root layout lives at app/[locale]/layout.tsx (a top-level dynamic
  // segment), so a nested app/[locale]/not-found.tsx never fires for a
  // genuinely unmatched path — only global-not-found.tsx does, per Next's
  // own docs for this exact setup.
  experimental: {
    globalNotFound: true,
  },
  // next/image resizes backend photos to the size actually displayed —
  // the originals are up to ~1900px wide, far more than a phone needs.
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      new URL("https://api.dowieziemycie.pl/media/**"),
      new URL(`${apiBase.origin}/media/**`),
    ],
    // Media files never change in place (a new upload gets a new name).
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Local dev serves media from localhost, which Next blocks by default.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
  },
};

export default withNextIntl(nextConfig);
