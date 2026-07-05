import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import { fetchTechTreeData, fetchStrings, getCivListLocalized } from "@/lib/api/techtree";
import { civKeyToSlug } from "@/lib/api/civ-detail";
import { getDictionary } from "@/i18n/getDictionary";
import { isValidLocale, type Locale } from "@/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return buildPageMetadata(params.locale, "techtree", "techtree");
}

async function CivGuideLinks({ locale }: { locale: Locale }) {
  try {
    const [data, strings, dict] = await Promise.all([
      fetchTechTreeData(),
      fetchStrings(locale),
      getDictionary(locale),
    ]);
    const civs = getCivListLocalized(data, strings);
    const d = dict.techtree as Record<string, string>;

    return (
      <nav aria-label={d.browse_civ_guides} className="max-w-7xl mx-auto px-4 pb-10">
        <h2 className="text-sm font-semibold text-gray-400 mb-3">{d.browse_civ_guides}</h2>
        <div className="flex flex-wrap gap-2">
          {civs.map((c) => (
            <Link
              key={c.key}
              href={`/${locale}/techtree/${civKeyToSlug(c.key)}`}
              className="text-xs px-2.5 py-1.5 rounded-full bg-aoe-dark border border-aoe-border text-gray-400 hover:border-aoe-accent/50 hover:text-aoe-accent transition-colors"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </nav>
    );
  } catch {
    return null;
  }
}

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const locale = isValidLocale(params.locale) ? (params.locale as Locale) : "en";
  return (
    <>
      {children}
      <CivGuideLinks locale={locale} />
    </>
  );
}
