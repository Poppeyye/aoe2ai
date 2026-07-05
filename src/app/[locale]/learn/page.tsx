"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  ChevronDown,
  Swords,
  Shield,
  Target,
  MapPin,
} from "lucide-react";
import { useDictionary, useLocale } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import FavoriteButton from "@/components/ui/FavoriteButton";
import { BUILD_ORDERS, type BuildOrderDifficulty } from "@/lib/aoe2/build-orders";

const DIFFICULTY_CONFIG: Record<BuildOrderDifficulty, { color: string; icon: typeof Swords }> = {
  beginner: { color: "bg-green-500/20 text-green-400 border-green-500/30", icon: Shield },
  intermediate: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Swords },
  advanced: { color: "bg-red-500/20 text-red-400 border-red-500/30", icon: Target },
};

export default function LearnPage() {
  const dict = useDictionary();
  const locale = useLocale();
  const d = dict.learn;
  const isEs = locale === "es";

  const [diffFilter, setDiffFilter] = useState<BuildOrderDifficulty | "all">("all");
  const [mapFilter, setMapFilter] = useState<string>("all");

  const allMaps = Array.from(new Set(BUILD_ORDERS.flatMap((bo) => bo.maps))).sort();

  const filtered = BUILD_ORDERS.filter((bo) => {
    if (diffFilter !== "all" && bo.difficulty !== diffFilter) return false;
    if (mapFilter !== "all" && !bo.maps.includes(mapFilter)) return false;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-medieval font-bold mb-3">
          <GraduationCap className="inline w-8 h-8 text-aoe-accent mr-2 -mt-1" />
          <span className="gold-gradient">{d.title}</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">{d.subtitle}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-8">
        <div className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-gray-500" />
          <select
            value={diffFilter}
            onChange={(e) => setDiffFilter(e.target.value as BuildOrderDifficulty | "all")}
            className="input-field !py-2 !px-3 text-sm"
          >
            <option value="all">{d.filter_by_difficulty}: {d.all}</option>
            <option value="beginner">{d.beginner}</option>
            <option value="intermediate">{d.intermediate}</option>
            <option value="advanced">{d.advanced}</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          <select
            value={mapFilter}
            onChange={(e) => setMapFilter(e.target.value)}
            className="input-field !py-2 !px-3 text-sm"
          >
            <option value="all">{d.filter_by_map}: {d.all}</option>
            {allMaps.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <span className="text-sm text-gray-500 ml-auto">
          {filtered.length} {d.build_orders.toLowerCase()}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((bo) => {
          const diffConfig = DIFFICULTY_CONFIG[bo.difficulty];
          const DiffIcon = diffConfig.icon;
          return (
            <Link
              key={bo.id}
              href={`/${locale}/learn/${bo.id}`}
              className="card text-left hover:border-aoe-accent/50 transition-all duration-300 hover:glow group block"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <h2 className="font-semibold text-white group-hover:text-aoe-accent transition-colors text-lg leading-tight truncate">
                    {isEs ? bo.nameEs : bo.name}
                  </h2>
                  <FavoriteButton
                    type="buildorder"
                    id={bo.id}
                    name={isEs ? bo.nameEs : bo.name}
                    size="sm"
                  />
                </div>
                <span className={cn("shrink-0 text-xs font-medium px-2 py-1 rounded-full border flex items-center gap-1", diffConfig.color)}>
                  <DiffIcon className="w-3 h-3" />
                  {d[bo.difficulty]}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {bo.maps.map((m) => (
                  <span key={m} className="text-xs px-2 py-0.5 rounded-full bg-aoe-dark border border-aoe-border text-gray-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {m}
                  </span>
                ))}
              </div>

              <div className="mb-3">
                <span className="text-xs text-gray-500 uppercase tracking-wide">{d.good_for}</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {bo.civs.map((c) => (
                    <span key={c} className="text-xs px-1.5 py-0.5 rounded bg-aoe-accent/10 text-aoe-accent/80">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-aoe-border/50">
                <span>{bo.steps.length} {d.steps.toLowerCase()}</span>
                <ChevronDown className="w-4 h-4 text-gray-600 group-hover:text-aoe-accent transition-colors" />
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{isEs ? "No se encontraron build orders con estos filtros." : "No build orders match the current filters."}</p>
        </div>
      )}
    </div>
  );
}
