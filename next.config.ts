import type { NextConfig } from "next";

// Media origin (TripEleven API host); /uploads on this site proxies to it.
const apiOrigin = (() => {
  try {
    return new URL(process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "").origin;
  } catch {
    return "https://api.tripeleven.com";
  }
})();

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/uploads/:path*", destination: `${apiOrigin}/uploads/:path*` }];
  },
  images: {
    contentDispositionType: "inline",
    // Upload filenames carry a timestamp and never change in place, so an
    // optimised copy can be reused for 31 days instead of re-encoding the
    // original after the 4-hour default.
    minimumCacheTTL: 2678400,
    // Uploads arrive already compressed as WebP; re-encoding them at the default
    // 75 compounds the artifacts, so photos use 90 (see components/site/photo.tsx).
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/api/**",
      },
      {
        protocol: "https",
        hostname: "api.tripeleven.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
