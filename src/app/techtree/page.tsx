"use client";

import { useState, useEffect } from "react";
import { BookOpen, Search, ArrowRightLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CivSummary {
  name: string;
  expansion: string;
  bonuses: string[];
  uniqueUnits: string[];
  uniqueTechs: string[];
  teamBonus: string;
}

export default function TechTreePage() {
  const [civs, setCivs] = useState<string[]>([]);
  const [selectedCiv, setSelectedCiv] = useState<string | null>(null);
  const [civData, setCivData] = useState<CivSummary | null>(null);
  const [compareCiv1, setCompareCiv1] = useState("");
  const [compareCiv2, setCompareCiv2] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/techtree")
      .then((r) => r.json())
      .then((data) => {
        setCivs(data.civs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function selectCiv(name: string) {
    setSelectedCiv(name);
    try {
      const res = await fetch(`/api/techtree?civ=${encodeURIComponent(name)}`);
      const data = await res.json();
      setCivData(data);
    } catch {
      setCivData(null);
    }
  }

  const filtered = civs.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-medieval font-bold mb-2">
          <BookOpen className="inline w-8 h-8 text-aoe-accent mr-2" />
          Tech Tree Explorer
        </h1>
        <p className="text-gray-400">
          Browse civilizations, bonuses, unique units. Click a civ or use the
          comparator below.
        </p>
      </div>

      {/* Compare tool */}
      <div className="card mb-8">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-aoe-accent" />
          Compare Civilizations
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={compareCiv1}
            onChange={(e) => setCompareCiv1(e.target.value)}
            className="input-field flex-1 min-w-[200px]"
          >
            <option value="">Select first civ...</option>
            {civs.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <span className="text-gray-500 font-bold">vs</span>
          <select
            value={compareCiv2}
            onChange={(e) => setCompareCiv2(e.target.value)}
            className="input-field flex-1 min-w-[200px]"
          >
            <option value="">Select second civ...</option>
            {civs.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button className="btn-primary">Compare</button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter civilizations..."
          className="input-field w-full pl-10"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-aoe-accent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Civ list */}
          <div className="lg:col-span-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2">
              {filtered.map((civ) => (
                <button
                  key={civ}
                  onClick={() => selectCiv(civ)}
                  className={cn(
                    "text-left px-3 py-2 rounded-lg border text-sm transition-all",
                    selectedCiv === civ
                      ? "border-aoe-accent bg-aoe-accent/10 text-aoe-accent"
                      : "border-aoe-border hover:border-aoe-accent/50 text-gray-300"
                  )}
                >
                  {civ}
                </button>
              ))}
            </div>
          </div>

          {/* Civ detail */}
          <div className="lg:col-span-2">
            {civData ? (
              <div className="card space-y-6">
                <h2 className="text-2xl font-medieval font-bold gold-gradient">
                  {civData.name}
                </h2>
                {civData.expansion && (
                  <div className="text-sm text-gray-500">
                    Expansion: {civData.expansion}
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-white mb-2">
                    Civilization Bonuses
                  </h3>
                  <ul className="space-y-1">
                    {civData.bonuses.map((b, i) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-aoe-accent mt-1">•</span> {b}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-2">Team Bonus</h3>
                  <p className="text-sm text-gray-300">{civData.teamBonus}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-2">
                    Unique Units
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {civData.uniqueUnits.map((u) => (
                      <span
                        key={u}
                        className="text-sm px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      >
                        {u}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-2">
                    Unique Technologies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {civData.uniqueTechs.map((t) => (
                      <span
                        key={t}
                        className="text-sm px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="card text-center text-gray-500 py-12">
                Select a civilization to view its tech tree
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
