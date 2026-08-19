import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { isValidLocale } from "@/i18n/config";
import EcoMathCalculator from "@/components/eco/EcoMathCalculator";
import JsonLd from "@/components/seo/JsonLd";

const FAQ = {
  en: [
    {
      q: "How many villagers do I need to keep one Town Center making villagers?",
      a: "A villager costs 50 food and takes 25 seconds, so one Town Center drains 120 food per minute. On farms with Wheelbarrow (22.8 food/min per farmer) that is 6 farmers, which is where the classic 'six farms per Town Center' rule comes from.",
    },
    {
      q: "How much gold does one Stable of Knights need?",
      a: "A Knight costs 60 food and 75 gold every 30 seconds, so a single Stable drains 120 food and 150 gold per minute. With no mining upgrades a gold miner brings 22.8 gold per minute, so you need 7 miners per Stable. Scout Cavalry, by contrast, costs 80 food and no gold at all — 160 food per minute and zero miners.",
    },
    {
      q: "Do farm upgrades make farmers gather faster?",
      a: "No. Horse Collar, Heavy Plow and Crop Rotation only increase how much food a farm holds before it runs out (175, 250, 375 and 550). The gain is wood: reseeding costs 60 wood every time, so a farm with Crop Rotation costs 109 wood per 1,000 food gathered instead of 343 with no upgrades.",
    },
    {
      q: "Where do these numbers come from?",
      a: "Unit costs and training times, and technology costs and effects, are the Definitive Edition game values. Gather rates are the villager work rates from the game data. Farm rates are measured DE rates that include walking to the drop-off point, because a farmer's raw work rate does not reflect what they actually deliver.",
    },
  ],
  es: [
    {
      q: "¿Cuántos aldeanos necesito para que un Centro Urbano no pare de sacar aldeanos?",
      a: "Un aldeano cuesta 50 de comida y tarda 25 segundos, así que un Centro Urbano consume 120 de comida por minuto. Con granjas y Carretilla (22,8 comida/min por granjero) son 6 granjeros, de ahí viene la regla clásica de 'seis granjas por Centro Urbano'.",
    },
    {
      q: "¿Cuánto oro necesita un Establo de Caballeros?",
      a: "Un Caballero cuesta 60 de comida y 75 de oro cada 30 segundos, así que un Establo consume 120 de comida y 150 de oro por minuto. Sin mejoras de minería un minero saca 22,8 de oro por minuto, así que necesitas 7 mineros por Establo. En cambio el Explorador cuesta 80 de comida y nada de oro: 160 de comida por minuto y cero mineros.",
    },
    {
      q: "¿Las mejoras de granja hacen que los granjeros recolecten más rápido?",
      a: "No. Collera, Arado Pesado y Rotación de Cultivos solo aumentan cuánta comida aguanta una granja antes de agotarse (175, 250, 375 y 550). La ganancia es de madera: resembrar cuesta 60 cada vez, así que una granja con Rotación cuesta 109 de madera por cada 1.000 de comida en vez de 343 sin mejoras.",
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
          "@type": "FAQPage",
          mainEntity: faq.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }}
      />

      <header className="max-w-3xl mb-10">
        <h1 className="text-3xl sm:text-4xl font-medieval font-bold text-white mb-3">
          {isEs ? "Calculadora de economía" : "Economy calculator"}
        </h1>
        <p className="text-gray-400 leading-relaxed">
          {isEs
            ? "Dime qué estás produciendo y te digo cuántos aldeanos necesitas en cada recurso para que la cola no se pare nunca. Todos los costes, tiempos y tasas salen de los datos de Definitive Edition."
            : "Tell it what you are producing and it tells you how many villagers each resource needs so the queue never stalls. Every cost, training time and gather rate comes from Definitive Edition game data."}
        </p>
      </header>

      <EcoMathCalculator locale={locale} />

      <section className="mt-14 max-w-3xl">
        <h2 className="text-2xl font-medieval font-bold text-white mb-6">
          {isEs ? "Preguntas frecuentes" : "Frequently asked"}
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
              <p className="text-sm text-gray-400 leading-relaxed mt-3">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-12 pt-8 border-t border-aoe-border flex flex-wrap gap-3">
        <Link href={`/${locale}/counters`} className="btn-secondary text-sm">
          {isEs ? "Calculadora de counters" : "Counter calculator"}
        </Link>
        <Link href={`/${locale}/learn`} className="btn-secondary text-sm">
          {isEs ? "Órdenes de construcción" : "Build orders"}
        </Link>
        <Link href={`/${locale}/agent`} className="btn-secondary text-sm">
          {isEs ? "Preguntar al agente" : "Ask the AI agent"}
        </Link>
      </section>
    </div>
  );
}
