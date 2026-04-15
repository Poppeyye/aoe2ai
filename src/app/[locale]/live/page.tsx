"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Radio, Search, Loader2, Swords, Shield, MapPin, Trophy,
  TrendingUp, TrendingDown, Clock, Crown, X, Flame, Target,
} from "lucide-react";
import { cn, formatTime } from "@/lib/utils";
import { useDictionary, useLocale } from "@/i18n/I18nProvider";
import FavoriteButton from "@/components/ui/FavoriteButton";
import KofiHint from "@/components/ui/KofiHint";
import AssistantPanel from "@/components/ai/AssistantPanel";

interface ScoutProfile {
  name: string;
  profileId: number;
  country: string;
  rating: number;
  rank: number;
  wins: number;
  losses: number;
  streak: number;
  highestRating: number;
  clan?: string;
}

interface CivStat {
  civName: string;
  games: number;
  wins: number;
  losses: number;
  winRate: number;
}

interface MapStat {
  map: string;
  games: number;
  wins: number;
  losses: number;
}

interface RecentMatch {
  map: string;
  won: boolean;
  civ: string;
  ratingChange: number;
  date: number;
}

interface CivRecommendation {
  civ: string;
  reason: string;
}

interface ScoutData {
  profile: ScoutProfile;
  civStats: CivStat[];
  mapStats: MapStat[];
  recentForm: string[];
  recentMatches: RecentMatch[];
  avgGameDuration: number;
  aiAnalysis: string | null;
  aiEnabled?: boolean;
  civRecommendations: CivRecommendation[];
  matchCount: number;
}

interface PlayerSuggestion {
  profileId: number;
  name: string;
  rating: number;
  rank: number;
  wins: number;
  losses: number;
  country?: string;
  lastMatchDate?: number;
}

export default function LivePage() {
  const dict = useDictionary();
  const locale = useLocale();
  const d = dict.live;
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlayerSuggestion[]>([]);
  const [sugLoading, setSugLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [scoutData, setScoutData] = useState<ScoutData | null>(null);
  const [scoutLoading, setScoutLoading] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function onQueryChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 3) {
      setSuggestions([]);
      setShowDropdown(value.trim().length > 0);
      return;
    }

    setShowDropdown(true);
    setSugLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/players?q=${encodeURIComponent(value.trim())}&type=rm_1v1`);
        const data = await res.json();
        setSuggestions(data.players || []);
      } catch {
        setSuggestions([]);
      } finally {
        setSugLoading(false);
      }
    }, 350);
  }

  const selectPlayer = useCallback(async (profileId: number) => {
    setShowDropdown(false);
    setScoutLoading(true);
    try {
      const res = await fetch(`/api/live?profileId=${profileId}&locale=${locale}`);
      if (!res.ok) throw new Error("Failed");
      const data: ScoutData = await res.json();
      setScoutData(data);
    } catch {
      setScoutData(null);
    } finally {
      setScoutLoading(false);
    }
  }, [locale]);

  function clearSearch() {
    setQuery("");
    setSuggestions([]);
    setShowDropdown(false);
    setScoutData(null);
  }

  const now = Math.floor(Date.now() / 1000);

  function daysAgo(timestamp: number): string {
    const days = Math.floor((now - timestamp) / 86400);
    if (days < 1) return d.days_ago?.replace("{days}", "0") ?? "Today";
    return d.days_ago?.replace("{days}", String(days)) ?? `${days}d ago`;
  }

  function formatDate(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-medieval font-bold mb-2">
          <Radio className="inline w-8 h-8 text-green-400 mr-2 animate-pulse" />
          {d.title}
        </h1>
        <p className="text-gray-400">{d.subtitle}</p>
      </div>

      {/* Search */}
      <div ref={searchRef} className="relative mb-8 max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setShowDropdown(false);
            }}
            onFocus={() => {
              if (query.trim().length >= 3 && suggestions.length > 0) setShowDropdown(true);
            }}
            placeholder={d.search_placeholder}
            className="input-field w-full pl-12 pr-10 py-3 text-lg"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {showDropdown && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-aoe-card border border-aoe-border rounded-xl shadow-2xl overflow-hidden max-h-[420px] overflow-y-auto">
            {sugLoading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" /> {d.searching}
              </div>
            ) : query.trim().length < 3 ? (
              <div className="py-6 text-center text-gray-500 text-sm">{d.search_placeholder}</div>
            ) : suggestions.length === 0 ? (
              <div className="py-6 text-center text-gray-500 text-sm">{d.no_results}</div>
            ) : (
              suggestions.slice(0, 15).map((p, idx) => {
                const totalGames = p.wins + p.losses;
                const daysSince = p.lastMatchDate && p.lastMatchDate > 0
                  ? Math.floor((now - p.lastMatchDate) / 86400)
                  : null;

                return (
                  <button
                    key={p.profileId}
                    onClick={() => {
                      setQuery(p.name);
                      selectPlayer(p.profileId);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-aoe-accent/10 transition-colors",
                      idx > 0 && "border-t border-aoe-border/30"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white truncate">{p.name}</span>
                        {p.country && (
                          <span className="text-xs text-gray-500 flex items-center gap-0.5 shrink-0">
                            <MapPin className="w-3 h-3" />{p.country.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                        {totalGames > 0 && (
                          <span>
                            <span className="text-green-400">{p.wins}W</span>
                            {" / "}
                            <span className="text-red-400">{p.losses}L</span>
                            <span className="text-gray-600 ml-1">({totalGames} {d.games})</span>
                          </span>
                        )}
                        {daysSince !== null && daysSince < 365 && (
                          <span className={cn(
                            "flex items-center gap-0.5",
                            daysSince < 7 ? "text-green-400" : daysSince < 30 ? "text-yellow-400" : "text-gray-500"
                          )}>
                            <Clock className="w-3 h-3" />
                            {d.days_ago?.replace("{days}", String(daysSince))}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {p.rating > 0 ? (
                        <div className="text-lg font-bold text-aoe-accent">{p.rating}</div>
                      ) : (
                        <div className="text-sm text-gray-600">—</div>
                      )}
                      {p.rank > 0 && (
                        <div className="text-xs text-gray-500">#{p.rank}</div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Loading state */}
      {scoutLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-aoe-accent" />
          <p className="text-gray-400 text-sm">{d.searching}</p>
        </div>
      )}

      {/* Scout data */}
      {!scoutLoading && scoutData && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <ProfileHeader profile={scoutData.profile} d={d} />
          <RecentFormRow form={scoutData.recentForm} d={d} avgDuration={scoutData.avgGameDuration} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CivPreferences civStats={scoutData.civStats} d={d} />
            <MapPreferences mapStats={scoutData.mapStats} d={d} />
          </div>

          <CivRecommendations recommendations={scoutData.civRecommendations} d={d} />
          <AssistantPanel
            surface="live"
            locale={locale === "es" ? "es" : "en"}
            context={scoutData}
            title={d.ai_analysis}
            placeholder={locale === "es" ? "Pregunta sobre openings, counters, mapas..." : "Ask about openings, counters, maps..."}
            initialPrompt={locale === "es"
              ? "Analiza a este rival y dame 4 consejos tácticos concretos para explotarlo, considerando sus civilizaciones favoritas, mapas más jugados, racha reciente y estilo de juego."
              : "Analyze this opponent and give me 4 concrete tactical tips to exploit their tendencies, considering their favorite civilizations, most-played maps, recent form, and play style."}
            initialPromptLabel={locale === "es" ? "Analizar con IA" : "Analyze with AI"}
            initialPromptDescription={locale === "es"
              ? "Lanza el análisis de IA para obtener consejos tácticos personalizados. Después podrás hacer preguntas de seguimiento."
              : "Run the AI analysis to get personalized tactical advice. You can ask follow-up questions after."}
            suggestions={locale === "es"
              ? [
                "¿Qué opening me recomiendas contra este rival?",
                "¿Qué debería vetar o priorizar en mapas abiertos?",
                "¿Qué hago si vuelve a su civ más jugada?",
              ]
              : [
                "What opening would you recommend against this opponent?",
                "What should I prioritize on open maps?",
                "What if they pick their most-played civilization again?",
              ]}
          />
          <RecentMatchesList
            matches={scoutData.recentMatches}
            d={d}
            formatDate={formatDate}
          />
          <KofiHint />
        </div>
      )}

      {/* Empty state */}
      {!scoutLoading && !scoutData && (
        <div className="card text-center py-16">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-aoe-accent/10 flex items-center justify-center">
              <Target className="w-10 h-10 text-aoe-accent" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">{d.select_opponent}</h2>
              <p className="text-gray-500 max-w-md mx-auto">{d.subtitle}</p>
            </div>
            <div className="flex items-center gap-2 mt-2 text-gray-600 text-sm">
              <Search className="w-4 h-4" />
              <span>{d.search_placeholder}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Profile Header ─── */

function ProfileHeader({ profile, d }: { profile: ScoutProfile; d: Record<string, string> }) {
  const total = profile.wins + profile.losses;
  const wr = total > 0 ? ((profile.wins / total) * 100).toFixed(1) : "0";

  return (
    <div className="card">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-medieval font-bold gold-gradient truncate">
              {profile.name}
            </h2>
            <FavoriteButton
              type="player"
              id={String(profile.profileId)}
              name={profile.name}
              meta={{ country: profile.country }}
            />
            {profile.clan && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-aoe-accent/15 text-aoe-accent rounded-md border border-aoe-accent/30">
                [{profile.clan}]
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
            {profile.country && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {profile.country.toUpperCase()}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> #{profile.rank}
            </span>
            <span className="flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 text-yellow-500" />
              {d.highest}: {profile.highestRating}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 md:gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-aoe-accent">{profile.rating}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mt-0.5">ELO</div>
          </div>
          <div className="w-px h-12 bg-aoe-border hidden md:block" />
          <div className="text-center">
            <div className="text-lg font-semibold text-white">
              <span className="text-green-400">{profile.wins}</span>
              <span className="text-gray-600 mx-1">/</span>
              <span className="text-red-400">{profile.losses}</span>
            </div>
            <div className="text-xs text-gray-500">{d.record} ({wr}%)</div>
          </div>
          <div className="w-px h-12 bg-aoe-border hidden md:block" />
          <div className="text-center">
            <div className={cn(
              "text-lg font-bold flex items-center justify-center gap-1",
              profile.streak > 0 ? "text-green-400" : profile.streak < 0 ? "text-red-400" : "text-gray-500"
            )}>
              {profile.streak > 0 ? (
                <><TrendingUp className="w-4 h-4" /> {profile.streak}</>
              ) : profile.streak < 0 ? (
                <><TrendingDown className="w-4 h-4" /> {Math.abs(profile.streak)}</>
              ) : (
                "—"
              )}
            </div>
            <div className="text-xs text-gray-500">{d.streak_label}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Recent Form ─── */

function RecentFormRow({
  form,
  d,
  avgDuration,
}: {
  form: string[];
  d: Record<string, string>;
  avgDuration: number;
}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="section-title !mb-0 flex items-center gap-2 text-sm">
          <Flame className="w-4 h-4 text-orange-400" />
          {d.recent_form}
        </h3>
        {avgDuration > 0 && (
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            {d.avg_duration}: {formatTime(avgDuration)}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {form.slice(0, 20).map((result, i) => (
          <div
            key={i}
            className={cn(
              "w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold transition-transform hover:scale-110",
              result === "W"
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            )}
            title={result === "W" ? d.victory : d.defeat}
          >
            {result}
          </div>
        ))}
        {form.length === 0 && (
          <span className="text-gray-600 text-sm">—</span>
        )}
      </div>
    </div>
  );
}

/* ─── Civ Preferences ─── */

function CivPreferences({ civStats, d }: { civStats: CivStat[]; d: Record<string, string> }) {
  const top = civStats.slice(0, 5);

  return (
    <div className="card">
      <h3 className="section-title flex items-center gap-2">
        <Shield className="w-5 h-5 text-aoe-accent" />
        {d.civ_prefs}
      </h3>
      {top.length > 0 ? (
        <div className="space-y-3">
          {top.map((civ) => {
            const winPct = civ.games > 0 ? (civ.wins / civ.games) * 100 : 0;
            return (
              <div key={civ.civName}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white">{civ.civName}</span>
                  <span className="text-xs text-gray-400">
                    {civ.games} {d.games} · <span className={cn(
                      winPct >= 55 ? "text-green-400" : winPct <= 45 ? "text-red-400" : "text-gray-300"
                    )}>{civ.winRate.toFixed(1)}% {d.win_rate}</span>
                  </span>
                </div>
                <div className="h-2.5 bg-aoe-dark rounded-full overflow-hidden flex">
                  <div
                    className="bg-green-500/70 rounded-l-full transition-all duration-500"
                    style={{ width: `${winPct}%` }}
                  />
                  <div
                    className="bg-red-500/50 rounded-r-full transition-all duration-500"
                    style={{ width: `${100 - winPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-600 text-sm">—</p>
      )}
    </div>
  );
}

/* ─── Map Preferences ─── */

function MapPreferences({ mapStats, d }: { mapStats: MapStat[]; d: Record<string, string> }) {
  const top = mapStats.slice(0, 5);
  const maxGames = top.length > 0 ? Math.max(...top.map((m) => m.games)) : 1;

  return (
    <div className="card">
      <h3 className="section-title flex items-center gap-2">
        <MapPin className="w-5 h-5 text-aoe-accent" />
        {d.map_prefs}
      </h3>
      {top.length > 0 ? (
        <div className="space-y-3">
          {top.map((map) => {
            const winPct = map.games > 0 ? (map.wins / map.games) * 100 : 0;
            return (
              <div key={map.map}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white">{map.map}</span>
                  <span className="text-xs text-gray-400">
                    {map.games} {d.games} · <span className={cn(
                      winPct >= 55 ? "text-green-400" : winPct <= 45 ? "text-red-400" : "text-gray-300"
                    )}>{winPct.toFixed(1)}% {d.win_rate}</span>
                  </span>
                </div>
                <div className="h-2.5 bg-aoe-dark rounded-full overflow-hidden flex">
                  <div
                    className="bg-green-500/70 rounded-l-full transition-all duration-500"
                    style={{ width: `${winPct}%` }}
                  />
                  <div
                    className="bg-red-500/50 rounded-r-full transition-all duration-500"
                    style={{ width: `${100 - winPct}%` }}
                  />
                </div>
                <div className="h-1 bg-aoe-dark/50 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-aoe-accent/30 rounded-full transition-all duration-500"
                    style={{ width: `${(map.games / maxGames) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-600 text-sm">—</p>
      )}
    </div>
  );
}

/* ─── Civ Recommendations ─── */

function CivRecommendations({
  recommendations,
  d,
}: {
  recommendations: CivRecommendation[];
  d: Record<string, string>;
}) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="card border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-transparent">
      <h3 className="section-title flex items-center gap-2">
        <Swords className="w-5 h-5 text-yellow-500" />
        <span className="gold-gradient">{d.civ_recommendations}</span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {recommendations.slice(0, 3).map((rec) => (
          <div
            key={rec.civ}
            className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4 hover:bg-yellow-500/10 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="font-bold text-white">{rec.civ}</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">{rec.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Recent Matches ─── */

function RecentMatchesList({
  matches,
  d,
  formatDate,
}: {
  matches: RecentMatch[];
  d: Record<string, string>;
  formatDate: (ts: number) => string;
}) {
  if (!matches || matches.length === 0) return null;

  return (
    <div className="card">
      <h3 className="section-title flex items-center gap-2">
        <Clock className="w-5 h-5 text-aoe-accent" />
        {d.recent_matches}
      </h3>
      <div className="space-y-1.5">
        {matches.slice(0, 10).map((m, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
              m.won ? "bg-green-500/5 hover:bg-green-500/10" : "bg-red-500/5 hover:bg-red-500/10"
            )}
          >
            <div className={cn(
              "px-2 py-0.5 rounded text-xs font-bold uppercase shrink-0",
              m.won ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
            )}>
              {m.won ? d.victory : d.defeat}
            </div>
            <div className="flex-1 min-w-0 flex items-center gap-3 text-sm">
              <span className="text-white font-medium truncate">{m.map}</span>
              <span className="text-gray-500 hidden sm:inline">·</span>
              <span className="text-gray-400 truncate hidden sm:inline">{m.civ}</span>
            </div>
            <div className={cn(
              "text-sm font-bold tabular-nums shrink-0",
              m.ratingChange > 0 ? "text-green-400" : m.ratingChange < 0 ? "text-red-400" : "text-gray-500"
            )}>
              {m.ratingChange > 0 ? "+" : ""}{m.ratingChange}
            </div>
            <div className="text-xs text-gray-600 shrink-0 w-16 text-right">
              {m.date > 0 ? formatDate(m.date) : "—"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
