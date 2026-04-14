"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Search, Users, Loader2, Trophy, TrendingUp, TrendingDown,
  ChevronLeft, ChevronRight, Swords, Clock, MapPin, ArrowLeft,
  Crown, Shield, Target, Flame, History, X,
} from "lucide-react";
import { cn, winRate, formatTime } from "@/lib/utils";
import { useDictionary } from "@/i18n/I18nProvider";
import FavoriteButton from "@/components/ui/FavoriteButton";

interface PlayerResult {
  profileId: number;
  name: string;
  rating: number;
  rank: number;
  wins: number;
  losses: number;
  streak: number;
  highestRating: number;
  country?: string;
  level?: number;
  lastMatchDate?: number;
  relevance?: number;
}

interface PlayerProfile {
  profile: {
    profileId: number;
    name: string;
    country: string;
  };
  ratings: Record<string, {
    rating: number; rank: number; wins: number; losses: number;
    streak: number; drops: number; highestRating: number;
    lastMatchDate: number; ranktotal: number;
  }>;
  matches: MatchEntry[];
}

interface MatchEntry {
  id: number;
  map: string;
  matchType: string;
  startTime: number;
  duration: number;
  won: boolean;
  ratingChange: number;
  newRating: number;
  players: {
    profileId: number;
    name: string;
    civ: string;
    civId: number;
    team: number;
    won: boolean;
    ratingChange: number;
    newRating: number;
  }[];
}

type Tab = "rm_1v1" | "rm_team" | "ew_1v1" | "ew_team";

export default function PlayersPage() {
  const dict = useDictionary();
  const d = dict.players;

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "rm_1v1", label: d.rm_1v1, icon: <Swords className="w-4 h-4" /> },
    { key: "rm_team", label: d.rm_team, icon: <Shield className="w-4 h-4" /> },
    { key: "ew_1v1", label: d.ew_1v1, icon: <Target className="w-4 h-4" /> },
    { key: "ew_team", label: d.ew_team, icon: <Flame className="w-4 h-4" /> },
  ];

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlayerResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("rm_1v1");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isSearchResult, setIsSearchResult] = useState(false);

  const [suggestions, setSuggestions] = useState<PlayerResult[]>([]);
  const [sugLoading, setSugLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const loadLeaderboard = useCallback(async (tab: Tab, p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/players?type=${tab}&page=${p}`);
      const data = await res.json();
      setResults(data.players || []);
      setTotal(data.total || 0);
      setIsSearchResult(false);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeaderboard(activeTab, page);
  }, [activeTab, page, loadLeaderboard]);

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
        const res = await fetch(`/api/players?q=${encodeURIComponent(value.trim())}&type=${activeTab}`);
        const data = await res.json();
        setSuggestions(data.players || []);
      } catch {
        setSuggestions([]);
      } finally {
        setSugLoading(false);
      }
    }, 350);
  }

  function confirmSearch() {
    setShowDropdown(false);
    if (!query.trim()) {
      setPage(1);
      loadLeaderboard(activeTab, 1);
      return;
    }
    if (suggestions.length > 0) {
      setResults(suggestions);
      setTotal(0);
      setIsSearchResult(true);
    }
  }

  function selectSuggestion(profileId: number) {
    setShowDropdown(false);
    openProfile(profileId);
  }

  function clearSearch() {
    setQuery("");
    setSuggestions([]);
    setShowDropdown(false);
    setIsSearchResult(false);
    setPage(1);
    loadLeaderboard(activeTab, 1);
  }

  async function openProfile(profileId: number) {
    setProfileLoading(true);
    try {
      const res = await fetch(`/api/players?profileId=${profileId}`);
      const data = await res.json();
      setProfile(data);
    } catch {
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }

  if (profile) {
    return <PlayerProfileView profile={profile} onBack={() => setProfile(null)} />;
  }

  const totalPages = Math.ceil(total / 200);
  const now = Math.floor(Date.now() / 1000);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-medieval font-bold mb-2">
          <Users className="inline w-8 h-8 text-aoe-accent mr-2" />
          {d.title}
        </h1>
        <p className="text-gray-400">
          {total > 0
            ? d.subtitle.replace("{count}", total.toLocaleString())
            : d.subtitle_fallback}
        </p>
      </div>

      <div ref={searchRef} className="relative mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmSearch();
                if (e.key === "Escape") setShowDropdown(false);
              }}
              onFocus={() => { if (query.trim().length >= 3 && suggestions.length > 0) setShowDropdown(true); }}
              placeholder={d.search_placeholder}
              className="input-field w-full pl-10 pr-10"
            />
            {query && (
              <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button onClick={confirmSearch} className="btn-primary" disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : d.search}
          </button>
        </div>

        {showDropdown && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-aoe-card border border-aoe-border rounded-xl shadow-2xl overflow-hidden max-h-[420px] overflow-y-auto">
            {sugLoading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" /> {d.searching}
              </div>
            ) : query.trim().length < 3 ? (
              <div className="py-6 text-center text-gray-500 text-sm">{d.type_to_search}</div>
            ) : suggestions.length === 0 ? (
              <div className="py-6 text-center text-gray-500 text-sm">{d.no_results}</div>
            ) : (
              suggestions.slice(0, 15).map((p, idx) => {
                const daysSince = p.lastMatchDate && p.lastMatchDate > 0
                  ? Math.floor((now - p.lastMatchDate) / 86400)
                  : null;
                const totalGames = p.wins + p.losses;

                return (
                  <button
                    key={p.profileId}
                    onClick={() => selectSuggestion(p.profileId)}
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
                            {d.days_ago.replace("{days}", String(daysSince))}
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

      <div className="flex gap-1 mb-6 bg-aoe-card rounded-lg p-1 border border-aoe-border">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setPage(1); setQuery(""); }}
            className={cn(
              "flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2",
              activeTab === tab.key
                ? "bg-aoe-accent text-aoe-dark"
                : "text-gray-400 hover:text-white"
            )}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {profileLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-aoe-accent" />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-aoe-accent" />
        </div>
      ) : results.length > 0 ? (
        <>
          <div className="bg-aoe-card border border-aoe-border rounded-xl overflow-hidden">
            <div className="grid grid-cols-[60px_1fr_100px_120px_80px] gap-2 px-4 py-3 text-xs text-gray-500 uppercase font-semibold border-b border-aoe-border">
              <div>{d.rank}</div>
              <div>{d.player}</div>
              <div className="text-right">{d.rating}</div>
              <div className="text-right">{d.record}</div>
              <div className="text-right">{d.streak}</div>
            </div>
            {results.map((player, idx) => (
              <button
                key={player.profileId}
                onClick={() => openProfile(player.profileId)}
                className={cn(
                  "w-full grid grid-cols-[60px_1fr_100px_120px_80px] gap-2 px-4 py-3 items-center hover:bg-aoe-accent/5 transition-colors text-left",
                  idx % 2 === 0 ? "bg-transparent" : "bg-aoe-dark/30"
                )}
              >
                <div className="text-center">
                  {player.rank > 0 && player.rank <= 3 ? (
                    <Crown className={cn("w-5 h-5 mx-auto", {
                      "text-yellow-400": player.rank === 1,
                      "text-gray-300": player.rank === 2,
                      "text-amber-600": player.rank === 3,
                    })} />
                  ) : (
                    <span className="text-sm text-gray-500">
                      {player.rank > 0 ? `#${player.rank}` : "—"}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-white truncate">{player.name}</div>
                  {player.country && (
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{player.country.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-bold text-aoe-accent text-lg">{player.rating}</span>
                </div>
                <div className="text-right text-sm">
                  <span className="text-green-400">{player.wins}W</span>
                  {" / "}
                  <span className="text-red-400">{player.losses}L</span>
                  <div className="text-xs text-gray-500">{winRate(player.wins, player.losses)}</div>
                </div>
                <div className="text-right">
                  {player.streak > 0 ? (
                    <span className="flex items-center justify-end gap-1 text-green-400 text-sm">
                      <TrendingUp className="w-4 h-4" />{player.streak}
                    </span>
                  ) : player.streak < 0 ? (
                    <span className="flex items-center justify-end gap-1 text-red-400 text-sm">
                      <TrendingDown className="w-4 h-4" />{Math.abs(player.streak)}
                    </span>
                  ) : (
                    <span className="text-gray-500 text-sm">—</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {!isSearchResult && total > 200 && (
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="btn-secondary !px-4 !py-2 text-sm flex items-center gap-2 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" /> {d.previous}
              </button>
              <span className="text-sm text-gray-400">
                {d.page_of.replace("{page}", String(page)).replace("{total}", String(totalPages))}
                <span className="text-gray-600 ml-2">
                  {d.players_count.replace("{count}", total.toLocaleString())}
                </span>
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page * 200 >= total}
                className="btn-secondary !px-4 !py-2 text-sm flex items-center gap-2 disabled:opacity-30"
              >
                {d.next} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          {d.no_players}
        </div>
      )}
    </div>
  );
}

function computeDashboardStats(matches: MatchEntry[], profileId: number) {
  const civMap = new Map<string, { games: number; wins: number }>();
  const mapMap = new Map<string, { games: number; wins: number }>();
  const recentForm: ("W" | "L")[] = [];

  for (const m of matches) {
    const me = m.players.find((pl) => pl.profileId === profileId);
    if (!me) continue;

    if (recentForm.length < 20) {
      recentForm.push(m.won ? "W" : "L");
    }

    const civEntry = civMap.get(me.civ) || { games: 0, wins: 0 };
    civEntry.games++;
    if (m.won) civEntry.wins++;
    civMap.set(me.civ, civEntry);

    const mapEntry = mapMap.get(m.map) || { games: 0, wins: 0 };
    mapEntry.games++;
    if (m.won) mapEntry.wins++;
    mapMap.set(m.map, mapEntry);
  }

  const civStats = Array.from(civMap)
    .map(([civ, s]) => ({ civ, games: s.games, wins: s.wins, losses: s.games - s.wins }))
    .sort((a, b) => b.games - a.games)
    .slice(0, 5);

  const mapStats = Array.from(mapMap)
    .map(([map, s]) => ({ map, games: s.games, wins: s.wins, losses: s.games - s.wins }))
    .sort((a, b) => b.games - a.games)
    .slice(0, 5);

  return { civStats, mapStats, recentForm };
}

function PlayerProfileView({
  profile,
  onBack,
}: {
  profile: PlayerProfile;
  onBack: () => void;
}) {
  const dict = useDictionary();
  const d = dict.players;
  const [matchFilter, setMatchFilter] = useState<"all" | "won" | "lost">("all");
  const p = profile.profile;

  const filteredMatches = profile.matches.filter((m) => {
    if (matchFilter === "won") return m.won;
    if (matchFilter === "lost") return !m.won;
    return true;
  });

  const ratingEntries = Object.entries(profile.ratings).filter(
    ([, v]) => v.rating > 0
  );

  const dashboard = useMemo(
    () => computeDashboardStats(profile.matches, profile.profile.profileId),
    [profile.matches, profile.profile.profileId]
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-aoe-accent mb-6 transition-colors">
        <ArrowLeft className="w-5 h-5" /> {d.back_to_leaderboard}
      </button>

      <div className="card mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-medieval font-bold gold-gradient">{p.name}</h1>
              <FavoriteButton
                type="player"
                id={String(p.profileId)}
                name={p.name}
                meta={{ country: p.country }}
              />
            </div>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-400">
              {p.country && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {p.country.toUpperCase()}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 uppercase">{d.profile_id}</div>
            <div className="text-lg font-mono text-gray-300">{p.profileId}</div>
          </div>
        </div>
      </div>

      {ratingEntries.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {ratingEntries.map(([name, r]) => (
            <div key={name} className="card !p-4">
              <div className="text-xs text-gray-500 uppercase mb-2 font-semibold">{name}</div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-aoe-accent">{r.rating}</span>
                {r.rank > 0 && (
                  <span className="text-sm text-gray-400">
                    #{r.rank}
                    {r.ranktotal > 0 && (
                      <span className="text-gray-600"> / {r.ranktotal.toLocaleString()}</span>
                    )}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
                <div>
                  <div className="text-gray-500 text-xs">{d.record}</div>
                  <div className="text-white">
                    <span className="text-green-400">{r.wins}</span>
                    {" / "}
                    <span className="text-red-400">{r.losses}</span>
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">{d.win_rate}</div>
                  <div className="text-white">{winRate(r.wins, r.losses)}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">{d.peak}</div>
                  <div className="text-yellow-400">{r.highestRating}</div>
                </div>
              </div>
              {r.streak !== 0 && (
                <div className="mt-2 text-sm">
                  {r.streak > 0 ? (
                    <span className="text-green-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> {r.streak} {d.win_streak}
                    </span>
                  ) : (
                    <span className="text-red-400 flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" /> {Math.abs(r.streak)} {d.loss_streak}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {dashboard.recentForm.length > 0 && (
        <div className="card mb-6">
          <h2 className="section-title !mb-3 flex items-center gap-2">
            <Flame className="w-5 h-5 text-aoe-accent" /> {d.recent_form}
          </h2>
          <div className="flex items-center gap-1 flex-wrap">
            {dashboard.recentForm.map((r, i) => (
              <div
                key={i}
                className={cn(
                  "w-3 h-3 rounded-sm",
                  r === "W" ? "bg-green-500" : "bg-red-500"
                )}
                title={r === "W" ? d.victory : d.defeat}
              />
            ))}
          </div>
          <p className="text-sm text-gray-400 mt-2">
            <span className="text-green-400">{dashboard.recentForm.filter((r) => r === "W").length}W</span>
            {" "}
            <span className="text-red-400">{dashboard.recentForm.filter((r) => r === "L").length}L</span>
            {" "}{d.in_last} {dashboard.recentForm.length}
          </p>
        </div>
      )}

      {dashboard.civStats.length > 0 && (
        <div className="card mb-6">
          <h2 className="section-title !mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-aoe-accent" /> {d.most_played_civs}
          </h2>
          <div className="space-y-3">
            {dashboard.civStats.map((c) => {
              const wr = c.games > 0 ? Math.round((c.wins / c.games) * 100) : 0;
              return (
                <div key={c.civ} className="flex items-center gap-3">
                  <span className="text-white font-medium w-28 truncate">{c.civ}</span>
                  <span className="text-xs text-gray-500 w-16 text-right">{c.games} {d.games}</span>
                  <div className="flex-1 h-2 bg-aoe-dark rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${wr}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-12 text-right">{wr}% {d.win_rate}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {dashboard.mapStats.length > 0 && (
        <div className="card mb-6">
          <h2 className="section-title !mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-aoe-accent" /> {d.map_stats}
          </h2>
          <div className="space-y-3">
            {dashboard.mapStats.map((m) => {
              const wr = m.games > 0 ? Math.round((m.wins / m.games) * 100) : 0;
              return (
                <div key={m.map} className="flex items-center gap-3">
                  <span className="text-white font-medium w-28 truncate">{m.map}</span>
                  <span className="text-xs text-gray-500 w-16 text-right">{m.games} {d.games}</span>
                  <div className="flex-1 h-2 bg-aoe-dark rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${wr}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-12 text-right">{wr}% {d.win_rate}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title !mb-0 flex items-center gap-2">
            <History className="w-5 h-5 text-aoe-accent" /> {d.match_history}
          </h2>
          <div className="flex gap-1 bg-aoe-dark rounded-lg p-1">
            {(["all", "won", "lost"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setMatchFilter(f)}
                className={cn(
                  "px-3 py-1 rounded text-xs font-medium transition-colors",
                  matchFilter === f
                    ? "bg-aoe-accent text-aoe-dark"
                    : "text-gray-400 hover:text-white"
                )}
              >
                {d[f]}
              </button>
            ))}
          </div>
        </div>

        {filteredMatches.length > 0 ? (
          <div className="space-y-2">
            {filteredMatches.map((m) => {
              const team1 = m.players.filter((p) => p.team === 0 || p.team === m.players[0]?.team);
              const team2 = m.players.filter((p) => !team1.includes(p));
              const hasTeams = team2.length > 0;

              return (
                <div
                  key={m.id}
                  className={cn(
                    "rounded-lg p-4 border transition-colors",
                    m.won
                      ? "border-green-500/20 bg-green-500/5"
                      : "border-red-500/20 bg-red-500/5"
                  )}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <div className={cn(
                      "px-3 py-1 rounded text-xs font-bold uppercase w-fit",
                      m.won ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    )}>
                      {m.won ? d.victory : d.defeat}
                    </div>
                    <div className="flex-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                      <span className="text-white font-medium">{m.map}</span>
                      <span className="text-gray-500">{m.matchType}</span>
                      {m.duration > 0 && (
                        <span className="text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {formatTime(m.duration)}
                        </span>
                      )}
                      {m.startTime > 0 && (
                        <span className="text-gray-600 text-xs">
                          {new Date(m.startTime * 1000).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        "text-sm font-bold",
                        m.ratingChange > 0 ? "text-green-400" : m.ratingChange < 0 ? "text-red-400" : "text-gray-500"
                      )}>
                        {m.ratingChange > 0 ? "+" : ""}{m.ratingChange}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">({m.newRating})</span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {(hasTeams ? [team1, team2] : [m.players]).map((team, tIdx) => (
                      <div key={tIdx} className="flex flex-wrap gap-1.5">
                        {tIdx > 0 && <span className="text-gray-600 self-center px-1">{dict.common.vs}</span>}
                        {team.map((pl) => (
                          <span
                            key={pl.profileId}
                            className={cn(
                              "px-2 py-1 rounded border",
                              pl.profileId === profile.profile.profileId
                                ? "border-aoe-accent/50 bg-aoe-accent/10 text-aoe-accent"
                                : pl.won
                                  ? "border-green-500/20 text-green-300"
                                  : "border-red-500/20 text-red-300"
                            )}
                          >
                            <span className="font-medium">{pl.name}</span>
                            <span className="text-gray-500 ml-1">({pl.civ})</span>
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {d.no_matches}
          </div>
        )}
      </div>
    </div>
  );
}
