import type { NextConfig } from "next";
import siteMap from "../archive/wordpress/scrape/site-map.json" with { type: "json" };

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
  async redirects() {
    // Next.js 15+ strips trailing slashes BEFORE matching redirects(), so any
    // source ending with `/` never matches incoming requests. Strip it here,
    // then drop redirects that became no-ops after the strip.
    const cleaned = (siteMap as Array<{ source: string; destination: string; permanent: boolean }>)
      .map((r) => ({
        ...r,
        source: r.source === "/" ? "/" : r.source.replace(/\/$/, ""),
      }))
      .filter((r) => r.source !== r.destination);
    console.log(`[next.config] loaded ${cleaned.length} redirects (after trailing-slash strip)`);
    return cleaned;
  },
};

export default nextConfig;
