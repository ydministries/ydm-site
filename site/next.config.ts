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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
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

    // Phase JJ — guestbook is retired in favor of curated testimonials.
    // Anyone with a bookmark to /guestbook lands on /testimonials.
    cleaned.push({
      source: "/guestbook",
      destination: "/testimonials",
      permanent: true,
    });

    console.log(`[next.config] loaded ${cleaned.length} redirects (after trailing-slash strip + Phase JJ guestbook→testimonials)`);
    return cleaned;
  },
};

export default nextConfig;
