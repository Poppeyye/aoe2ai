"use client";

import { useState, useEffect } from "react";
import { Trophy, Calendar, DollarSign, Loader2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface Tournament {
  id: string;
  name: string;
  tier: string;
  startDate: string;
  endDate: string;
  prizePool?: string;
  status: "upcoming" | "ongoing" | "completed";
  liquipediaUrl?: string;
}

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "ongoing" | "upcoming" | "completed">("all");

  useEffect(() => {
    fetch("/api/tournaments")
      .then((r) => r.json())
      .then((data) => {
        setTournaments(data.tournaments || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = tournaments.filter(
    (t) => filter === "all" || t.status === filter
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-medieval font-bold mb-2">
          <Trophy className="inline w-8 h-8 text-aoe-accent mr-2" />
          Tournaments
        </h1>
        <p className="text-gray-400">
          Live results, brackets, and schedules from the biggest AoE2 events
          worldwide.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(["all", "ongoing", "upcoming", "completed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize",
              filter === f
                ? "bg-aoe-accent text-aoe-dark"
                : "bg-aoe-card border border-aoe-border text-gray-400 hover:text-white"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-aoe-accent" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((t) => (
            <div key={t.id} className="card flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-white text-lg">{t.name}</h3>
                  <StatusBadge status={t.status} />
                  {t.tier && (
                    <span className="text-xs px-2 py-0.5 rounded bg-aoe-accent/20 text-aoe-accent">
                      {t.tier}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {t.startDate} — {t.endDate}
                  </span>
                  {t.prizePool && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {t.prizePool}
                    </span>
                  )}
                </div>
              </div>
              {t.liquipediaUrl && (
                <a
                  href={t.liquipediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary !px-4 !py-2 text-sm flex items-center gap-2"
                >
                  Liquipedia <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No tournaments found for this filter.
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    ongoing: "bg-green-500/20 text-green-400",
    upcoming: "bg-blue-500/20 text-blue-400",
    completed: "bg-gray-500/20 text-gray-400",
  };
  return (
    <span
      className={cn(
        "text-xs font-medium px-2 py-0.5 rounded-full capitalize",
        styles[status as keyof typeof styles] || styles.completed
      )}
    >
      {status === "ongoing" && "● "}
      {status}
    </span>
  );
}
