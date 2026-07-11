import type { MetadataRoute } from "next";

const SITE_URL = "https://dw-event-co.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/checkout", "/confirmation", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
