import type { Metadata } from "next";
import Link from "next/link";
import {
  Trophy, Target, Swords, Shield, Clock,
  CheckCircle2, AlertTriangle, ArrowRight, Sparkles, BookOpen,
  Zap, TrendingUp, HelpCircle, BarChart3,
} from "lucide-react";
import JsonLd from "@/components/seo/JsonLd";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isEs = locale === "es";
  const title = isEs
    ? "Cómo Subir ELO en AoE2 DE (De 1000 a 1500+ de Rating) | AoE2.ai"
    : "How to Climb Ranked ELO in AoE2 DE (1000 to 1500+ Guide) | AoE2.ai";
  const description = isEs
    ? "Aprende cómo subir de ELO en Age of Empires II: Definitive Edition. Consejos prácticos de 1000 a 1500+ ELO: cero inactividad de TC, scouting activo, control de grupos y análisis de replays."
    : "Comprehensive guide to climbing ranked ELO in Age of Empires II: Definitive Edition. Practical roadmap from 1000 to 1500+ ELO: zero idle TC, active scouting, hotkeys, and replay analysis.";

  return {
    title,
    description,
    alternates: {
      canonical: `https://aoe2.ai/${locale}/guides/how-to-climb-elo`,
      languages: {
        en: "https://aoe2.ai/en/guides/how-to-climb-elo",
        es: "https://aoe2.ai/es/guides/how-to-climb-elo",
        "x-default": "https://aoe2.ai/en/guides/how-to-climb-elo",
      },
    },
    openGraph: {
      title,
      description,
      url: `https://aoe2.ai/${locale}/guides/how-to-climb-elo`,
      type: "article",
    },
  };
}

export default function HowToClimbEloGuidePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const isEs = locale === "es";

  const faqs = [
    {
      q: isEs ? "¿Cuál es el error más común que mantiene a los jugadores por debajo de 1200 ELO?" : "What is the single biggest mistake keeping players below 1200 ELO?",
      a: isEs
        ? "El tiempo de inactividad del Centro Urbano (TC Idle Time). A 1000 ELO, los jugadores acumulan entre 2 y 5 minutos de TC inactivo en los primeros 20 minutos de partida, lo que equivale a perder entre 5 y 12 aldeanos de ventaja económica."
        : "Town Center idle time. At 1000 ELO, players typically accumulate 2 to 5 minutes of idle TC in the first 20 minutes, meaning they are 5 to 12 villagers behind before the first major battle even begins.",
    },
    {
      q: isEs ? "¿Cuántas civilizaciones debería jugar para subir ELO rápido?" : "How many civilizations should I main to climb ELO quickly?",
      a: isEs
        ? "Limítate a 1 o 2 civilizaciones sólidas (como Francos, Mayas o Magiares) hasta alcanzar 1300 ELO. Esto te permite dominar la ejecución de build orders y toma de decisiones sin tener que memorizar árboles tecnológicos cambiantes en cada partida."
        : "Stick to 1 or 2 versatile civs (like Franks, Mayans, or Magyars) until you reach 1300 ELO. This lets you master build order execution and game sense without cognitive overload from switching tech trees every match.",
    },
    {
      q: isEs ? "¿Cómo ayuda el análisis de replays a mejorar el ELO?" : "How does analyzing recorded games accelerate rating gains?",
      a: isEs
        ? "Revisar tus partidas te muestra exactamente el momento en el que tu economía se desequilibró (acumulando 2000 de madera sin gastar), tus tiempos de subida de edad comparados con el rival y las peleas que tomaste cuesta abajo o bajo castillos enemigos."
        : "Replay analysis highlights your exact economic bottlenecks (floating 2000 unspent wood), age-up benchmark delays against your opponent, and bad fights taken uphill or under enemy defensive structures.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: f.a,
            },
          })),
        }}
      />

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <Link href={`/${locale}`} className="hover:text-gray-300">
          AoE2.ai
        </Link>
        <span>/</span>
        <Link href={`/${locale}/guides`} className="hover:text-gray-300">
          {isEs ? "Guías" : "Guides"}
        </Link>
        <span>/</span>
        <span className="text-aoe-accent font-medium">
          {isEs ? "Cómo Subir ELO en Ranked" : "How to Climb Ranked ELO"}
        </span>
      </nav>

      {/* Hero Header */}
      <div className="card border-aoe-accent/40 bg-gradient-to-br from-aoe-accent/10 via-aoe-card to-aoe-dark p-6 sm:p-8 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-semibold mb-3">
          <Trophy className="w-3.5 h-3.5" />
          {isEs ? "Hoja de Ruta Competitiva" : "Competitive Ranked Roadmap"}
        </div>
        <h1 className="text-3xl sm:text-4xl font-medieval font-bold gold-gradient mb-3">
          {isEs ? "Cómo Subir ELO en Age of Empires II: De 1000 a 1500+" : "How to Climb Ranked ELO in AoE2: 1000 to 1500+ Guide"}
        </h1>
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
          {isEs
            ? "Subir de rating en AoE2 no se trata de hacer más clics por minuto (APM), sino de eliminar errores sistemáticos en tu macro, mantener el Centro Urbano trabajando constantemente y elegir las peleas correctas."
            : "Climbing ELO in AoE2 is not about raw APM speed. It is about eliminating systematic macro inefficiencies, maintaining zero Town Center idle time, and executing high-percentage tactical decisions."}
        </p>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-aoe-accent" />
            {isEs ? "11 min de lectura" : "11 min read"}
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-green-400" />
            {isEs ? "Estrategias probadas en ladder de DE" : "Proven DE ranked ladder benchmarks"}
          </span>
        </div>
      </div>

      {/* ELO Bracket Breakdown */}
      <div className="space-y-6 mb-10">
        <h2 className="section-title flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-aoe-accent" />
          {isEs ? "La Escalera de ELO: Qué Dominar en Cada Rango" : "The ELO Ladder: What to Master at Each Bracket"}
        </h2>

        {/* 1000 ELO Bracket */}
        <div className="card p-5 border-l-4 border-l-gray-400">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-white">
              {isEs ? "Rango 800 - 1000 ELO: Cero Inactividad de Centro Urbano" : "800 - 1000 ELO: Zero Idle Town Center"}
            </h3>
            <span className="text-xs font-bold text-gray-400">Level 1</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-2">
            {isEs
              ? "Crea aldeanos constantemente sin parar. Usa la tecla rápida 'Seleccionar Centro Urbano' y 'Crear Aldeano' en bucle. Construye casas con tiempo para no quedarte trabado de población (housed)."
              : "Never let your Town Center idle. Queue villagers continuously using hotkeys. Build houses proactively with 1 dedicated builder to avoid supply blocks."}
          </p>
        </div>

        {/* 1200 ELO Bracket */}
        <div className="card p-5 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-white">
              {isEs ? "Rango 1000 - 1200 ELO: Ejecución Limpia de Build Orders" : "1000 - 1200 ELO: Clean Build Order Execution"}
            </h3>
            <span className="text-xs font-bold text-blue-400">Level 2</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-2">
            {isEs
              ? "Aprende 2 aperturas básicas de memoria: 20-pop Scouts y 21-pop Arqueros. Llega a Feudal antes del minuto 10:00 e investiga Flecha Emplumada o Hacha de Doble Filo al instante."
              : "Master 2 core openings: 20-pop Scouts and 21-pop Archers. Arrive at Feudal before 10:00 and immediately research Double-Bit Axe or Fletching."}
          </p>
        </div>

        {/* 1400 ELO Bracket */}
        <div className="card p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-white">
              {isEs ? "Rango 1200 - 1400 ELO: Scouting Activo y Visión del Mapa" : "1200 - 1400 ELO: Active Scouting & Map Control"}
            </h3>
            <span className="text-xs font-bold text-amber-400">Level 3</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-2">
            {isEs
              ? "No dejes tu caballo explorador parado. Mira si el rival tiene cuartel, establo o galería para preparar el contraataque antes de que sus tropas lleguen a tu base."
              : "Keep your scout moving continuously. Identify whether the enemy opened Barracks, Stable, or Range so you prepare the counter composition before their units reach your base."}
          </p>
        </div>

        {/* 1500+ ELO Bracket */}
        <div className="card p-5 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-white">
              {isEs ? "Rango 1400 - 1600+ ELO: Control de Tiempos y Posicionamiento en Colinas" : "1400 - 1600+ ELO: Hill Control & Timing Windows"}
            </h3>
            <span className="text-xs font-bold text-purple-400">Level 4</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-2">
            {isEs
              ? "Lucha siempre con ventaja de colina (+25% de daño infligido, -25% de daño recibido). Castiga las transiciones del enemigo cuando esté subiendo de edad."
              : "Always fight with elevation hill bonus (+25% dealt, -25% taken). Strike aggressively during the opponent's vulnerable transition windows when they invest in age-ups."}
          </p>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="card mb-10">
        <h2 className="section-title flex items-center gap-2 mb-4">
          <HelpCircle className="w-5 h-5 text-aoe-accent" />
          {isEs ? "Preguntas Frecuentes sobre Subir ELO" : "ELO Climb Frequently Asked Questions"}
        </h2>
        <div className="space-y-4">
          {faqs.map((f, i) => (
            <div key={i} className="p-4 rounded-lg bg-aoe-dark border border-aoe-border/60">
              <h3 className="text-sm font-semibold text-white mb-1.5 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                {f.q}
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed pl-6">
                {f.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA to AI Tools */}
      <div className="card border-aoe-accent/40 bg-gradient-to-r from-aoe-accent/10 via-aoe-card to-aoe-dark p-6 text-center">
        <h2 className="text-lg font-bold text-white mb-2 flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-aoe-accent" />
          {isEs ? "Analiza tus partidas grabadas y espía a tus rivales con IA" : "Analyze your replays & scout opponents with AI"}
        </h2>
        <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto mb-4">
          {isEs
            ? "Sube tus archivos .aoe2record para detectar errores de tiempo o espía el perfil de tu rival en ranked antes de empezar la partida."
            : "Upload your .aoe2record files to pinpoint macro mistakes or scout your opponent's ranked tendencies before the match starts."}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href={`/${locale}/replay`}
            className="btn-primary inline-flex items-center gap-2 text-sm"
          >
            {isEs ? "Analizar Replay con IA" : "Analyze Replay with AI"}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href={`/${locale}/live`}
            className="btn-secondary inline-flex items-center gap-2 text-sm"
          >
            {isEs ? "Espiar Rival en Vivo" : "Scout Opponent"}
          </Link>
        </div>
      </div>
    </div>
  );
}
