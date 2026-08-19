"use client";

import { useState } from "react";
import { Zap, Shield, Swords, Target, AlertTriangle, Trophy, Copy, Check, User } from "lucide-react";
import type { TacticalBriefing } from "@/lib/scout/opponent";
import { PlaystyleBadge } from "@/components/scout/OpponentExtras";

interface TacticalBriefingCardProps {
  briefing: TacticalBriefing;
  locale: "en" | "es";
  opponentName: string;
  opponentCiv?: string | null;
  currentMap?: string | null;
}

export default function TacticalBriefingCard({
  briefing,
  locale,
  opponentName,
  opponentCiv,
  currentMap,
}: TacticalBriefingCardProps) {
  const [copied, setCopied] = useState(false);

  const copyBriefing = () => {
    const text = locale === "es"
      ? `⚡ **Ficha Táctica Rápida (30s) — vs ${opponentName}${opponentCiv ? ` (${opponentCiv})` : ""}${currentMap ? ` en ${currentMap}` : ""}**\n\n` +
        `👤 **Perfil**: ${briefing.playerProfile.headline.es} — ${briefing.playerProfile.detail.es}\n\n` +
        `⚔️ **Matchup**: ${briefing.matchupAdvantage.headline.es} — ${briefing.matchupAdvantage.detail.es}\n\n` +
        `🎯 **Plan de Juego (3 Pasos)**:\n` +
        `1. ${briefing.threeStepPlan.step1Opening.title.es}: ${briefing.threeStepPlan.step1Opening.detail.es}\n` +
        `2. ${briefing.threeStepPlan.step2Warning.title.es}: ${briefing.threeStepPlan.step2Warning.detail.es}\n` +
        `3. ${briefing.threeStepPlan.step3WinCondition.title.es}: ${briefing.threeStepPlan.step3WinCondition.detail.es}\n\n` +
        `Generado en https://aoe2.ai`
      : `⚡ **30-Second Tactical Briefing — vs ${opponentName}${opponentCiv ? ` (${opponentCiv})` : ""}${currentMap ? ` on ${currentMap}` : ""}**\n\n` +
        `👤 **Profile**: ${briefing.playerProfile.headline.en} — ${briefing.playerProfile.detail.en}\n\n` +
        `⚔️ **Matchup**: ${briefing.matchupAdvantage.headline.en} — ${briefing.matchupAdvantage.detail.en}\n\n` +
        `🎯 **3-Step Game Plan**:\n` +
        `1. ${briefing.threeStepPlan.step1Opening.title.en}: ${briefing.threeStepPlan.step1Opening.detail.en}\n` +
        `2. ${briefing.threeStepPlan.step2Warning.title.en}: ${briefing.threeStepPlan.step2Warning.detail.en}\n` +
        `3. ${briefing.threeStepPlan.step3WinCondition.title.en}: ${briefing.threeStepPlan.step3WinCondition.detail.en}\n\n` +
        `Generated at https://aoe2.ai`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="rounded-xl border border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-slate-900/90 to-slate-900/95 p-5 shadow-xl relative overflow-hidden">
      {/* Top Banner */}
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap pb-3 border-b border-amber-500/20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
            <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-medieval font-bold gold-gradient">
                {locale === "es" ? "Ficha Táctica Rápida (30s)" : "30-Second Tactical Briefing"}
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                LIVE COACH
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {locale === "es"
                ? "Plan de acción instantáneo para aplicar durante la pantalla de carga"
                : "Instant game plan ready for the loading screen"}
            </p>
            {(opponentCiv || currentMap) && (
              <p className="text-xs text-slate-300 mt-0.5">
                <span className="text-slate-500">vs </span>
                <span className="font-semibold text-slate-200">{opponentName}</span>
                {opponentCiv && <span className="text-amber-300/90"> · {opponentCiv}</span>}
                {currentMap && <span className="text-slate-400"> · {currentMap}</span>}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={copyBriefing}
          className="btn-secondary text-xs !px-3 !py-1.5 flex items-center gap-1.5 border-amber-500/30 hover:border-amber-400"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
          {copied
            ? (locale === "es" ? "¡Ficha copiada!" : "Briefing copied!")
            : (locale === "es" ? "Copiar ficha táctica" : "Copy briefing")}
        </button>
      </div>

      {!briefing.hasHistory && (
        <div className="flex items-start gap-2 mb-3 rounded-lg border border-slate-600/50 bg-slate-800/50 px-3 py-2 text-xs text-slate-300">
          <AlertTriangle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span>
            {locale === "es"
              ? "No hay historial de partidas para este jugador ahora mismo, así que el plan es genérico y no está adaptado a su estilo."
              : "No match history available for this player right now, so this plan is generic rather than tailored to their style."}
          </span>
        </div>
      )}

      {/* Grid of Profile & Matchup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {/* Opponent Profile */}
        <div className="rounded-lg bg-slate-800/60 border border-slate-700/60 p-3.5">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
              <User className="w-3.5 h-3.5 text-amber-400" />
              {locale === "es" ? "Perfil del Rival" : "Opponent Profile"}
            </span>
            {briefing.playerProfile.tag && (
              <PlaystyleBadge tag={briefing.playerProfile.tag as any} locale={locale} />
            )}
          </div>
          <h4 className="text-sm font-semibold text-white mb-1">
            {locale === "es" ? briefing.playerProfile.headline.es : briefing.playerProfile.headline.en}
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {locale === "es" ? briefing.playerProfile.detail.es : briefing.playerProfile.detail.en}
          </p>
        </div>

        {/* Matchup advantage */}
        <div className="rounded-lg bg-slate-800/60 border border-slate-700/60 p-3.5">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider mb-1.5">
            <Swords className="w-3.5 h-3.5 text-amber-400" />
            {locale === "es" ? "Dinámica de Matchup" : "Matchup Dynamics"}
          </span>
          <h4 className="text-sm font-semibold text-white mb-1">
            {locale === "es" ? briefing.matchupAdvantage.headline.es : briefing.matchupAdvantage.headline.en}
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {locale === "es" ? briefing.matchupAdvantage.detail.es : briefing.matchupAdvantage.detail.en}
          </p>
        </div>
      </div>

      {/* 3-Step Action Plan */}
      <div className="rounded-lg bg-slate-900/80 border border-amber-500/20 p-3.5">
        <div className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Target className="w-4 h-4 text-amber-400" />
          {locale === "es" ? "Plan de Juego en 3 Pasos" : "Actionable 3-Step Game Plan"}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Step 1 */}
          <div className="bg-slate-800/70 border border-slate-700/50 rounded-md p-3">
            <div className="text-[11px] font-bold text-green-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              {locale === "es" ? briefing.threeStepPlan.step1Opening.title.es : briefing.threeStepPlan.step1Opening.title.en}
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {locale === "es" ? briefing.threeStepPlan.step1Opening.detail.es : briefing.threeStepPlan.step1Opening.detail.en}
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-800/70 border border-slate-700/50 rounded-md p-3">
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {locale === "es" ? briefing.threeStepPlan.step2Warning.title.es : briefing.threeStepPlan.step2Warning.title.en}
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {locale === "es" ? briefing.threeStepPlan.step2Warning.detail.es : briefing.threeStepPlan.step2Warning.detail.en}
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-800/70 border border-slate-700/50 rounded-md p-3">
            <div className="text-[11px] font-bold text-blue-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              {locale === "es" ? briefing.threeStepPlan.step3WinCondition.title.es : briefing.threeStepPlan.step3WinCondition.title.en}
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {locale === "es" ? briefing.threeStepPlan.step3WinCondition.detail.es : briefing.threeStepPlan.step3WinCondition.detail.en}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
