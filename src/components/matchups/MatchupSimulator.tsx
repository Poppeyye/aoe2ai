"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeftRight, ArrowRight, Sparkles } from "lucide-react";
import {
  CIV_DATA,
  POPULAR_MATCHUPS,
  getCivMatchupData,
  buildMatchupSlug,
} from "@/lib/aoe2/matchups";
import { cn } from "@/lib/utils";

const CIV_KEYS = Object.keys(CIV_DATA);

export default function MatchupSimulator({ locale }: { locale: string }) {
  const isEs = locale === "es";
  const t = (en: string, es: string) => (isEs ? es : en);

  const [civ1, setCiv1] = useState("franks");
  const [civ2, setCiv2] = useState("britons");

  const data = useMemo(() => getCivMatchupData(civ1, civ2), [civ1, civ2]);
  if (!data) return null;

  const {
    civ1: c1,
    civ2: c2,
    earlyGameDynamics,
    castleAgeSpikes,
    lateGameImperial,
    countersCiv1VsCiv2,
    strategicGamePlanCiv1,
  } = data;

  const ages = [
    { label: t("Feudal Age", "Edad Feudal"), favored: earlyGameDynamics.favored },
    { label: t("Castle Age", "Edad de los Castillos"), favored: castleAgeSpikes.favored },
    { label: t("Imperial Age", "Edad Imperial"), favored: lateGameImperial.favored },
  ];

  const verdict = (favored: string) =>
    favored === "civ1" ? c1.name : favored === "civ2" ? c2.name : t("Even", "Igualado");

  return (
    <div className="card !p-5 sm:!p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="font-semibold text-white">
          {t("Compare any two civilizations", "Compara dos civilizaciones cualesquiera")}
        </h2>
        <div className="flex flex-wrap items-center gap-1.5">
          {POPULAR_MATCHUPS.slice(0, 3).map((p) => {
            const active =
              (civ1 === p.civ1 && civ2 === p.civ2) || (civ1 === p.civ2 && civ2 === p.civ1);
            return (
              <button
                key={p.slug}
                onClick={() => {
                  setCiv1(p.civ1);
                  setCiv2(p.civ2);
                }}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                  active
                    ? "bg-aoe-accent text-aoe-dark"
                    : "border border-aoe-border bg-aoe-dark text-gray-400 hover:text-white"
                )}
              >
                {CIV_DATA[p.civ1]?.name} vs {CIV_DATA[p.civ2]?.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-center">
        <CivPicker
          label={t("You", "Tú")}
          value={civ1}
          onChange={setCiv1}
          archetype={c1.archetype}
          uniqueUnit={c1.uniqueUnits[0]}
          powerSpike={c1.powerSpike}
          accent
        />

        <button
          onClick={() => {
            setCiv1(civ2);
            setCiv2(civ1);
          }}
          className="mx-auto w-9 h-9 rounded-full border border-aoe-border bg-aoe-dark text-gray-400 hover:text-white hover:border-aoe-accent/60 flex items-center justify-center transition-colors"
          title={t("Swap", "Intercambiar")}
        >
          <ArrowLeftRight className="w-4 h-4" />
        </button>

        <CivPicker
          label={t("Opponent", "Rival")}
          value={civ2}
          onChange={setCiv2}
          archetype={c2.archetype}
          uniqueUnit={c2.uniqueUnits[0]}
          powerSpike={c2.powerSpike}
        />
      </div>

      <div className="grid grid-cols-3 gap-3 mt-5">
        {ages.map((age) => (
          <div
            key={age.label}
            className="rounded-lg border border-aoe-border bg-aoe-dark px-3 py-3 text-center"
          >
            <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
              {age.label}
            </div>
            <div
              className={cn(
                "text-sm font-semibold truncate",
                age.favored === "civ1"
                  ? "text-emerald-400"
                  : age.favored === "civ2"
                  ? "text-red-400"
                  : "text-gray-300"
              )}
            >
              {verdict(age.favored)}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
        <Insight
          label={t("Opening for", "Apertura para") + ` ${c1.name}`}
          body={isEs ? strategicGamePlanCiv1.opening.es : strategicGamePlanCiv1.opening.en}
        />
        <Insight
          label={t("Key counter", "Counter clave")}
          body={`${countersCiv1VsCiv2.units[0]?.name ?? ""} — ${
            isEs ? countersCiv1VsCiv2.units[0]?.why.es : countersCiv1VsCiv2.units[0]?.why.en
          }`}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5 mt-5 pt-5 border-t border-aoe-border">
        <Link
          href={`/${locale}/matchups/${buildMatchupSlug(civ1, civ2)}`}
          className="btn-primary text-sm inline-flex items-center justify-center gap-2"
        >
          {t(`Full ${c1.name} vs ${c2.name} guide`, `Guía completa ${c1.name} vs ${c2.name}`)}
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href={`/${locale}/agent`}
          className="btn-secondary text-sm inline-flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {t("Ask the AI agent", "Preguntar al agente")}
        </Link>
      </div>
    </div>
  );
}

function CivPicker({
  label,
  value,
  onChange,
  archetype,
  uniqueUnit,
  powerSpike,
  accent,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  archetype: string;
  uniqueUnit?: string;
  powerSpike: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "h-full rounded-xl border bg-aoe-dark p-4 flex flex-col gap-3",
        accent ? "border-aoe-accent/40" : "border-aoe-border"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "text-[10px] font-semibold uppercase tracking-wider",
            accent ? "text-aoe-accent" : "text-gray-500"
          )}
        >
          {label}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-gray-600 capitalize">
          {archetype}
        </span>
      </div>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-aoe-border bg-aoe-card px-3 py-2 text-sm font-semibold text-white focus:border-aoe-accent/60 focus:outline-none"
      >
        {CIV_KEYS.map((key) => (
          <option key={key} value={key}>
            {CIV_DATA[key].name}
          </option>
        ))}
      </select>

      <div className="text-xs text-gray-500 leading-relaxed line-clamp-2 min-h-[2.25rem]">
        {uniqueUnit ? <span className="text-gray-300">{uniqueUnit}</span> : null}
        {uniqueUnit ? " · " : null}
        {powerSpike}
      </div>
    </div>
  );
}

function Insight({ label, body }: { label: string; body: string }) {
  return (
    <div className="rounded-lg border border-aoe-border bg-aoe-dark px-4 py-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
        {label}
      </div>
      <p className="text-xs text-gray-300 leading-relaxed">{body}</p>
    </div>
  );
}
