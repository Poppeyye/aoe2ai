import type { MetadataRoute } from "next";

const BASE_URL = "https://aoe2.ai";

const PAGES = [
  "",
  "/agent",
  "/replay",
  "/techtree",
  "/players",
  "/tournaments",
  "/live",
  "/learn",
  "/privacy",
];

const LOCALES = ["en", "es"];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const page of PAGES) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === "" ? "daily" : "weekly",
        priority: page === "" ? 1 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map((l) => [l, `${BASE_URL}/${l}${page}`]),
          ),
        },
      });
    }
  }

  return entries;
}
