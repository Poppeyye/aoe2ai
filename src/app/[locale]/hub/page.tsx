"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Tv,
  Trophy,
  Flame,
  Play,
  ExternalLink,
  Sparkles,
  Users,
  Swords,
  Shield,
  Clock,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Globe,
  Radio,
} from "lucide-react";
import { useLocale } from "@/i18n/I18nProvider";
import {
  COMMUNITY_CREATORS,
  MAJOR_TOURNAMENTS,
  CURRENT_PATCH_META,
  type CreatorCategory,
} from "@/lib/aoe2/hub";
import { cn } from "@/lib/utils";
import JsonLd from "@/components/seo/JsonLd";

export default function HubPage() {
  const locale = useLocale();
  const isEs = locale === "es";

  const [activeTab, setActiveTab] = useState<"creators" | "tournaments" | "meta">("creators");
  const [langFilter, setLangFilter] = useState<"all" | "es" | "en">("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | CreatorCategory>("all");

  const filteredCreators = useMemo(() => {
    return COMMUNITY_CREATORS.filter((c) => {
      if (langFilter !== "all" && c.language !== langFilter) return false;
      if (categoryFilter !== "all" && c.category !== categoryFilter) return false;
      return true;
    });
  }, [langFilter, categoryFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: isEs ? "AoE2 Creator Hub & Torneos" : "AoE2 Creator Hub & Tournaments",
          description: isEs
            ? "Directorio de los mejores creadores de contenido de Age of Empires II en español e inglés, vídeos de YouTube y torneos."
            : "Directory of the top Age of Empires II content creators, YouTube videos, and major tournaments.",
          url: `https://aoe2.ai/${locale}/hub`,
        }}
      />

      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-aoe-accent/10 border border-aoe-accent/30 text-aoe-accent text-xs font-semibold uppercase tracking-wider mb-3">
          <Tv className="w-3.5 h-3.5" />
          {isEs ? "Comunidad & Creadores de Contenido" : "Community & Creator Hub"}
        </div>
        <h1 className="text-3xl sm:text-5xl font-medieval font-bold gold-gradient mb-3">
          {isEs ? "El Epicentro de la Comunidad de AoE2" : "The AoE2 Community & Creator Hub"}
        </h1>
        <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
          {isEs
            ? "Aprende de los mejores creadores de YouTube en español e inglés, sigue los torneos mundiales y mantente al día con el meta competitivo."
            : "Learn from top English & Spanish YouTube creators, track major S-Tier world tournaments, and master the current ranked meta."}
        </p>
      </div>

      {/* Main Section Navigation Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 rounded-xl bg-aoe-dark border border-aoe-border/80 shadow-lg gap-1">
          <button
            onClick={() => setActiveTab("creators")}
            className={cn(
              "px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition-all",
              activeTab === "creators"
                ? "bg-aoe-accent text-aoe-dark shadow-md"
                : "text-gray-400 hover:text-white"
            )}
          >
            <Tv className="w-4 h-4" />
            <span>{isEs ? "Creadores & Vídeos" : "Creators & Videos"}</span>
          </button>

          <button
            onClick={() => setActiveTab("tournaments")}
            className={cn(
              "px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition-all",
              activeTab === "tournaments"
                ? "bg-aoe-accent text-aoe-dark shadow-md"
                : "text-gray-400 hover:text-white"
            )}
          >
            <Trophy className="w-4 h-4" />
            <span>{isEs ? "Torneos Mayores" : "Major Tournaments"}</span>
          </button>

          <button
            onClick={() => setActiveTab("meta")}
            className={cn(
              "px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition-all",
              activeTab === "meta"
                ? "bg-aoe-accent text-aoe-dark shadow-md"
                : "text-gray-400 hover:text-white"
            )}
          >
            <Flame className="w-4 h-4" />
            <span>{isEs ? "Meta Actual & Parches" : "Patch & Meta"}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CREATORS & VIDEOS */}
      {activeTab === "creators" && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="card !p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Language filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-aoe-accent" />
                {isEs ? "Idioma:" : "Language:"}
              </span>
              <div className="flex gap-1.5">
                {[
                  { id: "all", label: isEs ? "Todos" : "All" },
                  { id: "es", label: "🇪🇸 Español" },
                  { id: "en", label: "🇬🇧 English" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setLangFilter(item.id as any)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                      langFilter === item.id
                        ? "bg-aoe-accent/20 text-aoe-accent border border-aoe-accent/40 font-bold"
                        : "bg-aoe-dark text-gray-400 hover:text-white border border-transparent"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: "all", label: isEs ? "Todo" : "All" },
                { id: "guides", label: isEs ? "Guías" : "Guides" },
                { id: "pro_play", label: "Pro Play" },
                { id: "math_mechanics", label: isEs ? "Matemáticas" : "Math & Eco" },
                { id: "casting_entertainment", label: "Casting & Shows" },
                { id: "build_orders", label: "Build Orders" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id as any)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs transition-colors",
                    categoryFilter === cat.id
                      ? "bg-aoe-accent text-aoe-dark font-bold"
                      : "bg-aoe-dark text-gray-400 hover:text-white border border-aoe-border"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Creators Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCreators.map((creator) => (
              <div
                key={creator.id}
                className="card !p-5 hover:border-aoe-accent/50 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Creator Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-aoe-accent/30 to-slate-800 border-2 border-aoe-accent flex items-center justify-center font-bold text-white text-lg shrink-0 shadow">
                        {creator.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-lg font-bold text-white group-hover:text-aoe-accent transition-colors">
                            {creator.name}
                          </h3>
                          <span className="text-xs px-1.5 py-0.2 rounded bg-slate-800 text-gray-400 font-mono">
                            {creator.country}
                          </span>
                        </div>
                        <span className="text-xs text-red-400 font-semibold flex items-center gap-1">
                          <Play className="w-3 h-3 fill-current" /> {creator.subscriberCount} en YouTube
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Specialty badge */}
                  <div className="text-xs text-aoe-accent font-semibold mb-2 flex items-center gap-1.5 bg-aoe-accent/10 border border-aoe-accent/20 px-2.5 py-1 rounded-md">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isEs ? creator.specialty.es : creator.specialty.en}</span>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-gray-300 leading-relaxed mb-4">
                    {isEs ? creator.description.es : creator.description.en}
                  </p>

                  {/* Featured Video Links */}
                  <div className="space-y-2 mb-4 pt-3 border-t border-aoe-border/50">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                      {isEs ? "Vídeos & Guías Recomendadas:" : "Featured Highlights:"}
                    </span>
                    {creator.featuredVideos.map((vid) => (
                      <a
                        key={vid.id}
                        href={creator.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-lg bg-aoe-dark border border-aoe-border/60 hover:border-aoe-accent flex items-center justify-between text-xs text-gray-200 transition-colors group/vid"
                      >
                        <span className="font-medium truncate mr-2 group-hover/vid:text-white">
                          🎬 {isEs ? vid.title.es : vid.title.en}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono shrink-0">
                          {vid.duration}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Social Channel Links */}
                <div className="flex items-center gap-2 pt-3 border-t border-aoe-border/50">
                  <a
                    href={creator.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 btn-primary text-xs !py-1.5 flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    YouTube Channel
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  {creator.twitchUrl && (
                    <a
                      href={creator.twitchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-xs !py-1.5 !px-3 text-[#5865F2] hover:text-white hover:border-[#5865F2] flex items-center gap-1"
                      title="Twitch Stream"
                    >
                      <Radio className="w-3 h-3" />
                      Twitch
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: TOURNAMENTS */}
      {activeTab === "tournaments" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MAJOR_TOURNAMENTS.map((t) => (
              <div
                key={t.id}
                className="card !p-6 flex flex-col justify-between border-aoe-border/80 hover:border-aoe-accent/50 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                            t.tier === "S-Tier"
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                              : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                          )}
                        >
                          {t.tier}
                        </span>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                            t.status === "live"
                              ? "bg-red-500/20 text-red-400 animate-pulse border border-red-500/30"
                              : t.status === "upcoming"
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-slate-800 text-gray-400"
                          )}
                        >
                          {t.status === "live"
                            ? (isEs ? "EN VIVO" : "LIVE NOW")
                            : t.status === "upcoming"
                            ? (isEs ? "PRÓXIMAMENTE" : "UPCOMING")
                            : (isEs ? "FINALIZADO" : "COMPLETED")}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white font-medieval">{t.name}</h3>
                      <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                        <span>Organizado por <strong>{t.organizer}</strong></span>
                        <span>&bull;</span>
                        <span>{t.dates}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs text-gray-400 uppercase font-medium">{isEs ? "Premios" : "Prize Pool"}</div>
                      <div className="text-xl font-bold text-green-400 tabular-nums">{t.prizePool}</div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed mb-4">
                    {isEs ? t.description.es : t.description.en}
                  </p>

                  <div className="p-3 rounded-lg bg-aoe-dark border border-aoe-border text-xs mb-4">
                    <div className="text-[10px] font-bold uppercase text-gray-400 mb-1">{isEs ? "Formato del Torneo" : "Tournament Format"}</div>
                    <div className="text-gray-200">{isEs ? t.format.es : t.format.en}</div>
                  </div>

                  {t.winner && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-xs mb-4">
                      <Trophy className="w-5 h-5 text-yellow-400 shrink-0" />
                      <div>
                        <div className="text-[10px] font-bold uppercase text-yellow-300">
                          {isEs ? "Campeón" : "Champion"}
                        </div>
                        <div className="font-bold text-white text-sm">
                          👑 {t.winner}{" "}
                          <span className="font-normal text-xs text-gray-400">
                            (Runner-up: {t.runnerUp})
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-aoe-border/50">
                  <a
                    href={t.liquipediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-xs !py-2 flex-1 flex items-center justify-center gap-1.5"
                  >
                    <span>Liquipedia Bracket</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  {t.watchUrl && (
                    <a
                      href={t.watchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-xs !py-2 flex-1 flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isEs ? "Ver Retransmisión" : "Watch Broadcast"}</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CURRENT PATCH & META */}
      {activeTab === "meta" && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Main Patch Summary Card */}
          <div className="card !p-6 border-aoe-accent/40 bg-gradient-to-br from-aoe-accent/10 via-aoe-card to-aoe-dark">
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-aoe-accent bg-aoe-accent/20 border border-aoe-accent/30 px-2.5 py-0.5 rounded">
                  {CURRENT_PATCH_META.patchVersion}
                </span>
                <h2 className="text-2xl font-bold font-medieval gold-gradient mt-1.5">
                  {isEs ? CURRENT_PATCH_META.title.es : CURRENT_PATCH_META.title.en}
                </h2>
              </div>
              <span className="text-xs text-gray-400">{CURRENT_PATCH_META.releaseDate}</span>
            </div>

            <p className="text-sm text-gray-200 leading-relaxed">
              {isEs ? CURRENT_PATCH_META.summary.es : CURRENT_PATCH_META.summary.en}
            </p>
          </div>

          {/* Buffs vs Nerfs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Buffed */}
            <div className="card !p-5 border-green-500/30 bg-green-500/5 space-y-3">
              <h3 className="text-base font-bold text-green-400 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {isEs ? "Civilizaciones Mejoradas (Buffs)" : "Buffed Civilizations"}
              </h3>
              <div className="space-y-2.5">
                {CURRENT_PATCH_META.buffedCivs.map((c) => (
                  <div key={c.civ} className="p-3 rounded-lg bg-aoe-dark/80 border border-green-500/20">
                    <div className="font-bold text-white text-sm mb-1">{c.civ}</div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {isEs ? c.change.es : c.change.en}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Nerfed */}
            <div className="card !p-5 border-red-500/30 bg-red-500/5 space-y-3">
              <h3 className="text-base font-bold text-red-400 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {isEs ? "Civilizaciones Ajustadas (Nerfs)" : "Adjusted / Nerfed Civilizations"}
              </h3>
              <div className="space-y-2.5">
                {CURRENT_PATCH_META.nerfedCivs.map((c) => (
                  <div key={c.civ} className="p-3 rounded-lg bg-aoe-dark/80 border border-red-500/20">
                    <div className="font-bold text-white text-sm mb-1">{c.civ}</div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {isEs ? c.change.es : c.change.en}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Meta Trends Breakdown */}
          <div className="card !p-6 space-y-4">
            <h3 className="section-title flex items-center gap-2 mb-2">
              <Swords className="w-5 h-5 text-aoe-accent" />
              {isEs ? "Tendencias Clave en Ranked 1v1" : "Key Ranked 1v1 Playstyle Trends"}
            </h3>

            <div className="space-y-3">
              {CURRENT_PATCH_META.metaShifts.map((m, i) => (
                <div key={i} className="p-4 rounded-xl bg-aoe-dark border border-aoe-border">
                  <h4 className="font-bold text-white text-sm mb-1">
                    {isEs ? m.title.es : m.title.en}
                  </h4>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {isEs ? m.desc.es : m.desc.en}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cross-Link Call to Agent */}
      <div className="card border-aoe-accent/30 bg-gradient-to-r from-aoe-accent/10 via-aoe-card to-aoe-dark p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-aoe-accent" />
            {isEs ? "¿Quieres probar estas estrategias en tus partidas?" : "Want to test these strategies in your ranked games?"}
          </h3>
          <p className="text-xs text-gray-300">
            {isEs
              ? "Usa el Agente IA para practicar o resolver dudas tácticas al instante."
              : "Use our AI Agent to practice build orders and ask tactical questions in real time."}
          </p>
        </div>
        <Link href={`/${locale}/agent`} className="btn-primary shrink-0 text-xs !px-4 !py-2.5 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          {isEs ? "Abrir Agente IA" : "Open AI Agent"}
        </Link>
      </div>
    </div>
  );
}
