"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  UserCircle, Search, Loader2, Trophy, TrendingUp, TrendingDown,
  Swords, Shield, Crown, Flame, Wifi, WifiOff, Radio,
  Link2, X, Target, Sparkles, LogIn, ChevronRight, Clock, MapPin, History,
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
import {
  classifyMatch,
  formatLobbySettings,
  getMatchKindLabel,
  inferScoutLeaderboard,
  type MatchKind,
  type MatchSource,
  type ScoutLeaderboard,
} from "@/lib/aoe2/lobby";
import { PlaystyleBadge, RatingSparkline, formatRelativeTime } from "@/components/scout/OpponentExtras";

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
  steam_profile?: string | null;
}

interface LiveMatch {
  matchid: string;
  map_name: string;
  server: number;
  description: string;
  slots: Record<string, MatchSlot>;
  start_time: number;
  hide_civilizations: boolean;
  population?: number;
  speed?: number;
  starting_age?: number;
  ending_age?: number;
  mode?: number;
  resources?: number;
  reveal_map?: number;
  treaty_length?: number;
  lock_teams?: boolean;
  team_together?: boolean;
  team_positions?: boolean;
  shared_exploration?: boolean;
  turbo_mode?: boolean;
  cheats?: boolean;
  password?: boolean;
  record?: boolean;
  ranked_dm?: number;
  slots_taken?: number;
  slots_total?: number;
  steam_lobbyid?: string | number;
  host_profileid?: number;
  matchSource?: MatchSource;
  ew_mode?: boolean;
}

type ConnectionState = "disconnected" | "connecting" | "connected" | "match_found";

const SCOUT_FETCH_TIMEOUT_MS = 45_000;

function slotProfileId(slot: MatchSlot): number | null {
  const id = Number(slot.profileid);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function getMatchParticipants(match: LiveMatch, myId: number) {
  const occupied = Object.values(match.slots).filter(
    (slot) => slot.status === 3 && slotProfileId(slot) !== null,
  );
  const mySlot = occupied.find((slot) => slotProfileId(slot) === myId) ?? null;
  const myTeam = mySlot?.team;
  const teammates = occupied.filter(
    (slot) => {
      const pid = slotProfileId(slot);
      return pid !== null && pid !== myId && myTeam !== undefined && slot.team === myTeam;
    },
  );
  const opponents = occupied.filter(
    (slot) => {
      const pid = slotProfileId(slot);
      return pid !== null && pid !== myId && (myTeam === undefined || slot.team !== myTeam);
    },
  );
  const isTeamGame = opponents.length > 1 || teammates.length > 0;

  return { mySlot, teammates, opponents, isTeamGame };
}

function getLeaderboardRating(
  leaderboards: CompanionLeaderboard[] | undefined,
  type: ScoutLeaderboard,
): number | null {
  const abbrMap: Record<ScoutLeaderboard, string> = {
    rm_1v1: "RM 1v1",
    rm_team: "RM Team",
    ew_1v1: "EW 1v1",
    ew_team: "EW Team",
  };
  const lb = leaderboards?.find(
    (entry) => entry.abbreviation === abbrMap[type] || entry.leaderboardId === type,
  );
  return lb && lb.rating > 0 ? lb.rating : null;
}

function getScoutLbStats(
  profile: Record<string, unknown> | undefined,
  type: ScoutLeaderboard,
): { rating?: number } | undefined {
  if (!profile) return undefined;
  const key =
    type === "rm_team" ? "rmTeam" :
    type === "ew_1v1" ? "ew1v1" :
    type === "ew_team" ? "ewTeam" :
    "rm1v1";
  return profile[key] as { rating?: number } | undefined;
}

function getScoutRating(
  profileId: number | null,
  scouts: Array<{ slot: MatchSlot; data: Record<string, unknown> }>,
  lbType: ScoutLeaderboard,
): number | null {
  if (!profileId) return null;
  const scout = scouts.find((entry) => slotProfileId(entry.slot) === profileId);
  const profile = scout?.data.profile as Record<string, unknown> | undefined;
  const lb = getScoutLbStats(profile, lbType);
  return lb && Number(lb.rating) > 0 ? Number(lb.rating) : null;
}

function formatRating(value: number | null, loading: boolean): string {
  if (value !== null) return String(value);
  return loading ? "…" : "—";
}

async function fetchOpponentScout(
  slot: MatchSlot,
  locale: string,
  lb: ScoutLeaderboard,
  myId: number,
  signal: AbortSignal,
) {
  const profileId = slotProfileId(slot);
  if (!profileId) return { slot, data: {} as Record<string, unknown> };

  const url = `/api/live?profileId=${profileId}&locale=${locale}&lb=${lb}&vs=${myId}&pages=2`;

  try {
    const res = await Promise.race([
      fetch(url, { signal }),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Scout fetch timed out")), SCOUT_FETCH_TIMEOUT_MS);
      }),
    ]);
    if (!res.ok) return { slot, data: {} as Record<string, unknown> };
    const data = await res.json();
    return { slot, data };
  } catch {
    return { slot, data: {} as Record<string, unknown> };
  }
}

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

  const [opponentScouts, setOpponentScouts] = useState<Array<{ slot: MatchSlot; data: Record<string, unknown> }>>([]);
  const [scouting, setScouting] = useState(false);
  const scoutAbortRef = useRef<AbortController | null>(null);
  const scoutedOpponentIdsRef = useRef<string>("");

  const [aiText, setAiText] = useState("");
  const [aiActivities, setAiActivities] = useState<ToolActivity[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      // No session: stop the page loader so the login prompt renders
      setProfileLoading(false);
      return;
    }
    fetchLinkedProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading]);

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
    setOpponentScouts([]);
    scoutedOpponentIdsRef.current = "";
    scoutAbortRef.current?.abort();
    scoutAbortRef.current = null;
    setScouting(false);
    setAiText("");
    setAiActivities([]);

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource(`/api/match-detect?profileId=${linkedProfile.profileId}`);
    eventSourceRef.current = es;

    es.addEventListener("status", (e) => {
      const data = JSON.parse(e.data);
      if ((data.status === "spectate" || data.status === "lobby") && data.matchid) {
        setConnectionState("match_found");
      } else if (data.status === null && !data.matchid) {
        setConnectionState("connected");
      }
    });

    es.addEventListener("match", (e) => {
      const match = JSON.parse(e.data) as LiveMatch;
      setLiveMatch((prev) => {
        if (!prev) return match;
        return {
          ...prev,
          ...match,
          slots: { ...prev.slots, ...match.slots },
        };
      });
      setConnectionState("match_found");
    });

    es.addEventListener("ping", () => {
      setConnectionState((prev) => prev !== "match_found" ? "connected" : prev);
    });

    es.onerror = () => {
      if (eventSourceRef.current === es) {
        setConnectionState("disconnected");
        es.close();
        eventSourceRef.current = null;
        setDetecting(false);
      }
    };

    es.onopen = () => {
      setConnectionState("connected");
    };
  }, [linkedProfile, detecting]);

  function stopMatchDetection() {
    setDetecting(false);
    setConnectionState("disconnected");
    scoutAbortRef.current?.abort();
    scoutAbortRef.current = null;
    setScouting(false);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }

  function resetDetection() {
    setLiveMatch(null);
    setOpponentScouts([]);
    scoutedOpponentIdsRef.current = "";
    scoutAbortRef.current?.abort();
    scoutAbortRef.current = null;
    setScouting(false);
    setAiText("");
    setAiActivities([]);
    setConnectionState("disconnected");
  }

  useEffect(() => {
    return () => {
      scoutAbortRef.current?.abort();
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Auto-fetch all opponents' stats when match is found.
  // NOTE: liveMatch gets a new identity on every SSE update, so this effect
  // must be idempotent per opponent set: mark the set as attempted BEFORE
  // fetching and never abort in-flight fetches from the effect itself,
  // otherwise repeated match updates cancel the scout forever.
  useEffect(() => {
    if (!liveMatch || !linkedProfile?.profileId) return;

    const myId = linkedProfile.profileId;
    const { opponents, isTeamGame } = getMatchParticipants(liveMatch, myId);
    const opponentIds = opponents
      .map((slot) => slotProfileId(slot))
      .filter((id): id is number => id !== null)
      .sort((a, b) => a - b)
      .join(",");

    if (opponents.length === 0) return;
    if (opponentIds === scoutedOpponentIdsRef.current) return;

    scoutedOpponentIdsRef.current = opponentIds;
    scoutAbortRef.current?.abort();
    const abortController = new AbortController();
    scoutAbortRef.current = abortController;

    const lb = inferScoutLeaderboard(liveMatch as unknown as Record<string, unknown>, isTeamGame);
    setScouting(true);

    Promise.all(
      opponents.map((slot) => fetchOpponentScout(slot, locale, lb, myId, abortController.signal)),
    )
      .then((results) => {
        if (abortController.signal.aborted) return;
        setOpponentScouts(results);
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setScouting(false);
        }
      });
  }, [liveMatch, linkedProfile?.profileId, locale]);

  const runAiAnalysis = useCallback(async () => {
    if (!liveMatch || opponentScouts.length === 0 || !linkedProfile?.profileId) return;

    const myId = linkedProfile.profileId;
    const myCiv = Object.values(liveMatch.slots).find((s) => s.profileid === myId);
    const myCivName = myCiv ? getCivName(myCiv.civilization) : "Unknown";
    const isTeamGame = opponentScouts.length > 1;
    const matchKind = classifyMatch(
      liveMatch as unknown as Record<string, unknown>,
      liveMatch.matchSource,
    );
    const scoutLb = inferScoutLeaderboard(liveMatch as unknown as Record<string, unknown>, isTeamGame);
    const matchKindLabel = getMatchKindLabel(matchKind, locale as "en" | "es");

    const opponentsDesc = opponentScouts.map((opp) => {
      const oppCivName = !liveMatch.hide_civilizations ? getCivName(opp.slot.civilization) : "Unknown";
      const p = opp.data.profile as Record<string, unknown> | undefined;
      const civs = opp.data.civStats as CivStat[] | undefined;
      const topCivs = civs?.slice(0, 3).map((c) => `${c.civName} (${c.winRate}%)`).join(", ") || "N/A";
      const primaryLb = getScoutLbStats(p, scoutLb);
      const rating = primaryLb?.rating ?? p?.rating ?? "?";
      const wins = (primaryLb as { wins?: number } | undefined)?.wins ?? p?.wins ?? 0;
      const losses = (primaryLb as { losses?: number } | undefined)?.losses ?? p?.losses ?? 0;
      return `${p?.name || opp.slot.name || "Unknown"} (${oppCivName}): Rating ${rating}, ${wins}W/${losses}L, streak ${p?.streak ?? 0}. Top civs: ${topCivs}`;
    }).join("\n");

    const lobbyRows = formatLobbySettings(liveMatch as unknown as Record<string, unknown>, locale as "en" | "es");
    const lobbySummary = lobbyRows.map((row) => `${row.label}: ${row.value}`).join(", ");

    const matchType = isTeamGame ? "team game" : "1v1";
    const prompt = locale === "es"
      ? `Analiza este enfrentamiento (${matchKindLabel}, ${matchType}). Yo juego ${myCivName} en ${liveMatch.map_name}.\n\nAjustes del lobby: ${lobbySummary}\n\nRivales:\n${opponentsDesc}\n\nDame un análisis táctico rápido y build order recomendado.`
      : `Analyze this ${matchKindLabel} ${matchType} matchup. I'm playing ${myCivName} on ${liveMatch.map_name}.\n\nLobby settings: ${lobbySummary}\n\nOpponents:\n${opponentsDesc}\n\nGive me a quick tactical analysis and recommended build order.`;

    const combinedContext = isTeamGame
      ? { opponents: opponentScouts.map((o) => o.data), matchType: "team" }
      : opponentScouts[0]?.data || {};

    setAiLoading(true);
    setAiText("");
    setAiActivities([]);
    try {
      await readAssistantStream(
        { surface: "live", locale: locale as "en" | "es", context: combinedContext, messages: [{ role: "user", content: prompt }] },
        (event: ClientAssistantStreamEvent) => {
          if (event.type === "text_delta") {
            setAiText((prev) => prev + (event.text || ""));
          } else if (event.type === "tool_call" && event.toolName) {
            const toolName = event.toolName;
            setAiActivities((prev) => [...prev, { id: `${toolName}-${prev.length}`, toolName, status: "running", args: event.args }]);
          } else if (event.type === "tool_result" && event.toolName) {
            const toolName = event.toolName;
            setAiActivities((prev) => prev.map((a) => a.toolName === toolName && a.status === "running" ? { ...a, status: "done" } : a));
          }
        },
      );
      setAiActivities((prev) => prev.map((a) => ({ ...a, status: "done" })));
    } catch {
      // AI analysis failed
    } finally {
      setAiLoading(false);
    }
  }, [liveMatch, opponentScouts, linkedProfile, locale]);

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
            playerStats={playerStats}
            opponentScouts={opponentScouts}
            scouting={scouting}
            aiText={aiText}
            aiActivities={aiActivities}
            aiLoading={aiLoading}
            onStart={startMatchDetection}
            onStop={stopMatchDetection}
            onReset={resetDetection}
            onAnalyze={runAiAnalysis}
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

function MatchPlayerLine({
  slot,
  name,
  rating,
  hideCivs,
  ratingLoading,
  highlight,
}: {
  slot: MatchSlot | null;
  name: string;
  rating: number | null;
  hideCivs: boolean;
  ratingLoading?: boolean;
  highlight?: "ally" | "enemy" | "self";
}) {
  const civName = slot && !hideCivs ? getCivName(slot.civilization) : null;
  const border =
    highlight === "self" ? "border-amber-500/40" :
    highlight === "ally" ? "border-green-500/30" :
    highlight === "enemy" ? "border-red-500/30" :
    "border-slate-700/40";

  return (
    <div className={cn("flex items-center gap-3 rounded-lg border bg-slate-800/40 px-3 py-2", border)}>
      {slot?.steam_avatar ? (
        <img src={slot.steam_avatar} alt="" className="w-9 h-9 rounded-full shrink-0" />
      ) : (
        <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
          <UserCircle className="w-5 h-5 text-slate-500" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-amber-100 truncate">{name}</span>
          {slot?.country && (
            <span className="text-[10px] text-slate-500 uppercase">{slot.country}</span>
          )}
        </div>
        {civName && <div className="text-xs text-slate-400 mt-0.5">{civName}</div>}
      </div>
      <div className="text-right shrink-0">
        <div className="text-[10px] text-slate-500 uppercase tracking-wider">ELO</div>
        <div className="text-lg font-bold text-amber-200 tabular-nums">
          {formatRating(rating, Boolean(ratingLoading))}
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
  playerStats,
  opponentScouts,
  scouting,
  aiText,
  aiActivities,
  aiLoading,
  onStart,
  onStop,
  onReset,
  onAnalyze,
  locale,
}: {
  t: Record<string, string>;
  connectionState: ConnectionState;
  detecting: boolean;
  liveMatch: LiveMatch | null;
  linkedProfile: LinkedProfile;
  playerStats: PlayerStats | null;
  opponentScouts: Array<{ slot: MatchSlot; data: Record<string, unknown> }>;
  scouting: boolean;
  aiText: string;
  aiActivities: ToolActivity[];
  aiLoading: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onAnalyze: () => void;
  locale: "en" | "es";
}) {
  const myId = linkedProfile.profileId;

  const { mySlot, teammates, opponents, isTeamGame } = liveMatch
    ? getMatchParticipants(liveMatch, myId ?? 0)
    : { mySlot: null, teammates: [], opponents: [], isTeamGame: false };
  const allOpponentSlots = opponents;
  const myTeamSlots = teammates;

  const aiStarted = aiText.length > 0 || aiLoading;
  const matchKind: MatchKind | null = liveMatch
    ? classifyMatch(liveMatch as unknown as Record<string, unknown>, liveMatch.matchSource)
    : null;
  const scoutLb: ScoutLeaderboard = liveMatch
    ? inferScoutLeaderboard(liveMatch as unknown as Record<string, unknown>, isTeamGame)
    : "rm_1v1";
  const isEwMatch = scoutLb.startsWith("ew_");
  const myRating =
    getScoutRating(myId ?? null, opponentScouts, scoutLb) ??
    getLeaderboardRating(playerStats?.leaderboards, scoutLb);
  const lobbySettings = liveMatch ? formatLobbySettings(liveMatch as unknown as Record<string, unknown>, locale) : [];
  const canAnalyze = opponentScouts.length > 0 && !scouting;
  const inLobbyWaiting = liveMatch?.matchSource === "lobby" && allOpponentSlots.length === 0;

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
          {liveMatch ? (
            <button onClick={onReset} className="btn-secondary text-sm !px-4 !py-2">
              {locale === "es" ? "Nueva búsqueda" : "New search"}
            </button>
          ) : !detecting ? (
            <button onClick={onStart} className="btn-primary text-sm !px-4 !py-2 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5" />
              {locale === "es" ? "Escuchar" : "Listen"}
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
          <div className="bg-slate-900/60 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded">
                  {t.match_found}
                </span>
                {isTeamGame && (
                  <span className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                    {locale === "es" ? "Partida de equipo" : "Team Game"}
                  </span>
                )}
                {matchKind && (
                  <span className={cn(
                    "text-xs font-medium px-2 py-1 rounded",
                    matchKind === "ranked" || matchKind === "ew_ranked"
                      ? "text-amber-400 bg-amber-500/10"
                      : "text-purple-400 bg-purple-500/10",
                  )}>
                    {getMatchKindLabel(matchKind, locale)}
                  </span>
                )}
                {liveMatch.matchSource === "lobby" && (
                  <span className="text-xs font-medium text-slate-400 bg-slate-800/80 px-2 py-1 rounded">
                    {locale === "es" ? "En lobby" : "In lobby"}
                  </span>
                )}
                {liveMatch.hide_civilizations && (
                  <span className="text-xs font-medium text-slate-400 bg-slate-800/80 px-2 py-1 rounded">
                    {locale === "es" ? "Civs ocultas" : "Hidden civs"}
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-500">
                {liveMatch.map_name} &bull; {SERVER_REGIONS[liveMatch.server] || `Server ${liveMatch.server}`}
              </span>
            </div>

            {liveMatch.description && (
              <p className="text-sm text-slate-300">{liveMatch.description}</p>
            )}

            {/* Lobby settings */}
            {lobbySettings.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {lobbySettings.map((row) => (
                  <div key={row.label} className="bg-slate-800/50 rounded-md px-2.5 py-2">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">{row.label}</div>
                    <div className="text-xs text-slate-200 font-medium truncate" title={row.value}>{row.value}</div>
                  </div>
                ))}
              </div>
            )}

            {inLobbyWaiting && (
              <p className="text-sm text-slate-400 text-center py-2">
                {locale === "es"
                  ? "Lobby detectado — esperando rivales..."
                  : "Lobby detected — waiting for opponents..."}
              </p>
            )}

            {/* 1v1 layout */}
            {!isTeamGame && allOpponentSlots.length === 1 && (
              <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
                <MatchPlayerLine
                  slot={mySlot}
                  name={linkedProfile.name || "You"}
                  rating={myRating}
                  hideCivs={liveMatch.hide_civilizations}
                  ratingLoading={scouting}
                  highlight="self"
                />
                <div className="text-amber-500 font-bold text-lg px-1">VS</div>
                <MatchPlayerLine
                  slot={allOpponentSlots[0]}
                  name={allOpponentSlots[0]?.name || t.opponent}
                  rating={getScoutRating(slotProfileId(allOpponentSlots[0]), opponentScouts, scoutLb)}
                  hideCivs={liveMatch.hide_civilizations}
                  ratingLoading={scouting}
                  highlight="enemy"
                />
              </div>
            )}

            {/* Team game layout */}
            {isTeamGame && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-xs text-green-400 font-medium uppercase tracking-wider">
                    {locale === "es" ? "Tu equipo" : "Your Team"}
                  </div>
                  <MatchPlayerLine
                    slot={mySlot}
                    name={linkedProfile.name || "You"}
                    rating={myRating}
                    hideCivs={liveMatch.hide_civilizations}
                    ratingLoading={scouting}
                    highlight="self"
                  />
                  {myTeamSlots.map((slot) => (
                    <MatchPlayerLine
                      key={slotProfileId(slot) ?? slot.name}
                      slot={slot}
                      name={slot.name || `Player ${slotProfileId(slot)}`}
                      rating={getScoutRating(slotProfileId(slot), opponentScouts, scoutLb)}
                      hideCivs={liveMatch.hide_civilizations}
                      ratingLoading={scouting}
                      highlight="ally"
                    />
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-red-400 font-medium uppercase tracking-wider">
                    {locale === "es" ? "Equipo rival" : "Enemy Team"}
                  </div>
                  {allOpponentSlots.map((slot) => (
                    <MatchPlayerLine
                      key={slotProfileId(slot) ?? slot.name}
                      slot={slot}
                      name={slot.name || `Player ${slotProfileId(slot)}`}
                      rating={getScoutRating(slotProfileId(slot), opponentScouts, scoutLb)}
                      hideCivs={liveMatch.hide_civilizations}
                      ratingLoading={scouting}
                      highlight="enemy"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Fallback when layout doesn't match 1v1 or team */}
            {!isTeamGame && allOpponentSlots.length !== 1 && allOpponentSlots.length > 0 && (
              <div className="space-y-2">
                <MatchPlayerLine
                  slot={mySlot}
                  name={linkedProfile.name || "You"}
                  rating={myRating}
                  hideCivs={liveMatch.hide_civilizations}
                  ratingLoading={scouting}
                  highlight="self"
                />
                {allOpponentSlots.map((slot) => (
                  <MatchPlayerLine
                    key={slotProfileId(slot) ?? slot.name}
                    slot={slot}
                    name={slot.name || t.opponent}
                    rating={getScoutRating(slotProfileId(slot), opponentScouts, scoutLb)}
                    hideCivs={liveMatch.hide_civilizations}
                    ratingLoading={scouting}
                    highlight="enemy"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Loading opponents */}
          {scouting && (
            <div className="flex items-center gap-2 text-amber-400 text-sm py-4 justify-center">
              <Loader2 className="w-4 h-4 animate-spin" /> {t.scouting}
            </div>
          )}

          {/* Opponent Intel Cards */}
          {opponentScouts.length > 0 && (
            <div className="space-y-4">
              {opponentScouts.map((opp) => {
                const p = opp.data.profile as Record<string, unknown> | undefined;
                const hasProfile = Boolean(p && (p.name || p.profileId));
                const rm1v1 = p?.rm1v1 as Record<string, number | string | null> | undefined;
                const rmTeam = p?.rmTeam as Record<string, number | string | null> | undefined;
                const ew1v1 = p?.ew1v1 as Record<string, number | string | null> | undefined;
                const ewTeam = p?.ewTeam as Record<string, number | string | null> | undefined;
                const col1 = isEwMatch ? ew1v1 : rm1v1;
                const col2 = isEwMatch ? ewTeam : rmTeam;
                const col1Label = isEwMatch ? "EW 1v1" : "RM 1v1";
                const col2Label = isEwMatch ? "EW Team" : "RM Team";
                const col1Active = scoutLb === (isEwMatch ? "ew_1v1" : "rm_1v1");
                const col2Active = scoutLb === (isEwMatch ? "ew_team" : "rm_team");
                const civs = opp.data.civStats as CivStat[] | undefined;
                const maps = opp.data.mapStats as { map: string; games: number; wins: number; losses: number }[] | undefined;
                const form = opp.data.recentForm as string[] | undefined;
                const avgDuration = opp.data.avgGameDuration as number | undefined;
                const recentMatchesList = opp.data.recentMatches as Array<{ map: string; won: boolean; civ: string; ratingChange: number; date: number }> | undefined;
                const civRecs = opp.data.civRecommendations as Array<{ civ: string; reason: string }> | undefined;
                const playstyle = opp.data.playstyle as "cavalry" | "archers" | "infantry" | "camels" | "siege" | "gunpowder" | "navy" | "flex" | "boom" | null | undefined;
                const ratingHistory = opp.data.ratingHistory as number[] | undefined;
                const headToHead = opp.data.headToHead as {
                  totalGames: number; wins: number; losses: number; lastEncounter: number | null;
                  recent: Array<{ map: string; won: boolean; myCiv: string; opponentCiv: string; date: number; ratingChange: number }>;
                } | null | undefined;
                const clan = typeof p?.clan === "string" ? p.clan : null;
                const primaryLb = getScoutLbStats(p, scoutLb) as Record<string, number | string | null> | undefined;
                const lastMatchTime = primaryLb?.lastMatchTime;
                const lastMatchTs = typeof lastMatchTime === "string" && lastMatchTime
                  ? Math.floor(new Date(lastMatchTime).getTime() / 1000)
                  : null;
                const rankCountry = Number(primaryLb?.rankCountry ?? 0);
                const displayName = String(p?.name || opp.slot.name || t.opponent);
                const profileId = slotProfileId(opp.slot);

                // Current match context cross-references
                const currentMapName = liveMatch.map_name;
                const mapStat = currentMapName && maps?.find((m) => m.map.toLowerCase() === currentMapName.toLowerCase());
                const mapStatWr = mapStat && mapStat.games > 0 ? Math.round((mapStat.wins / mapStat.games) * 100) : null;

                const currentCivName = !liveMatch.hide_civilizations ? getCivName(opp.slot.civilization) : null;
                const civStat = currentCivName && civs?.find((c) => c.civName.toLowerCase() === currentCivName.toLowerCase());

                return (
                  <div key={profileId ?? displayName} className="bg-slate-900/60 rounded-lg p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        {opp.slot.steam_avatar ? (
                          <img src={opp.slot.steam_avatar} alt="" className="w-8 h-8 rounded-full" />
                        ) : (
                          <Target className="w-4 h-4 text-amber-500 shrink-0" />
                        )}
                        <h4 className="text-sm font-bold text-amber-100 flex items-center gap-2 flex-wrap">
                          {displayName}
                        </h4>
                        {clan && (
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-800/70 px-1.5 py-0.5 rounded">
                            [{clan}]
                          </span>
                        )}
                        {currentCivName && (
                          <span className="text-xs text-slate-400 font-normal">— {currentCivName}</span>
                        )}
                        {playstyle && <PlaystyleBadge tag={playstyle} locale={locale} />}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        {lastMatchTs && (
                          <span className="flex items-center gap-1" title={new Date(lastMatchTs * 1000).toLocaleString()}>
                            <Clock className="w-3 h-3" />
                            {formatRelativeTime(lastMatchTs, locale)}
                          </span>
                        )}
                        {(typeof p?.country === "string" && p.country) || opp.slot.country ? (
                          <span>{String(p?.country || opp.slot.country).toUpperCase()}</span>
                        ) : null}
                        {opp.slot.steam_profile && (
                          <a
                            href={opp.slot.steam_profile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-500/80 hover:text-amber-400"
                          >
                            Steam
                          </a>
                        )}
                      </div>
                    </div>

                    {!hasProfile && (
                      <div className="text-xs text-amber-400/90 bg-amber-500/10 border border-amber-500/20 rounded-md px-3 py-2">
                        {locale === "es"
                          ? "No se pudieron cargar las estadísticas completas. Mostrando datos del lobby."
                          : "Could not load full stats. Showing lobby data only."}
                      </div>
                    )}

                    {hasProfile && (
                      <>
                    {(mapStatWr !== null || civStat) && (
                      <div className="flex items-center gap-2 flex-wrap">
                        {mapStatWr !== null && mapStat && (
                          <div className={cn(
                            "flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-md border",
                            mapStatWr >= 55 ? "bg-red-500/10 border-red-500/30 text-red-300" :
                            mapStatWr <= 45 ? "bg-green-500/10 border-green-500/30 text-green-300" :
                            "bg-slate-800/60 border-slate-700/60 text-slate-300"
                          )}>
                            <MapPin className="w-3 h-3" />
                            <span className="font-medium">
                              {locale === "es" ? `WR en ${mapStat.map}` : `WR on ${mapStat.map}`}:
                            </span>
                            <span className="font-bold">{mapStatWr}%</span>
                            <span className="text-slate-500">({mapStat.games}g)</span>
                          </div>
                        )}
                        {civStat && (
                          <div className={cn(
                            "flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-md border",
                            civStat.winRate >= 55 ? "bg-red-500/10 border-red-500/30 text-red-300" :
                            civStat.winRate <= 45 ? "bg-green-500/10 border-green-500/30 text-green-300" :
                            "bg-slate-800/60 border-slate-700/60 text-slate-300"
                          )}>
                            <Shield className="w-3 h-3" />
                            <span className="font-medium">
                              {locale === "es" ? `WR con ${civStat.civName}` : `WR as ${civStat.civName}`}:
                            </span>
                            <span className="font-bold">{civStat.winRate}%</span>
                            <span className="text-slate-500">({civStat.games}g)</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Head-to-head */}
                    {headToHead && headToHead.totalGames > 0 && (
                      <div className="bg-purple-500/5 border border-purple-500/30 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-xs font-medium text-purple-300">
                            <History className="w-3.5 h-3.5" />
                            {locale === "es" ? "Historial directo (H2H)" : "Head-to-head"}
                          </div>
                          <div className="text-xs font-bold">
                            <span className="text-green-400">{headToHead.wins}W</span>
                            <span className="text-slate-500"> - </span>
                            <span className="text-red-400">{headToHead.losses}L</span>
                            <span className="text-slate-500 ml-1.5">
                              ({Math.round((headToHead.wins / headToHead.totalGames) * 100)}%)
                            </span>
                          </div>
                        </div>
                        {headToHead.recent.length > 0 && (
                          <div className="space-y-1">
                            {headToHead.recent.slice(0, 3).map((h, i) => (
                              <div key={i} className="flex items-center gap-2 text-[11px]">
                                <span className={cn(
                                  "w-5 h-5 rounded flex items-center justify-center font-bold",
                                  h.won ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                                )}>
                                  {h.won ? "W" : "L"}
                                </span>
                                <span className="text-slate-400 flex-1 truncate">
                                  {h.map} · {h.myCiv} vs {h.opponentCiv}
                                </span>
                                <span className="text-slate-500">{formatRelativeTime(h.date, locale)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Dual ELO ratings */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className={cn(
                        "rounded-lg p-3 border",
                        col1 && Number(col1.rating) > 0 ? "bg-slate-800/60 border-slate-700/50" : "bg-slate-800/30 border-slate-700/20",
                        col1Active && "ring-1 ring-amber-500/40",
                      )}>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{col1Label}</div>
                        {col1 && Number(col1.rating) > 0 ? (
                          <div className="space-y-1">
                            <div className="flex items-baseline gap-2">
                              <span className="text-xl font-bold text-amber-100">{String(col1.rating)}</span>
                              <span className="text-xs text-slate-500">#{String(col1.rank)}</span>
                              {col1Active && ratingHistory && ratingHistory.length > 1 && (
                                <RatingSparkline points={ratingHistory} width={70} height={20} />
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs flex-wrap">
                              <span><span className="text-green-400">{String(col1.wins)}W</span> / <span className="text-red-400">{String(col1.losses)}L</span></span>
                              <span className="text-slate-400">{String(col1.winRate)}%</span>
                              <span className="text-slate-500">{locale === "es" ? "Pico" : "Peak"}: {String(col1.highestRating)}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-600">{locale === "es" ? "Sin datos" : "No data"}</span>
                        )}
                      </div>
                      <div className={cn(
                        "rounded-lg p-3 border",
                        col2 && Number(col2.rating) > 0 ? "bg-slate-800/60 border-slate-700/50" : "bg-slate-800/30 border-slate-700/20",
                        col2Active && "ring-1 ring-amber-500/40",
                      )}>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{col2Label}</div>
                        {col2 && Number(col2.rating) > 0 ? (
                          <div className="space-y-1">
                            <div className="flex items-baseline gap-2">
                              <span className="text-xl font-bold text-amber-100">{String(col2.rating)}</span>
                              <span className="text-xs text-slate-500">#{String(col2.rank)}</span>
                              {col2Active && ratingHistory && ratingHistory.length > 1 && (
                                <RatingSparkline points={ratingHistory} width={70} height={20} />
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs flex-wrap">
                              <span><span className="text-green-400">{String(col2.wins)}W</span> / <span className="text-red-400">{String(col2.losses)}L</span></span>
                              <span className="text-slate-400">{String(col2.winRate)}%</span>
                              <span className="text-slate-500">{locale === "es" ? "Pico" : "Peak"}: {String(col2.highestRating)}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-600">{locale === "es" ? "Sin datos" : "No data"}</span>
                        )}
                      </div>
                    </div>

                    {/* Extra stats row */}
                    <div className="flex items-center gap-4 text-xs flex-wrap">
                      {Number(p?.streak ?? 0) !== 0 && (
                        <span className={cn("flex items-center gap-1", Number(p?.streak) >= 0 ? "text-green-400" : "text-red-400")}>
                          {Number(p?.streak) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {locale === "es" ? "Racha" : "Streak"}: {String(p?.streak)}
                        </span>
                      )}
                      {rankCountry > 0 && (
                        <span className="text-slate-400">
                          {locale === "es" ? "Rank país" : "Country rank"}: #{rankCountry}
                        </span>
                      )}
                      {avgDuration && avgDuration > 0 && (
                        <span className="text-slate-400">
                          {locale === "es" ? "Duración media" : "Avg. game"}: {formatTime(avgDuration)}
                        </span>
                      )}
                      {(() => {
                        const drops = Number(primaryLb?.drops ?? 0);
                        const games = Number(primaryLb?.games ?? 0);
                        if (drops > 0 && games > 0) {
                          const dropRate = Math.round((drops / games) * 100);
                          return (
                            <span className={cn(dropRate > 5 ? "text-red-400" : "text-slate-500")}>
                              Drops: {drops} ({dropRate}%)
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </div>

                    {form && form.length > 0 && (
                      <div>
                        <div className="text-xs text-slate-500 mb-1.5">{t.recent_form}</div>
                        <div className="flex gap-1 flex-wrap">
                          {form.slice(0, 15).map((r, i) => (
                            <span key={i} className={cn(
                              "w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold",
                              r === "W" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400",
                            )}>
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {civs && civs.length > 0 && (
                        <div>
                          <div className="text-xs text-slate-500 mb-1.5">{locale === "es" ? "Civs favoritas" : "Top civs"}</div>
                          <div className="space-y-1">
                            {civs.slice(0, 5).map((c) => (
                              <div key={c.civName} className={cn(
                                "flex items-center justify-between text-xs py-1 px-2 -mx-2 rounded",
                                currentCivName && c.civName === currentCivName && "bg-amber-500/10 ring-1 ring-amber-500/30"
                              )}>
                                <span className="text-slate-300">{c.civName}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-500">{c.games}g</span>
                                  <span className={cn("font-medium", c.winRate >= 50 ? "text-green-400" : "text-red-400")}>
                                    {c.winRate}%
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {maps && maps.length > 0 && (
                        <div>
                          <div className="text-xs text-slate-500 mb-1.5">{locale === "es" ? "Mapas favoritos" : "Top maps"}</div>
                          <div className="space-y-1">
                            {maps.slice(0, 5).map((m) => {
                              const wr = m.games > 0 ? Math.round((m.wins / m.games) * 100) : 0;
                              const isCurrentMap = currentMapName && m.map.toLowerCase() === currentMapName.toLowerCase();
                              return (
                                <div key={m.map} className={cn(
                                  "flex items-center justify-between text-xs py-1 px-2 -mx-2 rounded",
                                  isCurrentMap && "bg-amber-500/10 ring-1 ring-amber-500/30"
                                )}>
                                  <span className="text-slate-300">{m.map}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-500">{m.games}g</span>
                                    <span className={cn("font-medium", wr >= 50 ? "text-green-400" : "text-red-400")}>
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

                    {/* Recent matches */}
                    {recentMatchesList && recentMatchesList.length > 0 && (
                      <div>
                        <div className="text-xs text-slate-500 mb-1.5">
                          {locale === "es" ? "Partidas recientes" : "Recent matches"}
                        </div>
                        <div className="space-y-1">
                          {recentMatchesList.slice(0, 5).map((m, i) => (
                            <div key={i} className="flex items-center gap-2 text-[11px] py-1">
                              <span className={cn(
                                "w-5 h-5 rounded flex items-center justify-center font-bold shrink-0",
                                m.won ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                              )}>
                                {m.won ? "W" : "L"}
                              </span>
                              <span className="text-slate-300 truncate flex-1">
                                {m.map} · {m.civ}
                              </span>
                              <span className={cn("font-medium tabular-nums", m.ratingChange >= 0 ? "text-green-400" : "text-red-400")}>
                                {m.ratingChange >= 0 ? "+" : ""}{m.ratingChange}
                              </span>
                              <span className="text-slate-500 w-14 text-right">
                                {formatRelativeTime(m.date, locale)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Civ recommendations (counters to their top civ) */}
                    {civRecs && civRecs.length > 0 && civs && civs.length > 0 && (
                      <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                        <div className="text-xs font-medium text-amber-300 mb-2 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          {locale === "es"
                            ? `Counters sugeridos contra ${civs[0].civName}`
                            : `Suggested counters vs ${civs[0].civName}`}
                        </div>
                        <div className="space-y-1.5">
                          {civRecs.slice(0, 3).map((r, i) => (
                            <div key={i} className="text-[11px] text-slate-300">
                              <span className="font-bold text-amber-200">{r.civ}</span>
                              <span className="text-slate-400"> — {r.reason}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* AI Analysis Button or Results */}
          {!aiStarted ? (
            <button
              onClick={onAnalyze}
              disabled={!canAnalyze}
              className={cn(
                "btn-primary w-full flex items-center justify-center gap-2",
                !canAnalyze && "opacity-50 cursor-not-allowed",
              )}
            >
              <Sparkles className="w-4 h-4" />
              {locale === "es" ? "Análisis táctico con IA" : "AI Tactical Analysis"}
            </button>
          ) : (
            <div className="bg-slate-900/60 rounded-lg p-4">
              <h4 className="text-sm font-bold text-amber-100 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> {t.auto_scout}
              </h4>
              {aiActivities.length > 0 && (
                <ToolActivityPanel activities={aiActivities} locale={locale} />
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
