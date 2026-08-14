"use client";

import { useState, useRef } from "react";
import {
  Trophy, Shield, Swords, Share2, Download, Copy, Check, Crown, Flame, Target, MapPin, Sparkles,
} from "lucide-react";
import type { ScoutProfile, CivStat, PlaystyleTag } from "@/lib/scout/opponent";
import { PlaystyleBadge } from "@/components/scout/OpponentExtras";

interface ShareablePlayerCardProps {
  profile: ScoutProfile;
  civStats: CivStat[];
  playstyle: PlaystyleTag | null;
  locale: "en" | "es";
}

export default function ShareablePlayerCard({
  profile,
  civStats,
  playstyle,
  locale,
}: ShareablePlayerCardProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const total = profile.wins + profile.losses;
  const winRate = total > 0 ? ((profile.wins / total) * 100).toFixed(1) : "0";
  const topCivs = civStats.slice(0, 3);

  const shareText = locale === "es"
    ? `🛡️ **Ficha Táctica de AoE2.ai — ${profile.name}**\n` +
      `👑 ELO: **${profile.rating}** (#${profile.rank}) | Winrate: **${winRate}%** (${profile.wins}W / ${profile.losses}L)\n` +
      `⚔️ Estilo: **${playstyle || "Versátil"}**\n` +
      `🏰 Top Civs: ${topCivs.map((c) => `${c.civName} (${c.winRate}%)`).join(", ")}\n\n` +
      `Espía a cualquier rival en https://aoe2.ai/live?profileId=${profile.profileId}`
    : `🛡️ **AoE2.ai Tactical Scout Card — ${profile.name}**\n` +
      `👑 ELO: **${profile.rating}** (#${profile.rank}) | Winrate: **${winRate}%** (${profile.wins}W / ${profile.losses}L)\n` +
      `⚔️ Playstyle: **${playstyle || "Flexible"}**\n` +
      `🏰 Top Civs: ${topCivs.map((c) => `${c.civName} (${c.winRate}%)`).join(", ")}\n\n` +
      `Scout any opponent at https://aoe2.ai/live?profileId=${profile.profileId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadImage = () => {
    setDownloading(true);
    try {
      const canvas = document.createElement("canvas");
      const W = 600;
      const H = 340;
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, W, H);
      bgGrad.addColorStop(0, "#0e1a24");
      bgGrad.addColorStop(0.5, "#152433");
      bgGrad.addColorStop(1, "#0a131b");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Gold border
      ctx.strokeStyle = "#c8aa6e";
      ctx.lineWidth = 3;
      ctx.strokeRect(10, 10, W - 20, H - 20);

      ctx.strokeStyle = "#4a5d6e";
      ctx.lineWidth = 1;
      ctx.strokeRect(14, 14, W - 28, H - 28);

      // Header Tag
      ctx.fillStyle = "#c8aa6e";
      ctx.font = "bold 11px Inter, sans-serif";
      ctx.fillText("AOE2.AI TACTICAL SCOUT CARD", 30, 42);

      // Player Name
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 26px Cinzel, Georgia, serif";
      const nameStr = profile.clan ? `${profile.name} [${profile.clan}]` : profile.name;
      ctx.fillText(nameStr, 30, 80);

      // Country / Rank
      ctx.fillStyle = "#94a3b8";
      ctx.font = "12px Inter, sans-serif";
      const subInfo = [
        profile.country ? profile.country.toUpperCase() : null,
        `Rank #${profile.rank || "—"}`,
        `Peak: ${profile.highestRating || profile.rating}`,
      ].filter(Boolean).join("  •  ");
      ctx.fillText(subInfo, 30, 102);

      // Divider
      ctx.strokeStyle = "rgba(200, 170, 110, 0.3)";
      ctx.beginPath();
      ctx.moveTo(30, 118);
      ctx.lineTo(W - 30, 118);
      ctx.stroke();

      // Stats boxes
      const drawBox = (x: number, y: number, w: number, h: number, title: string, value: string, color: string) => {
        ctx.fillStyle = "rgba(10, 19, 27, 0.7)";
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = "rgba(200, 170, 110, 0.2)";
        ctx.strokeRect(x, y, w, h);

        ctx.fillStyle = "#64748b";
        ctx.font = "bold 9px Inter, sans-serif";
        ctx.fillText(title.toUpperCase(), x + 10, y + 18);

        ctx.fillStyle = color;
        ctx.font = "bold 18px Inter, sans-serif";
        ctx.fillText(value, x + 10, y + 42);
      };

      drawBox(30, 134, 120, 54, "1v1 ELO", String(profile.rating), "#c8aa6e");
      drawBox(162, 134, 120, 54, "Winrate", `${winRate}%`, "#4ade80");
      drawBox(294, 134, 120, 54, "Record", `${profile.wins}W / ${profile.losses}L`, "#ffffff");
      drawBox(426, 134, 144, 54, "Playstyle", playstyle ? playstyle.toUpperCase() : "FLEX", "#38bdf8");

      // Top Civs line
      ctx.fillStyle = "#c8aa6e";
      ctx.font = "bold 11px Inter, sans-serif";
      ctx.fillText(locale === "es" ? "TOP CIVILIZACIONES:" : "TOP CIVILIZATIONS:", 30, 222);

      let cx = 30;
      for (const civ of topCivs) {
        ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
        ctx.fillRect(cx, 234, 165, 42);
        ctx.strokeStyle = "rgba(148, 163, 184, 0.2)";
        ctx.strokeRect(cx, 234, 165, 42);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px Inter, sans-serif";
        ctx.fillText(civ.civName, cx + 10, 252);

        ctx.fillStyle = civ.winRate >= 50 ? "#4ade80" : "#f87171";
        ctx.font = "11px Inter, sans-serif";
        ctx.fillText(`${civ.winRate}% WR (${civ.games}g)`, cx + 10, 268);
        cx += 175;
      }

      // Footer brand
      ctx.fillStyle = "#64748b";
      ctx.font = "10px Inter, sans-serif";
      ctx.fillText("Generated on AoE2.ai — The AI Strategy & Scout Companion", 30, 312);

      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `aoe2ai-scout-${profile.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}.png`;
      a.click();
    } catch {
      // download fallback
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="card border-aoe-accent/40 bg-gradient-to-br from-aoe-accent/10 via-aoe-card to-aoe-dark p-5 relative overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-aoe-accent" />
          <span className="text-xs font-bold uppercase tracking-wider text-aoe-accent">
            {locale === "es" ? "Tarjeta Táctica de Jugador" : "Tactical Player Card"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="btn-secondary text-xs !px-3 !py-1.5 flex items-center gap-1.5"
            title={locale === "es" ? "Copiar al portapapeles" : "Copy to clipboard"}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied
              ? (locale === "es" ? "¡Copiado!" : "Copied!")
              : (locale === "es" ? "Copiar Ficha" : "Copy Card")}
          </button>
          <button
            onClick={handleDownloadImage}
            disabled={downloading}
            className="btn-secondary text-xs !px-3 !py-1.5 flex items-center gap-1.5 border-aoe-accent/40 text-aoe-accent hover:text-white"
          >
            <Download className="w-3.5 h-3.5" />
            {downloading
              ? (locale === "es" ? "Generando..." : "Generating...")
              : (locale === "es" ? "Descargar PNG" : "Download PNG")}
          </button>
        </div>
      </div>

      {/* Card Content Presentation */}
      <div className="rounded-xl border border-aoe-border/80 bg-aoe-dark/90 p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-2xl font-medieval font-bold gold-gradient">
                {profile.name}
              </h3>
              {profile.clan && (
                <span className="text-xs px-2 py-0.5 rounded bg-aoe-accent/15 text-aoe-accent font-semibold border border-aoe-accent/30">
                  [{profile.clan}]
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
              {profile.country && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-gray-500" />
                  {profile.country.toUpperCase()}
                </span>
              )}
              <span>Rank #{profile.rank || "—"}</span>
              <span>{locale === "es" ? "Pico" : "Peak"}: {profile.highestRating || profile.rating}</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold text-aoe-accent tabular-nums">{profile.rating}</div>
            <div className="text-[10px] uppercase text-gray-500 tracking-wider">1v1 RM ELO</div>
          </div>
        </div>

        {/* 4 Stat Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
          <div className="bg-aoe-card/60 p-2.5 rounded-lg border border-aoe-border/50 text-center">
            <div className="text-[10px] text-gray-400 uppercase font-medium">{locale === "es" ? "Victorias" : "Wins"}</div>
            <div className="text-base font-bold text-green-400">{profile.wins}</div>
          </div>
          <div className="bg-aoe-card/60 p-2.5 rounded-lg border border-aoe-border/50 text-center">
            <div className="text-[10px] text-gray-400 uppercase font-medium">{locale === "es" ? "Derrotas" : "Losses"}</div>
            <div className="text-base font-bold text-red-400">{profile.losses}</div>
          </div>
          <div className="bg-aoe-card/60 p-2.5 rounded-lg border border-aoe-border/50 text-center">
            <div className="text-[10px] text-gray-400 uppercase font-medium">{locale === "es" ? "Tasa Victoria" : "Win Rate"}</div>
            <div className="text-base font-bold text-white">{winRate}%</div>
          </div>
          <div className="bg-aoe-card/60 p-2.5 rounded-lg border border-aoe-border/50 text-center flex flex-col items-center justify-center">
            <div className="text-[10px] text-gray-400 uppercase font-medium mb-0.5">{locale === "es" ? "Estilo" : "Playstyle"}</div>
            {playstyle ? <PlaystyleBadge tag={playstyle} locale={locale} /> : <span className="text-xs text-gray-400">—</span>}
          </div>
        </div>

        {/* Top Civs */}
        {topCivs.length > 0 && (
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              {locale === "es" ? "Civilizaciones Preferidas" : "Signature Civilizations"}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {topCivs.map((civ) => (
                <div key={civ.civName} className="bg-aoe-card/40 border border-aoe-border/40 p-2 rounded-lg flex items-center justify-between text-xs">
                  <span className="font-semibold text-white truncate">{civ.civName}</span>
                  <span className={civ.winRate >= 50 ? "text-green-400 font-bold" : "text-gray-400"}>
                    {civ.winRate}% <span className="text-[10px] text-gray-500">({civ.games}g)</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
