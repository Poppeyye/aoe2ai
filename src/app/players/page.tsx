"use client";

import { useState } from "react";
import { Search, Users, Loader2, Trophy, TrendingUp, TrendingDown } from "lucide-react";
import { cn, winRate } from "@/lib/utils";

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
}

type Tab = "rm_1v1" | "rm_team" | "ew_1v1" | "ew_team";

const TABS: { key: Tab; label: string }[] = [
  { key: "rm_1v1", label: "1v1 RM" },
  { key: "rm_team", label: "Team RM" },
  { key: "ew_1v1", label: "1v1 EW" },
  { key: "ew_team", label: "Team EW" },
];

export default function PlayersPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlayerResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("rm_1v1");
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerResult | null>(null);

  async function search() {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/players?q=${encodeURIComponent(query)}&type=${activeTab}`
      );
      const data = await res.json();
      setResults(data.players || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-medieval font-bold mb-2">
          <Users className="inline w-8 h-8 text-aoe-accent mr-2" />
          Player Lookup
        </h1>
        <p className="text-gray-400">
          Browse the official AoE2 DE leaderboard or look up any player by
          profile ID.
        </p>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="Search player name or paste Profile ID..."
            className="input-field w-full pl-10"
          />
        </div>
        <button onClick={search} className="btn-primary" disabled={loading}>
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
        </button>
      </div>

      <p className="text-xs text-gray-500 mb-6">
        Searches all ranked players (~90K). You can also paste a Profile ID.
      </p>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-aoe-card rounded-lg p-1 border border-aoe-border">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "bg-aoe-accent text-aoe-dark"
                : "text-gray-400 hover:text-white"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-aoe-accent" />
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-2">
          {results.map((player) => (
            <button
              key={player.profileId}
              onClick={() => setSelectedPlayer(player)}
              className={cn(
                "w-full card !p-4 flex items-center gap-4 hover:border-aoe-accent/50 transition-colors text-left",
                selectedPlayer?.profileId === player.profileId &&
                  "border-aoe-accent"
              )}
            >
              <div className="w-12 text-center">
                <div className="text-xs text-gray-500">#{player.rank}</div>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-white">{player.name}</div>
                {player.country && (
                  <div className="text-xs text-gray-500">{player.country}</div>
                )}
              </div>
              <div className="text-right">
                <div className="font-bold text-aoe-accent">{player.rating}</div>
                <div className="text-xs text-gray-500">
                  {player.wins}W {player.losses}L ({winRate(player.wins, player.losses)})
                </div>
              </div>
              <div className="text-right w-16">
                {player.streak > 0 ? (
                  <span className="flex items-center gap-1 text-green-400 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    {player.streak}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-400 text-sm">
                    <TrendingDown className="w-4 h-4" />
                    {Math.abs(player.streak)}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      ) : query ? (
        <div className="text-center py-12 text-gray-500">
          No players found. Try a different search.
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          Search for a player or browse the leaderboard
        </div>
      )}

      {/* Player detail */}
      {selectedPlayer && (
        <div className="card mt-6">
          <h2 className="text-xl font-bold text-white mb-4">
            {selectedPlayer.name}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label="Rating" value={String(selectedPlayer.rating)} />
            <Stat label="Rank" value={`#${selectedPlayer.rank}`} />
            <Stat
              label="Win Rate"
              value={winRate(selectedPlayer.wins, selectedPlayer.losses)}
            />
            <Stat
              label="Highest"
              value={String(selectedPlayer.highestRating)}
            />
            <Stat label="Wins" value={String(selectedPlayer.wins)} />
            <Stat label="Losses" value={String(selectedPlayer.losses)} />
            <Stat label="Streak" value={String(selectedPlayer.streak)} />
            <Stat
              label="Games"
              value={String(selectedPlayer.wins + selectedPlayer.losses)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-aoe-dark rounded-lg p-3">
      <div className="text-xs text-gray-500 uppercase">{label}</div>
      <div className="text-lg font-bold text-white">{value}</div>
    </div>
  );
}
