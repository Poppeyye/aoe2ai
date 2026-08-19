"use client";

import { useMemo, useState } from "react";
import { Plus, Minus, X, Info } from "lucide-react";
import {
  UNITS,
  UNITS_BY_ID,
  GATHER_RATES,
  ECO_TECHS,
  CIV_ECO_BONUSES,
  FARM_YIELD,
  FARM_TECH_LABEL,
  FARM_WOOD_COST,
  woodPer1000Food,
  planProduction,
  techBreakEvenMinutes,
  drainPerMinute,
  PRESETS,
  type FarmTech,
  type FoodSource,
  type GoldTech,
  type PlannerSettings,
  type ProductionLine,
  type ResourceKey,
  type VillagerTech,
  type WoodTech,
} from "@/lib/aoe2/eco-math";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "planner", en: "Production planner", es: "Planificador" },
  { id: "rates", en: "Gather rates", es: "Tasas de recolección" },
  { id: "farms", en: "Farm economics", es: "Economía de granjas" },
  { id: "civs", en: "Civ bonuses", es: "Bonos de civilización" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const DEFAULT_PRESET = PRESETS[2];

export default function EcoMathCalculator({ locale }: { locale: string }) {
  const isEs = locale === "es";
  const t = (en: string, es: string) => (isEs ? es : en);

  const [tab, setTab] = useState<TabId>("planner");
  const [lines, setLines] = useState<ProductionLine[]>(DEFAULT_PRESET.lines);
  const [settings, setSettings] = useState<PlannerSettings>(DEFAULT_PRESET.settings);
  const [activePreset, setActivePreset] = useState<string | null>(DEFAULT_PRESET.id);

  const result = useMemo(() => planProduction(lines, settings), [lines, settings]);

  const applyPreset = (id: string) => {
    const preset = PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setLines(preset.lines.map((l) => ({ ...l })));
    setSettings({ ...preset.settings });
    setActivePreset(preset.id);
  };

  const mutate = (next: ProductionLine[]) => {
    setLines(next);
    setActivePreset(null);
  };

  const setBuildings = (unitId: string, delta: number) => {
    mutate(
      lines
        .map((l) =>
          l.unitId === unitId ? { ...l, buildings: Math.max(0, Math.min(6, l.buildings + delta)) } : l
        )
        .filter((l) => l.buildings > 0)
    );
  };

  const addUnit = (unitId: string) => {
    if (lines.some((l) => l.unitId === unitId)) {
      setBuildings(unitId, 1);
      return;
    }
    mutate([...lines, { unitId, buildings: 1 }]);
  };

  const removeUnit = (unitId: string) => mutate(lines.filter((l) => l.unitId !== unitId));

  const patchSettings = (patch: Partial<PlannerSettings>) => {
    setSettings((s) => ({ ...s, ...patch }));
    setActivePreset(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1 p-1 rounded-xl bg-aoe-card border border-aoe-border overflow-x-auto">
        {TABS.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={cn(
              "px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
              tab === item.id
                ? "bg-aoe-accent text-aoe-dark"
                : "text-gray-400 hover:text-white hover:bg-aoe-dark/60"
            )}
          >
            {t(item.en, item.es)}
          </button>
        ))}
      </div>

      {tab === "planner" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-4">
            <PresetRow
              activePreset={activePreset}
              onSelect={applyPreset}
              label={t("Start from a standard setup", "Empieza desde una configuración estándar")}
              isEs={isEs}
            />
            <ProductionCard
              lines={lines}
              isEs={isEs}
              onAdd={addUnit}
              onRemove={removeUnit}
              onStep={setBuildings}
            />
            <SettingsCard settings={settings} onChange={patchSettings} isEs={isEs} />
          </div>

          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
            <ResultCard result={result} settings={settings} isEs={isEs} />
            <TechAdviceCard result={result} settings={settings} isEs={isEs} />
          </div>
        </div>
      )}

      {tab === "rates" && <RatesTab isEs={isEs} />}
      {tab === "farms" && <FarmsTab isEs={isEs} />}
      {tab === "civs" && <CivsTab isEs={isEs} />}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function PresetRow({
  activePreset,
  onSelect,
  label,
  isEs,
}: {
  activePreset: string | null;
  onSelect: (id: string) => void;
  label: string;
  isEs: boolean;
}) {
  return (
    <div className="card !p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">{label}</div>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelect(preset.id)}
            title={isEs ? preset.description.es : preset.description.en}
            className={cn(
              "px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors",
              activePreset === preset.id
                ? "border-aoe-accent/60 bg-aoe-accent/10 text-aoe-accent"
                : "border-aoe-border bg-aoe-dark text-gray-400 hover:text-white hover:border-gray-600"
            )}
          >
            {isEs ? preset.name.es : preset.name.en}
          </button>
        ))}
      </div>
    </div>
  );
}

function ProductionCard({
  lines,
  isEs,
  onAdd,
  onRemove,
  onStep,
}: {
  lines: ProductionLine[];
  isEs: boolean;
  onAdd: (unitId: string) => void;
  onRemove: (unitId: string) => void;
  onStep: (unitId: string, delta: number) => void;
}) {
  const t = (en: string, es: string) => (isEs ? es : en);
  const activeIds = new Set(lines.map((l) => l.unitId));
  const available = UNITS.filter((u) => !activeIds.has(u.id));

  return (
    <div className="card !p-5">
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <h3 className="font-semibold text-white">
          {t("What you are producing", "Qué estás produciendo")}
        </h3>
        <span className="text-xs text-gray-500">
          {t("buildings training non-stop", "edificios produciendo sin parar")}
        </span>
      </div>

      <div className="space-y-2">
        {lines.length === 0 && (
          <p className="text-sm text-gray-500 py-4 text-center">
            {t("Add a unit below to start.", "Añade una unidad abajo para empezar.")}
          </p>
        )}
        {lines.map((line) => {
          const unit = UNITS_BY_ID[line.unitId];
          if (!unit) return null;
          const drain = drainPerMinute(unit);
          return (
            <div
              key={line.unitId}
              className="flex items-center gap-3 rounded-lg border border-aoe-border bg-aoe-dark px-3 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-white truncate">
                  {isEs ? unit.name.es : unit.name.en}
                </div>
                <div className="text-xs text-gray-500 font-mono">
                  {formatCost(unit.cost, isEs)} · {unit.trainTimeSec}s ·{" "}
                  {formatDrain(drain, isEs)}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <StepButton onClick={() => onStep(line.unitId, -1)} label="-">
                  <Minus className="w-3.5 h-3.5" />
                </StepButton>
                <span className="w-6 text-center text-sm font-semibold text-white tabular-nums">
                  {line.buildings}
                </span>
                <StepButton onClick={() => onStep(line.unitId, 1)} label="+">
                  <Plus className="w-3.5 h-3.5" />
                </StepButton>
                <button
                  onClick={() => onRemove(line.unitId)}
                  className="ml-1 w-7 h-7 rounded-md text-gray-600 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-colors"
                  aria-label={t("Remove", "Quitar")}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {available.length > 0 && (
        <div className="mt-4 pt-4 border-t border-aoe-border">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2.5">
            {t("Add production", "Añadir producción")}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {available.map((unit) => (
              <button
                key={unit.id}
                onClick={() => onAdd(unit.id)}
                className="px-2.5 py-1 rounded-md border border-aoe-border bg-aoe-dark/60 text-xs text-gray-400 hover:text-white hover:border-aoe-accent/50 transition-colors"
              >
                {isEs ? unit.name.es : unit.name.en}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StepButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="w-7 h-7 rounded-md border border-aoe-border bg-aoe-card text-gray-300 hover:text-white hover:border-gray-600 flex items-center justify-center transition-colors"
    >
      {children}
    </button>
  );
}

function SettingsCard({
  settings,
  onChange,
  isEs,
}: {
  settings: PlannerSettings;
  onChange: (patch: Partial<PlannerSettings>) => void;
  isEs: boolean;
}) {
  const t = (en: string, es: string) => (isEs ? es : en);

  return (
    <div className="card !p-5 space-y-4">
      <h3 className="font-semibold text-white">
        {t("Your economy", "Tu economía")}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={t("Food source", "Fuente de comida")}>
          <Select
            value={settings.foodSource}
            onChange={(v) => onChange({ foodSource: v as FoodSource })}
            options={[
              { value: "farm", label: t("Farms", "Granjas") },
              { value: "sheep", label: t("Sheep", "Ovejas") },
              { value: "hunt", label: t("Hunt (boar / deer)", "Caza (jabalí / ciervo)") },
              { value: "berries", label: t("Berries", "Bayas") },
            ]}
          />
        </Field>

        <Field label={t("Villager techs", "Mejoras de aldeano")}>
          <Select
            value={settings.villagerTech}
            onChange={(v) => onChange({ villagerTech: v as VillagerTech })}
            options={[
              { value: "none", label: t("None", "Ninguna") },
              { value: "wheelbarrow", label: t("Wheelbarrow", "Carretilla") },
              { value: "hand_cart", label: t("Hand Cart", "Carretilla de Mano") },
            ]}
          />
        </Field>

        <Field label={t("Farm techs", "Mejoras de granja")} disabled={settings.foodSource !== "farm"}>
          <Select
            value={settings.farmTech}
            disabled={settings.foodSource !== "farm"}
            onChange={(v) => onChange({ farmTech: v as FarmTech })}
            options={(Object.keys(FARM_YIELD) as FarmTech[]).map((k) => ({
              value: k,
              label: `${isEs ? FARM_TECH_LABEL[k].es : FARM_TECH_LABEL[k].en} · ${FARM_YIELD[k]}F`,
            }))}
          />
        </Field>

        <Field label={t("Lumber techs", "Mejoras de madera")}>
          <Select
            value={settings.woodTech}
            onChange={(v) => onChange({ woodTech: v as WoodTech })}
            options={[
              { value: "none", label: t("None", "Ninguna") },
              { value: "double_bit_axe", label: t("Double-Bit Axe", "Hacha de Doble Filo") },
              { value: "bow_saw", label: t("Bow Saw", "Sierra de Arco") },
              { value: "two_man_saw", label: t("Two-Man Saw", "Sierra de Dos Hombres") },
            ]}
          />
        </Field>

        <Field label={t("Mining techs", "Mejoras de minería")}>
          <Select
            value={settings.goldTech}
            onChange={(v) => onChange({ goldTech: v as GoldTech })}
            options={[
              { value: "none", label: t("None", "Ninguna") },
              { value: "gold_mining", label: t("Gold Mining", "Minería de Oro") },
              { value: "gold_shaft_mining", label: t("Gold Shaft Mining", "Minería de Pozo") },
            ]}
          />
        </Field>
      </div>
    </div>
  );
}

function Field({
  label,
  disabled,
  children,
}: {
  label: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block", disabled && "opacity-40")}>
      <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}

function Select({
  value,
  onChange,
  options,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-aoe-border bg-aoe-dark px-3 py-2 text-sm text-white focus:border-aoe-accent/60 focus:outline-none disabled:cursor-not-allowed"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function ResultCard({
  result,
  settings,
  isEs,
}: {
  result: ReturnType<typeof planProduction>;
  settings: PlannerSettings;
  isEs: boolean;
}) {
  const t = (en: string, es: string) => (isEs ? es : en);
  const { villagers, rates, productionDemand, farmReseedWoodPerMin, totalWoodDemand, farms } = result;

  return (
    <div className="card !p-5">
      <div className="mb-4">
        <h3 className="font-semibold text-white">
          {t("Villagers needed", "Aldeanos necesarios")}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {t(
            "To keep every queue running without ever going idle.",
            "Para que ninguna cola de producción se quede sin recursos."
          )}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <Stat
          label={t("Food", "Comida")}
          value={villagers.food}
          detail={`${Math.round(productionDemand.food)} / ${rates.food}`}
          tone="amber"
        />
        <Stat
          label={t("Wood", "Madera")}
          value={villagers.wood}
          detail={`${Math.round(totalWoodDemand)} / ${rates.wood}`}
          tone="green"
        />
        <Stat
          label={t("Gold", "Oro")}
          value={villagers.gold}
          detail={`${Math.round(productionDemand.gold)} / ${rates.gold}`}
          tone="yellow"
        />
      </div>

      <div className="rounded-lg border border-aoe-accent/30 bg-aoe-accent/[0.06] px-4 py-3 flex items-baseline justify-between">
        <span className="text-sm text-gray-300">{t("Total on economy", "Total en economía")}</span>
        <span className="text-2xl font-bold text-aoe-accent tabular-nums">{villagers.total}</span>
      </div>

      <div className="mt-4 space-y-2.5 text-xs text-gray-400">
        {result.lines.map((line) => (
          <div key={line.unit.id} className="flex items-baseline justify-between gap-3">
            <span className="truncate">
              {line.buildings}× {isEs ? line.unit.name.es : line.unit.name.en}
            </span>
            <span className="font-mono text-gray-500 shrink-0">{formatDrain(line.drain, isEs)}</span>
          </div>
        ))}

        {farms && farmReseedWoodPerMin > 0 && (
          <div className="flex items-baseline justify-between gap-3 pt-2.5 border-t border-aoe-border">
            <span className="truncate">
              {t("Reseeding", "Resembrado")} {farms.count} {t("farms", "granjas")}
            </span>
            <span className="font-mono text-gray-500 shrink-0">
              {Math.round(farmReseedWoodPerMin)} {t("wood/min", "madera/min")}
            </span>
          </div>
        )}
      </div>

      {farms && (
        <p className="mt-4 pt-4 border-t border-aoe-border text-xs text-gray-500 leading-relaxed flex gap-2">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>
            {t(
              `Each farm holds ${FARM_YIELD[settings.farmTech]} food and runs dry every ${farms.reseedIntervalSec}s, then costs ${FARM_WOOD_COST} wood to reseed. That reseeding wood is already counted above — it is the cost most players forget.`,
              `Cada granja tiene ${FARM_YIELD[settings.farmTech]} de comida y se agota cada ${farms.reseedIntervalSec}s, y resembrarla cuesta ${FARM_WOOD_COST} de madera. Esa madera ya está contada arriba: es el coste que más se olvida.`
            )}
          </span>
        </p>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: number;
  detail: string;
  tone: "amber" | "green" | "yellow";
}) {
  const toneClass =
    tone === "amber" ? "text-amber-400" : tone === "green" ? "text-emerald-400" : "text-yellow-400";
  return (
    <div className="rounded-lg border border-aoe-border bg-aoe-dark px-3 py-3 text-center">
      <div className={cn("text-[11px] font-semibold uppercase tracking-wider mb-1", toneClass)}>
        {label}
      </div>
      <div className="text-2xl font-bold text-white tabular-nums leading-none">{value}</div>
      <div className="text-[10px] text-gray-600 font-mono mt-1.5">{detail}</div>
    </div>
  );
}

function TechAdviceCard({
  result,
  settings,
  isEs,
}: {
  result: ReturnType<typeof planProduction>;
  settings: PlannerSettings;
  isEs: boolean;
}) {
  const t = (en: string, es: string) => (isEs ? es : en);

  const candidates = useMemo(() => {
    const researched = new Set<string>();
    if (settings.woodTech === "double_bit_axe") researched.add("double_bit_axe");
    if (settings.woodTech === "bow_saw") ["double_bit_axe", "bow_saw"].forEach((i) => researched.add(i));
    if (settings.woodTech === "two_man_saw")
      ["double_bit_axe", "bow_saw", "two_man_saw"].forEach((i) => researched.add(i));
    if (settings.goldTech === "gold_mining") researched.add("gold_mining");
    if (settings.goldTech === "gold_shaft_mining")
      ["gold_mining", "gold_shaft_mining"].forEach((i) => researched.add(i));

    const nextWood: Record<WoodTech, string | null> = {
      none: "double_bit_axe",
      double_bit_axe: "bow_saw",
      bow_saw: "two_man_saw",
      two_man_saw: null,
    };
    const nextGold: Record<GoldTech, string | null> = {
      none: "gold_mining",
      gold_mining: "gold_shaft_mining",
      gold_shaft_mining: null,
    };

    const ids = [nextWood[settings.woodTech], nextGold[settings.goldTech]].filter(
      (id): id is string => Boolean(id)
    );

    return ids
      .map((id) => ECO_TECHS.find((tech) => tech.id === id))
      .filter((tech): tech is NonNullable<typeof tech> => Boolean(tech))
      .map((tech) => {
        const resource = tech.rateEffect?.resource;
        const villagers = resource === "wood" ? result.villagers.wood : result.villagers.gold;
        const rate = resource === "wood" ? result.rates.wood : result.rates.gold;
        const minutes = techBreakEvenMinutes(tech, villagers, rate);
        const extra = Math.round(villagers * rate * ((tech.rateEffect?.multiplier ?? 1) - 1));
        return { tech, minutes, extra, villagers };
      })
      .filter((c) => c.minutes !== null)
      .sort((a, b) => (a.minutes ?? 0) - (b.minutes ?? 0));
  }, [settings, result]);

  if (candidates.length === 0) return null;

  return (
    <div className="card !p-5">
      <h3 className="font-semibold text-white mb-1">
        {t("Research next", "Investiga a continuación")}
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        {t(
          "Break-even is the technology's total cost divided by the extra income it gives your current villagers.",
          "El punto de equilibrio es el coste total de la mejora dividido entre los ingresos extra que da a tus aldeanos actuales."
        )}
      </p>

      <div className="space-y-2.5">
        {candidates.map(({ tech, minutes, extra, villagers }) => (
          <div key={tech.id} className="rounded-lg border border-aoe-border bg-aoe-dark px-3.5 py-3">
            <div className="flex items-baseline justify-between gap-3 mb-1">
              <span className="text-sm font-medium text-white">
                {isEs ? tech.name.es : tech.name.en}
              </span>
              <span className="text-xs font-mono text-emerald-400 shrink-0">
                {minutes !== null && minutes < 60
                  ? `${minutes.toFixed(1)} min`
                  : t("no payback", "sin retorno")}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {formatCost(tech.cost, isEs)} ·{" "}
              {t(
                `+${extra}/min across ${villagers} villagers`,
                `+${extra}/min con ${villagers} aldeanos`
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

const RESOURCE_FILTERS: { id: ResourceKey | "all"; en: string; es: string }[] = [
  { id: "all", en: "All", es: "Todos" },
  { id: "food", en: "Food", es: "Comida" },
  { id: "wood", en: "Wood", es: "Madera" },
  { id: "gold", en: "Gold", es: "Oro" },
  { id: "stone", en: "Stone", es: "Piedra" },
];

function RatesTab({ isEs }: { isEs: boolean }) {
  const t = (en: string, es: string) => (isEs ? es : en);
  const [filter, setFilter] = useState<ResourceKey | "all">("all");
  const rates = filter === "all" ? GATHER_RATES : GATHER_RATES.filter((r) => r.resource === filter);

  return (
    <div className="card !p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="font-semibold text-white">
            {t("Resources per villager per minute", "Recursos por aldeano y minuto")}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {t(
              "Villager work rates from the game data. Farms are measured rates that include walking to the drop-off.",
              "Tasas de trabajo de los datos del juego. Las granjas son tasas medidas que incluyen el camino al depósito."
            )}
          </p>
        </div>
        <div className="flex gap-1">
          {RESOURCE_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                filter === f.id
                  ? "bg-aoe-accent text-aoe-dark"
                  : "text-gray-400 hover:text-white hover:bg-aoe-dark"
              )}
            >
              {t(f.en, f.es)}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-aoe-border">
        {rates.map((rate) => (
          <div key={rate.id} className="py-3 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-sm font-medium text-white">
                {isEs ? rate.name.es : rate.name.en}
              </div>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                {isEs ? rate.detail.es : rate.detail.en}
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-semibold text-white tabular-nums">{rate.perMinute}</div>
              <div className="text-[10px] text-gray-600 font-mono">
                {rate.perSecond ? `${rate.perSecond}/s` : t("measured", "medido")}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FarmsTab({ isEs }: { isEs: boolean }) {
  const t = (en: string, es: string) => (isEs ? es : en);
  const techs: FarmTech[] = ["none", "horse_collar", "heavy_plow", "crop_rotation"];

  return (
    <div className="space-y-4">
      <div className="card !p-5">
        <h3 className="font-semibold text-white mb-1">
          {t("What farm upgrades actually do", "Qué hacen realmente las mejoras de granja")}
        </h3>
        <p className="text-xs text-gray-500 mb-5 leading-relaxed max-w-3xl">
          {t(
            `Horse Collar, Heavy Plow and Crop Rotation do not make farmers gather faster. They make each farm hold more food, so you pay the ${FARM_WOOD_COST} wood reseed cost less often. That is the entire bonus, and it is why they matter more the more farms you have.`,
            `Collera, Arado Pesado y Rotación de Cultivos no hacen que los granjeros recolecten más rápido. Hacen que cada granja aguante más comida, así pagas los ${FARM_WOOD_COST} de madera del resembrado menos veces. Ese es todo el bono, y por eso importan más cuantas más granjas tengas.`
          )}
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-gray-500 border-b border-aoe-border">
                <th className="pb-2.5 font-semibold">{t("Upgrade", "Mejora")}</th>
                <th className="pb-2.5 font-semibold text-right">{t("Food per farm", "Comida por granja")}</th>
                <th className="pb-2.5 font-semibold text-right">
                  {t("Wood per 1,000 food", "Madera por 1.000 de comida")}
                </th>
                <th className="pb-2.5 font-semibold text-right">
                  {t("Reseed every", "Resembrado cada")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-aoe-border">
              {techs.map((tech) => {
                const yieldFood = FARM_YIELD[tech];
                const interval = Math.round((yieldFood / 22.8) * 60);
                return (
                  <tr key={tech}>
                    <td className="py-3 text-white font-medium">
                      {isEs ? FARM_TECH_LABEL[tech].es : FARM_TECH_LABEL[tech].en}
                    </td>
                    <td className="py-3 text-right tabular-nums text-gray-300">{yieldFood}</td>
                    <td className="py-3 text-right tabular-nums text-emerald-400 font-semibold">
                      {woodPer1000Food(tech)}
                    </td>
                    <td className="py-3 text-right tabular-nums text-gray-500">{interval}s</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-600 mt-3">
          {t(
            "Reseed interval assumes a farmer with Wheelbarrow (22.8 food/min).",
            "El intervalo de resembrado asume un granjero con Carretilla (22,8 comida/min)."
          )}
        </p>
      </div>

      <div className="card !p-5">
        <h3 className="font-semibold text-white mb-4">
          {t("Economy technologies", "Mejoras económicas")}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-gray-500 border-b border-aoe-border">
                <th className="pb-2.5 font-semibold">{t("Technology", "Mejora")}</th>
                <th className="pb-2.5 font-semibold">{t("Age", "Edad")}</th>
                <th className="pb-2.5 font-semibold">{t("Cost", "Coste")}</th>
                <th className="pb-2.5 font-semibold">{t("Effect", "Efecto")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-aoe-border">
              {ECO_TECHS.map((tech) => (
                <tr key={tech.id}>
                  <td className="py-3 pr-3 text-white font-medium whitespace-nowrap">
                    {isEs ? tech.name.es : tech.name.en}
                  </td>
                  <td className="py-3 pr-3 text-gray-500 capitalize whitespace-nowrap">{tech.age}</td>
                  <td className="py-3 pr-3 text-gray-400 font-mono text-xs whitespace-nowrap">
                    {formatCost(tech.cost, isEs)}
                  </td>
                  <td className="py-3 text-gray-400 text-xs leading-relaxed">
                    {isEs ? tech.effect.es : tech.effect.en}
                    {tech.note && (
                      <span className="block text-gray-600 mt-1">
                        {isEs ? tech.note.es : tech.note.en}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CivsTab({ isEs }: { isEs: boolean }) {
  const t = (en: string, es: string) => (isEs ? es : en);
  return (
    <div className="card !p-5">
      <h3 className="font-semibold text-white mb-1">
        {t("Economy bonuses that change the math", "Bonos económicos que cambian los números")}
      </h3>
      <p className="text-xs text-gray-500 mb-5">
        {t(
          "Only bonuses that alter gather rates, upgrade costs or starting resources.",
          "Solo bonos que alteran tasas de recolección, coste de mejoras o recursos iniciales."
        )}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {CIV_ECO_BONUSES.map((civ) => (
          <div key={civ.civ} className="rounded-lg border border-aoe-border bg-aoe-dark px-4 py-3.5">
            <div className="flex items-baseline justify-between gap-2 mb-1.5">
              <span className="text-sm font-semibold text-white">
                {isEs ? civ.name.es : civ.name.en}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-gray-600 font-semibold">
                {civ.resource}
              </span>
            </div>
            <div className="text-xs text-aoe-accent mb-1.5">
              {isEs ? civ.bonus.es : civ.bonus.en}
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              {isEs ? civ.inNumbers.es : civ.inNumbers.en}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function formatCost(cost: { food: number; wood: number; gold: number }, isEs: boolean): string {
  const parts: string[] = [];
  if (cost.food) parts.push(`${cost.food}${isEs ? "C" : "F"}`);
  if (cost.wood) parts.push(`${cost.wood}${isEs ? "M" : "W"}`);
  if (cost.gold) parts.push(`${cost.gold}${isEs ? "O" : "G"}`);
  return parts.join(" ") || (isEs ? "gratis" : "free");
}

function formatDrain(drain: { food: number; wood: number; gold: number }, isEs: boolean): string {
  const parts: string[] = [];
  if (drain.food > 0) parts.push(`${Math.round(drain.food)}${isEs ? "C" : "F"}`);
  if (drain.wood > 0) parts.push(`${Math.round(drain.wood)}${isEs ? "M" : "W"}`);
  if (drain.gold > 0) parts.push(`${Math.round(drain.gold)}${isEs ? "O" : "G"}`);
  return `${parts.join(" ")} /min`;
}
