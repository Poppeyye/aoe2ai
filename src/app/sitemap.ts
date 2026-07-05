import type { MetadataRoute } from "next";
import { BUILD_ORDERS } from "@/lib/aoe2/build-orders";
import { fetchTechTreeData } from "@/lib/api/techtree";
import { civKeyToSlug } from "@/lib/api/civ-detail";

const BASE_URL = "https://aoe2.ai";
const LOCALES = ["en", "es"] as const;

const LAST_MODIFIED = new Date("2026-07-05");

// Fallback in case the remote tech tree data is unavailable at request time
const FALLBACK_CIV_KEYS = [
  "Armenians", "Aztecs", "Bengalis", "Berbers", "Bohemians", "Britons",
  "Bulgarians", "Burgundians", "Burmese", "Byzantines", "Celts", "Chinese",
  "Cumans", "Dravidians", "Ethiopians", "Franks", "Georgians", "Goths",
  "Gurjaras", "Hindustanis", "Huns", "Incas", "Italians", "Japanese",
  "Jurchens", "Khitans", "Khmer", "Koreans", "Lithuanians", "Magyars",
  "Malay", "Malians", "Mayans", "Mongols", "Persians", "Poles",
  "Portuguese", "Romans", "Saracens", "Shu", "Sicilians", "Slavs",
  "Spanish", "Tatars", "Teutons", "Turks", "Vietnamese", "Vikings",
  "Wei", "Wu",
];

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

function entriesFor(
  path: string,
  priority: number,
  changeFrequency: PageDef["changeFrequency"],
): MetadataRoute.Sitemap {
  return LOCALES.map((locale) => ({
    url: `${BASE_URL}/${locale}${path}`,
    lastModified: LAST_MODIFIED,
    changeFrequency,
    priority,
    alternates: {
      languages: Object.fromEntries(
        LOCALES.map((l) => [l, `${BASE_URL}/${l}${path}`]),
      ),
    },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const { path, priority, changeFrequency } of PAGES) {
    entries.push(...entriesFor(path, priority, changeFrequency));
  }

  // Civilization guide pages
  let civKeys = FALLBACK_CIV_KEYS;
  try {
    const data = await fetchTechTreeData();
    civKeys = Object.keys(data.civs);
  } catch {
    // use fallback list
  }
  for (const key of civKeys.sort()) {
    entries.push(...entriesFor(`/techtree/${civKeyToSlug(key)}`, 0.6, "monthly"));
  }

  // Build order pages
  for (const bo of BUILD_ORDERS) {
    entries.push(...entriesFor(`/learn/${bo.id}`, 0.6, "monthly"));
  }

  return entries;
}
