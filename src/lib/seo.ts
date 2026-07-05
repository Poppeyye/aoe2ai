import type { Metadata } from "next";
import { getDictionary } from "@/i18n/getDictionary";
import { isValidLocale, type Locale } from "@/i18n/config";

export async function buildPageMetadata(
  locale: string,
  section: string,
  dictKey: string,
): Promise<Metadata> {
  if (!isValidLocale(locale)) return {};
  const dict = await getDictionary(locale as Locale);
  const d = (dict as unknown as Record<string, Record<string, string>>)[dictKey];
  if (!d) return {};

  return {
    title: d.title,
    description: d.subtitle,
    openGraph: {
      title: d.title,
      description: d.subtitle,
      url: `https://aoe2.ai/${locale}/${section}`,
      images: [
        {
          url: "https://aoe2.ai/og-image.png",
          width: 1200,
          height: 630,
          alt: "AoE2.ai — AI-Powered Tools for Age of Empires II",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: d.title,
      description: d.subtitle,
      images: ["https://aoe2.ai/og-image.png"],
    },
    alternates: {
      canonical: `https://aoe2.ai/${locale}/${section}`,
      languages: {
        en: `/en/${section}`,
        es: `/es/${section}`,
      },
    },
  };
}
