import type { Metadata } from "next";
import Link from "next/link";
import {
  Flame, Shield, Swords, Target, Trophy, Clock,
  CheckCircle2, AlertTriangle, ArrowRight, Sparkles, BookOpen,
  Hammer, TrendingUp, HelpCircle,
} from "lucide-react";
import JsonLd from "@/components/seo/JsonLd";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isEs = locale === "es";
  const title = isEs
    ? "Guía de Fast Castle en AoE2 DE — Build Orders, Tiempos y Estrategia | AoE2.ai"
    : "Fast Castle Strategy Guide in AoE2 DE — Build Orders, Timings & Civs | AoE2.ai";
  const description = isEs
    ? "Domina el Fast Castle (FC) en Age of Empires II: Definitive Edition. Tiempos objetivo (14:30 - 16:00), distribución de aldeanos, uso del mercado, mejores civilizaciones y transiciones a Castillos."
    : "Master the Fast Castle (FC) in Age of Empires II: Definitive Edition. Benchmark timings (14:30 - 16:00), villager distributions, market abuse, best civilizations, and Castle Age transitions.";

  return {
    title,
    description,
    alternates: {
      canonical: `https://aoe2.ai/${locale}/guides/fast-castle-guide`,
      languages: {
        en: "https://aoe2.ai/en/guides/fast-castle-guide",
        es: "https://aoe2.ai/es/guides/fast-castle-guide",
        "x-default": "https://aoe2.ai/en/guides/fast-castle-guide",
      },
    },
    openGraph: {
      title,
      description,
      url: `https://aoe2.ai/${locale}/guides/fast-castle-guide`,
      type: "article",
    },
  };
}

export default function FastCastleGuidePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const isEs = locale === "es";

  const faqs = [
    {
      q: isEs ? "¿Cuál es el tiempo ideal para llegar a la Edad de los Castillos con Fast Castle?" : "What is the benchmark Castle Age timing for Fast Castle?",
      a: isEs
        ? "El tiempo estándar de llegada a Castillos con 26-27 de población es aproximadamente 15:45 - 16:15 en tiempo de juego. Con civilizaciones con bonus económicos rápidos (como Jemeres o Lituanos) o subiendo a 24-25 pop con Mercado y Herrería, se puede alcanzar entre 14:30 y 15:00."
        : "A standard 26-27 pop Fast Castle arrives at Castle Age between 15:45 and 16:15 game time. With economic bonus civs (Khmer, Lithuanians) or aggressive 24-25 pop Market + Blacksmith clicks, you can reach Castle Age between 14:30 and 15:00.",
    },
    {
      q: isEs ? "¿Cuándo es recomendable hacer Fast Castle y cuándo NO?" : "When should you Fast Castle and when should you avoid it?",
      a: isEs
        ? "Es ideal en mapas cerrados (Arena, Hideout, Black Forest) o en partidas de equipo en posición de bolsillo (pocket). NO se recomienda en mapas abiertos (Arabia) si tu base no está 100% amurallada, ya que un rush de arqueros o scouts en Feudal castigará tu economía antes de llegar a Castillos."
        : "Fast Castle is optimal on closed maps (Arena, Hideout, Black Forest) and in team games when playing the Pocket position. Avoid naked Fast Castles on open maps (Arabia) unless you have an exceptionally wallable map, as Feudal archers or scouts will punish you before clicking up.",
    },
    {
      q: isEs ? "¿Qué dos edificios de Feudal debo construir para pasar a Castillos?" : "Which two Feudal buildings should I build to click up to Castle Age?",
      a: isEs
        ? "La combinación más rápida y versátil es Mercado + Herrería (Market + Blacksmith), ya que cuesta menos madera total (325 de madera) y te permite comprar/vender recursos si te falta comida u oro. Si vas a jugar jinetes ofensivos, puedes construir Establo + Herrería."
        : "The fastest and most flexible combination is Market + Blacksmith (325 total wood), which enables market balancing if you need extra food or gold. If planning an aggressive knight push, Stable + Blacksmith is standard.",
    },
    {
      q: isEs ? "¿Qué civilizaciones tienen el mejor Fast Castle?" : "Which civilizations have the best Fast Castle in AoE2?",
      a: isEs
        ? "Francos (granjas gratis y jinetes con +20% HP), Bohemios (química gratis y monjes con asedio), Polos (granjas Folwark que dan comida instantánea), Españoles (construyen 30% más rápido para Castillos tempranos) y Turcos (gratis química y pólvora instantánea)."
        : "Franks (free farm upgrades & +20% HP cavalry), Bohemians (free Chemistry & monk/siege potency), Poles (Folwark instant food burst), Spanish (30% faster building for early Castles), and Turks (free Chemistry and immediate Castle Age Janissaries).",
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
          {isEs ? "Guía de Fast Castle" : "Fast Castle Strategy Guide"}
        </span>
      </nav>

      {/* Hero Header */}
      <div className="card border-aoe-accent/40 bg-gradient-to-br from-aoe-accent/10 via-aoe-card to-aoe-dark p-6 sm:p-8 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-3">
          <Flame className="w-3.5 h-3.5" />
          {isEs ? "Estrategia Maestra de Macro" : "Core Macro Strategy Guide"}
        </div>
        <h1 className="text-3xl sm:text-4xl font-medieval font-bold gold-gradient mb-3">
          {isEs ? "Guía Completa de Fast Castle en Age of Empires II" : "The Complete AoE2 Fast Castle Strategy Guide"}
        </h1>
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
          {isEs
            ? "El Fast Castle (FC) es la estrategia de macro más influyente de Age of Empires II. Consiste en minimizar el tiempo pasado en Feudal para desbloquear rápidamente jinetes pesados, castillos, asedio y Centros Urbanos adicionales."
            : "The Fast Castle (FC) is the single most defining macroeconomic build in Age of Empires II. It focuses on transitioning through the Feudal Age in under 2 minutes to unlock heavy cavalry, forward castles, siege engines, and multi-TC boom."}
        </p>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-aoe-accent" />
            {isEs ? "10 min de lectura" : "10 min read"}
          </span>
          <span className="flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-yellow-500" />
            {isEs ? "Tiempos optimizados para Definitive Edition" : "Benchmark timings for Definitive Edition"}
          </span>
        </div>
      </div>

      {/* Core Timings & Benchmarks */}
      <div className="card mb-8">
        <h2 className="section-title flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-aoe-accent" />
          {isEs ? "Tiempos Clave y Referencias de Población" : "Key Timings & Population Benchmarks"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-aoe-dark border border-aoe-border text-center">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
              {isEs ? "Click a Feudal (26 Pop)" : "Click Feudal (26 Pop)"}
            </div>
            <div className="text-2xl font-bold text-amber-400">~10:30</div>
            <div className="text-[11px] text-gray-500 mt-1">500 {isEs ? "Alimento" : "Food"}</div>
          </div>
          <div className="p-4 rounded-xl bg-aoe-dark border border-aoe-border text-center">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
              {isEs ? "Click a Castillos (28 Pop)" : "Click Castle Age (28 Pop)"}
            </div>
            <div className="text-2xl font-bold text-green-400">~13:30</div>
            <div className="text-[11px] text-gray-500 mt-1">800 {isEs ? "Alimento" : "Food"} / 200 {isEs ? "Oro" : "Gold"}</div>
          </div>
          <div className="p-4 rounded-xl bg-aoe-dark border border-aoe-border text-center">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
              {isEs ? "Llegada a Castillos" : "Castle Age Arrival"}
            </div>
            <div className="text-2xl font-bold text-aoe-accent">15:45 - 16:15</div>
            <div className="text-[11px] text-gray-500 mt-1">{isEs ? "Pico de Poder Activo" : "Power Spike Active"}</div>
          </div>
        </div>
      </div>

      {/* Step by Step Breakdown */}
      <div className="space-y-6 mb-10">
        <h2 className="section-title flex items-center gap-2">
          <Hammer className="w-5 h-5 text-aoe-accent" />
          {isEs ? "Ejecución Paso a Paso: Del Aldeano 1 al Pico de Castillos" : "Step-by-Step Execution: Villager 1 to Castle Age"}
        </h2>

        {/* Step 1 */}
        <div className="card p-5 border-l-4 border-l-green-500">
          <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs">1</span>
            {isEs ? "Alta Edad Media (Dark Age): Base Económica Limpia" : "Dark Age: Flawless Food & Wood Foundation"}
          </h3>
          <ul className="space-y-1.5 text-xs sm:text-sm text-gray-300 pl-8 list-disc">
            <li><strong>Pop 1-6:</strong> {isEs ? "6 aldeanos a ovejas bajo el Centro Urbano." : "6 villagers on sheep under the Town Center."}</li>
            <li><strong>Pop 7-10:</strong> {isEs ? "4 aldeanos al campamento maderero en el mejor bosque." : "4 villagers on wood at the primary lumber camp."}</li>
            <li><strong>Pop 11-12:</strong> {isEs ? "Caza el primer jabalí (lure) y construye 2 casas." : "Lure 1st boar and build 2 houses."}</li>
            <li><strong>Pop 13-16:</strong> {isEs ? "4 aldeanos al campamento de bayas (molino)." : "4 villagers on berries (build mill)."}</li>
            <li><strong>Pop 17:</strong> {isEs ? "Caza el segundo jabalí." : "Lure 2nd boar."}</li>
            <li><strong>Pop 18-20:</strong> {isEs ? "Come ciervos o añade 3 granjas tempranas." : "Push deer or seed 3 early farms."}</li>
            <li><strong>Pop 21-23:</strong> {isEs ? "3 aldeanos al segundo campamento maderero." : "3 villagers to a second lumber camp."}</li>
            <li><strong>Pop 24-26:</strong> {isEs ? "2-3 aldeanos a minar oro (Campamento Minero)." : "2-3 villagers to gold (Mining Camp)."}</li>
          </ul>
        </div>

        {/* Step 2 */}
        <div className="card p-5 border-l-4 border-l-amber-500">
          <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">2</span>
            {isEs ? "La Transición en Feudal: Velocidad Máxima" : "The Feudal Transition: Maximum Speed"}
          </h3>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-3">
            {isEs
              ? "Nada más pinchar a Feudal, investiga Hacha de Doble Filo. Durante la subida, prepara 325 de madera para colocar Mercado y Herrería inmediatamente al 100% de la subida. Crea 2 aldeanos en Feudal y pincha a Castillos al instante."
              : "The moment Feudal research starts, ensure you have wood ready. Upon hitting Feudal, immediately drop a Market and Blacksmith (or Stable + Blacksmith). Train 2 villagers, research Double-Bit Axe, and click Castle Age without idle TC."}
          </p>
        </div>

        {/* Step 3 */}
        <div className="card p-5 border-l-4 border-l-purple-500">
          <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs">3</span>
            {isEs ? "Llegada a Castillos: Elige tu Plan de Victoria" : "Castle Age Arrival: Choose Your Win Condition"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
            <div className="p-3 bg-aoe-dark rounded-lg">
              <div className="text-xs font-bold text-amber-400 uppercase mb-1">{isEs ? "A. Presión de Jinetes" : "A. Knight Push"}</div>
              <p className="text-[11px] text-gray-300">{isEs ? "2 Establos + Armadura de Malla + Líneas de Sangre para dominar el mapa." : "2 Stables + Chain Barding Armor + Bloodlines for immediate map control."}</p>
            </div>
            <div className="p-3 bg-aoe-dark rounded-lg">
              <div className="text-xs font-bold text-blue-400 uppercase mb-1">{isEs ? "B. Boom Económico" : "B. 3-TC Boom"}</div>
              <p className="text-[11px] text-gray-300">{isEs ? "Planta 2 Centros Urbanos adicionales en madera y oro para explotar en aldeanos." : "Drop 2 additional TCs on wood & gold to reach 100+ villagers in under 26 mins."}</p>
            </div>
            <div className="p-3 bg-aoe-dark rounded-lg">
              <div className="text-xs font-bold text-purple-400 uppercase mb-1">{isEs ? "C. Castillo Ofensivo" : "C. Castle Drop"}</div>
              <p className="text-[11px] text-gray-300">{isEs ? "Mina 650 de piedra y clava un Castillo en su cara con soporte de mangonelas." : "Gather 650 stone on way up and drop a forward Castle on their primary resources."}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Civilizations for Fast Castle */}
      <div className="card mb-10">
        <h2 className="section-title flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-yellow-500" />
          {isEs ? "Mejores Civilizaciones para Ejecutar Fast Castle" : "Top Civilizations for Fast Castle"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-aoe-dark border border-aoe-border">
            <div className="font-bold text-white text-sm mb-1">⚔️ {isEs ? "Francos (Franks)" : "Franks"}</div>
            <p className="text-xs text-gray-300 leading-relaxed">
              {isEs
                ? "Las mejoras de granja gratuitas ahorran cientos de recursos de madera. Sus jinetes con +20% de vida al llegar a Castillos arrollan cualquier defensa."
                : "Free farm upgrades save hundreds of wood. Their +20% HP knights instantly overwhelm enemy Feudal armies."}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-aoe-dark border border-aoe-border">
            <div className="font-bold text-white text-sm mb-1">⚔️ {isEs ? "Polacos (Poles)" : "Poles"}</div>
            <p className="text-xs text-gray-300 leading-relaxed">
              {isEs
                ? "El Folwark recolecta el 8% de la comida de la granja al instante, otorgando ráfagas masivas de comida para pasar a Castillos a gran velocidad."
                : "The Folwark collects 8% of farm food instantly on construction, enabling ultra-fast food accumulation for effortless up-clicks."}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-aoe-dark border border-aoe-border">
            <div className="font-bold text-white text-sm mb-1">⚔️ {isEs ? "Jemeres (Khmer)" : "Khmer"}</div>
            <p className="text-xs text-gray-300 leading-relaxed">
              {isEs
                ? "No necesitan construir edificios para avanzar de edad ni para desbloquear otros edificios. Pueden pasar a Castillos a 24 pop sin Mercado ni Herrería."
                : "No prerequisite buildings required to advance ages. Can click up at 24 pop without spending wood on a Market or Blacksmith."}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-aoe-dark border border-aoe-border">
            <div className="font-bold text-white text-sm mb-1">⚔️ {isEs ? "Bohemios (Bohemians)" : "Bohemians"}</div>
            <p className="text-xs text-gray-300 leading-relaxed">
              {isEs
                ? "Herrería y Universidad cuestan -100 de madera. La tecnología de Química gratuita y sus vagones de guerra son letales en mapas cerrados."
                : "Blacksmith & Monastery cost 100 less wood. Free Chemistry and deadly Hussite Wagons make them undisputed Arena monsters."}
            </p>
          </div>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="card mb-10">
        <h2 className="section-title flex items-center gap-2 mb-4">
          <HelpCircle className="w-5 h-5 text-aoe-accent" />
          {isEs ? "Preguntas Frecuentes sobre Fast Castle" : "Fast Castle Frequently Asked Questions"}
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

      {/* Interactive Build Order Links */}
      <div className="card border-aoe-accent/40 bg-gradient-to-r from-aoe-accent/10 via-aoe-card to-aoe-dark p-6 text-center">
        <h2 className="text-lg font-bold text-white mb-2 flex items-center justify-center gap-2">
          <Target className="w-5 h-5 text-aoe-accent" />
          {isEs ? "¿Quieres practicar el Fast Castle con un temporizador interactivo?" : "Ready to practice Fast Castle with an interactive timer?"}
        </h2>
        <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto mb-4">
          {isEs
            ? "Usa nuestra herramienta de Build Orders interactiva con temporizador integrado paso a paso para clavar tus tiempos de aldeanos."
            : "Use our interactive step-by-step build order tool with a voice/visual practice timer to hit your timings perfectly."}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href={`/${locale}/learn/fast-castle`}
            className="btn-primary inline-flex items-center gap-2 text-sm"
          >
            <Sparkles className="w-4 h-4" />
            {isEs ? "Practicar Fast Castle Estándar" : "Practice Standard Fast Castle"}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href={`/${locale}/learn/fast-castle-knights`}
            className="btn-secondary inline-flex items-center gap-2 text-sm"
          >
            {isEs ? "Fast Castle a Jinetes" : "Fast Castle into Knights"}
          </Link>
        </div>
      </div>
    </div>
  );
}
