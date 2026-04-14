"use client";

import { useState, useEffect } from "react";
import {
  Trophy, Calendar, DollarSign, Loader2, ExternalLink,
  Crown, Clock, Globe, Filter, Medal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDictionary, useLocale } from "@/i18n/I18nProvider";

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

type FilterType = "all" | "ongoing" | "upcoming" | "completed";

const TIER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "S-Tier": { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/30" },
  "A-Tier": { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" },
  "B-Tier": { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/30" },
  "C-Tier": { bg: "bg-gray-500/10", text: "text-gray-400", border: "border-gray-500/30" },
};

export default function TournamentsPage() {
  const dict = useDictionary();
  const locale = useLocale();
  const d = dict.tournaments;
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

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

  const statusCounts = {
    all: tournaments.length,
    ongoing: tournaments.filter((t) => t.status === "ongoing").length,
    upcoming: tournaments.filter((t) => t.status === "upcoming").length,
    completed: tournaments.filter((t) => t.status === "completed").length,
  };

  const ongoing = filtered.filter((t) => t.status === "ongoing");
  const upcoming = filtered.filter((t) => t.status === "upcoming");
  const completed = filtered.filter((t) => t.status === "completed");
  const grouped = filter === "all"
    ? [
        { title: d.live_now, icon: <Clock className="w-4 h-4 text-green-400" />, items: ongoing },
        { title: d.upcoming, icon: <Calendar className="w-4 h-4 text-blue-400" />, items: upcoming },
        { title: d.completed, icon: <Medal className="w-4 h-4 text-gray-400" />, items: completed },
      ].filter((g) => g.items.length > 0)
    : [{ title: filter, icon: <Trophy className="w-4 h-4 text-aoe-accent" />, items: filtered }];

  function formatDateRange(start: string, end: string) {
    try {
      const s = new Date(start);
      const e = new Date(end);
      const dateLocale = locale === "es" ? "es-ES" : "en-US";
      const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
      const startStr = s.toLocaleDateString(dateLocale, opts);
      const endStr = e.toLocaleDateString(dateLocale, { ...opts, year: "numeric" });
      if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
        return `${s.toLocaleDateString(dateLocale, { month: "short" })} ${s.getDate()}–${e.getDate()}, ${e.getFullYear()}`;
      }
      return `${startStr} – ${endStr}`;
    } catch {
      return `${start} — ${end}`;
    }
  }

  function daysUntil(dateStr: string) {
    const now = new Date();
    const target = new Date(dateStr);
    const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  }

  const FILTER_KEYS: FilterType[] = ["all", "ongoing", "upcoming", "completed"];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-medieval font-bold mb-2">
          <Trophy className="inline w-8 h-8 text-aoe-accent mr-2" />
          {d.title}
        </h1>
        <p className="text-gray-400">{d.subtitle}</p>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {FILTER_KEYS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "py-3 px-4 rounded-xl text-sm font-medium transition-all capitalize text-center",
              filter === f
                ? "bg-aoe-accent text-aoe-dark shadow-lg shadow-aoe-accent/20"
                : "bg-aoe-card border border-aoe-border text-gray-400 hover:text-white hover:border-aoe-accent/30"
            )}
          >
            <div className="text-lg font-bold">{statusCounts[f]}</div>
            <div className="text-xs">{f === "all" ? d.total : d[f]}</div>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-aoe-accent" />
        </div>
      ) : grouped.length > 0 ? (
        <div className="space-y-8">
          {grouped.map((group) => (
            <div key={group.title}>
              <h2 className="text-sm font-semibold text-gray-500 uppercase flex items-center gap-2 mb-4">
                {group.icon}
                {group.title} ({group.items.length})
              </h2>
              <div className="space-y-3">
                {group.items.map((t) => {
                  const tierStyle = TIER_COLORS[t.tier] || TIER_COLORS["C-Tier"];
                  const days = t.status === "upcoming" ? daysUntil(t.startDate) : 0;

                  return (
                    <div
                      key={t.id}
                      className={cn(
                        "card !p-5 flex flex-col md:flex-row md:items-center gap-4 transition-all hover:border-aoe-accent/30",
                        t.status === "ongoing" && "border-green-500/30 glow"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-semibold text-white text-lg">{t.name}</h3>
                          <StatusBadge status={t.status} dict={d} />
                          {t.tier && (
                            <span className={cn(
                              "text-xs font-semibold px-2.5 py-0.5 rounded-full border",
                              tierStyle.bg, tierStyle.text, tierStyle.border
                            )}>
                              {t.tier}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                          {t.startDate && t.endDate && (
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 shrink-0" />
                              {formatDateRange(t.startDate, t.endDate)}
                            </span>
                          )}
                          {t.prizePool && (
                            <span className="flex items-center gap-1.5">
                              <DollarSign className="w-4 h-4 shrink-0" />
                              <span className="text-yellow-400 font-medium">{t.prizePool}</span>
                            </span>
                          )}
                          {t.status === "upcoming" && days > 0 && (
                            <span className="text-blue-400 text-xs">
                              {days === 1
                                ? d.starts_in.replace("{days}", "1")
                                : d.starts_in_plural.replace("{days}", String(days))}
                            </span>
                          )}
                        </div>
                      </div>

                      {t.liquipediaUrl && (
                        <a
                          href={t.liquipediaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary !px-4 !py-2 text-sm flex items-center gap-2 shrink-0 self-start md:self-auto"
                        >
                          <Globe className="w-4 h-4" />
                          Liquipedia
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Filter className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          {d.no_tournaments}
        </div>
      )}
    </div>
  );
}

function StatusBadge({
  status,
  dict: d,
}: {
  status: string;
  dict: typeof import("@/i18n/dictionaries/en.json")["tournaments"];
}) {
  const styles: Record<string, string> = {
    ongoing: "bg-green-500/20 text-green-400 border-green-500/30",
    upcoming: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    completed: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  };
  const labels: Record<string, string> = {
    ongoing: d.ongoing,
    upcoming: d.upcoming,
    completed: d.completed,
  };
  return (
    <span className={cn(
      "text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize border",
      styles[status] || styles.completed
    )}>
      {status === "ongoing" && (
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 mr-1 animate-pulse" />
      )}
      {labels[status] || status}
    </span>
  );
}
