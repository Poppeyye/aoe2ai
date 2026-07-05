import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Shield, Swords, FlaskConical, Castle, ChevronLeft, ExternalLink, Users } from "lucide-react";
import { fetchTechTreeData, fetchStrings } from "@/lib/api/techtree";
import { buildCivDetail, findCivBySlug, civKeyToSlug } from "@/lib/api/civ-detail";
import { getDictionary } from "@/i18n/getDictionary";
import { isValidLocale, type Locale } from "@/i18n/config";

export const revalidate = 86400;

interface PageProps {
  params: { locale: string; civ: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  if (!isValidLocale(params.locale)) return {};
  const locale = params.locale;

  try {
    const [data, strings, dict] = await Promise.all([
      fetchTechTreeData(),
      fetchStrings(locale),
      getDictionary(locale as Locale),
    ]);
    const found = findCivBySlug(data, params.civ);
    if (!found) return {};

    const displayName = strings[String(found.civ.name_string_id)] || found.key;
    const d = dict.techtree as Record<string, string>;
    const title = d.civ_page_title.replace("{civ}", displayName);
    const description = d.civ_page_subtitle.replace("{civ}", displayName);
    const slug = civKeyToSlug(found.key);

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `https://aoe2.ai/${locale}/techtree/${slug}`,
        images: [{ url: "https://aoe2.ai/og-image.png", width: 1200, height: 630 }],
      },
      alternates: {
        canonical: `https://aoe2.ai/${locale}/techtree/${slug}`,
        languages: {
          en: `/en/techtree/${slug}`,
          es: `/es/techtree/${slug}`,
        },
      },
    };
  } catch {
    return {};
  }
}

function CostLine({ cost }: { cost: Record<string, number> }) {
  const entries = Object.entries(cost).filter(([, v]) => v > 0);
  if (entries.length === 0) return null;
  return (
    <span className="text-xs text-gray-500">
      {entries.map(([res, amount]) => `${amount} ${res}`).join(" · ")}
    </span>
  );
}

export default async function CivPage({ params }: PageProps) {
  if (!isValidLocale(params.locale)) notFound();
  const locale = params.locale as Locale;

  let data, strings, dict;
  try {
    [data, strings, dict] = await Promise.all([
      fetchTechTreeData(),
      fetchStrings(locale),
      getDictionary(locale),
    ]);
  } catch {
    notFound();
  }

  const found = findCivBySlug(data, params.civ);
  if (!found) notFound();

  const civ = buildCivDetail(data, strings, found.key, found.civ);
  const d = dict.techtree as Record<string, string>;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: d.civ_page_title.replace("{civ}", civ.displayName),
    description: d.civ_page_subtitle.replace("{civ}", civ.displayName),
    inLanguage: locale,
    author: { "@type": "Organization", name: "AoE2.ai", url: "https://aoe2.ai" },
    mainEntityOfPage: `https://aoe2.ai/${locale}/techtree/${civKeyToSlug(found.key)}`,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href={`/${locale}/techtree`}
        className="text-sm text-gray-400 hover:text-aoe-accent transition-colors mb-6 inline-flex items-center gap-1"
      >
        <ChevronLeft className="w-4 h-4" />
        {d.back_to_techtree}
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-medieval font-bold mb-2">
          <span className="gold-gradient">{civ.displayName}</span>
        </h1>
        {civ.description && (
          <p className="text-gray-400 max-w-3xl">{civ.description}</p>
        )}
      </div>

      {/* Bonuses */}
      {civ.bonuses.length > 0 && (
        <section className="card mb-6">
          <h2 className="section-title !text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-aoe-accent" />
            {d.civ_bonuses}
          </h2>
          <ul className="space-y-2">
            {civ.bonuses.map((bonus, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-aoe-accent mt-0.5 shrink-0">▸</span>
                {bonus}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Team bonus */}
      {civ.teamBonus && (
        <section className="card mb-6 border-blue-500/30">
          <h2 className="section-title !text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            {d.team_bonus}
          </h2>
          <p className="text-sm text-gray-300">{civ.teamBonus}</p>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Unique units */}
        {civ.uniqueUnits.length > 0 && (
          <section className="card">
            <h2 className="section-title !text-lg flex items-center gap-2">
              <Swords className="w-5 h-5 text-aoe-accent" />
              {d.unique_units}
            </h2>
            <div className="space-y-3">
              {civ.uniqueUnits.map((u) => (
                <div key={u.id} className="rounded-lg bg-aoe-dark/50 p-3">
                  <div className="font-semibold text-white text-sm mb-1">{u.name}</div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                    <span>{d.stats_hp}: {u.hp}</span>
                    <span>{d.stats_attack}: {u.attack}</span>
                    {u.range > 0 && <span>{d.stats_range}: {u.range}</span>}
                    <span>{d.stats_speed}: {u.speed}</span>
                  </div>
                  <CostLine cost={u.cost} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Unique techs */}
        {civ.uniqueTechs.length > 0 && (
          <section className="card">
            <h2 className="section-title !text-lg flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-aoe-accent" />
              {d.unique_techs}
            </h2>
            <div className="space-y-3">
              {civ.uniqueTechs.map((t) => (
                <div key={t.id} className="rounded-lg bg-aoe-dark/50 p-3">
                  <div className="font-semibold text-white text-sm mb-1">{t.name}</div>
                  <CostLine cost={t.cost} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Availability summary */}
      <section className="card mb-6">
        <h2 className="section-title !text-lg flex items-center gap-2">
          <Castle className="w-5 h-5 text-aoe-accent" />
          {d.availability}
        </h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-aoe-accent">{civ.availableUnits}</div>
            <div className="text-xs text-gray-500">
              {d.units} · {d.of_total.replace("{total}", String(civ.totals.units))}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-aoe-accent">{civ.availableTechs}</div>
            <div className="text-xs text-gray-500">
              {d.techs} · {d.of_total.replace("{total}", String(civ.totals.techs))}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-aoe-accent">{civ.availableBuildings}</div>
            <div className="text-xs text-gray-500">
              {d.buildings_label} · {d.of_total.replace("{total}", String(civ.totals.buildings))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive tech tree CTA */}
      <div className="text-center">
        <Link
          href={`/${locale}/techtree`}
          className="btn-primary inline-flex items-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          {d.open_interactive}
        </Link>
      </div>
    </div>
  );
}
