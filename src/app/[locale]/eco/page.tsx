import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Calculator, Sparkles, Brain, Shield, Swords, Target,
  Clock, CheckCircle2, ChevronRight, Zap, Trophy,
} from "lucide-react";
import { isValidLocale } from "@/i18n/config";
import EcoMathCalculator from "@/components/eco/EcoMathCalculator";
import AssistantPanel from "@/components/ai/AssistantPanel";
import JsonLd from "@/components/seo/JsonLd";

const FAQ = {
  en: [
    {
      q: "How many villagers on gold do I need for constant Archers as Ethiopians in Feudal Age?",
      a: "An Archer costs 25 wood and 45 gold every 35 seconds, which is 77.14 gold per minute per Archery Range. A standard or Ethiopian gold miner gathers 22.8 gold per minute (without Gold Mining tech), so you need 4 gold miners (3.38 exact) per Archery Range, or 7 gold miners (6.77 exact) for standard 2-Range Archer play. With Gold Mining researched (26.22 gold/min), it drops to 3 miners for 1 Range and 6 miners for 2 Ranges. Furthermore, Ethiopians receive an immediate +100 food and +100 gold upon reaching Feudal Age, which instantly covers the first 2 Archers or over 1 minute of single-range gold consumption while your miners settle in!",
    },
    {
      q: "How many villagers do I need to keep one Town Center making villagers?",
      a: "A villager costs 50 food and takes 25 seconds, so one Town Center drains 120 food per minute. On farms with Wheelbarrow (22.8 food/min per farmer) that is 6 farmers (5.26 exact), which is where the classic 'six farms per Town Center' rule comes from. For a 3-TC boom in Castle Age, you need 16-18 farmers (360 food/min) plus 3-4 dedicated lumberjacks solely to afford the 60-wood farm reseeding cycle.",
    },
    {
      q: "How much gold does one Stable of Knights need?",
      a: "A Knight costs 60 food and 75 gold every 30 seconds, so a single Stable drains 120 food and 150 gold per minute. With no mining upgrades a gold miner brings 22.8 gold per minute, so you need 7 miners per Stable. For 2 Stables producing Knights non-stop, you need 14 gold miners and 12-14 farmers. Scout Cavalry, by contrast, costs 80 food and no gold at all — 160 food per minute and zero miners.",
    },
    {
      q: "Do farm upgrades make farmers gather faster?",
      a: "No. Horse Collar, Heavy Plow, and Crop Rotation only increase how much food a farm holds before it runs out (175, 250, 375, and 550). The gain is wood: reseeding costs 60 wood every time, so a farm with Crop Rotation costs only 109 wood per 1,000 food gathered instead of 343 wood with no upgrades.",
    },
    {
      q: "When does Wheelbarrow pay for itself?",
      a: "Wheelbarrow costs 175 food and 50 wood (225 total resources) and takes 75 seconds (the time to create 3 villagers). With 14-16 farmers, the +12% farming efficiency boost generates an extra ~35-40 food per minute, paying off the investment in under 4 minutes while providing faster walking and carrying capacity across your entire economy.",
    },
    {
      q: "Where do these numbers come from?",
      a: "Unit costs and training times, and technology costs and effects, are the Definitive Edition game values. Gather rates are the villager work rates from the game data. Farm rates are measured DE rates that include walking to the drop-off point, because a farmer's raw work rate does not reflect what they actually deliver.",
    },
  ],
  es: [
    {
      q: "¿Cuántos aldeanos en oro necesito para arqueros continuos con Etíopes en Feudal?",
      a: "Un Arquero cuesta 25 de madera y 45 de oro cada 35 segundos, lo que supone un consumo de 77,14 de oro por minuto por Galería de Tiro. Un minero de oro estándar o etíope recoge 22,8 de oro por minuto (sin Minería de Oro), así que necesitas 4 mineros de oro (3,38 exactos) por Galería, o 7 mineros (6,77 exactos) para jugar a 2 Galerías. Con la tecnología de Minería de Oro (26,22 oro/min), la cifra baja a 3 mineros para 1 Galería y 6 mineros para 2 Galerías. Además, ¡los etíopes reciben +100 de comida y +100 de oro al subir a Feudal, lo que paga los primeros 2 arqueros al instante o cubre más de 1 minuto de producción!",
    },
    {
      q: "¿Cuántos aldeanos necesito para que un Centro Urbano no pare de sacar aldeanos?",
      a: "Un aldeano cuesta 50 de comida y tarda 25 segundos, así que un Centro Urbano consume 120 de comida por minuto. Con granjas y Carretilla (22,8 comida/min por granjero) son 6 granjeros (5,26 exactos), de ahí viene la regla clásica de 'seis granjas por Centro Urbano'. Para un boom de 3 Centros Urbanos en Castillos, necesitas 16-18 granjeros (360 comida/min) más 3-4 leñadores dedicados únicamente a pagar la madera para resembrar granjas.",
    },
    {
      q: "¿Cuánto oro necesita un Establo de Caballeros?",
      a: "Un Caballero cuesta 60 de comida y 75 de oro cada 30 segundos, así que un Establo consume 120 de comida y 150 de oro por minuto. Sin mejoras de minería un minero saca 22,8 de oro por minuto, así que necesitas 7 mineros por Establo. Para 2 Establos con jinetes sin parar necesitas 14 mineros y 12-14 granjeros. En cambio el Explorador cuesta 80 de comida y nada de oro: 160 de comida por minuto y cero mineros.",
    },
    {
      q: "¿Las mejoras de granja hacen que los granjeros recolecten más rápido?",
      a: "No. Collera, Arado Pesado y Rotación de Cultivos solo aumentan cuánta comida aguanta una granja antes de agotarse (175, 250, 375 y 550). La ganancia es de madera: resembrar cuesta 60 cada vez, así que una granja con Rotación cuesta 109 de madera por cada 1.000 de comida en vez de 343 sin mejoras.",
    },
    {
      q: "¿Cuándo se amortiza la Carretilla?",
      a: "La Carretilla cuesta 175 de comida y 50 de madera (225 recursos en total) y tarda 75 segundos (el tiempo de 3 aldeanos). Con 14-16 granjas, la mejora del +12% de eficiencia en granjas genera ~35-40 de comida extra por minuto, amortizándose en menos de 4 minutos y mejorando la velocidad y capacidad de carga en toda tu economía.",
    },
    {
      q: "¿De dónde salen estos números?",
      a: "Los costes y tiempos de creación de unidades, y los costes y efectos de las mejoras, son los valores de Definitive Edition. Las tasas de recolección son las tasas de trabajo del aldeano en los datos del juego. Las tasas de granja son medidas de DE que incluyen el camino hasta el punto de descarga, porque la tasa bruta de un granjero no refleja lo que entrega de verdad.",
    },
  ],
};

export default function EcoPage({ params }: { params: { locale: string } }) {
  if (!isValidLocale(params.locale)) notFound();
  const locale = params.locale;
  const isEs = locale === "es";
  const faq = isEs ? FAQ.es : FAQ.en;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: isEs ? "Calculadora de Economía y Macro AoE2" : "AoE2 Economy & Villager Macro Calculator",
          description: isEs
            ? "Calcula con rigor matemático los aldeanos exactos en comida, madera y oro para producir sin parar en Age of Empires II. Tasas reales de Definitive Edition, coste de resembrar granjas y bonos de civilización."
            : "Calculate exact villagers required on food, wood, and gold to sustain continuous military production in Age of Empires II. Definitive Edition gather rates, farm reseeding math, and civ bonuses.",
          url: `https://aoe2.ai/${locale}/eco`,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }}
      />

      {/* Header */}
      <header className="max-w-4xl mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-aoe-accent/10 border border-aoe-accent/30 text-aoe-accent text-xs font-semibold uppercase tracking-wider mb-3">
          <Calculator className="w-3.5 h-3.5" />
          {isEs ? "Motor de Macroeconomía y Tasas Reales DE" : "Definitive Edition Macro & Gather Rate Engine"}
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medieval font-bold text-white mb-4">
          {isEs ? "Calculadora de Economía y Macro" : "Economy & Macro Calculator"}
        </h1>
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-3xl mb-6">
          {isEs
            ? "Dime qué unidades estás produciendo y qué civilización juegas: la calculadora y el Agente de IA calculan los aldeanos exactos en comida, madera y oro para que tus colas de producción no se detengan nunca. Todos los cálculos usan tasas reales medidas de Definitive Edition y costes de resembrado de granjas."
            : "Plan your production and civ setup: the calculator and AI Agent compute the exact villager distribution on food, wood, and gold so your production queues never stall. Powered by measured Definitive Edition gather rates, true farm reseeding costs, and civilization modifiers."}
        </p>

        {/* Feature Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-aoe-card/70 border border-aoe-border flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
            <span className="text-gray-200">{isEs ? "Tasas Reales DE" : "Measured DE Rates"}</span>
          </div>
          <div className="p-3 rounded-xl bg-aoe-card/70 border border-aoe-border flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-gray-200">{isEs ? "Coste Real Granjas" : "True Farm Reseed Math"}</span>
          </div>
          <div className="p-3 rounded-xl bg-aoe-card/70 border border-aoe-border flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="text-gray-200">{isEs ? "Todas las Civs (45+)" : "All 45+ Civ Bonuses"}</span>
          </div>
          <div className="p-3 rounded-xl bg-aoe-card/70 border border-aoe-border flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="text-gray-200">{isEs ? "Conexión con Agente IA" : "Connected AI Agent"}</span>
          </div>
        </div>
      </header>

      {/* Visual Interactive Planner */}
      <EcoMathCalculator locale={locale} />

      {/* AI Connected Agent Section */}
      <section className="mt-14">
        <AssistantPanel
          surface="eco"
          locale={isEs ? "es" : "en"}
          title={isEs ? "Asistente de Macroeconomía y Aldeanos IA" : "AI Economy & Villager Macro Coach"}
          placeholder={isEs
            ? "Pregunta por cualquier civ, edad o ejército (ej: ¿Cuántos aldeanos en oro necesito para arqueros con Etíopes en Feudal?)..."
            : "Ask about any civ, age, or army (e.g., How many villagers on gold for constant archers as Ethiopians in Feudal?)..."}
          initialPrompt={isEs
            ? "Calcula exactamente cuántos aldeanos necesito en comida, madera y oro para producir constantemente unidades militares en mi civilización y edad actual."
            : "Calculate the exact villager distribution on food, wood, and gold to sustain continuous military production for my civ and current age."}
          initialPromptLabel={isEs ? "Calcular Macro con IA" : "Compute Macro with AI"}
          initialPromptDescription={isEs
            ? "Pregúntale al Agente de IA para calcular la asignación exacta de aldeanos considerando bonos de civilización, mejoras económicas y costes de resembrar granjas."
            : "Ask the AI Agent to compute exact villager allocations taking into account civ bonuses, eco techs, and farm reseeding wood costs."}
          suggestions={isEs
            ? [
                "¿Cuántos aldeanos en oro necesito para arqueros continuos con Etíopes en Feudal?",
                "¿Cuántas granjas necesito para mantener 3 Centros Urbanos y 2 Establos de Caballeros con Francos?",
                "¿Cuánto tarda en amortizarse la Carretilla con 25 aldeanos?",
                "Comparar la tasa de madera entre Celtas con Hacha de Doble Filo y civs genéricas",
              ]
            : [
                "How many villagers on gold do I need for constant archers as Ethiopians in Feudal?",
                "How many farms do I need for 3 TCs and 2 Stables of Knights as Franks?",
                "How long does Wheelbarrow take to break even with 25 villagers?",
                "Compare wood gather rate between Celts with Double-Bit Axe and generic civs",
              ]}
        />
      </section>

      {/* Frequently Asked Questions */}
      <section className="mt-14 max-w-4xl">
        <h2 className="text-2xl font-medieval font-bold text-white mb-6 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          {isEs ? "Preguntas Frecuentes sobre Economía y Aldeanos" : "Frequently Asked Macro & Economy Questions"}
        </h2>
        <div className="space-y-3">
          {faq.map((item, i) => (
            <details
              key={i}
              className="group rounded-xl border border-aoe-border bg-aoe-card/50 px-5 py-4"
            >
              <summary className="cursor-pointer list-none flex items-center justify-between gap-3 font-semibold text-white">
                {item.q}
                <ChevronRight className="w-4 h-4 text-gray-500 shrink-0 transition-transform group-open:rotate-90" />
              </summary>
              <p className="text-sm text-gray-300 leading-relaxed mt-3">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Cross-Link Discovery Hub */}
      <section className="mt-12 pt-8 border-t border-aoe-border flex flex-wrap gap-3">
        <Link href={`/${locale}/counters`} className="btn-secondary text-sm">
          {isEs ? "Calculadora de counters" : "Counter calculator"}
        </Link>
        <Link href={`/${locale}/guides/fast-castle-guide`} className="btn-secondary text-sm">
          {isEs ? "Guía de Fast Castle" : "Fast Castle Guide"}
        </Link>
        <Link href={`/${locale}/learn`} className="btn-secondary text-sm">
          {isEs ? "Órdenes de construcción" : "Build orders"}
        </Link>
        <Link href={`/${locale}/matchups`} className="btn-secondary text-sm">
          {isEs ? "Enfrentamientos de Civilizaciones" : "Civilization Matchups"}
        </Link>
        <Link href={`/${locale}/agent`} className="btn-secondary text-sm">
          {isEs ? "Consultar al Agente IA General" : "Ask General AI Agent"}
        </Link>
      </section>
    </div>
  );
}
