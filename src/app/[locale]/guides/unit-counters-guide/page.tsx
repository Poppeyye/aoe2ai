import type { Metadata } from "next";
import Link from "next/link";
import {
  Shield, Swords, Target, Trophy, Clock,
  CheckCircle2, AlertTriangle, ArrowRight, Sparkles, BookOpen,
  Zap, HelpCircle, Users, Hammer,
} from "lucide-react";
import JsonLd from "@/components/seo/JsonLd";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isEs = locale === "es";
  const title = isEs
    ? "Guía de Counters AoE2 DE — Tabla de Contraataques y Tácticas | AoE2.ai"
    : "AoE2 Unit Counters Guide & Cheatsheet — Rock-Paper-Scissors Explained | AoE2.ai";
  const description = isEs
    ? "Tabla completa de counters para Age of Empires II: Definitive Edition. Aprende cómo contrarrestar jinetes, arqueros, infantería, armas de asedio, monjes y unidades únicas."
    : "Comprehensive AoE2 DE counter matrix & cheatsheet. Learn how to counter knights, archers, infantry, siege engines, monks, and civilization unique units.";

  return {
    title,
    description,
    alternates: {
      canonical: `https://aoe2.ai/${locale}/guides/unit-counters-guide`,
      languages: {
        en: "https://aoe2.ai/en/guides/unit-counters-guide",
        es: "https://aoe2.ai/es/guides/unit-counters-guide",
        "x-default": "https://aoe2.ai/en/guides/unit-counters-guide",
      },
    },
    openGraph: {
      title,
      description,
      url: `https://aoe2.ai/${locale}/guides/unit-counters-guide`,
      type: "article",
    },
  };
}

export default function UnitCountersGuidePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const isEs = locale === "es";

  const faqs = [
    {
      q: isEs ? "¿Qué unidad contrarresta a los Caballeros (Knights) en AoE2?" : "What is the best counter to Knights in AoE2?",
      a: isEs
        ? "El counter más eficiente en coste son los Piqueros / Alabarderos (Pikemen / Halberdiers) por su daño extra masivo contra caballería. Los Camellos (Camels) son la mejor opción móvil para perseguirlos por el mapa, y los Monjes (Monks) son devastadores en números reducidos antes de que investiguen Fe."
        : "The most cost-effective counter is the Pikeman / Halberdier line due to massive bonus attack against cavalry. Heavy Camels provide the best mobile answer to hunt them down, and Monks with Sanctity can convert expensive knights effortlessly in early Castle Age.",
    },
    {
      q: isEs ? "¿Cómo se destruye una masa de 30+ Ballesteros o Arqueros a Caballo?" : "How do you defeat a mass of 30+ Crossbowmen or Cavalry Archers?",
      a: isEs
        ? "Los Guerrilleros de Élite (Elite Skirmishers) absorben sus flechas con alta armadura antiproyectil y causan daño bonus. Las Mangonelas / Onagros pueden borrar el grupo entero de un solo impacto si no están dispersos, y los Jinetes con Armadura de Malla (+2) pueden rodearlos y masacrarlos en campo abierto."
        : "Elite Skirmishers absorb arrow fire with high pierce armor and inflict heavy bonus damage. Mangonels/Onagers can annihilate tightly clumped masses in a single shot, while +2 armor Knights flank to eliminate them in open terrain.",
    },
    {
      q: isEs ? "¿Qué es el Triángulo de Unidades Basura (Trash Units)?" : "What is the Trash Unit Triangle in AoE2?",
      a: isEs
        ? "Las unidades 'basura' son las que no cuestan oro (Piqueros, Guerrilleros y Caballería Ligera). Siguen una regla estricta de piedra-papel-tijera: Los Piqueros vencen a la Caballería Ligera; la Caballería Ligera vence a los Guerrilleros; y los Guerrilleros vencen a los Piqueros."
        : "Trash units are zero-gold units (Pikemen, Skirmishers, and Light Cavalry). They form a strict rock-paper-scissors dynamic: Pikemen beat Light Cavalry; Light Cavalry beats Skirmishers; and Skirmishers beat Pikemen.",
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
          {isEs ? "Guía de Counters de Unidades" : "Unit Counters Guide"}
        </span>
      </nav>

      {/* Hero Header */}
      <div className="card border-aoe-accent/40 bg-gradient-to-br from-aoe-accent/10 via-aoe-card to-aoe-dark p-6 sm:p-8 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-3">
          <Shield className="w-3.5 h-3.5" />
          {isEs ? "Manual Táctico de Combate" : "Combat Tactics Handbook"}
        </div>
        <h1 className="text-3xl sm:text-4xl font-medieval font-bold gold-gradient mb-3">
          {isEs ? "Guía y Tabla de Counters en Age of Empires II" : "The Definitive AoE2 Unit Counter Matrix & Guide"}
        </h1>
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
          {isEs
            ? "El combate en Age of Empires II está regido por un sofisticado sistema de bonificaciones de ataque y armaduras. Conocer qué unidad vence a cuál te permite ganar batallas con ejércitos numéricamente inferiores y menor gasto de recursos."
            : "Combat in Age of Empires II is governed by hidden attack bonuses, damage classes, and armor ratings. Understanding exact unit counters enables you to crush enemy armies with half the resources."}
        </p>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-aoe-accent" />
            {isEs ? "9 min de lectura" : "9 min read"}
          </span>
          <span className="flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-yellow-500" />
            {isEs ? "Incluye mecánicas de daño bonus de Definitive Edition" : "Includes DE damage bonus mechanics"}
          </span>
        </div>
      </div>

      {/* The Trash Triangle Infographic */}
      <div className="card mb-8 border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-transparent">
        <h2 className="section-title flex items-center gap-2 mb-3">
          <Zap className="w-5 h-5 text-yellow-500" />
          {isEs ? "El Triángulo de Unidades Basura (Sin Coste de Oro)" : "The Zero-Gold Trash Unit Triangle"}
        </h2>
        <p className="text-xs sm:text-sm text-gray-300 mb-4">
          {isEs
            ? "En el juego tardío (Imperial tardío) cuando el oro se agota en el mapa, dominar este triángulo es el factor decisivo entre la victoria y la derrota:"
            : "In late Imperial age when gold veins run dry, mastering this triangle is the primary determinant of victory:"}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-xl bg-aoe-dark border border-green-500/30">
            <div className="text-sm font-bold text-green-400 mb-1">
              🛡️ {isEs ? "Piqueros / Alabarderos" : "Pikemen / Halberdiers"}
            </div>
            <div className="text-xs text-gray-400 mb-2">35 {isEs ? "Comida" : "Food"} · 25 {isEs ? "Madera" : "Wood"}</div>
            <div className="text-xs font-semibold text-white bg-green-500/10 py-1 rounded">
              {isEs ? "Vence a: Caballería Ligera / Húsares" : "Beats: Light Cav / Hussar"}
            </div>
            <div className="text-[11px] text-red-400 mt-1">
              {isEs ? "Pierde contra: Guerrilleros" : "Loses to: Skirmishers"}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-aoe-dark border border-amber-500/30">
            <div className="text-sm font-bold text-amber-400 mb-1">
              🏹 {isEs ? "Guerrilleros de Élite" : "Elite Skirmishers"}
            </div>
            <div className="text-xs text-gray-400 mb-2">25 {isEs ? "Comida" : "Food"} · 35 {isEs ? "Madera" : "Wood"}</div>
            <div className="text-xs font-semibold text-white bg-amber-500/10 py-1 rounded">
              {isEs ? "Vence a: Piqueros y Arqueros" : "Beats: Pikemen & Archers"}
            </div>
            <div className="text-[11px] text-red-400 mt-1">
              {isEs ? "Pierde contra: Caballería Ligera" : "Loses to: Light Cav"}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-aoe-dark border border-blue-500/30">
            <div className="text-sm font-bold text-blue-400 mb-1">
              🐎 {isEs ? "Caballería Ligera / Húsar" : "Light Cavalry / Hussar"}
            </div>
            <div className="text-xs text-gray-400 mb-2">80 {isEs ? "Comida" : "Food"} · 0 {isEs ? "Madera" : "Wood"}</div>
            <div className="text-xs font-semibold text-white bg-blue-500/10 py-1 rounded">
              {isEs ? "Vence a: Guerrilleros, Monjes, Asedio" : "Beats: Skirmishers, Monks, Siege"}
            </div>
            <div className="text-[11px] text-red-400 mt-1">
              {isEs ? "Pierde contra: Piqueros" : "Loses to: Pikemen"}
            </div>
          </div>
        </div>
      </div>

      {/* Main Army Unit Counter Breakdown */}
      <div className="space-y-6 mb-10">
        <h2 className="section-title flex items-center gap-2">
          <Swords className="w-5 h-5 text-aoe-accent" />
          {isEs ? "Matriz Completa de Contraataques por Tipo de Unidad" : "Full Counter Matrix by Unit Class"}
        </h2>

        {/* Cavalry Counters */}
        <div className="card p-5">
          <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs">Cavalry</span>
            {isEs ? "Cómo Contrarrestar a la Caballería Pesada (Jinetes, Paladines)" : "How to Counter Heavy Cavalry (Knights, Paladins)"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 text-xs">
            <div className="p-3 bg-aoe-dark rounded-lg">
              <div className="font-bold text-green-400 mb-1">{isEs ? "1. Alabarderos" : "1. Halberdiers"}</div>
              <p className="text-gray-300">{isEs ? "+32 de daño bonus contra caballería. Muy baratos y fáciles de masificar." : "+32 bonus damage vs cavalry. Ultra cheap and easy to mass."}</p>
            </div>
            <div className="p-3 bg-aoe-dark rounded-lg">
              <div className="font-bold text-blue-400 mb-1">{isEs ? "2. Camellos Pesados" : "2. Heavy Camels"}</div>
              <p className="text-gray-300">{isEs ? "Tienen velocidad para interceptar raids y causan daño bonus masivo." : "Mobile counter capable of hunting knights anywhere on the map."}</p>
            </div>
            <div className="p-3 bg-aoe-dark rounded-lg">
              <div className="font-bold text-purple-400 mb-1">{isEs ? "3. Monjes con Santidad" : "3. Monks with Sanctity"}</div>
              <p className="text-gray-300">{isEs ? "Convierten a los jinetes enemigos desde 9 casillas de distancia." : "Converts individual knights safely from 9 tiles of range."}</p>
            </div>
          </div>
        </div>

        {/* Archer Counters */}
        <div className="card p-5">
          <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-xs">Archers</span>
            {isEs ? "Cómo Contrarrestar a los Arqueros y Ballesteros" : "How to Counter Foot Archers (Crossbows, Arbalesters)"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 text-xs">
            <div className="p-3 bg-aoe-dark rounded-lg">
              <div className="font-bold text-amber-400 mb-1">{isEs ? "1. Guerrilleros de Élite" : "1. Elite Skirmishers"}</div>
              <p className="text-gray-300">{isEs ? "+4 de armadura antiproyectil y daño bonus contra arqueros." : "+4 pierce armor base and heavy bonus attack vs archers."}</p>
            </div>
            <div className="p-3 bg-aoe-dark rounded-lg">
              <div className="font-bold text-red-400 mb-1">{isEs ? "2. Mangonelas / Onagros" : "2. Mangonels / Onagers"}</div>
              <p className="text-gray-300">{isEs ? "Daño de área devastador. Borran 15+ arqueros con un solo disparo." : "Devastating splash damage. Deletes 15+ archers in one direct hit."}</p>
            </div>
            <div className="p-3 bg-aoe-dark rounded-lg">
              <div className="font-bold text-green-400 mb-1">{isEs ? "3. Jinetes con Armadura +2" : "3. +2 Armor Knights"}</div>
              <p className="text-gray-300">{isEs ? "Solo reciben 1-2 de daño por flecha y despedazan arqueros aislados." : "Take only 1-2 damage per arrow, quickly shredding archer lines."}</p>
            </div>
          </div>
        </div>

        {/* Siege Counters */}
        <div className="card p-5">
          <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-xs">Siege</span>
            {isEs ? "Cómo Contrarrestar las Armas de Asedio (Mangonelas, Escorpiones, Arietes)" : "How to Counter Siege Engines"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 text-xs">
            <div className="p-3 bg-aoe-dark rounded-lg">
              <div className="font-bold text-yellow-400 mb-1">{isEs ? "1. Caballería Ligera" : "1. Light Cavalry"}</div>
              <p className="text-gray-300">{isEs ? "Inmunes a conversiones y con velocidad para rodear y destruir mangonelas." : "Speedy and immune to conversions; destroys siege before it fires."}</p>
            </div>
            <div className="p-3 bg-aoe-dark rounded-lg">
              <div className="font-bold text-blue-400 mb-1">{isEs ? "2. Bombardas / Artillería" : "2. Bombard Cannons"}</div>
              <p className="text-gray-300">{isEs ? "12 de rango para snipear onagros y cañones enemigos con precisión." : "12-14 range to snipe opposing onagers and trebuchets safely."}</p>
            </div>
            <div className="p-3 bg-aoe-dark rounded-lg">
              <div className="font-bold text-purple-400 mb-1">{isEs ? "3. Águilas / Infantería Rápida" : "3. Eagle Warriors / Woads"}</div>
              <p className="text-gray-300">{isEs ? "Esquivan proyectiles de asedio gracias a su alta velocidad de movimiento." : "Ultra fast movement speed allows them to dodge shots and surround siege."}</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="card mb-10">
        <h2 className="section-title flex items-center gap-2 mb-4">
          <HelpCircle className="w-5 h-5 text-aoe-accent" />
          {isEs ? "Preguntas Frecuentes sobre Combate y Counters" : "Combat & Counter FAQ"}
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

      {/* CTA to Interactive Counter Calculator */}
      <div className="card border-aoe-accent/40 bg-gradient-to-r from-aoe-accent/10 via-aoe-card to-aoe-dark p-6 text-center">
        <h2 className="text-lg font-bold text-white mb-2 flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-aoe-accent" />
          {isEs ? "Calcula el contraataque exacto para tu partida en vivo" : "Calculate the exact counter army for your active game"}
        </h2>
        <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto mb-4">
          {isEs
            ? "Introduce el número exacto de unidades enemigas y descubre el counter perfecto junto con los aldeanos necesarios en comida, madera y oro."
            : "Input the exact enemy army composition to calculate the ideal counter units and required villager economy balance."}
        </p>
        <Link
          href={`/${locale}/counters`}
          className="btn-primary inline-flex items-center gap-2 text-sm"
        >
          <Shield className="w-4 h-4" />
          {isEs ? "Abrir Calculadora de Counters y Macro" : "Open Counter & Macro Calculator"}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
