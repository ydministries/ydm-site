import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dgpjimeujubptwysymzw.supabase.co",
      },
      {
        protocol: "https",
        hostname: "media.ydministries.ca",
      },
    ],
  },
};

export default nextConfig;
