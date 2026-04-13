"use client";

import { useState } from "react";
import { Radio, Search, Loader2, Swords, Shield, Map } from "lucide-react";
import { cn } from "@/lib/utils";

interface MatchupResult {
  player: { name: string; rating: number; civ: string; wins: number; losses: number };
  opponent: { name: string; rating: number; civ: string; wins: number; losses: number };
  analysis: string;
  tips: string[];
}

export default function LivePage() {
  const [profileId, setProfileId] = useState("");
  const [loading, setLoading] = useState(false);
  const [matchup, setMatchup] = useState<MatchupResult | null>(null);

  async function scout() {
    if (!profileId.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/live?profileId=${profileId}`);
      const data = await res.json();
      setMatchup(data);
    } catch {
      setMatchup(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-medieval font-bold mb-2">
          <Radio className="inline w-8 h-8 text-green-400 mr-2" />
          AoE2 Live Tracker
        </h1>
        <p className="text-gray-400">
          Enter your profile ID to track your current game and get instant
          matchup analysis.
        </p>
      </div>

      <div className="flex gap-3 mb-8">
        <input
          type="text"
          value={profileId}
          onChange={(e) => setProfileId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && scout()}
          placeholder="Enter your Profile ID..."
          className="input-field flex-1"
        />
        <button onClick={scout} className="btn-primary" disabled={loading}>
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </button>
      </div>

      {matchup ? (
        <div className="space-y-6">
          {/* Matchup display */}
          <div className="card">
            <div className="grid grid-cols-3 items-center gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-white">{matchup.player.name}</div>
                <div className="text-2xl font-bold text-aoe-accent">{matchup.player.rating}</div>
                <div className="text-sm text-gray-400">{matchup.player.civ}</div>
              </div>
              <div className="text-center">
                <Swords className="w-10 h-10 text-red-400 mx-auto" />
                <div className="text-xs text-gray-500 mt-2">VS</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-white">{matchup.opponent.name}</div>
                <div className="text-2xl font-bold text-red-400">{matchup.opponent.rating}</div>
                <div className="text-sm text-gray-400">{matchup.opponent.civ}</div>
              </div>
            </div>
          </div>

          {/* Analysis */}
          <div className="card">
            <h2 className="section-title flex items-center gap-2">
              <Shield className="w-5 h-5 text-aoe-accent" />
              Matchup Analysis
            </h2>
            <p className="text-gray-300 whitespace-pre-wrap">{matchup.analysis}</p>
          </div>

          {/* Tips */}
          {matchup.tips.length > 0 && (
            <div className="card">
              <h2 className="section-title flex items-center gap-2">
                <Map className="w-5 h-5 text-aoe-accent" />
                Strategy Tips
              </h2>
              <ul className="space-y-2">
                {matchup.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-aoe-accent mt-1">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : !loading ? (
        <div className="card text-center py-12">
          <div className="grid grid-cols-3 gap-8 max-w-sm mx-auto text-gray-500">
            <div>
              <div className="text-2xl font-bold text-white">—</div>
              <div className="text-xs">Rating</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">—</div>
              <div className="text-xs">Win Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">—</div>
              <div className="text-xs">Streak</div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
