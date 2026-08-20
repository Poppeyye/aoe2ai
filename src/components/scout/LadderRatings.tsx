import { cn } from "@/lib/utils";

/**
 * A player's 1v1 rating alone is a poor read on a team game and vice versa, so
 * scouting surfaces show both. Empire Wars ladders are only shown when the
 * player actually has games there, to avoid a wall of dashes.
 */

export interface LadderRating {
  rating?: number | string | null;
  rank?: number | string | null;
  highestRating?: number | string | null;
}

export interface LadderRatingSource {
  rm1v1?: LadderRating | null;
  rmTeam?: LadderRating | null;
  ew1v1?: LadderRating | null;
  ewTeam?: LadderRating | null;
}

function value(lb: LadderRating | null | undefined): number {
  const n = Number(lb?.rating);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

interface Entry {
  key: "rm_1v1" | "rm_team" | "ew_1v1" | "ew_team";
  label: string;
  rating: number;
  rank: number;
}

function collect(source: LadderRatingSource, isEs: boolean): Entry[] {
  const team = isEs ? "Equipo" : "Team";
  const definitions: Array<{ key: Entry["key"]; label: string; lb: LadderRating | null | undefined }> = [
    { key: "rm_1v1", label: "1v1", lb: source.rm1v1 },
    { key: "rm_team", label: team, lb: source.rmTeam },
    { key: "ew_1v1", label: "EW 1v1", lb: source.ew1v1 },
    { key: "ew_team", label: `EW ${team}`, lb: source.ewTeam },
  ];

  const all: Entry[] = definitions.map(({ key, label, lb }) => ({
    key,
    label,
    rating: value(lb),
    rank: Number(lb?.rank) > 0 ? Number(lb?.rank) : 0,
  }));

  // Random Map is the default ladder pair and stays visible even when unrated,
  // so the layout does not jump between players.
  const rm = all.filter((e) => e.key.startsWith("rm_"));
  const ew = all.filter((e) => e.key.startsWith("ew_") && e.rating > 0);
  return [...rm, ...ew];
}

/** Compact one-line form for lobby rows: "1v1 1234 · Team 1456". */
export function InlineLadderRatings({
  source,
  locale,
  activeLadder,
  loading,
}: {
  source: LadderRatingSource | null | undefined;
  locale: string;
  activeLadder?: string | null;
  loading?: boolean;
}) {
  const isEs = locale === "es";
  const entries = source ? collect(source, isEs) : [];

  if (!source || entries.every((e) => e.rating === 0)) {
    return (
      <div className="text-lg font-bold text-amber-200 tabular-nums">{loading ? "…" : "—"}</div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {entries.map((entry) => (
        <div key={entry.key} className="text-right">
          <div
            className={cn(
              "text-[10px] uppercase tracking-wider",
              entry.key === activeLadder ? "text-amber-400" : "text-slate-500",
            )}
          >
            {entry.label}
          </div>
          <div
            className={cn(
              "text-base font-bold tabular-nums",
              entry.rating > 0 ? "text-amber-200" : "text-slate-600",
            )}
          >
            {entry.rating > 0 ? entry.rating : "—"}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Larger stacked form for profile headers. */
export function LadderRatingsBlock({
  source,
  locale,
  activeLadder,
}: {
  source: LadderRatingSource;
  locale: string;
  activeLadder?: string | null;
}) {
  const isEs = locale === "es";
  const entries = collect(source, isEs);

  return (
    <div className="flex items-center gap-5">
      {entries.map((entry) => (
        <div key={entry.key} className="text-center">
          <div
            className={cn(
              "text-3xl font-bold tabular-nums",
              entry.rating > 0 ? "text-aoe-accent" : "text-gray-600",
            )}
          >
            {entry.rating > 0 ? entry.rating : "—"}
          </div>
          <div
            className={cn(
              "text-xs uppercase tracking-wider mt-0.5",
              entry.key === activeLadder ? "text-aoe-accent" : "text-gray-500",
            )}
          >
            {entry.label}
          </div>
          {entry.rank > 0 && <div className="text-[10px] text-gray-600">#{entry.rank}</div>}
        </div>
      ))}
    </div>
  );
}
