import type { Metadata } from "next";
import Link from "next/link";
import { Swords, Shield, Zap, Sparkles, Trophy, ArrowRight, BookOpen } from "lucide-react";
import { POPULAR_MATCHUPS, CIV_DATA } from "@/lib/aoe2/matchups";
import JsonLd from "@/components/seo/JsonLd";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isEs = locale === "es";
  const title = isEs
    ? "Enfrentamientos de Civilizaciones AoE2 — Guía de Matchups y Counters | AoE2.ai"
    : "AoE2 Civilization Matchups — Strategy, Counters & Head-to-Head Guides | AoE2.ai";
  const description = isEs
    ? "Analiza cualquier enfrentamiento entre civilizaciones de Age of Empires II: ventajas de apertura, picos de poder en Castillos, counters clave y estrategias para ganar en ranked."
    : "Analyze any Age of Empires II civilization matchup: early game advantages, Castle Age power spikes, key unit counters, and ranked winning strategies.";

  return {
    title,
    description,
    alternates: {
      canonical: `https://aoe2.ai/${locale}/matchups`,
      languages: {
        en: "https://aoe2.ai/en/matchups",
        es: "https://aoe2.ai/es/matchups",
      },
    },
    openGraph: {
      title,
      description,
      url: `https://aoe2.ai/${locale}/matchups`,
      type: "website",
    },
  };
}

export default function MatchupsIndexPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const isEs = locale === "es";
  const civList = Object.values(CIV_DATA);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: isEs ? "Enfrentamientos de Civilizaciones AoE2" : "AoE2 Civilization Matchups",
          description: isEs
            ? "Guía táctica de enfrentamientos entre civilizaciones de Age of Empires II."
            : "Tactical head-to-head matchup guide for Age of Empires II civilizations.",
          url: `https://aoe2.ai/${locale}/matchups`,
        }}
      />

      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-aoe-accent/10 border border-aoe-accent/30 text-aoe-accent text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          {isEs ? "Motor de Matchups Tácticos" : "Tactical Matchup Engine"}
        </div>
        <h1 className="text-3xl sm:text-4xl font-medieval font-bold mb-3 gold-gradient">
          {isEs ? "Enfrentamientos de Civilizaciones" : "Civilization Matchups"}
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          {isEs
            ? "Aprende cómo ganar cualquier enfrentamiento en ranked: tiempos de apertura, counters de unidades, picos de poder en Castillos y transiciones en Imperial."
            : "Learn how to win every ranked matchup: opening timings, unit counters, Castle Age power spikes, and late Imperial transitions."}
        </p>
      </div>

      {/* Quick Matchup Explorer Callout */}
      <div className="card border-aoe-accent/30 bg-gradient-to-r from-aoe-accent/10 via-aoe-card to-aoe-dark mb-10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
            <Swords className="w-5 h-5 text-aoe-accent" />
            {isEs ? "¿Buscas una estrategia personalizada?" : "Looking for customized advice?"}
          </h2>
          <p className="text-xs sm:text-sm text-gray-300">
            {isEs
              ? "Pregúntale al Agente de IA para adaptar el matchup a tu mapa, ELO y estilo de juego en tiempo real."
              : "Ask the AI Agent to adapt any matchup to your specific map, ELO bracket, and playstyle in real-time."}
          </p>
        </div>
        <Link
          href={`/${locale}/agent`}
          className="btn-primary shrink-0 inline-flex items-center gap-2 text-sm"
        >
          <Sparkles className="w-4 h-4" />
          {isEs ? "Abrir Agente IA" : "Open AI Agent"}
        </Link>
      </div>

      {/* Popular Matchups Grid */}
      <div className="mb-12">
        <h2 className="section-title flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-yellow-500" />
          {isEs ? "Enfrentamientos Más Populares de Ranked" : "Top Ranked Matchups"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {POPULAR_MATCHUPS.map((m) => {
            const c1 = CIV_DATA[m.civ1];
            const c2 = CIV_DATA[m.civ2];
            if (!c1 || !c2) return null;

            return (
              <Link
                key={m.slug}
                href={`/${locale}/matchups/${m.slug}`}
                className="card !p-5 hover:border-aoe-accent/60 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-aoe-accent px-2 py-0.5 rounded bg-aoe-accent/10 border border-aoe-accent/20">
                      {c1.archetype} vs {c2.archetype}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-aoe-accent group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-aoe-accent transition-colors">
                    {c1.name} vs {c2.name}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                    {isEs
                      ? `Estrategia completa, counters y tiempos clave entre ${c1.name} y ${c2.name}.`
                      : `Full strategy, unit counters, and key timing benchmarks between ${c1.name} and ${c2.name}.`}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-aoe-border/50 flex items-center justify-between text-xs text-gray-500">
                  <span>{isEs ? "Ver guía táctica" : "View tactical guide"}</span>
                  <span className="text-aoe-accent">AoE2 DE &rarr;</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Civilizations Directory */}
      <div className="card">
        <h2 className="section-title flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-aoe-accent" />
          {isEs ? "Explorar por Civilización" : "Explore by Civilization"}
        </h2>
        <p className="text-xs text-gray-400 mb-6">
          {isEs
            ? "Selecciona cualquier civilización para ver sus fortalezas y enfrentamientos clave:"
            : "Select any civilization to see their matchup toolkit and strengths:"}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {civList.map((civ) => (
            <Link
              key={civ.slug}
              href={`/${locale}/techtree/${civ.slug}`}
              className="p-3 rounded-lg bg-aoe-dark border border-aoe-border hover:border-aoe-accent/50 hover:bg-aoe-dark/80 transition-all flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-semibold text-white">{civ.name}</div>
                <div className="text-[10px] text-gray-500 capitalize">{civ.archetype}</div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-600" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
