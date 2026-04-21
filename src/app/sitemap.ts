import type { MetadataRoute } from "next";

const BASE_URL = "https://aoe2.ai";
const LOCALES = ["en", "es"] as const;

const LAST_MODIFIED = new Date("2026-04-17");

interface PageDef {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}

const PAGES: PageDef[] = [
  { path: "", priority: 1.0, changeFrequency: "weekly" },
  { path: "/agent", priority: 0.9, changeFrequency: "monthly" },
  { path: "/live", priority: 0.9, changeFrequency: "monthly" },
  { path: "/replay", priority: 0.8, changeFrequency: "monthly" },
  { path: "/techtree", priority: 0.8, changeFrequency: "monthly" },
  { path: "/players", priority: 0.7, changeFrequency: "daily" },
  { path: "/learn", priority: 0.7, changeFrequency: "monthly" },
  { path: "/profile", priority: 0.5, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const { path, priority, changeFrequency } of PAGES) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE_URL}/${locale}${path}`,
        lastModified: LAST_MODIFIED,
        changeFrequency,
        priority,
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map((l) => [l, `${BASE_URL}/${l}${path}`]),
          ),
        },
      });
    }
  }

  return entries;
}
