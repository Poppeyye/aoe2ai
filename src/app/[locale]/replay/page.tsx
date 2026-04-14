"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Upload, FileText, Loader2, AlertCircle, Swords, Clock,
  MapPin, MessageSquare, BarChart3, Shield, Flame, Crown, Sparkles,
} from "lucide-react";
import { cn, formatTime } from "@/lib/utils";
import { useDictionary, useLocale } from "@/i18n/I18nProvider";
import AssistantPanel from "@/components/ai/AssistantPanel";
import ToolActivityPanel from "@/components/ai/ToolActivityPanel";
import MarkdownMessage from "@/components/ai/MarkdownMessage";
import { useStreamedAssistant } from "@/components/ai/useStreamedAssistant";
import KofiHint from "@/components/ui/KofiHint";

interface Player {
  name: string; civ: string; civId: number; color: number;
  winner: boolean; feudalTime?: number; castleTime?: number; imperialTime?: number;
}
interface HeatPoint { x: number; y: number; type: string; playerId: number; timeSec: number; }
interface BattleData { id: number; startTime: number; endTime: number; location: { x: number; y: number }; participants: number[]; casualties: Record<string, number>; }
interface TimelineEvent { time: number; playerId: number; type: string; description: string; }
interface ChatMsg { timeSec: number; player: number; message: string; }

interface PlayerStatData {
  playerId: number;
  eapm: number;
  eapmOverTime: Array<{ minute: number; eapm: number }>;
  unitsTrainedByType: Record<string, number>;
  totalUnitsTrained: number;
  buildingsPlaced: Record<string, number>;
  totalBuildingsPlaced: number;
  militaryActions: number;
  economyActions: number;
}

interface AnalysisResult {
  chronicle: string;
  aiContext?: Record<string, unknown>;
  aiEnabled?: boolean;
  version: string;
  map: string;
  mapSize: { x: number; y: number };
  duration: number;
  players: Player[];
  battles: BattleData[];
  timeline: TimelineEvent[];
  chats: ChatMsg[];
  gameSettings: Record<string, string | boolean>;
  actionCounts: Record<string, number>;
  heatmapData: HeatPoint[];
  militaryEvents: HeatPoint[];
  playerStats: Record<string, PlayerStatData>;
}

const PLAYER_COLORS = ["#4a90d9", "#da4f49", "#3cb371", "#e6c619", "#00bcd4", "#ab47bc", "#ff7043", "#78909c"];

export default function ReplayPage() {
  const dict = useDictionary();
  const locale = useLocale();
  const d = dict.replay;
  const [dragging, setDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [heatmapMode, setHeatmapMode] = useState<"all" | "combat" | "build" | "move">("all");

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith(".aoe2record")) {
      setError(d.error_format);
      return;
    }
    setAnalyzing(true);
    setError(null);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("replay", file);
      const res = await fetch(`/api/replay?locale=${locale}`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setResult(data);
      requestAnimationFrame(() => window.scrollTo({ top: 0 }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to analyze replay");
    } finally {
      setAnalyzing(false);
    }
  }, [d.error_format, locale]);

  const [aiRequested, setAiRequested] = useState(false);

  useEffect(() => {
    setAiRequested(false);
  }, [result?.map, result?.duration]);

  const streamedChronicle = useStreamedAssistant({
    surface: "replay",
    locale: locale === "es" ? "es" : "en",
    context: result?.aiContext,
    prompt: locale === "es"
      ? "Analiza este replay y crea una crónica clara con momentos decisivos, errores, aciertos y consejos de mejora."
      : "Analyze this replay and produce a clear chronicle with turning points, mistakes, strong decisions, and improvement advice.",
    enabled: Boolean(aiRequested && result?.aiEnabled && result?.aiContext),
    resetKey: result
      ? `${result.map}-${result.duration}-${result.players.map((p) => p.name).join("-")}-${locale}-${aiRequested}`
      : `empty-${locale}`,
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-medieval font-bold mb-2">{d.title}</h1>
        <p className="text-gray-400">{d.subtitle}</p>
      </div>

      {!result && (
        <DropZone dragging={dragging} setDragging={setDragging} analyzing={analyzing} onFile={handleFile} dict={d} />
      )}

      {error && (
        <div className="mt-6 card !border-red-500/50 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-6 mt-4">
          <div className="card">
            <h2 className="section-title flex items-center gap-2">
              <FileText className="w-5 h-5 text-aoe-accent" /> {d.match_overview}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Stat label={d.map} value={result.map} />
              <Stat label={d.duration} value={result.duration > 0 ? formatTime(result.duration) : "—"} />
              <Stat label={d.version} value={result.version} />
              <Stat label={d.battles} value={String(result.battles.length)} />
              <Stat label={d.events} value={String(result.timeline.length)} />
            </div>
          </div>

          <div className="card">
            <h2 className="section-title flex items-center gap-2">
              <Crown className="w-5 h-5 text-aoe-accent" /> {d.players}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.players.map((p, i) => (
                <div key={i} className={cn(
                  "p-4 rounded-lg border",
                  p.winner ? "border-green-500/40 bg-green-500/5" : "border-aoe-border"
                )}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: PLAYER_COLORS[i] }} />
                      <div>
                        <div className="font-semibold text-white">{p.name}</div>
                        <div className="text-sm text-gray-400">{p.civ}</div>
                      </div>
                    </div>
                    {p.winner && (
                      <span className="text-xs font-medium px-2 py-1 rounded bg-green-500/20 text-green-400">{d.winner}</span>
                    )}
                  </div>
                  {(p.feudalTime || p.castleTime || p.imperialTime) && (
                    <div className="flex gap-4 text-xs text-gray-400">
                      {p.feudalTime && <span>Feudal: {formatTime(p.feudalTime)}</span>}
                      {p.castleTime && <span>Castle: {formatTime(p.castleTime)}</span>}
                      {p.imperialTime && <span>Imperial: {formatTime(p.imperialTime)}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {result.playerStats && Object.keys(result.playerStats).length > 0 && (
            <div className="card">
              <h2 className="section-title flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-aoe-accent" /> {d.player_stats}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {result.players.map((p, i) => {
                  const stats = result.playerStats[String(i + 1)];
                  if (!stats) return null;
                  const militaryUnits = Object.entries(stats.unitsTrainedByType)
                    .filter(([name]) => name !== "Villager")
                    .sort(([, a], [, b]) => b - a);
                  const villagers = stats.unitsTrainedByType["Villager"] || 0;
                  return (
                    <div key={i} className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PLAYER_COLORS[i] }} />
                        <span className="font-semibold text-white">{p.name}</span>
                        <span className="text-xs text-gray-500">({p.civ})</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-aoe-dark rounded-lg p-2.5 text-center">
                          <div className="text-xs text-gray-500">eAPM</div>
                          <div className="text-xl font-bold text-aoe-accent">{stats.eapm}</div>
                        </div>
                        <div className="bg-aoe-dark rounded-lg p-2.5 text-center">
                          <div className="text-xs text-gray-500">{d.events}</div>
                          <div className="text-xl font-bold text-white">{stats.totalUnitsTrained}</div>
                        </div>
                        <div className="bg-aoe-dark rounded-lg p-2.5 text-center">
                          <div className="text-xs text-gray-500">{d.buildings}</div>
                          <div className="text-xl font-bold text-white">{stats.totalBuildingsPlaced}</div>
                        </div>
                      </div>
                      {stats.eapmOverTime && stats.eapmOverTime.length > 0 && (
                        <EapmChart data={stats.eapmOverTime} color={PLAYER_COLORS[i]} />
                      )}
                      {(militaryUnits.length > 0 || villagers > 0) && (
                        <div className="space-y-1.5">
                          <div className="text-xs text-gray-400 uppercase font-medium">{d.army_composition}</div>
                          {villagers > 0 && (
                            <UnitBar name="Villager" count={villagers} total={stats.totalUnitsTrained} color="#8bc34a" />
                          )}
                          {militaryUnits.map(([name, count]) => (
                            <UnitBar key={name} name={name} count={count} total={stats.totalUnitsTrained} color={PLAYER_COLORS[i]} />
                          ))}
                        </div>
                      )}
                      {Object.keys(stats.buildingsPlaced).length > 0 && (
                        <div className="space-y-1">
                          <div className="text-xs text-gray-400 uppercase font-medium">{d.buildings}</div>
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(stats.buildingsPlaced).sort(([, a], [, b]) => b - a).map(([name, count]) => (
                              <span key={name} className="text-xs px-2 py-0.5 rounded bg-aoe-dark text-gray-300">
                                {count}× {name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {result.heatmapData.length > 0 && (
            <div className="card">
              <h2 className="section-title flex items-center gap-2">
                <Flame className="w-5 h-5 text-aoe-accent" /> {d.battlefield_map}
              </h2>
              <div className="flex gap-2 mb-4">
                {(["all", "combat", "build", "move"] as const).map((mode) => (
                  <button key={mode} onClick={() => setHeatmapMode(mode)}
                    className={cn("px-3 py-1 rounded text-xs font-medium capitalize transition-colors",
                      heatmapMode === mode ? "bg-aoe-accent text-aoe-dark" : "bg-aoe-dark text-gray-400 border border-aoe-border hover:text-white"
                    )}>
                    {mode}
                  </button>
                ))}
              </div>
              <Heatmap data={result.heatmapData} mapSize={result.mapSize} mode={heatmapMode} players={result.players} />
            </div>
          )}

          {result.heatmapData.length > 0 && (
            <div className="card">
              <h2 className="section-title flex items-center gap-2">
                <MapPin className="w-5 h-5 text-aoe-accent" /> {d.map_control}
              </h2>
              <MapControlChart data={result.heatmapData} duration={result.duration} players={result.players} mapSize={result.mapSize} />
              <p className="text-xs text-gray-500 mt-2 text-center">{d.map_control_desc}</p>
            </div>
          )}

          <div className="card">
            <h2 className="section-title flex items-center gap-2">
              <FileText className="w-5 h-5 text-aoe-accent" /> {d.ai_chronicle}
            </h2>
            {!aiRequested && result.aiEnabled ? (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500 mb-4">
                  {locale === "es"
                    ? "Genera una crónica detallada con IA sobre los momentos clave del replay."
                    : "Generate a detailed AI chronicle about the key moments of the replay."}
                </p>
                <button onClick={() => setAiRequested(true)} className="btn-primary inline-flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {locale === "es" ? "Generar crónica con IA" : "Generate AI chronicle"}
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <ToolActivityPanel activities={aiRequested ? streamedChronicle.activities : []} locale={locale === "es" ? "es" : "en"} />
                  {aiRequested && streamedChronicle.loading && !(streamedChronicle.text) && (
                    <div className="flex items-start gap-3 rounded-lg bg-aoe-dark/50 border border-aoe-border/50 px-4 py-3">
                      <Loader2 className="w-5 h-5 animate-spin text-aoe-accent mt-0.5 shrink-0" />
                      <p className="text-sm text-gray-400">
                        {locale === "es" ? "La IA está generando la crónica del replay..." : "The AI is generating the replay chronicle..."}
                      </p>
                    </div>
                  )}
                  {aiRequested && streamedChronicle.error && (
                    <div className="flex items-start justify-between gap-3 rounded-lg bg-red-500/5 border border-red-500/20 px-4 py-3">
                      <p className="text-sm text-red-300">{streamedChronicle.error}</p>
                      <button onClick={() => void streamedChronicle.retry()} className="text-xs text-red-200 hover:text-white transition-colors">
                        {locale === "es" ? "Reintentar" : "Retry"}
                      </button>
                    </div>
                  )}
                </div>
                <MarkdownMessage content={aiRequested ? (result.aiEnabled ? (streamedChronicle.text || "") : (result.chronicle || "")) : (result.chronicle || "")} />
                {aiRequested && streamedChronicle.loading && streamedChronicle.text ? (
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-aoe-accent" />
                    {locale === "es" ? "Generando más detalles..." : "Generating more detail..."}
                  </div>
                ) : null}
              </>
            )}
          </div>

          {result.aiContext && (
            <AssistantPanel
              surface="replay"
              locale={locale === "es" ? "es" : "en"}
              context={result.aiContext}
              title={locale === "es" ? "Pregunta sobre este replay" : "Ask about this replay"}
              placeholder={locale === "es" ? "Pregunta por timings, errores, transiciones..." : "Ask about timings, mistakes, transitions..."}
              emptyHint={locale === "es"
                ? "Puedes profundizar en decisiones concretas del replay: por qué una batalla salió mal, qué transición faltó o cuál era el mejor plan."
                : "You can go deeper on specific replay decisions: why a fight went badly, which transition was missing, or what the best plan was."}
              suggestions={locale === "es"
                ? [
                  "¿Cuál fue el mayor error estratégico?",
                  "¿Qué transición faltó en Castillo?",
                  "¿Cómo debería haber cerrado la partida el ganador?",
                ]
                : [
                  "What was the biggest strategic mistake?",
                  "Which Castle Age transition was missing?",
                  "How should the winner have closed the game?",
                ]}
            />
          )}

          {result.battles.length > 0 && (
            <div className="card">
              <h2 className="section-title flex items-center gap-2">
                <Swords className="w-5 h-5 text-aoe-accent" /> {d.battles_detected}
              </h2>
              <div className="space-y-3">
                {result.battles.map((b) => (
                  <div key={b.id} className="p-3 rounded-lg bg-aoe-dark border border-aoe-border flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
                      <Swords className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">Battle #{b.id}</div>
                      <div className="text-xs text-gray-400">
                        {formatTime(b.startTime)} – {formatTime(b.endTime)} | Location: ({b.location.x.toFixed(0)}, {b.location.y.toFixed(0)})
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {b.participants.length} {d.players_involved}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {Object.keys(result.actionCounts).length > 0 && (
            <div className="card">
              <h2 className="section-title flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-aoe-accent" /> {d.action_stats}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(result.actionCounts)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 12)
                  .map(([name, count]) => (
                    <div key={name} className="p-3 rounded-lg bg-aoe-dark">
                      <div className="text-xs text-gray-500 capitalize">{name.replace(/_/g, " ")}</div>
                      <div className="text-lg font-bold text-white">{count.toLocaleString()}</div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {result.timeline.length > 0 && (
            <div className="card">
              <h2 className="section-title flex items-center gap-2">
                <Clock className="w-5 h-5 text-aoe-accent" /> {d.timeline}
              </h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {result.timeline
                  .filter((e) => e.type === "age_up" || e.type === "resign" || e.type === "tribute" || e.type === "build")
                  .slice(0, 100)
                  .map((e, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <span className="text-xs text-gray-500 w-16 shrink-0 font-mono">{formatTime(e.time)}</span>
                      <div className={cn(
                        "w-2.5 h-2.5 rounded-full shrink-0",
                        e.type === "age_up" && "ring-2 ring-yellow-400/50"
                      )} style={{ backgroundColor: PLAYER_COLORS[e.playerId - 1] || "#888" }} />
                      <span className={cn(
                        "text-gray-300",
                        e.type === "age_up" && "text-yellow-300 font-medium",
                        e.type === "resign" && "text-red-300"
                      )}>{e.description}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {result.chats.length > 0 && (
            <div className="card">
              <h2 className="section-title flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-aoe-accent" /> {d.chat_messages}
              </h2>
              <div className="space-y-1">
                {result.chats.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PLAYER_COLORS[c.player - 1] || "#888" }} />
                    <span className="text-gray-300">{c.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.gameSettings && Object.keys(result.gameSettings).length > 0 && (
            <div className="card">
              <h2 className="section-title flex items-center gap-2">
                <Shield className="w-5 h-5 text-aoe-accent" /> {d.game_settings}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(result.gameSettings)
                  .filter(([, v]) => v && v !== "")
                  .map(([key, val]) => (
                    <div key={key} className="p-2 rounded bg-aoe-dark">
                      <div className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</div>
                      <div className="text-sm font-medium text-white">{String(val)}</div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <KofiHint />

          <button onClick={() => { setResult(null); setError(null); }} className="btn-secondary w-full">
            {d.analyze_another}
          </button>
        </div>
      )}
    </div>
  );
}

function DropZone({ dragging, setDragging, analyzing, onFile, dict: d }: {
  dragging: boolean; setDragging: (v: boolean) => void; analyzing: boolean; onFile: (f: File) => void;
  dict: typeof import("@/i18n/dictionaries/en.json")["replay"];
}) {
  return (
    <div
      className={cn(
        "card !p-12 border-2 border-dashed text-center cursor-pointer transition-all duration-300",
        dragging ? "border-aoe-accent bg-aoe-accent/5" : "border-aoe-border hover:border-aoe-accent/50"
      )}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
      onClick={() => {
        const input = document.createElement("input");
        input.type = "file"; input.accept = ".aoe2record";
        input.onchange = (e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) onFile(f); };
        input.click();
      }}
    >
      {analyzing ? (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-aoe-accent" />
          <p className="text-gray-300">{d.analyzing}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <Upload className="w-12 h-12 text-gray-500" />
          <p className="text-gray-300">{d.drop_text}</p>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-aoe-dark rounded-lg p-3">
      <div className="text-xs text-gray-500 uppercase">{label}</div>
      <div className="text-lg font-bold text-white">{value}</div>
    </div>
  );
}

function Heatmap({ data, mapSize, mode, players }: {
  data: HeatPoint[]; mapSize: { x: number; y: number }; mode: string; players: Player[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const SIZE = 480;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = SIZE; canvas.height = SIZE;
    ctx.fillStyle = "#0a1520"; ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.strokeStyle = "#1a2a3a"; ctx.lineWidth = 0.5;
    for (let i = 0; i <= 10; i++) {
      const p = (i / 10) * SIZE;
      ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, SIZE); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(SIZE, p); ctx.stroke();
    }
    const filtered = data.filter((p) => {
      if (mode === "all") return true;
      if (mode === "combat") return ["interact", "attack_ground", "attack_move", "patrol", "attackground_de"].includes(p.type);
      if (mode === "build") return p.type === "build" || p.type === "build_de" || p.type === "create";
      if (mode === "move") return p.type === "move" || p.type === "gather" || p.type === "gather_de";
      return true;
    });
    const scaleX = SIZE / (mapSize.x || 200); const scaleY = SIZE / (mapSize.y || 200);
    filtered.forEach((point) => {
      const px = point.x * scaleX; const py = point.y * scaleY;
      const color = PLAYER_COLORS[(point.playerId - 1) % PLAYER_COLORS.length];
      ctx.globalAlpha = 0.12; ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 0.35;
      ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.font = "11px Inter, sans-serif";
    players.forEach((p, i) => {
      ctx.fillStyle = PLAYER_COLORS[i]; ctx.fillRect(8, 8 + i * 18, 10, 10);
      ctx.fillStyle = "#ccc"; ctx.fillText(`${p.name} (${p.civ})`, 24, 17 + i * 18);
    });
    ctx.fillStyle = "#666"; ctx.font = "10px Inter, sans-serif";
    ctx.fillText(`${filtered.length.toLocaleString()} events`, SIZE - 90, SIZE - 8);
  }, [data, mapSize, mode, players]);

  return (
    <div className="flex justify-center">
      <canvas ref={canvasRef} className="rounded-lg border border-aoe-border" style={{ width: SIZE, height: SIZE }} />
    </div>
  );
}

function UnitBar({ name, count, total, color }: { name: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 w-28 truncate">{name}</span>
      <div className="flex-1 bg-aoe-dark rounded-full h-3 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color, opacity: 0.7 }} />
      </div>
      <span className="text-xs text-gray-300 w-8 text-right">{count}</span>
    </div>
  );
}

function EapmChart({ data, color }: { data: Array<{ minute: number; eapm: number }>; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = 280, H = 50;
    canvas.width = W; canvas.height = H;
    ctx.fillStyle = "#0a1520"; ctx.fillRect(0, 0, W, H);
    if (data.length === 0) return;
    const max = Math.max(...data.map((d) => d.eapm), 1);
    const barW = W / data.length;
    data.forEach((d, i) => {
      const h = (d.eapm / max) * (H - 4);
      ctx.fillStyle = color; ctx.globalAlpha = 0.6;
      ctx.fillRect(i * barW, H - h, barW - 1, h);
    });
    ctx.globalAlpha = 1;
  }, [data, color]);
  return <canvas ref={canvasRef} className="w-full rounded border border-aoe-border" style={{ height: 50 }} />;
}

function MapControlChart({ data, duration, players, mapSize }: {
  data: HeatPoint[]; duration: number; players: Player[]; mapSize: { x: number; y: number };
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const WIDTH = 600; const HEIGHT = 120;
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = WIDTH; canvas.height = HEIGHT;
    ctx.fillStyle = "#0a1520"; ctx.fillRect(0, 0, WIDTH, HEIGHT);
    if (duration <= 0 || data.length === 0) return;
    const bucketSize = 60;
    const numBuckets = Math.ceil(duration / bucketSize);
    const midX = (mapSize.x || 200) / 2; const midY = (mapSize.y || 200) / 2;
    const playerBuckets: Record<number, number[]> = {};
    players.forEach((_, i) => { playerBuckets[i + 1] = new Array(numBuckets).fill(0); });
    data.forEach((pt) => {
      const bucket = Math.min(Math.floor(pt.timeSec / bucketSize), numBuckets - 1);
      if (bucket < 0) return;
      const inEnemySide = pt.playerId === 1 ? (pt.x > midX || pt.y > midY) : (pt.x < midX || pt.y < midY);
      if (inEnemySide && playerBuckets[pt.playerId]) { playerBuckets[pt.playerId][bucket]++; }
    });
    const barW = WIDTH / numBuckets;
    for (let b = 0; b < numBuckets; b++) {
      const totals = players.map((_, i) => playerBuckets[i + 1]?.[b] || 0);
      const sum = totals.reduce((s, v) => s + v, 0);
      if (sum === 0) continue;
      let y = 0;
      totals.forEach((val, i) => {
        const h = (val / sum) * HEIGHT;
        ctx.fillStyle = PLAYER_COLORS[i]; ctx.globalAlpha = 0.7;
        ctx.fillRect(b * barW, y, barW - 1, h); y += h;
      });
    }
    ctx.globalAlpha = 1; ctx.fillStyle = "#666"; ctx.font = "9px Inter, sans-serif";
    for (let t = 0; t <= duration; t += 300) {
      const px = (t / duration) * WIDTH;
      ctx.fillText(`${Math.floor(t / 60)}m`, px + 2, HEIGHT - 4);
      ctx.strokeStyle = "#333"; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, HEIGHT); ctx.stroke();
    }
  }, [data, duration, players, mapSize]);
  return (
    <canvas ref={canvasRef} className="rounded-lg border border-aoe-border w-full" style={{ height: HEIGHT }} />
  );
}
