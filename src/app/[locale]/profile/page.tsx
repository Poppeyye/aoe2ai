"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  UserCircle, Search, Loader2, Trophy, TrendingUp, TrendingDown,
  Swords, Shield, Crown, Flame, Wifi, WifiOff, Radio,
  Link2, X, Target, Sparkles, LogIn, ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { cn, formatTime } from "@/lib/utils";
import { useDictionary, useLocale } from "@/i18n/I18nProvider";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import ToolActivityPanel, { type ToolActivity } from "@/components/ai/ToolActivityPanel";
import MarkdownMessage from "@/components/ai/MarkdownMessage";
import { readAssistantStream, type ClientAssistantStreamEvent } from "@/components/ai/chat-stream";
import KofiHint from "@/components/ui/KofiHint";
import { getCivName, SERVER_REGIONS } from "@/lib/aoe2/civs";

interface LinkedProfile {
  linked: boolean;
  profileId?: number;
  name?: string;
}

interface PlayerSuggestion {
  profileId: number;
  name: string;
  rating: number;
  rank: number;
  wins: number;
  losses: number;
  streak: number;
  country?: string;
  lastMatchDate?: number;
  totalGames?: number;
}

interface CompanionLeaderboard {
  leaderboardId: string;
  abbreviation: string;
  rating: number;
  maxRating: number;
  wins: number;
  losses: number;
  streak: number;
  rank: number;
  active: boolean;
}

interface PlayerStats {
  name: string;
  profileId: number;
  country: string | null;
  leaderboards: CompanionLeaderboard[];
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

interface MatchSlot {
  status: number;
  color: number;
  team: number;
  civilization: number;
  profileid: number | null;
  name?: string;
  country?: string;
  steam_avatar?: string | null;
}

interface LiveMatch {
  matchid: string;
  map_name: string;
  server: number;
  description: string;
  slots: Record<string, MatchSlot>;
  start_time: number;
  hide_civilizations: boolean;
}

type ConnectionState = "disconnected" | "connecting" | "connected" | "match_found";

export default function ProfilePage() {
  const dict = useDictionary();
  const locale = useLocale();
  const t = dict.profile;
  const { isAuthenticated, isLoading: authLoading, loginUrl } = useRequireAuth();

  const [linkedProfile, setLinkedProfile] = useState<LinkedProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlayerSuggestion[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [linking, setLinking] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [civStats, setCivStats] = useState<CivStat[]>([]);
  const [mapStats, setMapStats] = useState<MapStat[]>([]);
  const [recentMatches, setRecentMatches] = useState<RecentMatch[]>([]);
  const [recentForm, setRecentForm] = useState<string[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);

  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const [liveMatch, setLiveMatch] = useState<LiveMatch | null>(null);
  const [detecting, setDetecting] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const [scoutData, setScoutData] = useState<Record<string, unknown> | null>(null);
  const [scouting, setScouting] = useState(false);

  const [aiText, setAiText] = useState("");
  const [aiActivities, setAiActivities] = useState<ToolActivity[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchLinkedProfile();
  }, [isAuthenticated]);

  async function fetchLinkedProfile() {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      setLinkedProfile(data);
      if (data.linked && data.profileId) {
        loadPlayerStats(data.profileId);
      }
    } catch {
      setLinkedProfile({ linked: false });
    } finally {
      setProfileLoading(false);
    }
  }

  async function loadPlayerStats(profileId: number) {
    setStatsLoading(true);
    try {
      const [profileRes, scoutRes] = await Promise.all([
        fetch(`/api/players?profileId=${profileId}`),
        fetch(`/api/live?profileId=${profileId}&locale=${locale}`),
      ]);
      if (profileRes.ok) {
        const data = await profileRes.json();
        setPlayerStats(data);
      }
      if (scoutRes.ok) {
        const data = await scoutRes.json();
        setCivStats(data.civStats || []);
        setMapStats(data.mapStats || []);
        setRecentMatches(data.recentMatches || []);
        setRecentForm(data.recentForm || []);
      }
    } catch {
      // stats loading failed silently
    } finally {
      setStatsLoading(false);
    }
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function onSearchChange(value: string) {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 3) {
      setSuggestions([]);
      setShowDropdown(value.trim().length > 0);
      return;
    }

    setShowDropdown(true);
    setSearchLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/players?q=${encodeURIComponent(value.trim())}&type=rm_1v1`);
        const data = await res.json();
        setSuggestions(data.players || []);
      } catch {
        setSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 350);
  }

  async function linkProfile(profileId: number) {
    setLinking(true);
    setShowDropdown(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId }),
      });
      const data = await res.json();
      if (data.linked) {
        setLinkedProfile(data);
        setSuggestions([]);
        setSearchQuery("");
        loadPlayerStats(profileId);
      }
    } catch {
      // linking failed
    } finally {
      setLinking(false);
    }
  }

  const startMatchDetection = useCallback(() => {
    if (!linkedProfile?.profileId || detecting) return;

    setDetecting(true);
    setConnectionState("connecting");
    setLiveMatch(null);

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource(`/api/match-detect?profileId=${linkedProfile.profileId}`);
    eventSourceRef.current = es;

    es.addEventListener("status", (e) => {
      const data = JSON.parse(e.data);
      if (data.status === "spectate" && data.matchid) {
        setConnectionState("match_found");
      } else if (data.status === null && !data.matchid) {
        setConnectionState("connected");
      }
    });

    es.addEventListener("match", (e) => {
      const match = JSON.parse(e.data) as LiveMatch;
      setLiveMatch(match);
      setConnectionState("match_found");
    });

    es.addEventListener("ping", () => {
      if (connectionState !== "match_found") {
        setConnectionState("connected");
      }
    });

    es.onerror = () => {
      setConnectionState("disconnected");
      es.close();
      setTimeout(() => {
        if (detecting) startMatchDetection();
      }, 5000);
    };

    es.onopen = () => {
      setConnectionState("connected");
    };
  }, [linkedProfile, detecting, connectionState]);

  function stopMatchDetection() {
    setDetecting(false);
    setConnectionState("disconnected");
    setLiveMatch(null);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (!liveMatch || scouting || scoutData) return;

    const myId = linkedProfile?.profileId;
    if (!myId) return;

    const opponent = Object.values(liveMatch.slots).find(
      (s) => s.profileid && s.profileid !== myId && s.status === 3,
    );

    if (!opponent?.profileid) return;

    setScouting(true);
    fetch(`/api/live?profileId=${opponent.profileid}&locale=${locale}`)
      .then((r) => r.json())
      .then(async (data) => {
        setScoutData(data);
        const myCiv = Object.values(liveMatch.slots).find(
          (s) => s.profileid === myId,
        );
        const myCivName = myCiv ? getCivName(myCiv.civilization) : "Unknown";
        const oppCivName = getCivName(opponent.civilization);
        const prompt = locale === "es"
          ? `Analiza este enfrentamiento ranked. Yo juego ${myCivName} vs ${oppCivName} (${data.profile?.name}) en ${liveMatch.map_name}. Perfil del rival: Rating ${data.profile?.rating}, WR ${data.profile?.wins}W/${data.profile?.losses}L, racha ${data.profile?.streak}. Sus civs más jugadas: ${data.civStats?.slice(0, 3).map((c: CivStat) => `${c.civName} (${c.winRate}%)`).join(", ")}. Dame un análisis táctico rápido y build order recomendado.`
          : `Analyze this ranked matchup. I'm playing ${myCivName} vs ${oppCivName} (${data.profile?.name}) on ${liveMatch.map_name}. Opponent profile: Rating ${data.profile?.rating}, WR ${data.profile?.wins}W/${data.profile?.losses}L, streak ${data.profile?.streak}. Their top civs: ${data.civStats?.slice(0, 3).map((c: CivStat) => `${c.civName} (${c.winRate}%)`).join(", ")}. Give me a quick tactical analysis and recommended build order.`;

        setAiLoading(true);
        setAiText("");
        setAiActivities([]);
        try {
          await readAssistantStream(
            { surface: "live", locale: locale as "en" | "es", context: data, messages: [{ role: "user", content: prompt }] },
            (event: ClientAssistantStreamEvent) => {
              if (event.type === "text_delta") {
                setAiText((prev) => prev + (event.text || ""));
              } else if (event.type === "tool_call" && event.toolName) {
                const toolName = event.toolName;
                setAiActivities((prev) => [...prev, { id: `${toolName}-${prev.length}`, toolName, status: "running" }]);
              } else if (event.type === "tool_result" && event.toolName) {
                const toolName = event.toolName;
                setAiActivities((prev) => prev.map((a) => a.toolName === toolName && a.status === "running" ? { ...a, status: "done" } : a));
              }
            },
          );
          setAiActivities((prev) => prev.map((a) => ({ ...a, status: "done" })));
        } catch {
          // AI analysis failed silently
        } finally {
          setAiLoading(false);
        }
      })
      .catch(() => {})
      .finally(() => setScouting(false));
  }, [liveMatch, linkedProfile, scouting, scoutData, locale]);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <UserCircle className="w-16 h-16 text-amber-500/50 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-amber-100 mb-2">{t.login_required}</h2>
          <Link href={loginUrl} className="btn-primary mt-4 inline-flex items-center gap-2">
            <LogIn className="w-4 h-4" /> {dict.nav.login}
          </Link>
        </div>
      </div>
    );
  }

  const rm1v1 = playerStats?.leaderboards?.find(
    (lb) => lb.abbreviation === "RM 1v1" || lb.leaderboardId === "rm_1v1",
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-amber-100 flex items-center gap-3">
          <UserCircle className="w-8 h-8 text-amber-500" />
          {t.title}
        </h1>
        <p className="text-slate-400 mt-1">{t.subtitle}</p>
      </div>

      {!linkedProfile?.linked ? (
        <ProfileLinker
          t={t}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          suggestions={suggestions}
          searchLoading={searchLoading}
          showDropdown={showDropdown}
          setShowDropdown={setShowDropdown}
          linking={linking}
          linkProfile={linkProfile}
          searchRef={searchRef}
        />
      ) : (
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="bg-slate-800/60 backdrop-blur-sm border border-amber-900/20 rounded-xl p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Crown className="w-7 h-7 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-amber-100">{linkedProfile.name}</h2>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Link2 className="w-3.5 h-3.5" />
                    <span>ID: {linkedProfile.profileId}</span>
                    {playerStats?.country && (
                      <span className="text-xs px-1.5 py-0.5 bg-slate-700 rounded">
                        {playerStats.country.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => { setLinkedProfile({ linked: false }); setPlayerStats(null); }}
                className="text-xs text-slate-500 hover:text-amber-400 transition-colors"
              >
                {t.change_profile}
              </button>
            </div>

            {rm1v1 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-6">
                <StatCard label={t.rating} value={String(rm1v1.rating)} icon={<Trophy className="w-4 h-4 text-amber-400" />} />
                <StatCard label={t.rank} value={`#${rm1v1.rank}`} icon={<Target className="w-4 h-4 text-blue-400" />} />
                <StatCard label={t.record} value={`${rm1v1.wins}W / ${rm1v1.losses}L`} icon={<Swords className="w-4 h-4 text-slate-400" />} />
                <StatCard
                  label={t.win_rate}
                  value={`${rm1v1.wins + rm1v1.losses > 0 ? Math.round((rm1v1.wins / (rm1v1.wins + rm1v1.losses)) * 100) : 0}%`}
                  icon={<Shield className="w-4 h-4 text-green-400" />}
                />
                <StatCard
                  label={t.streak}
                  value={String(rm1v1.streak)}
                  icon={rm1v1.streak >= 0 ? <TrendingUp className="w-4 h-4 text-green-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
                />
                <StatCard label={t.peak} value={String(rm1v1.maxRating)} icon={<Flame className="w-4 h-4 text-orange-400" />} />
              </div>
            )}
          </div>

          {/* Live Match Detection */}
          <LiveMatchPanel
            t={t}
            connectionState={connectionState}
            detecting={detecting}
            liveMatch={liveMatch}
            linkedProfile={linkedProfile}
            scoutData={scoutData}
            scouting={scouting}
            aiText={aiText}
            aiActivities={aiActivities}
            aiLoading={aiLoading}
            onStart={startMatchDetection}
            onStop={stopMatchDetection}
            locale={locale as "en" | "es"}
          />

          {/* Recent Form */}
          {recentForm.length > 0 && (
            <div className="bg-slate-800/60 backdrop-blur-sm border border-amber-900/20 rounded-xl p-6">
              <h3 className="text-lg font-bold text-amber-100 mb-3">{t.recent_form}</h3>
              <div className="flex gap-1 flex-wrap">
                {recentForm.slice(0, 20).map((r, i) => (
                  <span
                    key={i}
                    className={cn(
                      "w-8 h-8 rounded flex items-center justify-center text-xs font-bold",
                      r === "W" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400",
                    )}
                  >
                    {r === "W" ? t.victory : t.defeat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stats Grid */}
          {statsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Civ Stats */}
              {civStats.length > 0 && (
                <div className="bg-slate-800/60 backdrop-blur-sm border border-amber-900/20 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-amber-100 mb-4">{t.civ_stats}</h3>
                  <div className="space-y-2">
                    {civStats.slice(0, 10).map((civ) => (
                      <div key={civ.civName} className="flex items-center justify-between py-1.5">
                        <span className="text-sm text-slate-300 font-medium">{civ.civName}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-500">{civ.games} {t.games}</span>
                          <div className="w-20 bg-slate-700 rounded-full h-2">
                            <div
                              className={cn("h-2 rounded-full", civ.winRate >= 50 ? "bg-green-500" : "bg-red-500")}
                              style={{ width: `${civ.winRate}%` }}
                            />
                          </div>
                          <span className={cn("text-xs font-medium w-10 text-right", civ.winRate >= 50 ? "text-green-400" : "text-red-400")}>
                            {civ.winRate}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Map Stats */}
              {mapStats.length > 0 && (
                <div className="bg-slate-800/60 backdrop-blur-sm border border-amber-900/20 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-amber-100 mb-4">{t.map_stats}</h3>
                  <div className="space-y-2">
                    {mapStats.slice(0, 10).map((m) => {
                      const wr = m.games > 0 ? Math.round((m.wins / m.games) * 100) : 0;
                      return (
                        <div key={m.map} className="flex items-center justify-between py-1.5">
                          <span className="text-sm text-slate-300 font-medium">{m.map}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500">{m.games} {t.games}</span>
                            <div className="w-20 bg-slate-700 rounded-full h-2">
                              <div
                                className={cn("h-2 rounded-full", wr >= 50 ? "bg-green-500" : "bg-red-500")}
                                style={{ width: `${wr}%` }}
                              />
                            </div>
                            <span className={cn("text-xs font-medium w-10 text-right", wr >= 50 ? "text-green-400" : "text-red-400")}>
                              {wr}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recent Matches */}
          {recentMatches.length > 0 && (
            <div className="bg-slate-800/60 backdrop-blur-sm border border-amber-900/20 rounded-xl p-6">
              <h3 className="text-lg font-bold text-amber-100 mb-4">{t.recent_matches}</h3>
              <div className="space-y-2">
                {recentMatches.slice(0, 15).map((m, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-900/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "w-7 h-7 rounded flex items-center justify-center text-xs font-bold",
                        m.won ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400",
                      )}>
                        {m.won ? t.victory : t.defeat}
                      </span>
                      <span className="text-sm text-slate-300">{m.civ}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-slate-500">{m.map}</span>
                      <span className={cn("text-xs font-medium", m.ratingChange >= 0 ? "text-green-400" : "text-red-400")}>
                        {m.ratingChange >= 0 ? "+" : ""}{m.ratingChange}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <KofiHint />
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-slate-900/50 rounded-lg p-3 text-center">
      <div className="flex items-center justify-center gap-1 mb-1">{icon}</div>
      <div className="text-lg font-bold text-amber-100">{value}</div>
      <div className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</div>
    </div>
  );
}

function ProfileLinker({
  t,
  searchQuery,
  onSearchChange,
  suggestions,
  searchLoading,
  showDropdown,
  setShowDropdown,
  linking,
  linkProfile,
  searchRef,
}: {
  t: Record<string, string>;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  suggestions: PlayerSuggestion[];
  searchLoading: boolean;
  showDropdown: boolean;
  setShowDropdown: (v: boolean) => void;
  linking: boolean;
  linkProfile: (id: number) => void;
  searchRef: React.RefObject<HTMLDivElement>;
}) {
  const now = Math.floor(Date.now() / 1000);

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-slate-800/60 backdrop-blur-sm border border-amber-900/20 rounded-xl p-8 text-center">
        <Link2 className="w-12 h-12 text-amber-500/50 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-amber-100 mb-2">{t.link_profile}</h2>
        <p className="text-slate-400 text-sm mb-6">{t.no_profile}</p>

        <div ref={searchRef} className="relative text-left">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Escape") setShowDropdown(false); }}
              onFocus={() => { if (searchQuery.trim().length >= 3 && suggestions.length > 0) setShowDropdown(true); }}
              placeholder={t.link_placeholder}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-12 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:border-amber-500/50 focus:outline-none"
            />
            {searchLoading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500 animate-spin" />
            )}
          </div>

          {showDropdown && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-[420px] overflow-y-auto">
              {searchLoading ? (
                <div className="flex items-center justify-center gap-2 py-6 text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" /> Searching...
                </div>
              ) : searchQuery.trim().length < 3 ? (
                <div className="py-6 text-center text-slate-500 text-sm">{t.link_placeholder}</div>
              ) : suggestions.length === 0 ? (
                <div className="py-6 text-center text-slate-500 text-sm">No players found</div>
              ) : (
                suggestions.slice(0, 15).map((p, idx) => {
                  const totalGames = (p.totalGames ?? p.wins + p.losses) || 0;
                  const daysSince = p.lastMatchDate && p.lastMatchDate > 0
                    ? Math.floor((now - p.lastMatchDate) / 86400)
                    : null;

                  return (
                    <button
                      key={p.profileId}
                      onClick={() => linkProfile(p.profileId)}
                      disabled={linking}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-amber-500/10 transition-colors",
                        idx > 0 && "border-t border-slate-700/30",
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white truncate">{p.name}</span>
                          {p.country && (
                            <span className="text-xs text-slate-500 shrink-0">{p.country.toUpperCase()}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                          {totalGames > 0 && (
                            <span>
                              <span className="text-green-400">{p.wins}W</span>
                              {" / "}
                              <span className="text-red-400">{p.losses}L</span>
                              <span className="text-slate-600 ml-1">({totalGames})</span>
                            </span>
                          )}
                          {daysSince !== null && daysSince < 365 && (
                            <span className={cn(
                              daysSince < 7 ? "text-green-400" : daysSince < 30 ? "text-yellow-400" : "text-slate-500",
                            )}>
                              {daysSince === 0 ? "Today" : `${daysSince}d ago`}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {p.rating > 0 && (
                          <span className="text-sm font-bold text-amber-400">{p.rating}</span>
                        )}
                        {p.rank > 0 && (
                          <span className="text-xs text-slate-500">#{p.rank}</span>
                        )}
                        {linking ? (
                          <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-600" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LiveMatchPanel({
  t,
  connectionState,
  detecting,
  liveMatch,
  linkedProfile,
  scoutData,
  scouting,
  aiText,
  aiActivities,
  aiLoading,
  onStart,
  onStop,
  locale,
}: {
  t: Record<string, string>;
  connectionState: ConnectionState;
  detecting: boolean;
  liveMatch: LiveMatch | null;
  linkedProfile: LinkedProfile;
  scoutData: Record<string, unknown> | null;
  scouting: boolean;
  aiText: string;
  aiActivities: ToolActivity[];
  aiLoading: boolean;
  onStart: () => void;
  onStop: () => void;
  locale: "en" | "es";
}) {
  const myId = linkedProfile.profileId;

  const mySlot = liveMatch
    ? Object.values(liveMatch.slots).find((s) => s.profileid === myId)
    : null;
  const opponentSlot = liveMatch
    ? Object.values(liveMatch.slots).find((s) => s.profileid && s.profileid !== myId && s.status === 3)
    : null;

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-amber-900/30 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-amber-100 flex items-center gap-2">
          <Radio className="w-5 h-5 text-amber-500" />
          {t.match_detection}
        </h3>
        <div className="flex items-center gap-3">
          <span className={cn("flex items-center gap-1.5 text-xs",
            connectionState === "connected" ? "text-green-400" :
            connectionState === "match_found" ? "text-amber-400" :
            connectionState === "connecting" ? "text-yellow-400" : "text-slate-500"
          )}>
            {connectionState === "disconnected" ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
            {connectionState === "connected" ? t.connected :
             connectionState === "match_found" ? t.match_found :
             connectionState === "connecting" ? t.detecting :
             t.disconnected.split("—")[0]}
          </span>
          {!detecting ? (
            <button onClick={onStart} className="btn-primary text-sm !px-4 !py-2">
              {t.detecting}
            </button>
          ) : (
            <button onClick={onStop} className="btn-secondary text-sm !px-4 !py-2 !border-red-500/30 !text-red-400">
              <X className="w-3.5 h-3.5 mr-1 inline" /> Stop
            </button>
          )}
        </div>
      </div>

      {!detecting && !liveMatch && (
        <div className="text-center py-8">
          <Radio className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">{t.waiting_desc}</p>
        </div>
      )}

      {detecting && !liveMatch && (
        <div className="text-center py-8">
          <div className="relative inline-flex">
            <Radio className="w-10 h-10 text-amber-500 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping" />
          </div>
          <p className="text-amber-200 mt-3 font-medium">{t.waiting}</p>
          <p className="text-slate-400 text-sm mt-1">{t.waiting_desc}</p>
        </div>
      )}

      {liveMatch && (
        <div className="space-y-4">
          {/* Match Info Header */}
          <div className="bg-slate-900/60 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded">
                {t.match_found}
              </span>
              <span className="text-xs text-slate-500">
                {liveMatch.map_name} • {SERVER_REGIONS[liveMatch.server] || `Server ${liveMatch.server}`}
              </span>
            </div>

            {/* Player vs Opponent */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 text-center">
                <div className="text-sm font-bold text-amber-100">{linkedProfile.name}</div>
                <div className="text-xs text-slate-400 mt-1">
                  {mySlot && !liveMatch.hide_civilizations
                    ? getCivName(mySlot.civilization)
                    : "—"}
                </div>
              </div>
              <div className="text-amber-500 font-bold text-lg">VS</div>
              <div className="flex-1 text-center">
                <div className="text-sm font-bold text-amber-100">
                  {opponentSlot?.name || "Opponent"}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {opponentSlot && !liveMatch.hide_civilizations
                    ? getCivName(opponentSlot.civilization)
                    : "—"}
                </div>
              </div>
            </div>
          </div>

          {/* Auto Scout */}
          {scouting && (
            <div className="flex items-center gap-2 text-amber-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> {t.scouting}
            </div>
          )}

          {scoutData && (
            <div className="bg-slate-900/60 rounded-lg p-4">
              <h4 className="text-sm font-bold text-amber-100 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> {t.auto_scout}
              </h4>
              {aiActivities.length > 0 && (
                <ToolActivityPanel activities={aiActivities} locale={locale as "en" | "es"} />
              )}
              {aiText && <MarkdownMessage content={aiText} />}
              {aiLoading && !aiText && (
                <div className="flex items-center gap-2 text-amber-400 text-sm py-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> {t.scouting}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
