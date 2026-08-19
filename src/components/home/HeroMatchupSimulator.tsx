"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Swords,
  Shield,
  Zap,
  ArrowRight,
  ArrowLeftRight,
  Sparkles,
  Trophy,
  Flame,
  ChevronRight,
} from "lucide-react";
import {
  CIV_DATA,
  POPULAR_MATCHUPS,
  getCivMatchupData,
  buildMatchupSlug,
} from "@/lib/aoe2/matchups";
import { cn } from "@/lib/utils";

interface HeroMatchupSimulatorProps {
  locale: string;
}

const FEATURED_CIV_KEYS = Object.keys(CIV_DATA);

export default function HeroMatchupSimulator({ locale }: HeroMatchupSimulatorProps) {
  const isEs = locale === "es";

  const [civ1, setCiv1] = useState<string>("franks");
  const [civ2, setCiv2] = useState<string>("britons");

  const matchupData = useMemo(() => {
    return getCivMatchupData(civ1, civ2);
  }, [civ1, civ2]);

  const swapCivs = () => {
    const temp = civ1;
    setCiv1(civ2);
    setCiv2(temp);
  };

  const applyPreset = (c1: string, c2: string) => {
    setCiv1(c1);
    setCiv2(c2);
  };

  if (!matchupData) return null;

  const {
    civ1: c1Info,
    civ2: c2Info,
    earlyGameDynamics,
    castleAgeSpikes,
    lateGameImperial,
    countersCiv1VsCiv2,
    strategicGamePlanCiv1,
  } = matchupData;

  const slug = buildMatchupSlug(civ1, civ2);

  return (
    <div className="w-full max-w-4xl mx-auto my-8 relative">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-aoe-accent/10 via-amber-500/5 to-aoe-accent/10 rounded-3xl blur-2xl pointer-events-none -z-10" />

      {/* Main Glassmorphism Card */}
      <div className="rounded-2xl border border-aoe-accent/40 bg-gradient-to-br from-slate-900/95 via-aoe-card/90 to-slate-950/95 p-5 sm:p-7 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between gap-3 mb-5 pb-3 border-b border-aoe-border/70 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-aoe-accent/20 border border-aoe-accent/40 flex items-center justify-center">
              <Zap className="w-4 h-4 text-aoe-accent" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-aoe-accent flex items-center gap-1.5">
                {isEs ? "Simulador Táctico Interactivo" : "Live Matchup Simulator"}
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-green-500/20 text-green-400 border border-green-500/30 font-mono">
                  INSTANT
                </span>
              </span>
            </div>
          </div>

          {/* Quick Presets Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-gray-400 hidden sm:inline mr-1">
              {isEs ? "Populares:" : "Presets:"}
            </span>
            {POPULAR_MATCHUPS.slice(0, 3).map((p) => {
              const active = (civ1 === p.civ1 && civ2 === p.civ2) || (civ1 === p.civ2 && civ2 === p.civ1);
              return (
                <button
                  key={p.slug}
                  onClick={() => applyPreset(p.civ1, p.civ2)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[11px] font-medium transition-all",
                    active
                      ? "bg-aoe-accent text-aoe-dark font-bold shadow-md"
                      : "bg-aoe-dark/80 text-gray-300 border border-aoe-border hover:border-aoe-accent/50 hover:text-white"
                  )}
                >
                  {CIV_DATA[p.civ1]?.name || p.civ1} vs {CIV_DATA[p.civ2]?.name || p.civ2}
                </button>
              );
            })}
          </div>
        </div>

        {/* Civ Selectors Dual Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 sm:gap-4 items-center mb-6">
          {/* Civ 1 Selector */}
          <div className="rounded-xl bg-slate-900/90 border border-aoe-accent/30 p-3.5 sm:p-4 transition-all focus-within:border-aoe-accent">
            <div className="text-[10px] uppercase font-bold text-aoe-accent tracking-wider mb-1 flex items-center justify-between">
              <span>{isEs ? "Tu Civilización" : "Your Civ"}</span>
              <span className="text-gray-400 font-normal capitalize">({c1Info.archetype})</span>
            </div>
            <select
              value={civ1}
              onChange={(e) => setCiv1(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700/80 rounded-lg px-3 py-2 text-base font-bold text-white focus:border-aoe-accent focus:outline-none cursor-pointer"
            >
              {FEATURED_CIV_KEYS.map((key) => (
                <option key={`c1-${key}`} value={key}>
                  {CIV_DATA[key].name}
                </option>
              ))}
            </select>
            <div className="text-xs text-gray-400 mt-2 truncate">
              ⭐ {c1Info.uniqueUnits[0] || "Unique Unit"} &bull; {c1Info.powerSpike}
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <button
              onClick={swapCivs}
              className="w-10 h-10 rounded-full bg-aoe-card border border-aoe-border hover:border-aoe-accent text-gray-300 hover:text-white flex items-center justify-center transition-all hover:scale-110 shadow-lg"
              title={isEs ? "Intercambiar civilizaciones" : "Swap civilizations"}
            >
              <ArrowLeftRight className="w-4 h-4 text-aoe-accent" />
            </button>
          </div>

          {/* Civ 2 Selector */}
          <div className="rounded-xl bg-slate-900/90 border border-slate-700/80 p-3.5 sm:p-4 transition-all focus-within:border-amber-400">
            <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider mb-1 flex items-center justify-between">
              <span>{isEs ? "Civilización Rival" : "Opponent Civ"}</span>
              <span className="text-gray-400 font-normal capitalize">({c2Info.archetype})</span>
            </div>
            <select
              value={civ2}
              onChange={(e) => setCiv2(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700/80 rounded-lg px-3 py-2 text-base font-bold text-white focus:border-amber-400 focus:outline-none cursor-pointer"
            >
              {FEATURED_CIV_KEYS.map((key) => (
                <option key={`c2-${key}`} value={key}>
                  {CIV_DATA[key].name}
                </option>
              ))}
            </select>
            <div className="text-xs text-gray-400 mt-2 truncate">
              ⭐ {c2Info.uniqueUnits[0] || "Unique Unit"} &bull; {c2Info.powerSpike}
            </div>
          </div>
        </div>

        {/* Live Power Spikes Timeline (Feudal -> Castle -> Imperial) */}
        <div className="rounded-xl bg-aoe-dark/80 border border-aoe-border/70 p-4 mb-5 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              {isEs ? "Ventaja Relativa por Edades" : "Relative Age Advantage"}
            </span>
            <span className="text-[11px] text-gray-400 font-normal">
              {c1Info.name} <span className="text-aoe-accent font-bold">vs</span> {c2Info.name}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            {/* Feudal */}
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">
                {isEs ? "Feudal (Apertura)" : "Feudal Age"}
              </div>
              <div
                className={cn(
                  "font-bold text-xs sm:text-sm truncate",
                  earlyGameDynamics.favored === "civ1"
                    ? "text-green-400"
                    : earlyGameDynamics.favored === "civ2"
                    ? "text-red-400"
                    : "text-amber-300"
                )}
              >
                {earlyGameDynamics.favored === "civ1"
                  ? `${c1Info.name} Advantage`
                  : earlyGameDynamics.favored === "civ2"
                  ? `${c2Info.name} Advantage`
                  : isEs
                  ? "Equilibrado"
                  : "Balanced Tempo"}
              </div>
            </div>

            {/* Castle */}
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">
                {isEs ? "Castillos (Spike)" : "Castle Age"}
              </div>
              <div
                className={cn(
                  "font-bold text-xs sm:text-sm truncate",
                  castleAgeSpikes.favored === "civ1"
                    ? "text-green-400"
                    : castleAgeSpikes.favored === "civ2"
                    ? "text-red-400"
                    : "text-amber-300"
                )}
              >
                {castleAgeSpikes.favored === "civ1"
                  ? `${c1Info.name} Power Spike`
                  : castleAgeSpikes.favored === "civ2"
                  ? `${c2Info.name} Power Spike`
                  : isEs
                  ? "Poder Similar"
                  : "Even Trading"}
              </div>
            </div>

            {/* Imperial */}
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">
                {isEs ? "Imperial (Late)" : "Imperial Age"}
              </div>
              <div
                className={cn(
                  "font-bold text-xs sm:text-sm truncate",
                  lateGameImperial.favored === "civ1"
                    ? "text-green-400"
                    : lateGameImperial.favored === "civ2"
                    ? "text-red-400"
                    : "text-amber-300"
                )}
              >
                {lateGameImperial.favored === "civ1"
                  ? `${c1Info.name} Late Game`
                  : lateGameImperial.favored === "civ2"
                  ? `${c2Info.name} Late Game`
                  : isEs
                  ? "Guerra de Basura"
                  : "Trash War"}
              </div>
            </div>
          </div>
        </div>

        {/* Tactical Takeaway & Key Counter Badge */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {/* Opening Plan */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            <div className="text-[10px] font-bold text-green-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              {isEs ? "Apertura Sugerida:" : "Recommended Opening:"}
            </div>
            <p className="text-gray-200 leading-relaxed">
              {isEs ? strategicGamePlanCiv1.opening.es : strategicGamePlanCiv1.opening.en}
            </p>
          </div>

          {/* Key Counter Option */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            <div className="text-[10px] font-bold text-aoe-accent uppercase tracking-wider mb-1 flex items-center gap-1">
              <Swords className="w-3 h-3" />
              {isEs ? "Counter Clave:" : "Key Counter Weapon:"}
            </div>
            <p className="text-gray-200 leading-relaxed font-semibold">
              ⚔️ {countersCiv1VsCiv2.units[0]?.name || "Specialized Counter"}:{" "}
              <span className="font-normal text-gray-300">
                {isEs ? countersCiv1VsCiv2.units[0]?.why.es : countersCiv1VsCiv2.units[0]?.why.en}
              </span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-aoe-border/50">
          <Link
            href={`/${locale}/matchups/${slug}`}
            className="btn-primary w-full sm:w-auto text-xs !px-5 !py-2.5 inline-flex items-center justify-center gap-2 font-bold shadow-lg"
          >
            <span>{isEs ? `Ver Guía Completa ${c1Info.name} vs ${c2Info.name}` : `Full ${c1Info.name} vs ${c2Info.name} Guide`}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <Link
            href={`/${locale}/agent`}
            className="btn-secondary w-full sm:w-auto text-xs !px-4 !py-2.5 inline-flex items-center justify-center gap-1.5 text-gray-300 hover:text-white"
          >
            <Sparkles className="w-3.5 h-3.5 text-aoe-accent" />
            <span>{isEs ? "Simular con Agente IA" : "Simulate with AI Agent"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
