import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/login", "/admin", "/*/admin"],
      },
    ],
    sitemap: "https://aoe2.ai/sitemap.xml",
    host: "https://aoe2.ai",
  };
}
