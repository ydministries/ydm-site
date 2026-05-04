import type { MetadataRoute } from "next";
import routeMap from "../../../archive/wordpress/scrape/route-map.json" with { type: "json" };

const SITE_URL = "https://ydministries.ca";

interface RouteItem {
  newPath?: string;
  type?: string;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return (routeMap.items as RouteItem[])
    .filter((item) => item.type !== "index_filter")
    .map((item) => {
      const path = (item.newPath ?? "/").split("?")[0];
      const url = path === "/" ? SITE_URL : `${SITE_URL}${path}`;

      let priority = 0.7;
      if (item.type === "home") priority = 1.0;
      else if (item.type === "index") priority = 0.9;
      else if (item.type === "page") priority = 0.8;

      let changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] =
        "monthly";
      if (item.type === "home" || item.type === "index") {
        changeFrequency = "weekly";
      }

      return {
        url,
        lastModified,
        changeFrequency,
        priority,
      };
    });
}
