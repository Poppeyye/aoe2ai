"use client";

import { useState, useMemo } from "react";
import {
  Calculator,
  Users,
  TrendingUp,
  Award,
  Zap,
  Sparkles,
  Info,
  Check,
  Clock,
  ArrowRight,
  Shield,
  Layers,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import {
  GATHERING_RATES,
  ECO_UPGRADES,
  CIV_ECO_BONUSES,
  calculateVillagersForTarget,
  type GatheringRate,
  type EcoUpgradeInfo,
} from "@/lib/aoe2/eco-math";
import { cn } from "@/lib/utils";

interface EcoMathCalculatorProps {
  locale: string;
}

export default function EcoMathCalculator({ locale }: EcoMathCalculatorProps) {
  const isEs = locale === "es";

  const [activeTab, setActiveTab] = useState<"balancer" | "rates" | "upgrades" | "civs">("balancer");

  // Macro target state
  const [tcCount, setTcCount] = useState(2);
  const [stablesCount, setStablesCount] = useState(1);
  const [crossbowCount, setCrossbowCount] = useState(0);
  const [skirmCount, setSkirmCount] = useState(0);
  const [halbCount, setHalbCount] = useState(0);
  const [siegeCount, setSiegeCount] = useState(0);

  // Upgrades active
  const [hasDoubleBitAxe, setHasDoubleBitAxe] = useState(true);
  const [hasWheelbarrow, setHasWheelbarrow] = useState(true);
  const [hasBowSaw, setHasBowSaw] = useState(false);
  const [hasGoldMining, setHasGoldMining] = useState(false);

  // Resource filter for rates tab
  const [resourceFilter, setResourceFilter] = useState<"all" | "food" | "wood" | "gold" | "stone">("all");

  const calculation = useMemo(() => {
    return calculateVillagersForTarget({
      tcCount,
      stablesCount,
      rangesCrossbowCount: crossbowCount,
      rangesSkirmCount: skirmCount,
      barracksHalbCount: halbCount,
      siegeWorkshopCount: siegeCount,
      hasWheelbarrow,
      hasDoubleBitAxe,
      hasBowSaw,
      hasGoldMining,
    });
  }, [
    tcCount,
    stablesCount,
    crossbowCount,
    skirmCount,
    halbCount,
    siegeCount,
    hasWheelbarrow,
    hasDoubleBitAxe,
    hasBowSaw,
    hasGoldMining,
  ]);

  const resetPresets = (presetType: "1tc_scouts" | "2tc_knights" | "3tc_boom" | "2range_xbow") => {
    if (presetType === "1tc_scouts") {
      setTcCount(1);
      setStablesCount(1);
      setCrossbowCount(0);
      setSkirmCount(0);
      setHalbCount(0);
      setSiegeCount(0);
      setHasWheelbarrow(false);
      setHasDoubleBitAxe(true);
      setHasBowSaw(false);
      setHasGoldMining(false);
    } else if (presetType === "2tc_knights") {
      setTcCount(2);
      setStablesCount(2);
      setCrossbowCount(0);
      setSkirmCount(0);
      setHalbCount(0);
      setSiegeCount(0);
      setHasWheelbarrow(true);
      setHasDoubleBitAxe(true);
      setHasBowSaw(true);
      setHasGoldMining(true);
    } else if (presetType === "3tc_boom") {
      setTcCount(3);
      setStablesCount(0);
      setCrossbowCount(0);
      setSkirmCount(0);
      setHalbCount(0);
      setSiegeCount(0);
      setHasWheelbarrow(true);
      setHasDoubleBitAxe(true);
      setHasBowSaw(true);
      setHasGoldMining(false);
    } else if (presetType === "2range_xbow") {
      setTcCount(1);
      setStablesCount(0);
      setCrossbowCount(2);
      setSkirmCount(0);
      setHalbCount(0);
      setSiegeCount(1);
      setHasWheelbarrow(true);
      setHasDoubleBitAxe(true);
      setHasBowSaw(false);
      setHasGoldMining(true);
    }
  };

  const filteredRates = useMemo(() => {
    if (resourceFilter === "all") return GATHERING_RATES;
    return GATHERING_RATES.filter((r) => r.resource === resourceFilter);
  }, [resourceFilter]);

  return (
    <div className="card !p-6 border-aoe-accent/40 bg-gradient-to-br from-slate-900/95 via-aoe-card to-slate-950/95 relative overflow-hidden shadow-2xl">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-aoe-accent/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-aoe-border/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-aoe-accent/20 text-aoe-accent border border-aoe-accent/30 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5" />
              {isEs ? "Motor de Matemáticas & Macro" : "AoE2 Economy & Math Engine"}
            </span>
          </div>
          <h2 className="text-2xl font-medieval font-bold gold-gradient">
            {isEs ? "Eficiencia Económica & Balance de Aldeanos" : "Economy Efficiency & Macro Balancer"}
          </h2>
          <p className="text-xs text-gray-400">
            {isEs
              ? "Calcula exactamente cuántos aldeanos necesitas en comida, madera y oro para no parar la producción."
              : "Calculate exact villager counts on food, wood, and gold to sustain non-stop production."}
          </p>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1 bg-aoe-dark p-1 rounded-xl border border-aoe-border shrink-0 flex-wrap">
          {[
            { id: "balancer", label: isEs ? "Calculadora Macro" : "Macro Balancer", icon: Users },
            { id: "rates", label: isEs ? "Tasas de Recolección" : "Gathering Rates", icon: TrendingUp },
            { id: "upgrades", label: isEs ? "Retorno Mejoras (ROI)" : "Tech ROI & Payoff", icon: Clock },
            { id: "civs", label: isEs ? "Bonuses de Civs" : "Civ Eco Bonuses", icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all",
                  activeTab === tab.id
                    ? "bg-aoe-accent text-aoe-dark shadow-md"
                    : "text-gray-400 hover:text-white"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: MACRO TARGET BALANCER */}
      {activeTab === "balancer" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Quick Presets */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">
              {isEs ? "Presets Típicos:" : "Quick Setups:"}
            </span>
            <button
              onClick={() => resetPresets("1tc_scouts")}
              className="px-2.5 py-1 rounded-lg bg-aoe-dark border border-aoe-border hover:border-aoe-accent text-xs text-gray-300 hover:text-white transition-colors"
            >
              1 TC + 1 Establo Scouts (Feudal)
            </button>
            <button
              onClick={() => resetPresets("2tc_knights")}
              className="px-2.5 py-1 rounded-lg bg-aoe-dark border border-aoe-border hover:border-aoe-accent text-xs text-gray-300 hover:text-white transition-colors"
            >
              2 TCs + 2 Establos Caballeros (Castillos)
            </button>
            <button
              onClick={() => resetPresets("2range_xbow")}
              className="px-2.5 py-1 rounded-lg bg-aoe-dark border border-aoe-border hover:border-aoe-accent text-xs text-gray-300 hover:text-white transition-colors"
            >
              1 TC + 2 Galerías Ballestas + Mangonela
            </button>
            <button
              onClick={() => resetPresets("3tc_boom")}
              className="px-2.5 py-1 rounded-lg bg-aoe-dark border border-aoe-border hover:border-aoe-accent text-xs text-gray-300 hover:text-white transition-colors"
            >
              3 TCs Pure Boom (Eco pura)
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Controls */}
            <div className="lg:col-span-6 space-y-4">
              <div className="card !p-4 bg-slate-900/90 border-slate-700/80 space-y-3.5">
                <div className="text-xs font-bold uppercase text-aoe-accent tracking-wider flex items-center justify-between">
                  <span>{isEs ? "1. Edificios de Producción Activos" : "1. Active Production Queues"}</span>
                  <span className="text-gray-400 font-normal">{isEs ? "Cola sin parar" : "100% uptime"}</span>
                </div>

                {/* Town Centers */}
                <div className="flex items-center justify-between text-xs py-1">
                  <div>
                    <span className="font-semibold text-white block">🏛️ {isEs ? "Centros Urbanos (Aldeanos)" : "Town Centers (Villagers)"}</span>
                    <span className="text-[10px] text-gray-500">{isEs ? "50C cada 25s = 120 comida/min" : "50F every 25s = 120 food/min"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTcCount((c) => Math.max(c - 1, 0))}
                      className="w-6 h-6 rounded bg-slate-800 text-gray-300 hover:bg-slate-700 flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-bold text-white tabular-nums">{tcCount}</span>
                    <button
                      onClick={() => setTcCount((c) => Math.min(c + 1, 5))}
                      className="w-6 h-6 rounded bg-slate-800 text-gray-300 hover:bg-slate-700 flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Stables Knights */}
                <div className="flex items-center justify-between text-xs py-1 border-t border-slate-800">
                  <div>
                    <span className="font-semibold text-white block">🐎 {isEs ? "Establos (Caballeros)" : "Stables (Knights)"}</span>
                    <span className="text-[10px] text-gray-500">{isEs ? "60C, 75O cada 30s" : "60F, 75G every 30s"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setStablesCount((c) => Math.max(c - 1, 0))}
                      className="w-6 h-6 rounded bg-slate-800 text-gray-300 hover:bg-slate-700 flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-bold text-white tabular-nums">{stablesCount}</span>
                    <button
                      onClick={() => setStablesCount((c) => Math.min(c + 1, 5))}
                      className="w-6 h-6 rounded bg-slate-800 text-gray-300 hover:bg-slate-700 flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Archery Ranges Crossbows */}
                <div className="flex items-center justify-between text-xs py-1 border-t border-slate-800">
                  <div>
                    <span className="font-semibold text-white block">🏹 {isEs ? "Galerías (Ballesteros)" : "Archery Ranges (Crossbows)"}</span>
                    <span className="text-[10px] text-gray-500">{isEs ? "25M, 45O cada 27s" : "25W, 45G every 27s"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCrossbowCount((c) => Math.max(c - 1, 0))}
                      className="w-6 h-6 rounded bg-slate-800 text-gray-300 hover:bg-slate-700 flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-bold text-white tabular-nums">{crossbowCount}</span>
                    <button
                      onClick={() => setCrossbowCount((c) => Math.min(c + 1, 5))}
                      className="w-6 h-6 rounded bg-slate-800 text-gray-300 hover:bg-slate-700 flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Archery Ranges Skirmishers */}
                <div className="flex items-center justify-between text-xs py-1 border-t border-slate-800">
                  <div>
                    <span className="font-semibold text-white block">🛡️ {isEs ? "Galerías (Guerrilleros)" : "Archery Ranges (Skirmishers)"}</span>
                    <span className="text-[10px] text-gray-500">{isEs ? "25C, 35M cada 22s" : "25F, 35W every 22s"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSkirmCount((c) => Math.max(c - 1, 0))}
                      className="w-6 h-6 rounded bg-slate-800 text-gray-300 hover:bg-slate-700 flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-bold text-white tabular-nums">{skirmCount}</span>
                    <button
                      onClick={() => setSkirmCount((c) => Math.min(c + 1, 5))}
                      className="w-6 h-6 rounded bg-slate-800 text-gray-300 hover:bg-slate-700 flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Barracks Halberdiers */}
                <div className="flex items-center justify-between text-xs py-1 border-t border-slate-800">
                  <div>
                    <span className="font-semibold text-white block">🗡️ {isEs ? "Cuarteles (Piqueros / Alabarderos)" : "Barracks (Pikes / Halbs)"}</span>
                    <span className="text-[10px] text-gray-500">{isEs ? "35C, 25M cada 22s" : "35F, 25W every 22s"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setHalbCount((c) => Math.max(c - 1, 0))}
                      className="w-6 h-6 rounded bg-slate-800 text-gray-300 hover:bg-slate-700 flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-bold text-white tabular-nums">{halbCount}</span>
                    <button
                      onClick={() => setHalbCount((c) => Math.min(c + 1, 5))}
                      className="w-6 h-6 rounded bg-slate-800 text-gray-300 hover:bg-slate-700 flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Siege Workshop */}
                <div className="flex items-center justify-between text-xs py-1 border-t border-slate-800">
                  <div>
                    <span className="font-semibold text-white block">💥 {isEs ? "Talleres de Asedio (Mangonelas)" : "Siege Workshops (Mangonels)"}</span>
                    <span className="text-[10px] text-gray-500">{isEs ? "160M, 135O cada 46s" : "160W, 135G every 46s"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSiegeCount((c) => Math.max(c - 1, 0))}
                      className="w-6 h-6 rounded bg-slate-800 text-gray-300 hover:bg-slate-700 flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-bold text-white tabular-nums">{siegeCount}</span>
                    <button
                      onClick={() => setSiegeCount((c) => Math.min(c + 1, 3))}
                      className="w-6 h-6 rounded bg-slate-800 text-gray-300 hover:bg-slate-700 flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Eco Upgrades Toggle */}
              <div className="card !p-4 bg-slate-900/90 border-slate-700/80 space-y-2.5">
                <div className="text-xs font-bold uppercase text-gray-300 tracking-wider mb-2">
                  {isEs ? "2. Mejoras Económicas Activas:" : "2. Researched Eco Technologies:"}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setHasDoubleBitAxe(!hasDoubleBitAxe)}
                    className={cn(
                      "p-2 rounded-lg border text-xs text-left transition-all",
                      hasDoubleBitAxe
                        ? "bg-green-500/20 border-green-500/50 text-green-300 font-bold"
                        : "bg-slate-800 border-slate-700 text-gray-500"
                    )}
                  >
                    🪓 Hacha Doble (+20% M)
                  </button>

                  <button
                    onClick={() => setHasWheelbarrow(!hasWheelbarrow)}
                    className={cn(
                      "p-2 rounded-lg border text-xs text-left transition-all",
                      hasWheelbarrow
                        ? "bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold"
                        : "bg-slate-800 border-slate-700 text-gray-500"
                    )}
                  >
                    🛒 Carretilla (+13% Granja)
                  </button>

                  <button
                    onClick={() => setHasBowSaw(!hasBowSaw)}
                    className={cn(
                      "p-2 rounded-lg border text-xs text-left transition-all",
                      hasBowSaw
                        ? "bg-green-500/20 border-green-500/50 text-green-300 font-bold"
                        : "bg-slate-800 border-slate-700 text-gray-500"
                    )}
                  >
                    🪚 Tronzador (+44% M)
                  </button>

                  <button
                    onClick={() => setHasGoldMining(!hasGoldMining)}
                    className={cn(
                      "p-2 rounded-lg border text-xs text-left transition-all",
                      hasGoldMining
                        ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-300 font-bold"
                        : "bg-slate-800 border-slate-700 text-gray-500"
                    )}
                  >
                    🪙 Minería Oro (+15% O)
                  </button>
                </div>
              </div>
            </div>

            {/* Output: Exact Villagers Balance Card */}
            <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
              <div className="card !p-6 bg-gradient-to-br from-aoe-accent/10 via-aoe-card to-slate-950 border-aoe-accent/50 space-y-5 shadow-xl">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-aoe-accent mb-1">
                    {isEs ? "DISTRIBUCIÓN ÓPTIMA DE MACRO" : "REQUIRED MACRO ALLOCATION"}
                  </div>
                  <h3 className="text-xl font-bold text-white font-medieval">
                    {isEs ? "Aldeanos Necesarios para Producción Continua" : "Villagers for 100% Production Uptime"}
                  </h3>
                  <p className="text-xs text-gray-300 mt-1">
                    {isEs
                      ? "Con esta asignación nunca te quedarás sin recursos para encolar unidades."
                      : "With this villager balance, your production queues will never starve."}
                  </p>
                </div>

                {/* 4 Stat Boxes */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Food */}
                  <div className="bg-aoe-dark/90 p-3.5 rounded-xl border border-amber-500/30 text-center">
                    <div className="text-xs text-amber-400 font-bold uppercase mb-0.5">🌾 {isEs ? "Granjas (Comida)" : "Farms (Food)"}</div>
                    <div className="text-3xl font-bold text-white tabular-nums">{calculation.foodVills}</div>
                    <div className="text-[11px] text-gray-400 font-mono mt-0.5">{calculation.foodDemand} {isEs ? "comida/min" : "food/min"}</div>
                  </div>

                  {/* Wood */}
                  <div className="bg-aoe-dark/90 p-3.5 rounded-xl border border-green-500/30 text-center">
                    <div className="text-xs text-green-400 font-bold uppercase mb-0.5">🌲 {isEs ? "Leñadores (Madera)" : "Lumberjacks (Wood)"}</div>
                    <div className="text-3xl font-bold text-white tabular-nums">{calculation.woodVills}</div>
                    <div className="text-[11px] text-gray-400 font-mono mt-0.5">{calculation.woodDemand} {isEs ? "madera/min" : "wood/min"}</div>
                  </div>

                  {/* Gold */}
                  <div className="bg-aoe-dark/90 p-3.5 rounded-xl border border-yellow-500/30 text-center">
                    <div className="text-xs text-yellow-400 font-bold uppercase mb-0.5">🪙 {isEs ? "Mineros (Oro)" : "Miners (Gold)"}</div>
                    <div className="text-3xl font-bold text-white tabular-nums">{calculation.goldVills}</div>
                    <div className="text-[11px] text-gray-400 font-mono mt-0.5">{calculation.goldDemand} {isEs ? "oro/min" : "gold/min"}</div>
                  </div>

                  {/* Total Eco */}
                  <div className="bg-aoe-dark/90 p-3.5 rounded-xl border border-aoe-accent/50 text-center flex flex-col justify-center">
                    <div className="text-xs text-aoe-accent font-bold uppercase mb-0.5">👥 {isEs ? "Total Población Eco" : "Total Eco Population"}</div>
                    <div className="text-3xl font-bold text-aoe-accent tabular-nums">{calculation.totalVills}</div>
                    <div className="text-[11px] text-gray-400 font-mono mt-0.5">{isEs ? "aldeanos activos" : "active gatherers"}</div>
                  </div>
                </div>

                {/* Golden Rule advice */}
                <div className="p-3.5 rounded-lg bg-aoe-dark/80 border border-aoe-border text-xs text-gray-300 leading-relaxed">
                  💡 <strong>{isEs ? "Regla de Oro en 1v1:" : "Pro Ladder Rule:"}</strong>{" "}
                  {isEs
                    ? `Cada Centro Urbano requiere 6 granjas fijas para crear aldeanos sin parar. Si estás sacando Caballeros de 2 establos, necesitas 12 granjas + 14 en oro adicionales (un total de ~32 aldeanos solo para sostener esa producción).`
                    : `Every Town Center needs 6 dedicated farms for continuous villager creation. Pumping Knights from 2 Stables requires another 12 farms + 14 miners (a baseline of ~32 villagers just to maintain production).`}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GATHERING RATES BENCHMARKS */}
      {activeTab === "rates" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-xs text-gray-400">
              {isEs
                ? "Tasa real de recursos recolectados por aldeano por minuto (datos oficiales de DE):"
                : "Real resource gather rates per villager per minute (official DE data):"}
            </p>

            <div className="flex gap-1.5">
              {(["all", "food", "wood", "gold", "stone"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setResourceFilter(r)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-semibold uppercase transition-colors",
                    resourceFilter === r
                      ? "bg-aoe-accent text-aoe-dark font-bold"
                      : "bg-aoe-dark text-gray-400 hover:text-white border border-aoe-border"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredRates.map((item) => (
              <div
                key={item.sourceId}
                className="p-3.5 rounded-xl bg-aoe-dark border border-aoe-border hover:border-aoe-accent/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-white text-sm">
                      {isEs ? item.name.es : item.name.en}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-bold font-mono px-2 py-0.5 rounded",
                        item.resource === "food"
                          ? "bg-amber-500/20 text-amber-300"
                          : item.resource === "wood"
                          ? "bg-green-500/20 text-green-300"
                          : item.resource === "gold"
                          ? "bg-yellow-500/20 text-yellow-300"
                          : "bg-slate-700 text-gray-300"
                      )}
                    >
                      {item.ratePerMin} / min
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {isEs ? item.notes.es : item.notes.en}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ECO UPGRADES ROI & PAYOFF TIMINGS */}
      {activeTab === "upgrades" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <p className="text-xs text-gray-400">
            {isEs
              ? "Cuándo investigar cada mejora económica y cuántos aldeanos libres equivale su rentabilidad:"
              : "When to research each economic technology and its exact villager output payoff:"}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ECO_UPGRADES.map((tech) => (
              <div
                key={tech.id}
                className="card !p-4 bg-slate-900/90 border-slate-700/80 flex flex-col justify-between hover:border-aoe-accent/50 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase text-aoe-accent px-2 py-0.5 rounded bg-aoe-accent/10 border border-aoe-accent/20">
                      {tech.age.toUpperCase()}
                    </span>
                    <span className="text-[11px] text-gray-500">{tech.researchTimeSec}s</span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1">
                    {isEs ? tech.name.es : tech.name.en}
                  </h3>
                  <div className="text-[11px] text-gray-400 mb-3">{tech.building}</div>

                  <div className="space-y-2 text-xs mb-4">
                    <div className="p-2 rounded bg-aoe-dark border border-aoe-border/50 text-gray-200">
                      <strong>{isEs ? "Efecto:" : "Effect:"}</strong> {isEs ? tech.effectDescription.es : tech.effectDescription.en}
                    </div>

                    <div className="p-2 rounded bg-green-500/10 border border-green-500/20 text-green-300 font-medium">
                      📈 {isEs ? tech.payoffMetric.es : tech.payoffMetric.en}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[11px] text-amber-300 leading-tight">
                  🎯 <strong>{isEs ? "Regla Óptima:" : "Timing Rule:"}</strong> {isEs ? tech.bestTimingRule.es : tech.bestTimingRule.en}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CIV ECO BONUSES */}
      {activeTab === "civs" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <p className="text-xs text-gray-400">
            {isEs
              ? "Las civilizaciones con las mejores bonificaciones económicas en el meta actual:"
              : "Civilizations with the most impactful economic bonuses in the current ranked meta:"}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CIV_ECO_BONUSES.map((civ) => (
              <div
                key={civ.civ}
                className="card !p-4 bg-slate-900/90 border-slate-700/80 hover:border-aoe-accent/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-base font-bold text-white">
                      👑 {isEs ? civ.name.es : civ.name.en}
                    </h3>
                    <span className="text-xs font-bold text-aoe-accent uppercase tracking-wider">
                      {civ.resourceImpact.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-amber-300 mb-2">
                    {isEs ? civ.bonusTitle.es : civ.bonusTitle.en}
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed">
                    {isEs ? civ.bonusFormula.es : civ.bonusFormula.en}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
