import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Swords, Shield, Trophy, Flame, Target, MapPin,
  HelpCircle, Sparkles, ArrowRight, CheckCircle2,
} from "lucide-react";
import {
  getCivMatchupData,
  parseMatchupSlug,
  POPULAR_MATCHUPS,
} from "@/lib/aoe2/matchups";
import JsonLd from "@/components/seo/JsonLd";

export async function generateStaticParams() {
  const locales = ["en", "es"];
  const params: Array<{ locale: string; slug: string }> = [];

  for (const locale of locales) {
    for (const m of POPULAR_MATCHUPS) {
      params.push({ locale, slug: m.slug });
    }
  }

  return params;
}

export async function generateMetadata({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const parsed = parseMatchupSlug(slug);
  if (!parsed) return { title: "Matchup Not Found | AoE2.ai" };

  const data = getCivMatchupData(parsed.civ1Slug, parsed.civ2Slug);
  if (!data) return { title: "Matchup Not Found | AoE2.ai" };

  const isEs = locale === "es";
  const c1Name = data.civ1.name;
  const c2Name = data.civ2.name;

  const title = isEs
    ? `${c1Name} vs ${c2Name} — Estrategia, Counters y Guía de Matchup | AoE2.ai`
    : `${c1Name} vs ${c2Name} — Strategy, Counters & Matchup Guide | AoE2.ai`;

  const description = isEs
    ? `Guía completa de ${c1Name} vs ${c2Name} en AoE2: tiempos de apertura en Feudal, counters clave, picos de poder en Castillos y cómo ganar en Arabia y Arena.`
    : `Complete ${c1Name} vs ${c2Name} AoE2 matchup guide: Feudal opening timings, key counter units, Castle Age power spikes, and winning strategies on Arabia & Arena.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://aoe2.ai/${locale}/matchups/${slug}`,
      languages: {
        en: `https://aoe2.ai/en/matchups/${slug}`,
        es: `https://aoe2.ai/es/matchups/${slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `https://aoe2.ai/${locale}/matchups/${slug}`,
      type: "article",
    },
  };
}

export default function MatchupDetailPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  const parsed = parseMatchupSlug(slug);
  if (!parsed) notFound();

  const data = getCivMatchupData(parsed.civ1Slug, parsed.civ2Slug);
  if (!data) notFound();

  const isEs = locale === "es";
  const { civ1, civ2 } = data;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faqs.map((faq) => ({
      "@type": "Question",
      name: isEs ? faq.question.es : faq.question.en,
      acceptedAnswer: {
        "@type": "Answer",
        text: isEs ? faq.answer.es : faq.answer.en,
      },
    })),
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <JsonLd data={faqSchema} />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <Link href={`/${locale}`} className="hover:text-gray-300">
          AoE2.ai
        </Link>
        <span>/</span>
        <Link href={`/${locale}/matchups`} className="hover:text-gray-300">
          {isEs ? "Matchups" : "Matchups"}
        </Link>
        <span>/</span>
        <span className="text-aoe-accent font-medium">{civ1.name} vs {civ2.name}</span>
      </nav>

      {/* Hero Header */}
      <div className="card border-aoe-accent/40 bg-gradient-to-br from-aoe-accent/10 via-aoe-card to-aoe-dark p-6 sm:p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-aoe-accent/20 border border-aoe-accent/30 text-aoe-accent text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              {isEs ? "Análisis Táctico de Matchup" : "Tactical Matchup Analysis"}
            </div>
            <h1 className="text-3xl sm:text-4xl font-medieval font-bold gold-gradient mb-3">
              {civ1.name} vs {civ2.name}
            </h1>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              {isEs ? data.overview.es : data.overview.en}
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0 bg-aoe-dark/70 p-4 rounded-xl border border-aoe-border">
            <div className="text-center">
              <div className="text-base font-bold text-white">{civ1.name}</div>
              <div className="text-xs text-aoe-accent capitalize">{civ1.archetype}</div>
            </div>
            <div className="text-yellow-500 font-bold text-lg px-2">VS</div>
            <div className="text-center">
              <div className="text-base font-bold text-white">{civ2.name}</div>
              <div className="text-xs text-aoe-accent capitalize">{civ2.archetype}</div>
            </div>
          </div>
        </div>

        {/* Quick Ask Agent Button */}
        <div className="mt-6 pt-4 border-t border-aoe-border/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-gray-400">
            {isEs
              ? "¿Quieres simular esta partida con la IA?"
              : "Want to simulate this match with AI?"}
          </span>
          <Link
            href={`/${locale}/agent`}
            className="btn-primary text-xs !px-4 !py-2 inline-flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isEs ? `Preguntar al Agente sobre ${civ1.name} vs ${civ2.name}` : `Ask AI Agent about ${civ1.name} vs ${civ2.name}`}
          </Link>
        </div>
      </div>

      {/* Matchup Progression by Age */}
      <div className="space-y-4 mb-8">
        <h2 className="section-title flex items-center gap-2">
          <Trophy className="w-5 h-5 text-aoe-accent" />
          {isEs ? "Dinámica por Edades y Tiempos de Poder" : "Game Phase Progression & Power Spikes"}
        </h2>

        {/* Early Game */}
        <div className="card p-5 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="text-base font-semibold text-white">
              {isEs ? data.earlyGameDynamics.title.es : data.earlyGameDynamics.title.en}
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-green-500/20 text-green-300">
              {isEs ? "Feudal / Apertura" : "Early Feudal"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            {isEs ? data.earlyGameDynamics.analysis.es : data.earlyGameDynamics.analysis.en}
          </p>
        </div>

        {/* Castle Age */}
        <div className="card p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="text-base font-semibold text-white">
              {isEs ? data.castleAgeSpikes.title.es : data.castleAgeSpikes.title.en}
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
              {isEs ? "Edad de los Castillos" : "Castle Age"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            {isEs ? data.castleAgeSpikes.analysis.es : data.castleAgeSpikes.analysis.en}
          </p>
        </div>

        {/* Imperial Age */}
        <div className="card p-5 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="text-base font-semibold text-white">
              {isEs ? data.lateGameImperial.title.es : data.lateGameImperial.title.en}
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
              {isEs ? "Edad Imperial" : "Imperial Age"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            {isEs ? data.lateGameImperial.analysis.es : data.lateGameImperial.analysis.en}
          </p>
        </div>
      </div>

      {/* Key Counter Units (Side by Side) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Counters for Civ 1 */}
        <div className="card">
          <h3 className="section-title flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-aoe-accent" />
            {isEs ? data.countersCiv1VsCiv2.title.es : data.countersCiv1VsCiv2.title.en}
          </h3>
          <div className="space-y-3">
            {data.countersCiv1VsCiv2.units.map((u, i) => (
              <div key={i} className="p-3 rounded-lg bg-aoe-dark border border-aoe-border/70">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white text-sm">⚔️ {u.name}</span>
                  <span className="text-[11px] text-gray-500">vs {u.target}</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {isEs ? u.why.es : u.why.en}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Counters for Civ 2 */}
        <div className="card">
          <h3 className="section-title flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-amber-500" />
            {isEs ? data.countersCiv2VsCiv1.title.es : data.countersCiv2VsCiv1.title.en}
          </h3>
          <div className="space-y-3">
            {data.countersCiv2VsCiv1.units.map((u, i) => (
              <div key={i} className="p-3 rounded-lg bg-aoe-dark border border-aoe-border/70">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white text-sm">⚔️ {u.name}</span>
                  <span className="text-[11px] text-gray-500">vs {u.target}</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {isEs ? u.why.es : u.why.en}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3-Step Strategy Plan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Civ 1 Game Plan */}
        <div className="card bg-slate-900/60">
          <h3 className="section-title flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-green-400" />
            {isEs ? `Plan de Juego para ${civ1.name}` : `Game Plan for ${civ1.name}`}
          </h3>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-aoe-dark">
              <div className="text-xs font-bold text-green-400 uppercase tracking-wider mb-1">
                {isEs ? "1. Apertura" : "1. Opening"}
              </div>
              <p className="text-xs text-gray-200">
                {isEs ? data.strategicGamePlanCiv1.opening.es : data.strategicGamePlanCiv1.opening.en}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-aoe-dark">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                {isEs ? "2. Juego Medio" : "2. Mid Game"}
              </div>
              <p className="text-xs text-gray-200">
                {isEs ? data.strategicGamePlanCiv1.midGame.es : data.strategicGamePlanCiv1.midGame.en}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-aoe-dark">
              <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">
                {isEs ? "3. Condición de Victoria" : "3. Win Condition"}
              </div>
              <p className="text-xs text-gray-200">
                {isEs ? data.strategicGamePlanCiv1.winCondition.es : data.strategicGamePlanCiv1.winCondition.en}
              </p>
            </div>
          </div>
        </div>

        {/* Civ 2 Game Plan */}
        <div className="card bg-slate-900/60">
          <h3 className="section-title flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-blue-400" />
            {isEs ? `Plan de Juego para ${civ2.name}` : `Game Plan for ${civ2.name}`}
          </h3>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-aoe-dark">
              <div className="text-xs font-bold text-green-400 uppercase tracking-wider mb-1">
                {isEs ? "1. Apertura" : "1. Opening"}
              </div>
              <p className="text-xs text-gray-200">
                {isEs ? data.strategicGamePlanCiv2.opening.es : data.strategicGamePlanCiv2.opening.en}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-aoe-dark">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                {isEs ? "2. Juego Medio" : "2. Mid Game"}
              </div>
              <p className="text-xs text-gray-200">
                {isEs ? data.strategicGamePlanCiv2.midGame.es : data.strategicGamePlanCiv2.midGame.en}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-aoe-dark">
              <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">
                {isEs ? "3. Condición de Victoria" : "3. Win Condition"}
              </div>
              <p className="text-xs text-gray-200">
                {isEs ? data.strategicGamePlanCiv2.winCondition.es : data.strategicGamePlanCiv2.winCondition.en}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Map Specific Dynamics */}
      <div className="card mb-8">
        <h2 className="section-title flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-aoe-accent" />
          {isEs ? "Estrategia por Tipo de Mapa" : "Map Strategy Dynamics"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-aoe-dark border border-aoe-border">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Arabia</div>
            <p className="text-xs text-gray-300 leading-relaxed">
              {isEs ? data.mapContext.arabia.es : data.mapContext.arabia.en}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-aoe-dark border border-aoe-border">
            <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Arena</div>
            <p className="text-xs text-gray-300 leading-relaxed">
              {isEs ? data.mapContext.arena.es : data.mapContext.arena.en}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-aoe-dark border border-aoe-border">
            <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">Nomad / Water</div>
            <p className="text-xs text-gray-300 leading-relaxed">
              {isEs ? data.mapContext.waterNomad.es : data.mapContext.waterNomad.en}
            </p>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="card mb-8">
        <h2 className="section-title flex items-center gap-2 mb-4">
          <HelpCircle className="w-5 h-5 text-aoe-accent" />
          {isEs ? "Preguntas Frecuentes del Matchup" : "Matchup FAQ"}
        </h2>
        <div className="space-y-4">
          {data.faqs.map((faq, i) => (
            <div key={i} className="p-4 rounded-lg bg-aoe-dark border border-aoe-border/60">
              <h3 className="text-sm font-semibold text-white mb-1.5 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                {isEs ? faq.question.es : faq.question.en}
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed pl-6">
                {isEs ? faq.answer.es : faq.answer.en}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Explore More Matchups */}
      <div className="text-center py-6">
        <Link
          href={`/${locale}/matchups`}
          className="btn-secondary inline-flex items-center gap-2 text-sm"
        >
          <Swords className="w-4 h-4" />
          {isEs ? "Ver Todos los Enfrentamientos" : "Explore All Matchups"}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
