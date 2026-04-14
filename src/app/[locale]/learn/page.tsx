"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  GraduationCap,
  Timer,
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Swords,
  Shield,
  Castle,
  Target,
  MapPin,
} from "lucide-react";
import { useDictionary, useLocale } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import FavoriteButton from "@/components/ui/FavoriteButton";

type Difficulty = "beginner" | "intermediate" | "advanced";

interface BuildOrder {
  id: string;
  name: string;
  nameEs: string;
  difficulty: Difficulty;
  maps: string[];
  civs: string[];
  steps: { pop: string; task: string; taskEs: string }[];
  tips: string[];
  tipsEs: string[];
}

const STEP_DURATION_SECONDS = 10;

const BUILD_ORDERS: BuildOrder[] = [
  {
    id: "22-pop-scouts",
    name: "22-Pop Scouts",
    nameEs: "Scouts a 22 de Población",
    difficulty: "beginner",
    maps: ["Arabia"],
    civs: ["Franks", "Mongols", "Huns", "Lithuanians"],
    steps: [
      { pop: "1-6", task: "6 villagers to sheep under TC", taskEs: "6 aldeanos a ovejas bajo el TC" },
      { pop: "7-10", task: "4 villagers to wood (build lumber camp)", taskEs: "4 aldeanos a madera (construir campamento maderero)" },
      { pop: "11", task: "Lure 1st boar with a villager", taskEs: "Atraer 1er jabalí con un aldeano" },
      { pop: "12-15", task: "4 villagers to berries (build mill)", taskEs: "4 aldeanos a bayas (construir molino)" },
      { pop: "16", task: "Lure 2nd boar", taskEs: "Atraer 2do jabalí" },
      { pop: "17-19", task: "3 villagers build farms under TC", taskEs: "3 aldeanos construyen granjas bajo el TC" },
      { pop: "20-21", task: "2 villagers to wood (2nd lumber camp or join 1st)", taskEs: "2 aldeanos a madera (2do campamento o unirse al 1ro)" },
      { pop: "22", task: "Research Loom → Click Feudal Age", taskEs: "Investigar Telares → Clic en Edad Feudal" },
      { pop: "F", task: "While advancing: build stable with 2 wood villagers", taskEs: "Mientras avanzas: construir establo con 2 aldeanos de madera" },
      { pop: "F", task: "Produce scouts non-stop, add farms as wood allows", taskEs: "Producir exploradores sin parar, añadir granjas según la madera" },
    ],
    tips: [
      "Force-drop food from boar before it dies so you don't waste decay",
      "Push deer with your scout toward TC for extra food",
      "Keep scout production constant — idle stable = lost pressure",
      "Prioritize farms over berries once you click Feudal",
    ],
    tipsEs: [
      "Fuerza la descarga de comida del jabalí antes de que muera para no perder decay",
      "Empuja ciervos con el explorador hacia el TC para comida extra",
      "Mantén producción constante de exploradores — establo inactivo = presión perdida",
      "Prioriza granjas sobre bayas una vez hagas clic en Feudal",
    ],
  },
  {
    id: "22-pop-archers",
    name: "22-Pop Archers",
    nameEs: "Arqueros a 22 de Población",
    difficulty: "beginner",
    maps: ["Arabia"],
    civs: ["Britons", "Mayans", "Ethiopians", "Vietnamese"],
    steps: [
      { pop: "1-6", task: "6 villagers to sheep under TC", taskEs: "6 aldeanos a ovejas bajo el TC" },
      { pop: "7-10", task: "4 villagers to wood (build lumber camp)", taskEs: "4 aldeanos a madera (construir campamento maderero)" },
      { pop: "11", task: "Lure 1st boar with a villager", taskEs: "Atraer 1er jabalí con un aldeano" },
      { pop: "12-15", task: "4 villagers to berries (build mill)", taskEs: "4 aldeanos a bayas (construir molino)" },
      { pop: "16", task: "Lure 2nd boar", taskEs: "Atraer 2do jabalí" },
      { pop: "17-18", task: "2 villagers to gold (build mining camp)", taskEs: "2 aldeanos a oro (construir campamento minero)" },
      { pop: "19", task: "1 villager builds a farm under TC", taskEs: "1 aldeano construye granja bajo el TC" },
      { pop: "20-21", task: "2 villagers to wood", taskEs: "2 aldeanos a madera" },
      { pop: "22", task: "Research Loom → Click Feudal Age", taskEs: "Investigar Telares → Clic en Edad Feudal" },
      { pop: "F", task: "While advancing: build 2 archery ranges with wood villagers", taskEs: "Mientras avanzas: construir 2 galerías de tiro con aldeanos de madera" },
      { pop: "F", task: "Produce archers non-stop, add villagers to gold", taskEs: "Producir arqueros sin parar, añadir aldeanos al oro" },
    ],
    tips: [
      "You need at least 7 on gold to sustain 2-range archer production",
      "Research Fletching ASAP for +1 range and attack",
      "Micro archers in a line formation — focus fire one unit at a time",
      "Wall your base before sending archers forward",
    ],
    tipsEs: [
      "Necesitas al menos 7 en oro para sostener producción de arqueros en 2 galerías",
      "Investiga Punta de flecha lo antes posible para +1 rango y ataque",
      "Micro los arqueros en línea — enfoca fuego de a una unidad",
      "Amuralla tu base antes de enviar arqueros al frente",
    ],
  },
  {
    id: "fast-castle",
    name: "Fast Castle",
    nameEs: "Castillos Rápido",
    difficulty: "beginner",
    maps: ["Arena", "Black Forest", "Hideout"],
    civs: ["Franks", "Teutons", "Persians", "Spanish"],
    steps: [
      { pop: "1-6", task: "6 villagers to sheep under TC", taskEs: "6 aldeanos a ovejas bajo el TC" },
      { pop: "7-10", task: "4 villagers to wood (build lumber camp)", taskEs: "4 aldeanos a madera (construir campamento maderero)" },
      { pop: "11", task: "Lure 1st boar with a villager", taskEs: "Atraer 1er jabalí con un aldeano" },
      { pop: "12-15", task: "4 villagers to berries (build mill)", taskEs: "4 aldeanos a bayas (construir molino)" },
      { pop: "16", task: "Lure 2nd boar", taskEs: "Atraer 2do jabalí" },
      { pop: "17-19", task: "3 villagers to gold (build mining camp)", taskEs: "3 aldeanos a oro (construir campamento minero)" },
      { pop: "20-21", task: "2 villagers to wood (2nd lumber camp)", taskEs: "2 aldeanos a madera (2do campamento maderero)" },
      { pop: "22-24", task: "Move 2 boar/sheep vills to farms, research Loom", taskEs: "Mover 2 aldeanos de jabalí/ovejas a granjas, investigar Telares" },
      { pop: "24", task: "Click Feudal Age", taskEs: "Clic en Edad Feudal" },
      { pop: "F", task: "While advancing: build barracks + market/blacksmith", taskEs: "Mientras avanzas: construir cuartel + mercado/herrería" },
      { pop: "F", task: "Immediately click Castle Age upon reaching Feudal", taskEs: "Inmediatamente clic en Edad de los Castillos al llegar a Feudal" },
      { pop: "C", task: "Build 2nd TC, boom economy, produce knights or UU", taskEs: "Construir 2do TC, expandir economía, producir caballeros o UU" },
    ],
    tips: [
      "On Arena you can wall with buildings — no need to waste wood on palisades",
      "Aim for Castle Age around 16:00-17:00 game time",
      "Place your 2nd TC on a woodline or gold for maximum efficiency",
      "If you scout early aggression, add a defensive tower before clicking Castle",
    ],
    tipsEs: [
      "En Arena puedes amurallar con edificios — no gastes madera en empalizadas",
      "Apunta a llegar a Castillos alrededor de 16:00-17:00 de tiempo de juego",
      "Coloca tu 2do TC en un bosque u oro para máxima eficiencia",
      "Si descubres agresión temprana, añade una torre defensiva antes de hacer clic en Castillos",
    ],
  },
  {
    id: "maa-archers",
    name: "Men-at-Arms into Archers",
    nameEs: "Hombres de Armas a Arqueros",
    difficulty: "intermediate",
    maps: ["Arabia"],
    civs: ["Japanese", "Vikings", "Celts", "Aztecs"],
    steps: [
      { pop: "1-6", task: "6 villagers to sheep under TC", taskEs: "6 aldeanos a ovejas bajo el TC" },
      { pop: "7-10", task: "4 villagers to wood (build lumber camp)", taskEs: "4 aldeanos a madera (construir campamento maderero)" },
      { pop: "11", task: "Lure 1st boar with a villager", taskEs: "Atraer 1er jabalí con un aldeano" },
      { pop: "12-14", task: "3 villagers to berries (build mill)", taskEs: "3 aldeanos a bayas (construir molino)" },
      { pop: "15", task: "Research Loom, lure 2nd boar", taskEs: "Investigar Telares, atraer 2do jabalí" },
      { pop: "15-16", task: "Build barracks with 1 villager (send to wood after)", taskEs: "Construir cuartel con 1 aldeano (enviar a madera después)" },
      { pop: "17-19", task: "3 villagers — 1 to berries, 2 to gold (build mining camp)", taskEs: "3 aldeanos — 1 a bayas, 2 a oro (construir campamento minero)" },
      { pop: "20", task: "Queue 3 militia from barracks", taskEs: "Encolar 3 milicianos del cuartel" },
      { pop: "21", task: "1 more villager to gold, click Feudal Age", taskEs: "1 aldeano más a oro, clic en Edad Feudal" },
      { pop: "F", task: "Research Men-at-Arms upgrade, send militia forward", taskEs: "Investigar mejora de Hombres de Armas, enviar milicianos al frente" },
      { pop: "F", task: "Build 2 archery ranges while MAA harass", taskEs: "Construir 2 galerías de tiro mientras los HdA acosan" },
      { pop: "F", task: "Transition: archers non-stop, add farms + gold", taskEs: "Transición: arqueros sin parar, añadir granjas + oro" },
    ],
    tips: [
      "Time your militia to arrive just as Men-at-Arms finishes researching",
      "Target enemy woodlines and mining camps with your MAA",
      "Don't over-commit MAA — their main job is to buy time for your ranges",
      "Research Fletching before Armor for archers — offense wins in Feudal",
    ],
    tipsEs: [
      "Sincroniza tus milicianos para que lleguen justo cuando termine la mejora de HdA",
      "Ataca líneas de madera y campamentos mineros enemigos con tus HdA",
      "No te excedas con los HdA — su objetivo es ganar tiempo para tus galerías",
      "Investiga Punta de flecha antes que Armadura — la ofensiva gana en Feudal",
    ],
  },
  {
    id: "drush-fc",
    name: "Drush Fast Castle",
    nameEs: "Drush a Castillos Rápido",
    difficulty: "intermediate",
    maps: ["Arabia", "Runestones"],
    civs: ["Aztecs", "Mayans", "Malay", "Chinese"],
    steps: [
      { pop: "1-6", task: "6 villagers to sheep under TC", taskEs: "6 aldeanos a ovejas bajo el TC" },
      { pop: "7-8", task: "2 villagers build barracks then go to wood", taskEs: "2 aldeanos construyen cuartel y luego van a madera" },
      { pop: "9-10", task: "2 villagers to wood (build lumber camp)", taskEs: "2 aldeanos a madera (construir campamento maderero)" },
      { pop: "11", task: "Lure 1st boar with a villager", taskEs: "Atraer 1er jabalí con un aldeano" },
      { pop: "—", task: "Queue 3 militia as soon as barracks finishes", taskEs: "Encolar 3 milicianos cuando termine el cuartel" },
      { pop: "12-15", task: "4 villagers to berries (build mill)", taskEs: "4 aldeanos a bayas (construir molino)" },
      { pop: "16", task: "Lure 2nd boar, send 3 militia to harass enemy", taskEs: "Atraer 2do jabalí, enviar 3 milicianos a acosar al enemigo" },
      { pop: "17-19", task: "3 villagers to gold (build mining camp)", taskEs: "3 aldeanos a oro (construir campamento minero)" },
      { pop: "20-22", task: "Move food villagers to farms, add 2 to wood", taskEs: "Mover aldeanos de comida a granjas, añadir 2 a madera" },
      { pop: "23", task: "Research Loom → Click Feudal Age", taskEs: "Investigar Telares → Clic en Edad Feudal" },
      { pop: "F", task: "Build market + blacksmith, click Castle Age immediately", taskEs: "Construir mercado + herrería, clic en Castillos inmediatamente" },
      { pop: "C", task: "Boom with 2-3 TCs or produce knights / unique unit", taskEs: "Expandir con 2-3 TCs o producir caballeros / unidad única" },
    ],
    tips: [
      "Militia should target enemy walls, berries, or woodlines — force idle time",
      "Don't chase with militia — just keep them near enemy resources",
      "This BO is about disruption, not kills. A few seconds of idle TC is worth it",
      "Transition to knights, eagles, or unique unit depending on your civ",
    ],
    tipsEs: [
      "Los milicianos deben atacar murallas, bayas o bosques del enemigo — fuerza tiempo muerto",
      "No persigas con milicianos — solo mantenlos cerca de los recursos enemigos",
      "Este BO busca disrupción, no matar. Unos segundos de TC inactivo vale la pena",
      "Transiciona a caballeros, águilas o unidad única según tu civ",
    ],
  },
  {
    id: "trush",
    name: "Tower Rush (Trush)",
    nameEs: "Rush de Torres (Trush)",
    difficulty: "advanced",
    maps: ["Arabia"],
    civs: ["Koreans", "Incas", "Teutons", "Spanish"],
    steps: [
      { pop: "1-6", task: "6 villagers to sheep under TC", taskEs: "6 aldeanos a ovejas bajo el TC" },
      { pop: "7-10", task: "4 villagers to wood (build lumber camp)", taskEs: "4 aldeanos a madera (construir campamento maderero)" },
      { pop: "11", task: "Lure 1st boar with a villager", taskEs: "Atraer 1er jabalí con un aldeano" },
      { pop: "12-16", task: "5 villagers to stone (build mining camp)", taskEs: "5 aldeanos a piedra (construir campamento minero)" },
      { pop: "17", task: "Lure 2nd boar", taskEs: "Atraer 2do jabalí" },
      { pop: "18-19", task: "2 villagers to berries or farms", taskEs: "2 aldeanos a bayas o granjas" },
      { pop: "20", task: "Research Loom → Click Feudal Age", taskEs: "Investigar Telares → Clic en Edad Feudal" },
      { pop: "F", task: "Send 3-4 villagers forward with stone (gather ~270 stone first)", taskEs: "Enviar 3-4 aldeanos al frente con piedra (recolectar ~270 piedra primero)" },
      { pop: "F", task: "Build tower on enemy woodline or gold", taskEs: "Construir torre en bosque u oro enemigo" },
      { pop: "F", task: "Build 2nd tower to cover the 1st, deny resources", taskEs: "Construir 2da torre para cubrir la 1ra, negar recursos" },
      { pop: "F", task: "Continue pressure: 3rd tower or transition to Castle Age", taskEs: "Continuar presión: 3ra torre o transicionar a Edad de los Castillos" },
    ],
    tips: [
      "Scout the enemy base early — pick the most exposed resource to tower",
      "Build your first tower just outside their TC range (6 tiles)",
      "Keep your forward villagers alive — garrison in tower if attacked",
      "Don't forget your home economy! Keep making villagers at your TC",
    ],
    tipsEs: [
      "Explora la base enemiga temprano — elige el recurso más expuesto para poner torre",
      "Construye la primera torre justo fuera del rango del TC enemigo (6 casillas)",
      "Mantén vivos a tus aldeanos avanzados — refugia en la torre si los atacan",
      "¡No olvides tu economía en casa! Sigue creando aldeanos en tu TC",
    ],
  },
];

const DIFFICULTY_CONFIG: Record<Difficulty, { color: string; icon: typeof Swords }> = {
  beginner: { color: "bg-green-500/20 text-green-400 border-green-500/30", icon: Shield },
  intermediate: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Swords },
  advanced: { color: "bg-red-500/20 text-red-400 border-red-500/30", icon: Target },
};

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function BuildOrderDetail({
  bo,
  locale,
  d,
  onBack,
}: {
  bo: BuildOrder;
  locale: string;
  d: ReturnType<typeof useDictionary>["learn"];
  onBack: () => void;
}) {
  const [timerStep, setTimerStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isEs = locale === "es";
  const name = isEs ? bo.nameEs : bo.name;
  const tips = isEs ? bo.tipsEs : bo.tips;
  const diffConfig = DIFFICULTY_CONFIG[bo.difficulty];
  const DiffIcon = diffConfig.icon;

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    stop();
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        if (next > 0 && next % STEP_DURATION_SECONDS === 0) {
          setTimerStep((s) => (s < bo.steps.length - 1 ? s + 1 : s));
        }
        return next;
      });
    }, 1000);
  }, [stop, bo.steps.length]);

  const pause = useCallback(() => {
    setRunning(false);
    stop();
  }, [stop]);

  const reset = useCallback(() => {
    stop();
    setRunning(false);
    setTimerStep(0);
    setElapsed(0);
  }, [stop]);

  useEffect(() => {
    return stop;
  }, [stop]);

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={onBack}
        className="text-sm text-gray-400 hover:text-aoe-accent transition-colors mb-6 flex items-center gap-1"
      >
        <ChevronUp className="w-4 h-4" />
        {d.back}
      </button>

      <div className="card mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-medieval font-bold text-white">{name}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full border flex items-center gap-1", diffConfig.color)}>
                <DiffIcon className="w-3 h-3" />
                {d[bo.difficulty]}
              </span>
              {bo.maps.map((m) => (
                <span key={m} className="text-xs px-2.5 py-1 rounded-full bg-aoe-dark border border-aoe-border text-gray-300 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-2">
          <span className="text-sm text-gray-400">{d.good_for}:</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {bo.civs.map((c) => (
              <span key={c} className="text-xs px-2 py-0.5 rounded bg-aoe-accent/10 text-aoe-accent border border-aoe-accent/20">
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Timer className="w-5 h-5 text-aoe-accent" />
          <h3 className="font-semibold text-white">{d.start_timer}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-3 mb-2">
          {!running ? (
            <button onClick={start} className="btn-primary !px-4 !py-2 text-sm flex items-center gap-2">
              <Play className="w-4 h-4" />
              {d.start_timer}
            </button>
          ) : (
            <button onClick={pause} className="btn-secondary !px-4 !py-2 text-sm flex items-center gap-2">
              <Pause className="w-4 h-4" />
              {d.pause}
            </button>
          )}
          <button onClick={reset} className="btn-secondary !px-4 !py-2 text-sm flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            {d.reset}
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-400 ml-auto">
            <span>{d.elapsed}: <span className="text-white font-mono">{formatElapsed(elapsed)}</span></span>
            <span className="text-aoe-border">|</span>
            <span>
              {d.step_x_of_y
                .replace("{current}", String(timerStep + 1))
                .replace("{total}", String(bo.steps.length))}
            </span>
          </div>
        </div>
      </div>

      <div className="card mb-6">
        <h3 className="section-title !text-lg !mb-4 flex items-center gap-2">
          <Castle className="w-5 h-5 text-aoe-accent" />
          {d.steps}
        </h3>
        <div className="space-y-1">
          {bo.steps.map((step, i) => {
            const isActive = running && i === timerStep;
            const isDone = running && i < timerStep;
            return (
              <div
                key={i}
                className={cn(
                  "flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all duration-300",
                  isActive && "bg-aoe-accent/15 border border-aoe-accent/40",
                  isDone && "opacity-50",
                  !isActive && !isDone && "hover:bg-aoe-dark/50"
                )}
              >
                <span
                  className={cn(
                    "shrink-0 w-10 text-center text-xs font-mono font-bold py-1 rounded",
                    step.pop === "F"
                      ? "bg-blue-500/20 text-blue-400"
                      : step.pop === "C"
                        ? "bg-purple-500/20 text-purple-400"
                        : step.pop === "—"
                          ? "bg-aoe-dark text-gray-500"
                          : "bg-aoe-dark text-aoe-accent"
                  )}
                >
                  {step.pop === "F"
                    ? (isEs ? "FEU" : "FEU")
                    : step.pop === "C"
                      ? (isEs ? "CAS" : "CAS")
                      : step.pop}
                </span>
                <span className={cn("text-sm", isActive ? "text-white font-medium" : "text-gray-300")}>
                  {isEs ? step.taskEs : step.task}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <h3 className="section-title !text-lg !mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-aoe-accent" />
          {d.tips}
        </h3>
        <ul className="space-y-3">
          {tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
              <span className="text-aoe-accent mt-0.5 shrink-0">▸</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function LearnPage() {
  const dict = useDictionary();
  const locale = useLocale();
  const d = dict.learn;
  const isEs = locale === "es";

  const [selectedBo, setSelectedBo] = useState<BuildOrder | null>(null);
  const [diffFilter, setDiffFilter] = useState<Difficulty | "all">("all");
  const [mapFilter, setMapFilter] = useState<string>("all");

  const allMaps = Array.from(new Set(BUILD_ORDERS.flatMap((bo) => bo.maps))).sort();

  const filtered = BUILD_ORDERS.filter((bo) => {
    if (diffFilter !== "all" && bo.difficulty !== diffFilter) return false;
    if (mapFilter !== "all" && !bo.maps.includes(mapFilter)) return false;
    return true;
  });

  if (selectedBo) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <BuildOrderDetail bo={selectedBo} locale={locale} d={d} onBack={() => setSelectedBo(null)} />
      </div>
    );
  }

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
            onChange={(e) => setDiffFilter(e.target.value as Difficulty | "all")}
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
            <button
              key={bo.id}
              onClick={() => setSelectedBo(bo)}
              className="card text-left hover:border-aoe-accent/50 transition-all duration-300 hover:glow group"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <h3 className="font-semibold text-white group-hover:text-aoe-accent transition-colors text-lg leading-tight truncate">
                    {isEs ? bo.nameEs : bo.name}
                  </h3>
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
            </button>
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
