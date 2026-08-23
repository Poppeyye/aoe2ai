import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen, Brain, Swords, Shield, Trophy, Target, ArrowRight,
  Flame, Sparkles, Clock, Zap, CheckCircle2, Castle,
} from "lucide-react";
import JsonLd from "@/components/seo/JsonLd";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isEs = locale === "es";
  const title = isEs
    ? "Guías de Estrategia AoE2 DE — Build Orders, Counters, IA y ELO | AoE2.ai"
    : "AoE2 DE Strategy Guides — Build Orders, Counters, AI & ELO Climb | AoE2.ai";
  const description = isEs
    ? "Colección de guías tácticas y estratégicas para Age of Empires II: Definitive Edition. Aprende a vencer a la IA Extrema, dominar el Fast Castle, usar counters de unidades y subir ELO en ranked."
    : "Comprehensive collection of tactical strategy guides for Age of Empires II: Definitive Edition. Master Fast Castle, defeat Extreme AI, counter every army, and climb ranked ELO.";

  return {
    title,
    description,
    alternates: {
      canonical: `https://aoe2.ai/${locale}/guides`,
      languages: {
        en: "https://aoe2.ai/en/guides",
        es: "https://aoe2.ai/es/guides",
        "x-default": "https://aoe2.ai/en/guides",
      },
    },
    openGraph: {
      title,
      description,
      url: `https://aoe2.ai/${locale}/guides`,
      type: "website",
      images: [
        {
          url: "https://aoe2.ai/og-image.png",
          width: 1200,
          height: 630,
          alt: "AoE2.ai Strategy Guides",
        },
      ],
    },
  };
}

interface GuideItem {
  slug: string;
  title: { en: string; es: string };
  subtitle: { en: string; es: string };
  readTime: { en: string; es: string };
  tag: { en: string; es: string };
  badgeColor: string;
  icon: typeof Brain;
  difficulty: { en: string; es: string };
}

const STRATEGY_GUIDES: GuideItem[] = [
  {
    slug: "how-to-beat-extreme-ai",
    title: {
      en: "How to Beat the Extreme AI in AoE2 DE",
      es: "Cómo Vencer a la IA Extrema en AoE2 DE",
    },
    subtitle: {
      en: "Learn the exploitable weaknesses, panic triggers, and 4 foolproof strategies to defeat the Extreme AI 100% of the time.",
      es: "Descubre las debilidades explotables, gatillos de pánico y las 4 estrategias infalibles para ganar a la IA Extrema el 100% de las veces.",
    },
    readTime: { en: "8 min read", es: "8 min de lectura" },
    tag: { en: "AI Exploits & Tactics", es: "Tácticas contra IA" },
    badgeColor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    icon: Brain,
    difficulty: { en: "All Levels", es: "Todos los niveles" },
  },
  {
    slug: "fast-castle-guide",
    title: {
      en: "Fast Castle Strategy Guide — Timings, Civs & Follow-ups",
      es: "Guía Definitiva de Fast Castle — Tiempos, Civs y Planes",
    },
    subtitle: {
      en: "Master the most fundamental strategy in AoE2: 24 to 28 pop Fast Castle transitions, market abuse, building placement, and power spike execution.",
      es: "Domina la estrategia fundamental de AoE2: transiciones a 24-28 de población, uso del mercado, colocación de edificios y ejecución de picos de poder.",
    },
    readTime: { en: "10 min read", es: "10 min de lectura" },
    tag: { en: "Core Macro & Build Orders", es: "Macro y Build Orders" },
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    icon: Castle,
    difficulty: { en: "Beginner to Intermediate", es: "Principiante a Intermedio" },
  },
  {
    slug: "unit-counters-guide",
    title: {
      en: "The Complete AoE2 Unit Counters & Cheatsheet Guide",
      es: "Guía Completa de Counters de Unidades y Tabla Táctica",
    },
    subtitle: {
      en: "Full rock-paper-scissors military breakdown: hard counters vs soft counters, the trash unit triangle, siege defense, and monk conversion mechanics.",
      es: "Desglose completo de piedra-papel-tijera militar: counters duros y blandos, triángulo de unidades basura, defensa de asedio y mecánicas de monjes.",
    },
    readTime: { en: "9 min read", es: "9 min de lectura" },
    tag: { en: "Combat & Mechanics", es: "Combate y Mecánicas" },
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    icon: Shield,
    difficulty: { en: "All Levels", es: "Todos los niveles" },
  },
  {
    slug: "how-to-climb-elo",
    title: {
      en: "How to Climb Ranked ELO in AoE2 DE (1000 to 1500+)",
      es: "Cómo Subir ELO en AoE2 DE — Guía de 1000 a 1500+ de Rating",
    },
    subtitle: {
      en: "The exact habits and decision-making principles that separate 1000 ELO from 1500+ ELO players: 0s idle TC, scout multitasking, and tempo control.",
      es: "Los hábitos y principios de toma de decisiones que diferencian a un jugador de 1000 ELO de uno de 1500+: 0s de TC inactivo, scouting y control de tiempos.",
    },
    readTime: { en: "11 min read", es: "11 min de lectura" },
    tag: { en: "Ranked Improvement", es: "Mejora en Ranked" },
    badgeColor: "bg-green-500/20 text-green-400 border-green-500/30",
    icon: Trophy,
    difficulty: { en: "Ranked Players", es: "Jugadores Ranked" },
  },
];

export default function GuidesIndexPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const isEs = locale === "es";

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: isEs ? "Guías de Estrategia AoE2 DE" : "AoE2 DE Strategy Guides",
    description: isEs
      ? "Colección de guías estratégicas y tácticas de Age of Empires II: Definitive Edition."
      : "Collection of tactical strategy and gameplay guides for Age of Empires II: Definitive Edition.",
    url: `https://aoe2.ai/${locale}/guides`,
    hasPart: STRATEGY_GUIDES.map((g) => ({
      "@type": "Article",
      headline: isEs ? g.title.es : g.title.en,
      description: isEs ? g.subtitle.es : g.subtitle.en,
      url: `https://aoe2.ai/${locale}/guides/${g.slug}`,
    })),
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <JsonLd data={collectionSchema} />

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <Link href={`/${locale}`} className="hover:text-gray-300">
          AoE2.ai
        </Link>
        <span>/</span>
        <span className="text-aoe-accent font-medium">
          {isEs ? "Guías de Estrategia" : "Strategy Guides"}
        </span>
      </nav>

      {/* Hero Header */}
      <div className="card border-aoe-accent/40 bg-gradient-to-br from-aoe-accent/10 via-aoe-card to-aoe-dark p-6 sm:p-8 mb-10 text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-aoe-accent/20 border border-aoe-accent/30 text-aoe-accent text-xs font-semibold mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          {isEs ? "Base de Conocimiento Táctico" : "Tactical Strategy Knowledge Base"}
        </div>
        <h1 className="text-3xl sm:text-4xl font-medieval font-bold gold-gradient mb-3">
          {isEs ? "Guías Estratégicas de Age of Empires II" : "Age of Empires II Strategy Guides"}
        </h1>
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-3xl mb-4">
          {isEs
            ? "Aprende las mecánicas, tiempos y conceptos estratégicos clave de AoE2 DE con guías profundas redactadas para jugadores principiantes y competitivos."
            : "Master key AoE2 DE mechanics, timing windows, and strategic principles with in-depth guides crafted for both climbing players and seasoned veterans."}
        </p>
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-aoe-accent" />
            {STRATEGY_GUIDES.length} {isEs ? "guías maestras disponibles" : "master guides available"}
          </span>
          <span className="flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-yellow-500" />
            {isEs ? "Actualizado para el meta actual de DE" : "Updated for current DE patch meta"}
          </span>
        </div>
      </div>

      {/* Guides Grid */}
      <div className="space-y-5 mb-12">
        {STRATEGY_GUIDES.map((guide) => {
          const Icon = guide.icon;
          return (
            <Link
              key={guide.slug}
              href={`/${locale}/guides/${guide.slug}`}
              className="card !p-6 hover:border-aoe-accent/60 transition-all duration-300 group block hover:glow"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${guide.badgeColor}`}>
                      {isEs ? guide.tag.es : guide.tag.en}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {isEs ? guide.readTime.es : guide.readTime.en}
                    </span>
                    <span className="text-xs text-gray-500">
                      &bull; {isEs ? guide.difficulty.es : guide.difficulty.en}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white group-hover:text-aoe-accent transition-colors mb-2">
                    {isEs ? guide.title.es : guide.title.en}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                    {isEs ? guide.subtitle.es : guide.subtitle.en}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-aoe-accent shrink-0 pt-2 md:pt-0">
                  <span>{isEs ? "Leer guía" : "Read guide"}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Related Tools Callout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href={`/${locale}/learn`}
          className="card p-4 hover:border-aoe-accent/50 transition-colors text-center"
        >
          <Target className="w-6 h-6 text-aoe-accent mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white mb-1">
            {isEs ? "Build Orders Interactivos" : "Interactive Build Orders"}
          </h3>
          <p className="text-xs text-gray-400">
            {isEs ? "12 órdenes de construcción con temporizador" : "12 build orders with step-by-step practice timers"}
          </p>
        </Link>
        <Link
          href={`/${locale}/counters`}
          className="card p-4 hover:border-aoe-accent/50 transition-colors text-center"
        >
          <Shield className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white mb-1">
            {isEs ? "Calculadora de Counters" : "Counter Calculator"}
          </h3>
          <p className="text-xs text-gray-400">
            {isEs ? "Calcula el contraataque y macro perfecta" : "Calculate the perfect army counter & villager macro"}
          </p>
        </Link>
        <Link
          href={`/${locale}/matchups`}
          className="card p-4 hover:border-aoe-accent/50 transition-colors text-center"
        >
          <Swords className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white mb-1">
            {isEs ? "Simulador de Matchups" : "Matchup Simulator"}
          </h3>
          <p className="text-xs text-gray-400">
            {isEs ? "Enfrentamientos entre todas las civilizaciones" : "Head-to-head civ breakdowns & timings"}
          </p>
        </Link>
      </div>
    </div>
  );
}
