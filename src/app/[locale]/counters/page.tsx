"use client";

import { useState, useMemo } from "react";
import {
  Shield, Swords, Users, Target, Zap, Trophy, Copy, Check,
  Sparkles, Layers, ArrowRight, Hammer,
} from "lucide-react";
import { useLocale } from "@/i18n/I18nProvider";
import {
  UNITS_CATALOG,
  calculateCounterArmy,
  type GameAge,
} from "@/lib/aoe2/counters-engine";
import { CIV_NAMES } from "@/lib/aoe2/civs";
import JsonLd from "@/components/seo/JsonLd";
import Link from "next/link";

interface UnitSelection {
  unitId: string;
  quantity: number;
}

const COUNTER_FAQS = {
  en: [
    {
      q: "What counters Knights and heavy cavalry in AoE2?",
      a: "Pikemen and Halberdiers are the primary cost-effective counter with massive bonus damage. Camels match their mobility for chasing raids, and Monks with Sanctity can convert expensive knights from 9 range.",
    },
    {
      q: "What counters massed Crossbowmen and Archers?",
      a: "Elite Skirmishers have high pierce armor and inflict bonus damage against archers. Mangonels/Onagers eliminate clusters in single splash hits, and +2 armor Knights flank effectively in open fields.",
    },
    {
      q: "How many villagers do I need on resources to keep military buildings producing?",
      a: "For continuous 2-Stable Knight production, you need roughly 12-14 farmers and 14 gold miners. For 2-Range Crossbows, you need 8 lumberjacks and 14 gold miners. Use our macro calculator above for exact numbers.",
    },
    {
      q: "What is the zero-gold 'trash unit' counter triangle?",
      a: "Pikemen beat Light Cavalry / Hussar; Light Cavalry beats Skirmishers; and Skirmishers beat Pikemen.",
    },
  ],
  es: [
    {
      q: "¿Qué contrarresta a los Caballeros y caballería pesada en AoE2?",
      a: "Los Piqueros y Alabarderos son el counter más barato y eficiente gracias a su daño bonus masivo. Los Camellos igualan su velocidad para interceptar raids, y los Monjes con Santidad convierten jinetes a distancia.",
    },
    {
      q: "¿Qué vence a una masa de Ballesteros y Arqueros?",
      a: "Los Guerrilleros de Élite tienen alta armadura antiproyectil y daño bonus contra arqueros. Las Mangonelas u Onagros borran grupos compactos de un disparo, y los Jinetes con armadura +2 limpian en campo abierto.",
    },
    {
      q: "¿Cuántos aldeanos necesito en recursos para no parar la producción militar?",
      a: "Para producir jinetes sin pausa en 2 Establos necesitas unos 12-14 granjeros y 14 mineros de oro. Para 2 Galerías de Ballesteros necesitas 8 leñadores y 14 mineros. Nuestra calculadora arriba te da el desglose exacto.",
    },
    {
      q: "¿Cuál es el triángulo de counters de unidades 'basura' (sin oro)?",
      a: "Los Piqueros vencen a la Caballería Ligera / Húsar; la Caballería Ligera vence a los Guerrilleros; y los Guerrilleros vencen a los Piqueros.",
    },
  ],
};

const PRESETS = [
  {
    label: { en: "15 Knights + 10 Crossbowmen", es: "15 Caballeros + 10 Ballesteros" },
    units: [
      { unitId: "knights", quantity: 15 },
      { unitId: "archers", quantity: 10 },
    ],
    age: "castle" as GameAge,
  },
  {
    label: { en: "25 Massed Crossbowmen", es: "25 Ballesteros agrupados" },
    units: [{ unitId: "archers", quantity: 25 }],
    age: "castle" as GameAge,
  },
  {
    label: { en: "15 Fast Scouts / Light Cav", es: "15 Exploradores / Caballería Ligera" },
    units: [{ unitId: "scouts", quantity: 15 }],
    age: "feudal" as GameAge,
  },
  {
    label: { en: "20 Eagle Warriors + Monks", es: "20 Guerreros Águila + Monjes" },
    units: [
      { unitId: "eagles", quantity: 20 },
      { unitId: "monks", quantity: 4 },
    ],
    age: "castle" as GameAge,
  },
];

export default function CountersPage() {
  const locale = useLocale();
  const isEs = locale === "es";

  const [selectedAge, setSelectedAge] = useState<GameAge>("castle");
  const [selectedUnits, setSelectedUnits] = useState<UnitSelection[]>([
    { unitId: "knights", quantity: 12 },
    { unitId: "archers", quantity: 8 },
  ]);
  const [copied, setCopied] = useState(false);

  const recommendation = useMemo(() => {
    return calculateCounterArmy({
      enemyUnits: selectedUnits,
      gameAge: selectedAge,
    });
  }, [selectedUnits, selectedAge]);

  const addUnit = (unitId: string) => {
    setSelectedUnits((prev) => {
      const existing = prev.find((u) => u.unitId === unitId);
      if (existing) {
        return prev.map((u) =>
          u.unitId === unitId ? { ...u, quantity: u.quantity + 5 } : u,
        );
      }
      return [...prev, { unitId, quantity: 5 }];
    });
  };

  const removeUnit = (unitId: string) => {
    setSelectedUnits((prev) => {
      const existing = prev.find((u) => u.unitId === unitId);
      if (existing && existing.quantity > 5) {
        return prev.map((u) =>
          u.unitId === unitId ? { ...u, quantity: u.quantity - 5 } : u,
        );
      }
      return prev.filter((u) => u.unitId !== unitId);
    });
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setSelectedUnits(preset.units);
    setSelectedAge(preset.age);
  };

  const copyStrategy = () => {
    const text = isEs
      ? `🛡️ **Calculadora de Counters & Economía de AoE2.ai**\n\n` +
        `⚔️ **Composición Recomendada:**\n` +
        `• Principal: ${recommendation.primaryCounter.name.es}\n` +
        `• Secundario: ${recommendation.secondaryCounter.name.es}\n` +
        (recommendation.siegeSupport ? `• Asedio: ${recommendation.siegeSupport.name.es}\n` : "") +
        `\n🌾 **Aldeanos Necesarios (${recommendation.villagerEcoBalance.total} vills en total):**\n` +
        `• Granja (Alimento): ${recommendation.villagerEcoBalance.food} aldeanos\n` +
        `• Madera: ${recommendation.villagerEcoBalance.wood} aldeanos\n` +
        `• Oro: ${recommendation.villagerEcoBalance.gold} aldeanos\n\n` +
        `💡 ${recommendation.tacticalWhy.es}\n\nCalcula el tuyo en https://aoe2.ai/counters`
      : `🛡️ **AoE2.ai Counter & Economy Balancer**\n\n` +
        `⚔️ **Recommended Counter Army:**\n` +
        `• Primary: ${recommendation.primaryCounter.name.en}\n` +
        `• Secondary: ${recommendation.secondaryCounter.name.en}\n` +
        (recommendation.siegeSupport ? `• Siege Support: ${recommendation.siegeSupport.name.en}\n` : "") +
        `\n🌾 **Villagers Required (${recommendation.villagerEcoBalance.total} vills total):**\n` +
        `• Food (Farms): ${recommendation.villagerEcoBalance.food} vills\n` +
        `• Wood: ${recommendation.villagerEcoBalance.wood} vills\n` +
        `• Gold: ${recommendation.villagerEcoBalance.gold} vills\n\n` +
        `💡 ${recommendation.tacticalWhy.en}\n\nCalculate yours at https://aoe2.ai/counters`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const faqItems = isEs ? COUNTER_FAQS.es : COUNTER_FAQS.en;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: isEs ? "Calculadora de Counters y Economía AoE2" : "AoE2 Counter & Economy Balancer",
          description: isEs
            ? "Calcula en tiempo real la mejor composición de contraataque y el balance exacto de aldeanos en comida, madera y oro para ganar cualquier batalla."
            : "Calculate real-time counter armies and exact villager distribution on food, wood, and gold to sustain continuous military production.",
          url: `https://aoe2.ai/${locale}/counters`,
        }}
      />
      <JsonLd data={faqSchema} />

      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-aoe-accent/10 border border-aoe-accent/30 text-aoe-accent text-xs font-semibold uppercase tracking-wider mb-3">
          <Zap className="w-3.5 h-3.5" />
          {isEs ? "Calculadora Táctica & Macro Engine" : "Tactical Counter & Macro Engine"}
        </div>
        <h1 className="text-3xl sm:text-4xl font-medieval font-bold gold-gradient mb-3">
          {isEs ? "Calculadora de Counters y Balance de Aldeanos" : "Counter Calculator & Villager Balancer"}
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          {isEs
            ? "Introduce el ejército que tiene tu rival y la calculadora te dirá el contraataque perfecto y cuántos aldeanos necesitas en comida, madera y oro para no parar la producción."
            : "Enter your opponent's army composition to instantly calculate the ideal counter units and the exact villager balance required on food, wood, and gold."}
        </p>
      </div>

      {/* Preset Quick Picks */}
      <div className="card mb-8">
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {isEs ? "Ejércitos Enemigos Típicos:" : "Common Enemy Compositions:"}
          </span>
          <span className="text-xs text-aoe-accent">
            {isEs ? "Haz clic para cargar" : "Click to load preset"}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => applyPreset(p)}
              className="px-3 py-1.5 rounded-lg bg-aoe-dark border border-aoe-border hover:border-aoe-accent text-xs text-gray-200 transition-all font-medium"
            >
              {isEs ? p.label.es : p.label.en}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input selection */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card">
            <h2 className="section-title flex items-center gap-2 mb-4">
              <Swords className="w-5 h-5 text-red-400" />
              {isEs ? "1. Ejército Enemigo Detectado" : "1. Detected Enemy Army"}
            </h2>

            {/* Age selector */}
            <div className="flex gap-2 mb-4">
              {(["feudal", "castle", "imperial"] as const).map((age) => (
                <button
                  key={age}
                  onClick={() => setSelectedAge(age)}
                  className={`flex-1 py-1.5 rounded-md text-xs font-bold capitalize transition-all border ${
                    selectedAge === age
                      ? "bg-aoe-accent text-aoe-dark border-aoe-accent"
                      : "bg-aoe-dark text-gray-400 border-aoe-border hover:text-white"
                  }`}
                >
                  {age}
                </button>
              ))}
            </div>

            {/* Selected Units in Threat */}
            <div className="space-y-2 mb-4">
              {selectedUnits.map((item) => {
                const u = UNITS_CATALOG[item.unitId];
                if (!u) return null;
                return (
                  <div
                    key={item.unitId}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-aoe-dark border border-aoe-border text-sm"
                  >
                    <span className="font-semibold text-white">
                      {isEs ? u.name.es : u.name.en}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeUnit(item.unitId)}
                        className="w-7 h-7 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-bold tabular-nums text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => addUnit(item.unitId)}
                        className="w-7 h-7 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30 flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
              {selectedUnits.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-4">
                  {isEs ? "Añade unidades enemigas abajo" : "Add enemy units below"}
                </p>
              )}
            </div>

            {/* Add More Units Catalog */}
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                {isEs ? "Añadir Unidad Enemiga:" : "Add Enemy Unit:"}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(UNITS_CATALOG).map((u) => (
                  <button
                    key={u.id}
                    onClick={() => addUnit(u.id)}
                    className="px-2.5 py-1.5 rounded-md bg-aoe-dark/70 border border-aoe-border/60 hover:border-aoe-accent text-xs text-gray-300 text-left truncate transition-colors"
                  >
                    + {isEs ? u.name.es : u.name.en}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Calculated Counter & Economy Balance */}
        <div className="lg:col-span-7 space-y-6">
          {/* Counter Army Recommendation */}
          <div className="card border-aoe-accent/40 bg-gradient-to-br from-aoe-accent/10 via-aoe-card to-aoe-dark">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="section-title !mb-0 flex items-center gap-2">
                <Shield className="w-5 h-5 text-aoe-accent" />
                {isEs ? "2. Composición de Contraataque" : "2. Optimal Counter Army"}
              </h2>
              <button
                onClick={copyStrategy}
                className="btn-secondary text-xs !px-3 !py-1.5 flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? (isEs ? "Copiado" : "Copied") : (isEs ? "Copiar Estrategia" : "Copy Strategy")}
              </button>
            </div>

            {/* Unit Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl border border-green-500/40 bg-green-500/10 p-4">
                <div className="text-[10px] font-bold uppercase text-green-400 tracking-wider mb-1">
                  {isEs ? "⭐ Counter Primario" : "⭐ Primary Counter"}
                </div>
                <div className="text-base font-bold text-white mb-1">
                  {isEs ? recommendation.primaryCounter.name.es : recommendation.primaryCounter.name.en}
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {isEs ? recommendation.primaryCounter.description.es : recommendation.primaryCounter.description.en}
                </p>
              </div>

              <div className="rounded-xl border border-blue-500/40 bg-blue-500/10 p-4">
                <div className="text-[10px] font-bold uppercase text-blue-400 tracking-wider mb-1">
                  {isEs ? "🛡️ Soporte / Flanqueo" : "🛡️ Secondary Support"}
                </div>
                <div className="text-base font-bold text-white mb-1">
                  {isEs ? recommendation.secondaryCounter.name.es : recommendation.secondaryCounter.name.en}
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {isEs ? recommendation.secondaryCounter.description.es : recommendation.secondaryCounter.description.en}
                </p>
              </div>
            </div>

            {recommendation.siegeSupport && (
              <div className="rounded-lg border border-purple-500/30 bg-purple-500/10 p-3 mb-4 flex items-center justify-between text-xs">
                <span className="font-semibold text-purple-200">
                  🏰 {isEs ? "Asedio Recomendado:" : "Recommended Siege:"} {isEs ? recommendation.siegeSupport.name.es : recommendation.siegeSupport.name.en}
                </span>
                <span className="text-gray-400">{isEs ? "Control de área" : "Area control"}</span>
              </div>
            )}

            <div className="p-3.5 rounded-lg bg-aoe-dark/80 border border-aoe-border text-xs text-gray-200 leading-relaxed">
              💡 <strong>{isEs ? "Razonamiento Táctico:" : "Tactical Rationale:"}</strong>{" "}
              {isEs ? recommendation.tacticalWhy.es : recommendation.tacticalWhy.en}
            </div>
          </div>

          {/* Villager Eco Balancer Card */}
          <div className="card">
            <h2 className="section-title flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-aoe-accent" />
              {isEs ? "3. Balance de Aldeanos Necesario (Macro)" : "3. Required Villager Economy Balance"}
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              {isEs
                ? `Para mantener la producción continua de este ejército en 2 edificios sin quedarte sin recursos, necesitas:`
                : `To sustain continuous production of this counter army without supply blocks, assign:`}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="bg-aoe-dark p-3.5 rounded-xl border border-amber-500/30 text-center">
                <div className="text-xs text-amber-400 font-bold uppercase mb-1">🌾 {isEs ? "Alimento" : "Food"}</div>
                <div className="text-2xl font-bold text-white">{recommendation.villagerEcoBalance.food}</div>
                <div className="text-[10px] text-gray-500">{isEs ? "Granjas" : "Farms"}</div>
              </div>

              <div className="bg-aoe-dark p-3.5 rounded-xl border border-green-500/30 text-center">
                <div className="text-xs text-green-400 font-bold uppercase mb-1">🌲 {isEs ? "Madera" : "Wood"}</div>
                <div className="text-2xl font-bold text-white">{recommendation.villagerEcoBalance.wood}</div>
                <div className="text-[10px] text-gray-500">{isEs ? "Leñadores" : "Lumberjacks"}</div>
              </div>

              <div className="bg-aoe-dark p-3.5 rounded-xl border border-yellow-500/30 text-center">
                <div className="text-xs text-yellow-400 font-bold uppercase mb-1">🪙 {isEs ? "Oro" : "Gold"}</div>
                <div className="text-2xl font-bold text-white">{recommendation.villagerEcoBalance.gold}</div>
                <div className="text-[10px] text-gray-500">{isEs ? "Mineros" : "Miners"}</div>
              </div>

              <div className="bg-aoe-dark p-3.5 rounded-xl border border-aoe-accent/40 text-center">
                <div className="text-xs text-aoe-accent font-bold uppercase mb-1">👥 {isEs ? "Total Vills" : "Total Eco"}</div>
                <div className="text-2xl font-bold text-aoe-accent">{recommendation.villagerEcoBalance.total}</div>
                <div className="text-[10px] text-gray-500">{isEs ? "Aldeanos" : "Villagers"}</div>
              </div>
            </div>

            {/* Infrastructure & Techs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-lg bg-aoe-dark border border-aoe-border">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Hammer className="w-3.5 h-3.5 text-aoe-accent" />
                  {isEs ? "Edificios de Producción:" : "Production Buildings:"}
                </div>
                <div className="space-y-1">
                  {recommendation.recommendedBuildings.map((b) => (
                    <div key={b.name} className="flex items-center justify-between text-xs text-gray-200">
                      <span>{b.name}</span>
                      <span className="font-bold text-white px-2 py-0.5 rounded bg-aoe-card">
                        {b.count}×
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-aoe-dark border border-aoe-border">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                  {isEs ? "Tecnologías Clave:" : "Priority Techs:"}
                </div>
                <div className="space-y-1.5">
                  {recommendation.keyTechnologies.map((t) => (
                    <div key={t.name} className="text-xs">
                      <span className="font-semibold text-white">{t.name}</span>
                      <span className="text-gray-500 block text-[10px]">{t.where}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="card mt-10">
        <h2 className="section-title flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-aoe-accent" />
          {isEs ? "Preguntas Frecuentes sobre Counters y Combate" : "Counter & Combat FAQs"}
        </h2>
        <div className="space-y-3">
          {faqItems.map((item, i) => (
            <div key={i} className="p-4 rounded-lg bg-aoe-dark border border-aoe-border/60">
              <h3 className="text-sm font-semibold text-white mb-1.5 flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400 shrink-0" />
                {item.q}
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed pl-6">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cross links */}
      <div className="mt-8 pt-6 border-t border-aoe-border flex flex-wrap gap-3">
        <Link href={`/${locale}/guides/unit-counters-guide`} className="btn-secondary text-xs">
          {isEs ? "Guía Completa de Counters" : "Full Unit Counters Guide"}
        </Link>
        <Link href={`/${locale}/eco`} className="btn-secondary text-xs">
          {isEs ? "Calculadora de Economía" : "Economy Calculator"}
        </Link>
        <Link href={`/${locale}/matchups`} className="btn-secondary text-xs">
          {isEs ? "Enfrentamientos de Civilizaciones" : "Civilization Matchups"}
        </Link>
      </div>
    </div>
  );
}
