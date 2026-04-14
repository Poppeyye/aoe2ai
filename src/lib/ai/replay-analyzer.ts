/**
 * AI-powered replay analysis.
 * Builds compact, authoritative replay context and lets the shared Responses runtime
 * produce the final chronicle in the requested locale.
 */

import type { ReplayData } from "@/types";
import { generateTextResponse } from "@/lib/ai/runtime";
import { hasOpenAIKey } from "@/lib/ai/openai-client";
import type { AiLocale } from "@/lib/ai/tools";

interface ReplayExtraStats {
  eapm: number;
  unitsTrainedByType: Record<string, number>;
  totalUnitsTrained: number;
  buildingsPlaced: Record<string, number>;
  totalBuildingsPlaced: number;
  militaryActions: number;
  economyActions: number;
}

const RAW_ID_PATTERN = /^(cell_|unknown_|\d+$)/i;

function isValidGameName(name: string): boolean {
  if (!name || name.length < 2) return false;
  if (RAW_ID_PATTERN.test(name)) return false;
  if (/^[0-9]+$/.test(name)) return false;
  return true;
}

function filterEntries(entries: Record<string, number>): Record<string, number> {
  return Object.fromEntries(
    Object.entries(entries).filter(([name]) => isValidGameName(name)),
  );
}

export function buildReplayAiContext(
  data: ReplayData,
  extra: Record<string, unknown>,
) {
  const playerStats = (extra.playerStats || {}) as Record<number, ReplayExtraStats>;
  const settings = (extra.gameSettings || {}) as Record<string, string | boolean>;
  const actionCounts = (extra.actionCounts || {}) as Record<string, number>;
  const chats = (extra.chats || []) as Array<{ player: number; message: string }>;

  return {
    match: {
      map: data.map,
      duration: data.duration,
      version: data.version,
    },
    gameKnowledge: {
      ageProgression: ["Dark Age", "Feudal Age", "Castle Age", "Imperial Age"],
      timingBenchmarks: {
        goodFeudalTime: "8:00-10:00",
        fastCastle: "16:00-17:00",
        fastImperial: "27:00-30:00",
        earlyRush: "Before 10:00",
        midGamePeak: "20:00-30:00",
        lateGame: "After 35:00",
      },
      unitCounterGuide: {
        "Knights": "Counter with Pikemen, Camels, or Monks",
        "Archers/Crossbowmen": "Counter with Skirmishers, Siege, or Cavalry",
        "Infantry": "Counter with Archers, Hand Cannoneers, or Scorpions",
        "Siege": "Counter with Cavalry, Bombard Cannons, or Monks",
        "Cavalry Archers": "Counter with Skirmishers, Camel Archers, or Eagle Warriors",
      },
      eapmBenchmarks: {
        beginner: "< 30",
        intermediate: "30-60",
        advanced: "60-100",
        expert: "> 100",
      },
    },
    players: data.players.map((player) => {
      const stats = playerStats[player.index];
      const cleanUnits = stats ? filterEntries(stats.unitsTrainedByType) : {};
      const cleanBuildings = stats ? filterEntries(stats.buildingsPlaced) : {};

      const topUnits = Object.entries(cleanUnits)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8)
        .map(([name, count]) => ({ name, count }));

      const topBuildings = Object.entries(cleanBuildings)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
        .map(([name, count]) => ({ name, count }));

      return {
        ...player,
        stats: stats
          ? {
            eapm: stats.eapm,
            totalUnitsTrained: stats.totalUnitsTrained,
            totalBuildingsPlaced: stats.totalBuildingsPlaced,
            militaryActions: stats.militaryActions,
            economyActions: stats.economyActions,
            topUnits,
            topBuildings,
          }
          : null,
      };
    }),
    battles: data.battles.slice(0, 20).map((battle) => ({
      id: battle.id,
      startTime: battle.startTime,
      endTime: battle.endTime,
      location: battle.location,
      participants: battle.participants,
      casualties: battle.casualties,
    })),
    keyEvents: data.timeline
      .filter((event) => event.type === "age_up" || event.type === "resign" || event.type === "tribute")
      .slice(0, 40),
    settings: Object.fromEntries(Object.entries(settings).filter(([, value]) => value && value !== "")),
    actionCounts: Object.fromEntries(
      Object.entries(filterEntries(actionCounts))
        .sort(([, a], [, b]) => b - a)
        .slice(0, 15),
    ),
    chat: chats.slice(0, 20),
  };
}

export async function analyzeReplay(replayData: ReplayData, locale: AiLocale = "en") {
  const extra = replayData as unknown as Record<string, unknown>;

  if (!hasOpenAIKey()) {
    return getFallbackAnalysis(replayData, extra, locale);
  }

  const context = buildReplayAiContext(replayData, extra);
  const chronicle = await generateTextResponse({
    surface: "replay",
    locale,
    context,
    messages: [
      {
        role: "user",
        content: locale === "es"
          ? "Analiza este replay y crea una crónica clara con momentos decisivos, errores, aciertos y consejos de mejora."
          : "Analyze this replay and produce a clear chronicle with turning points, mistakes, strong decisions, and improvement advice.",
      },
    ],
  });

  return { chronicle, raw: replayData, aiContext: context };
}

function getFallbackAnalysis(data: ReplayData, extra: Record<string, unknown>, locale: AiLocale) {
  const duration = data.duration;
  const durMin = Math.floor(duration / 60);
  const durSec = duration % 60;
  const winner = data.players.find((p) => p.winner);
  const loser = data.players.find((p) => !p.winner);
  const playerStats = extra.playerStats as Record<number, { eapm: number; unitsTrainedByType: Record<string, number>; totalUnitsTrained: number; buildingsPlaced: Record<string, number>; totalBuildingsPlaced: number; militaryActions: number; economyActions: number }> | undefined;
  const multiPlayerBattles = data.battles.filter((b) => b.participants.length > 1);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const L: string[] = [];

  const labels = locale === "es"
    ? {
      matchChronicle: "Crónica de la Partida",
      engagements: "Enfrentamientos",
      playerStats: "Estadísticas de Jugador",
      wins: "gana",
      only: "Solo",
      addKey: "*Añade OPENAI_API_KEY al .env para obtener análisis táctico completo con IA y consejos de mejora.*",
    }
    : {
      matchChronicle: "Match Chronicle",
      engagements: "Engagements",
      playerStats: "Player Statistics",
      wins: "wins",
      only: "Only",
      addKey: "*Add OPENAI_API_KEY to .env for full AI-powered tactical analysis and improvement tips.*",
    };

  L.push(`## ${data.players.map((p) => `${p.name} (${p.civ})`).join(" vs ")}`);
  L.push(``);
  L.push(`**${data.map.name}** (${data.map.size.x}×${data.map.size.y}) | **${durMin}m ${durSec}s** | ${winner ? `**${winner.name}** ${labels.wins}` : "Result unknown"}`);
  L.push(``);

  // Narrative chronicle
  if (winner && loser) {
    L.push(`### ${labels.matchChronicle}`);
    L.push(``);

    // Dark Age
    L.push(`Both players spawned on ${data.map.name}. `);

    // Feudal Age
    const p1 = data.players[0], p2 = data.players[1];
    if (p1.feudalTime && p2.feudalTime) {
      const faster = p1.feudalTime < p2.feudalTime ? p1 : p2;
      const slower = p1.feudalTime < p2.feudalTime ? p2 : p1;
      const diff = Math.abs(p1.feudalTime - p2.feudalTime);
      L.push(`**${faster.name}** reached Feudal Age first at **${fmt(faster.feudalTime!)}**, ${diff > 30 ? `a significant ${Math.floor(diff / 60)}m ${diff % 60}s ahead of` : `narrowly before`} **${slower.name}** (${fmt(slower.feudalTime!)}).`);
    }

    // Army composition
    if (playerStats) {
      for (const p of data.players) {
        const stats = playerStats[p.index];
        if (stats && stats.totalUnitsTrained > 0) {
          const military = Object.entries(stats.unitsTrainedByType)
            .filter(([name]) => name !== "Villager")
            .sort(([, a], [, b]) => b - a);
          const vills = stats.unitsTrainedByType["Villager"] || 0;
          if (military.length > 0) {
            const armyStr = military.map(([name, count]) => `${count} ${name}${count > 1 ? "s" : ""}`).join(", ");
            L.push(`**${p.name}** trained ${vills} Villagers and built an army of ${armyStr}.`);
          } else {
            L.push(`**${p.name}** trained ${vills} Villagers but no military units were detected.`);
          }
        }
      }
    }
    L.push(``);

    // Castle Age
    if (p1.castleTime || p2.castleTime) {
      const castlePlayers = data.players.filter((p) => p.castleTime).sort((a, b) => a.castleTime! - b.castleTime!);
      if (castlePlayers.length >= 2) {
        const diff = castlePlayers[1].castleTime! - castlePlayers[0].castleTime!;
        L.push(`**${castlePlayers[0].name}** hit Castle Age at ${fmt(castlePlayers[0].castleTime!)}, ${diff > 120 ? `a massive ${Math.floor(diff / 60)} minutes before` : `${Math.floor(diff / 60)}m ${diff % 60}s ahead of`} ${castlePlayers[1].name} (${fmt(castlePlayers[1].castleTime!)}).`);
      } else if (castlePlayers.length === 1) {
        L.push(`${labels.only} **${castlePlayers[0].name}** reached Castle Age (${fmt(castlePlayers[0].castleTime!)}).`);
      }
    }

    // Battles
    if (multiPlayerBattles.length > 0) {
      L.push(``);
      L.push(`### ${labels.engagements}`);
      L.push(``);
      L.push(`The game saw **${multiPlayerBattles.length} major engagements** between both players across ${data.battles.length} total skirmishes.`);
      const first = multiPlayerBattles[0];
      const last = multiPlayerBattles[multiPlayerBattles.length - 1];
      L.push(`Fighting began at **${fmt(first.startTime)}** and continued until **${fmt(last.endTime)}**.`);
      const heaviest = multiPlayerBattles.reduce((best, b) => {
        const total = Object.values(b.casualties).reduce((s, n) => s + n, 0);
        const bestTotal = Object.values(best.casualties).reduce((s, n) => s + n, 0);
        return total > bestTotal ? b : best;
      });
      const heaviestTotal = Object.values(heaviest.casualties).reduce((s, n) => s + n, 0);
      L.push(`The heaviest battle occurred at **${fmt(heaviest.startTime)}** near (${heaviest.location.x.toFixed(0)}, ${heaviest.location.y.toFixed(0)}) with ${heaviestTotal} military interactions.`);
    }

    // End
    L.push(``);
    L.push(`At **${fmt(duration)}**, **${loser.name}** resigned. **${winner.name}** takes the victory.`);
  }

  // Player stats
  if (playerStats) {
    L.push(``);
    L.push(`### ${labels.playerStats}`);
    L.push(``);
    for (const p of data.players) {
      const stats = playerStats[p.index];
      if (!stats) continue;
      L.push(`**${p.name}** (${p.civ})${p.winner ? " 👑" : ""}`);
      L.push(`- eAPM: **${stats.eapm}**`);
      L.push(`- Units trained: **${stats.totalUnitsTrained}**` +
        (Object.keys(stats.unitsTrainedByType).length > 0
          ? ` (${Object.entries(stats.unitsTrainedByType).sort(([, a], [, b]) => b - a).map(([n, c]) => `${c}× ${n}`).join(", ")})`
          : ""));
      L.push(`- Buildings placed: **${stats.totalBuildingsPlaced}**` +
        (Object.keys(stats.buildingsPlaced).length > 0
          ? ` (${Object.entries(stats.buildingsPlaced).sort(([, a], [, b]) => b - a).map(([n, c]) => `${c}× ${n}`).join(", ")})`
          : ""));
      L.push(`- Military actions: **${stats.militaryActions}** | Economy actions: **${stats.economyActions}**`);
      L.push(``);
    }
  }

  L.push(labels.addKey);

  return { chronicle: L.join("\n"), raw: data, aiContext: buildReplayAiContext(data, extra) };
}
