"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BookOpen, Search, ArrowRightLeft, Loader2, Swords, Shield,
  Heart, Crosshair, Zap, Clock, ChevronDown, ChevronUp,
  Castle, Hammer, Eye, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDictionary, useLocale } from "@/i18n/I18nProvider";
import FavoriteButton from "@/components/ui/FavoriteButton";

interface UnitDetail {
  id: number; name: string; hp?: number; attack?: number;
  meleeArmor?: number; pierceArmor?: number; range?: number;
  speed?: number; trainTime?: number; cost?: Record<string, number>; age?: string;
}
interface TechDetail {
  id: number; name: string; cost?: Record<string, number>;
  researchTime?: number; age?: string;
}
interface BuildingDetail {
  id: number; name: string; hp?: number;
  cost?: Record<string, number>; age?: string;
}
interface CivEntry {
  key: string;
  name: string;
}
interface CivDetail {
  name: string; displayName?: string; bonuses: string[]; teamBonus: string;
  uniqueUnits: UnitDetail[]; uniqueTechs: TechDetail[];
  units: UnitDetail[]; techs: TechDetail[]; buildings: BuildingDetail[];
  disabledCounts: { units: number; techs: number; buildings: number };
  totals: { units: number; techs: number; buildings: number };
  availableUnits: number; availableTechs: number; availableBuildings: number;
}

type ViewTab = "overview" | "units" | "techs" | "buildings";

export default function TechTreePage() {
  const dict = useDictionary();
  const locale = useLocale();
  const d = dict.techtree;
  const [civs, setCivs] = useState<CivEntry[]>([]);
  const [selectedCiv, setSelectedCiv] = useState<string | null>(null);
  const [civData, setCivData] = useState<CivDetail | null>(null);
  const [compareData, setCompareData] = useState<{ civ1: CivDetail; civ2: CivDetail } | null>(null);
  const [compareCiv1, setCompareCiv1] = useState("");
  const [compareCiv2, setCompareCiv2] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [civLoading, setCivLoading] = useState(false);
  const [viewTab, setViewTab] = useState<ViewTab>("overview");
  const [unitSearch, setUnitSearch] = useState("");

  useEffect(() => {
    fetch(`/api/techtree?locale=${locale}`)
      .then((r) => r.json())
      .then((data) => { setCivs(data.civs || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [locale]);

  const selectCiv = useCallback(async (key: string) => {
    setSelectedCiv(key); setCompareData(null); setCivLoading(true); setViewTab("overview");
    try {
      const res = await fetch(`/api/techtree?civ=${encodeURIComponent(key)}&locale=${locale}`);
      setCivData(await res.json());
    } catch { setCivData(null); }
    finally { setCivLoading(false); }
  }, [locale]);

  async function doCompare() {
    if (!compareCiv1 || !compareCiv2) return;
    setCivLoading(true); setSelectedCiv(null); setCivData(null);
    try {
      const res = await fetch(
        `/api/techtree?compare=${encodeURIComponent(compareCiv1)},${encodeURIComponent(compareCiv2)}&locale=${locale}`
      );
      setCompareData(await res.json());
    } catch { setCompareData(null); }
    finally { setCivLoading(false); }
  }

  const filtered = civs.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.key.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-medieval font-bold mb-2">
          <BookOpen className="inline w-8 h-8 text-aoe-accent mr-2" />
          {d.title}
        </h1>
        <p className="text-gray-400">{d.subtitle}</p>
      </div>

      <div className="card mb-8">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-aoe-accent" />
          {d.compare_title}
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          <select value={compareCiv1} onChange={(e) => setCompareCiv1(e.target.value)} className="input-field flex-1 min-w-[200px]">
            <option value="">{d.select_first}</option>
            {civs.map((c) => <option key={c.key} value={c.key}>{c.name}</option>)}
          </select>
          <span className="text-gray-500 font-bold">vs</span>
          <select value={compareCiv2} onChange={(e) => setCompareCiv2(e.target.value)} className="input-field flex-1 min-w-[200px]">
            <option value="">{d.select_second}</option>
            {civs.map((c) => <option key={c.key} value={c.key}>{c.name}</option>)}
          </select>
          <button className="btn-primary" onClick={doCompare} disabled={!compareCiv1 || !compareCiv2 || compareCiv1 === compareCiv2}>
            {d.compare}
          </button>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder={d.filter_placeholder} className="input-field w-full pl-10" />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-aoe-accent" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-1.5 max-h-[75vh] overflow-y-auto pr-1">
              {filtered.map((civ) => (
                <button key={civ.key} onClick={() => selectCiv(civ.key)}
                  className={cn(
                    "text-left px-3 py-2 rounded-lg border text-sm transition-all",
                    selectedCiv === civ.key
                      ? "border-aoe-accent bg-aoe-accent/10 text-aoe-accent font-medium"
                      : "border-aoe-border hover:border-aoe-accent/50 text-gray-300 hover:bg-aoe-card"
                  )}>
                  {civ.name}
                </button>
              ))}
            </div>
          </div>
          <div className="lg:col-span-3">
            {civLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-aoe-accent" /></div>
            ) : compareData ? (
              <CompareView data={compareData} onClose={() => setCompareData(null)} dict={d} />
            ) : civData ? (
              <CivDetailView civ={civData} viewTab={viewTab} setViewTab={setViewTab}
                unitSearch={unitSearch} setUnitSearch={setUnitSearch} dict={d} />
            ) : (
              <div className="card text-center text-gray-500 py-12">
                <Castle className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                {d.select_civ}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

type TechTreeDict = typeof import("@/i18n/dictionaries/en.json")["techtree"];

function CivDetailView({
  civ, viewTab, setViewTab, unitSearch, setUnitSearch, dict: d,
}: {
  civ: CivDetail; viewTab: ViewTab; setViewTab: (t: ViewTab) => void;
  unitSearch: string; setUnitSearch: (s: string) => void; dict: TechTreeDict;
}) {
  const tabs: { key: ViewTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: "overview", label: d.overview, icon: <Eye className="w-4 h-4" /> },
    { key: "units", label: d.units, icon: <Swords className="w-4 h-4" />, count: civ.availableUnits },
    { key: "techs", label: d.techs, icon: <Zap className="w-4 h-4" />, count: civ.availableTechs },
    { key: "buildings", label: d.buildings_label, icon: <Castle className="w-4 h-4" />, count: civ.availableBuildings },
  ];

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-2xl font-medieval font-bold gold-gradient">{civ.displayName || civ.name}</h2>
          <FavoriteButton
            type="civ"
            id={civ.name}
            name={civ.displayName || civ.name}
          />
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20">
            <Swords className="inline w-3 h-3 mr-1" />
            {civ.availableUnits} / {civ.totals.units} {d.units}
          </span>
          <span className="px-3 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20">
            <Zap className="inline w-3 h-3 mr-1" />
            {civ.availableTechs} / {civ.totals.techs} {d.techs}
          </span>
          <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            <Castle className="inline w-3 h-3 mr-1" />
            {civ.availableBuildings} / {civ.totals.buildings} {d.buildings_label}
          </span>
        </div>
      </div>

      <div className="flex gap-1 bg-aoe-card rounded-lg p-1 border border-aoe-border">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setViewTab(tab.key)}
            className={cn(
              "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1.5",
              viewTab === tab.key ? "bg-aoe-accent text-aoe-dark" : "text-gray-400 hover:text-white"
            )}>
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.count !== undefined && (
              <span className={cn("text-xs px-1.5 rounded-full", viewTab === tab.key ? "bg-aoe-dark/20" : "bg-aoe-dark text-gray-500")}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {viewTab === "overview" && <CivOverview civ={civ} dict={d} />}
      {viewTab === "units" && <UnitList units={civ.units} search={unitSearch} onSearchChange={setUnitSearch} dict={d} />}
      {viewTab === "techs" && <TechList techs={civ.techs} dict={d} />}
      {viewTab === "buildings" && <BuildingList buildings={civ.buildings} dict={d} />}
    </div>
  );
}

function CivOverview({ civ, dict: d }: { civ: CivDetail; dict: TechTreeDict }) {
  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-aoe-accent" /> {d.civ_bonuses}
        </h3>
        <ul className="space-y-2">
          {civ.bonuses.map((b, i) => (
            <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
              <span className="text-aoe-accent mt-0.5 shrink-0">&#9670;</span><span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="card">
        <h3 className="font-semibold text-white mb-3">{d.team_bonus}</h3>
        <p className="text-sm text-gray-300">{civ.teamBonus}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Swords className="w-4 h-4 text-blue-400" /> {d.unique_units}
          </h3>
          {civ.uniqueUnits.map((u) => (
            <div key={u.id} className="mb-4 last:mb-0 p-3 bg-aoe-dark/50 rounded-lg">
              <div className="font-medium text-blue-300 mb-2">{u.name}</div>
              {u.hp !== undefined && (
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <StatPill icon={<Heart className="w-3 h-3" />} label="HP" value={u.hp} color="text-red-400" />
                  <StatPill icon={<Swords className="w-3 h-3" />} label="ATK" value={u.attack} color="text-orange-400" />
                  <StatPill icon={<Shield className="w-3 h-3" />} label="Armor" value={`${u.meleeArmor}/${u.pierceArmor}`} color="text-blue-400" />
                  {u.range !== undefined && u.range > 0 && (
                    <StatPill icon={<Crosshair className="w-3 h-3" />} label="Range" value={u.range} color="text-green-400" />
                  )}
                  <StatPill icon={<Zap className="w-3 h-3" />} label="Speed" value={u.speed?.toFixed(2)} color="text-yellow-400" />
                  <StatPill icon={<Clock className="w-3 h-3" />} label="Train" value={`${u.trainTime}s`} color="text-gray-400" />
                </div>
              )}
              {u.cost && <CostBadges cost={u.cost} className="mt-2" />}
            </div>
          ))}
        </div>
        <div className="card">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-400" /> {d.unique_techs}
          </h3>
          {civ.uniqueTechs.map((t) => (
            <div key={t.id} className="mb-4 last:mb-0 p-3 bg-aoe-dark/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-purple-300">{t.name}</span>
                {t.age && <span className="text-xs text-gray-500">{t.age}</span>}
              </div>
              {t.cost && <CostBadges cost={t.cost} />}
              {t.researchTime !== undefined && (
                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {t.researchTime}s
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function UnitList({ units, search, onSearchChange, dict: d }: {
  units: UnitDetail[]; search: string; onSearchChange: (s: string) => void; dict: TechTreeDict;
}) {
  const [sortBy, setSortBy] = useState<"name" | "hp" | "attack" | "speed">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [ageFilter, setAgeFilter] = useState<string>("all");
  const ages = ["all", "Dark Age", "Feudal Age", "Castle Age", "Imperial Age"];

  const filtered = units
    .filter((u) => {
      if (search && !u.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (ageFilter !== "all" && u.age !== ageFilter) return false;
      return true;
    })
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortBy === "name") return dir * a.name.localeCompare(b.name);
      const aVal = a[sortBy] ?? 0; const bVal = b[sortBy] ?? 0;
      return dir * ((aVal as number) - (bVal as number));
    });

  function toggleSort(key: typeof sortBy) {
    if (sortBy === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortBy(key); setSortDir("asc"); }
  }

  return (
    <div className="card">
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" value={search} onChange={(e) => onSearchChange(e.target.value)}
            placeholder={d.filter_units} className="input-field w-full pl-9 !py-2 text-sm" />
        </div>
        <div className="flex gap-1">
          {ages.map((a) => (
            <button key={a} onClick={() => setAgeFilter(a)}
              className={cn("px-2.5 py-1.5 rounded text-xs font-medium transition-colors",
                ageFilter === a ? "bg-aoe-accent text-aoe-dark" : "bg-aoe-dark text-gray-400 hover:text-white"
              )}>
              {a === "all" ? "All" : a.replace(" Age", "")}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 uppercase border-b border-aoe-border">
              <SortHeader label="Name" sortKey="name" current={sortBy} dir={sortDir} onClick={toggleSort} />
              <th className="text-left py-2 px-2">Age</th>
              <SortHeader label="HP" sortKey="hp" current={sortBy} dir={sortDir} onClick={toggleSort} />
              <SortHeader label="ATK" sortKey="attack" current={sortBy} dir={sortDir} onClick={toggleSort} />
              <th className="text-right py-2 px-2">Armor</th>
              <th className="text-right py-2 px-2">Range</th>
              <SortHeader label="Speed" sortKey="speed" current={sortBy} dir={sortDir} onClick={toggleSort} />
              <th className="text-right py-2 px-2">Cost</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-aoe-border/30 hover:bg-aoe-dark/30">
                <td className="py-2 px-2 font-medium text-white">{u.name}</td>
                <td className="py-2 px-2"><AgeTag age={u.age} /></td>
                <td className="py-2 px-2 text-right text-red-400">{u.hp ?? "—"}</td>
                <td className="py-2 px-2 text-right text-orange-400">{u.attack ?? "—"}</td>
                <td className="py-2 px-2 text-right text-blue-400">{u.meleeArmor !== undefined ? `${u.meleeArmor}/${u.pierceArmor}` : "—"}</td>
                <td className="py-2 px-2 text-right text-green-400">{u.range && u.range > 0 ? u.range : "—"}</td>
                <td className="py-2 px-2 text-right text-yellow-400">{u.speed !== undefined ? u.speed.toFixed(2) : "—"}</td>
                <td className="py-2 px-2 text-right">{u.cost ? <CostBadges cost={u.cost} compact /> : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-gray-500 mt-3">
        {d.showing_of.replace("{shown}", String(filtered.length)).replace("{total}", String(units.length))} {d.available_units}
      </div>
    </div>
  );
}

function TechList({ techs, dict: d }: { techs: TechDetail[]; dict: TechTreeDict }) {
  const [ageFilter, setAgeFilter] = useState("all");
  const ages = ["all", "Dark Age", "Feudal Age", "Castle Age", "Imperial Age"];
  const filtered = techs.filter((t) => ageFilter === "all" || t.age === ageFilter);
  const grouped: Record<string, TechDetail[]> = {};
  for (const t of filtered) { const age = t.age || "Unknown"; (grouped[age] ??= []).push(t); }

  return (
    <div className="card">
      <div className="flex gap-1 mb-4">
        {ages.map((a) => (
          <button key={a} onClick={() => setAgeFilter(a)}
            className={cn("px-2.5 py-1.5 rounded text-xs font-medium transition-colors",
              ageFilter === a ? "bg-aoe-accent text-aoe-dark" : "bg-aoe-dark text-gray-400 hover:text-white"
            )}>
            {a === "all" ? "All" : a.replace(" Age", "")}
          </button>
        ))}
      </div>
      {Object.entries(grouped).map(([age, list]) => (
        <div key={age} className="mb-6 last:mb-0">
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">
            <AgeTag age={age} /> <span className="ml-2">{list.length} {d.technologies}</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {list.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-2.5 bg-aoe-dark/50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-purple-300">{t.name}</div>
                  {t.researchTime !== undefined && (
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" /> {t.researchTime}s</div>
                  )}
                </div>
                {t.cost && <CostBadges cost={t.cost} compact />}
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="text-xs text-gray-500 mt-3">
        {d.showing_of.replace("{shown}", String(filtered.length)).replace("{total}", String(techs.length))} {d.technologies}
      </div>
    </div>
  );
}

function BuildingList({ buildings, dict: d }: { buildings: BuildingDetail[]; dict: TechTreeDict }) {
  const grouped: Record<string, BuildingDetail[]> = {};
  for (const b of buildings) { const age = b.age || "Unknown"; (grouped[age] ??= []).push(b); }

  return (
    <div className="card">
      {Object.entries(grouped).map(([age, list]) => (
        <div key={age} className="mb-6 last:mb-0">
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">
            <AgeTag age={age} /> <span className="ml-2">{list.length} {d.buildings_label}</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {list.map((b) => (
              <div key={b.id} className="p-3 bg-aoe-dark/50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-emerald-300">{b.name}</span>
                  {b.hp !== undefined && (
                    <span className="text-xs text-red-400 flex items-center gap-1"><Heart className="w-3 h-3" /> {b.hp}</span>
                  )}
                </div>
                {b.cost && <CostBadges cost={b.cost} compact />}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function CompareView({ data, onClose, dict: d }: {
  data: { civ1: CivDetail; civ2: CivDetail }; onClose: () => void; dict: TechTreeDict;
}) {
  const { civ1, civ2 } = data;
  const n1 = civ1.displayName || civ1.name;
  const n2 = civ2.displayName || civ2.name;
  const civ1UnitNames = new Set(civ1.units.map((u) => u.name));
  const civ2UnitNames = new Set(civ2.units.map((u) => u.name));
  const civ1TechNames = new Set(civ1.techs.map((t) => t.name));
  const civ2TechNames = new Set(civ2.techs.map((t) => t.name));
  const exclusiveUnits1 = civ1.units.filter((u) => !civ2UnitNames.has(u.name));
  const exclusiveUnits2 = civ2.units.filter((u) => !civ1UnitNames.has(u.name));
  const exclusiveTechs1 = civ1.techs.filter((t) => !civ2TechNames.has(t.name));
  const exclusiveTechs2 = civ2.techs.filter((t) => !civ1TechNames.has(t.name));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medieval font-bold gold-gradient">{n1} vs {n2}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <CompareStatCard label={`${d.units}`} v1={civ1.availableUnits} v2={civ2.availableUnits} total={civ1.totals.units} />
        <CompareStatCard label={`${d.techs}`} v1={civ1.availableTechs} v2={civ2.availableTechs} total={civ1.totals.techs} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card !p-4">
          <h3 className="text-sm font-semibold text-aoe-accent mb-3">{n1} — {d.civ_bonuses}</h3>
          {civ1.bonuses.map((b, i) => (<p key={i} className="text-xs text-gray-300 mb-1">&#9670; {b}</p>))}
          <p className="text-xs text-gray-500 mt-2">{d.team_bonus}: {civ1.teamBonus}</p>
        </div>
        <div className="card !p-4">
          <h3 className="text-sm font-semibold text-aoe-accent mb-3">{n2} — {d.civ_bonuses}</h3>
          {civ2.bonuses.map((b, i) => (<p key={i} className="text-xs text-gray-300 mb-1">&#9670; {b}</p>))}
          <p className="text-xs text-gray-500 mt-2">{d.team_bonus}: {civ2.teamBonus}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card !p-4">
          <h3 className="text-sm font-semibold text-blue-300 mb-2">{d.unique_units} ({n1})</h3>
          {civ1.uniqueUnits.map((u) => (<div key={u.id} className="text-xs text-gray-300 mb-1">{u.name} {u.hp ? `— ${u.hp} HP, ${u.attack} ATK` : ""}</div>))}
          <h3 className="text-sm font-semibold text-purple-300 mt-3 mb-2">{d.unique_techs}</h3>
          {civ1.uniqueTechs.map((t) => (<div key={t.id} className="text-xs text-gray-300 mb-1">{t.name} {t.age ? `(${t.age})` : ""}</div>))}
        </div>
        <div className="card !p-4">
          <h3 className="text-sm font-semibold text-blue-300 mb-2">{d.unique_units} ({n2})</h3>
          {civ2.uniqueUnits.map((u) => (<div key={u.id} className="text-xs text-gray-300 mb-1">{u.name} {u.hp ? `— ${u.hp} HP, ${u.attack} ATK` : ""}</div>))}
          <h3 className="text-sm font-semibold text-purple-300 mt-3 mb-2">{d.unique_techs}</h3>
          {civ2.uniqueTechs.map((t) => (<div key={t.id} className="text-xs text-gray-300 mb-1">{t.name} {t.age ? `(${t.age})` : ""}</div>))}
        </div>
      </div>
      <div className="card">
        <h3 className="font-semibold text-white mb-4">{d.exclusive_differences}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-xs text-gray-500 uppercase mb-2">
              {d.only_has.replace("{civ}", n1).replace("{units}", String(exclusiveUnits1.length)).replace("{techs}", String(exclusiveTechs1.length))}
            </h4>
            <div className="flex flex-wrap gap-1">
              {exclusiveUnits1.slice(0, 20).map((u) => (
                <span key={u.id} className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">{u.name}</span>
              ))}
              {exclusiveTechs1.slice(0, 20).map((t) => (
                <span key={t.id} className="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">{t.name}</span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs text-gray-500 uppercase mb-2">
              {d.only_has.replace("{civ}", n2).replace("{units}", String(exclusiveUnits2.length)).replace("{techs}", String(exclusiveTechs2.length))}
            </h4>
            <div className="flex flex-wrap gap-1">
              {exclusiveUnits2.slice(0, 20).map((u) => (
                <span key={u.id} className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">{u.name}</span>
              ))}
              {exclusiveTechs2.slice(0, 20).map((t) => (
                <span key={t.id} className="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">{t.name}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompareStatCard({ label, v1, v2, total }: { label: string; v1: number; v2: number; total: number }) {
  const pct1 = Math.round((v1 / total) * 100);
  const pct2 = Math.round((v2 / total) * 100);
  const better = v1 > v2 ? 1 : v2 > v1 ? 2 : 0;
  return (
    <div className="card !p-4">
      <div className="text-xs text-gray-500 uppercase mb-3">{label}</div>
      <div className="flex items-center gap-4">
        <div className={cn("text-2xl font-bold", better === 1 ? "text-green-400" : "text-gray-300")}>{v1}</div>
        <div className="flex-1">
          <div className="h-2 bg-aoe-dark rounded-full overflow-hidden flex">
            <div className="bg-blue-500/50 h-full" style={{ width: `${pct1}%` }} />
            <div className="bg-red-500/50 h-full" style={{ width: `${pct2}%` }} />
          </div>
          <div className="text-xs text-gray-500 text-center mt-1">{pct1}% vs {pct2}%</div>
        </div>
        <div className={cn("text-2xl font-bold", better === 2 ? "text-green-400" : "text-gray-300")}>{v2}</div>
      </div>
    </div>
  );
}

function StatPill({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number | undefined; color: string }) {
  if (value === undefined) return null;
  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-aoe-dark/50 rounded">
      <span className={color}>{icon}</span><span className="text-gray-500">{label}</span>
      <span className={cn("font-medium", color)}>{value}</span>
    </div>
  );
}

function CostBadges({ cost, compact, className }: { cost: Record<string, number>; compact?: boolean; className?: string }) {
  const colors: Record<string, string> = { Food: "text-red-400", Wood: "text-amber-600", Gold: "text-yellow-400", Stone: "text-gray-400" };
  const entries = Object.entries(cost).filter(([, v]) => v > 0);
  if (entries.length === 0) return null;
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {entries.map(([resource, amount]) => (
        <span key={resource} className={cn("text-xs font-medium", compact ? "" : "px-1.5 py-0.5 bg-aoe-dark/50 rounded", colors[resource] || "text-gray-400")}>
          {compact ? `${amount}${resource[0]}` : `${amount} ${resource}`}
        </span>
      ))}
    </div>
  );
}

function AgeTag({ age }: { age?: string }) {
  const colors: Record<string, string> = {
    "Dark Age": "bg-gray-600/20 text-gray-400", "Feudal Age": "bg-green-600/20 text-green-400",
    "Castle Age": "bg-blue-600/20 text-blue-400", "Imperial Age": "bg-purple-600/20 text-purple-400",
  };
  if (!age) return null;
  return (<span className={cn("text-xs px-2 py-0.5 rounded-full font-medium inline-block", colors[age] || "bg-gray-600/20 text-gray-400")}>{age.replace(" Age", "")}</span>);
}

function SortHeader<T extends string>({ label, sortKey, current, dir, onClick }: {
  label: string; sortKey: T; current: string; dir: string; onClick: (key: T) => void;
}) {
  const active = current === sortKey;
  return (
    <th className="text-right py-2 px-2 cursor-pointer hover:text-aoe-accent transition-colors select-none" onClick={() => onClick(sortKey)}>
      <span className="inline-flex items-center gap-1">
        {label}
        {active && (dir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
      </span>
    </th>
  );
}
