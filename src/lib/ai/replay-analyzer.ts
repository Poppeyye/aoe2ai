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

export interface RootCauseAnalysis {
  turningPoint: {
    timeSec: number;
    formattedTime: string;
    headline: { en: string; es: string };
    detail: { en: string; es: string };
    severity: "critical" | "high" | "medium";
  };
  economicLeak: {
    headline: { en: string; es: string };
    detail: { en: string; es: string };
    villagerDeficit: number;
    eapmDeficit: number;
    severity: "critical" | "high" | "medium";
  };
  missingTransition: {
    headline: { en: string; es: string };
    detail: { en: string; es: string };
    recommendedCounters: string[];
  };
  actionableTip: {
    headline: { en: string; es: string };
    detail: { en: string; es: string };
  };
}

export function computeRootCauseAnalysis(
  data: ReplayData,
  extra: Record<string, unknown>,
): RootCauseAnalysis {
  const winner = data.players.find((p) => p.winner) || data.players[0];
  const loser = data.players.find((p) => !p.winner) || data.players[1] || data.players[0];
  const playerStats = (extra.playerStats || {}) as Record<number, ReplayExtraStats>;

  const winnerStats = playerStats[winner?.index];
  const loserStats = playerStats[loser?.index];

  const winnerVills = winnerStats?.unitsTrainedByType?.["Villager"] || 0;
  const loserVills = loserStats?.unitsTrainedByType?.["Villager"] || 0;
  const villDiff = winnerVills - loserVills;

  const winnerEapm = winnerStats?.eapm || 0;
  const loserEapm = loserStats?.eapm || 0;
  const eapmDiff = winnerEapm - loserEapm;

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  // 1. Turning point calculation
  let turningTime = Math.min(Math.floor(data.duration * 0.6), 1200);
  let turningHeadline = {
    en: "Decisive Castle Age engagement broke map control",
    es: "Enfrentamiento decisivo en Edad de los Castillos",
  };
  let turningDetail = {
    en: "A major army loss gave the opponent uncontested initiative and freedom to boom or drop forward siege.",
    es: "Una pérdida significativa del ejército otorgó al rival la iniciativa y el control para asediar.",
  };
  let severity: "critical" | "high" | "medium" = "high";

  // Check age up discrepancy
  if (winner?.castleTime && loser?.castleTime && loser.castleTime - winner.castleTime > 90) {
    const gap = loser.castleTime - winner.castleTime;
    turningTime = winner.castleTime;
    turningHeadline = {
      en: `Opponent hit Castle Age ${fmt(gap)} earlier`,
      es: `El rival alcanzó Castillos ${fmt(gap)} antes`,
    };
    turningDetail = {
      en: `The opponent's early Castle Age (${fmt(winner.castleTime)}) enabled instant Knights/Crossbow power spikes while you were still on Feudal eco.`,
      es: `El pase temprano a Castillos del rival (${fmt(winner.castleTime)}) le dio acceso a unidades pesadas y mejoras de herrería con ventaja tecnológica directa.`,
    };
    severity = "critical";
  } else if (data.battles.length > 0) {
    // Find highest casualty battle
    const multiPlayerBattles = data.battles.filter((b) => b.participants.length > 1);
    if (multiPlayerBattles.length > 0) {
      const biggest = multiPlayerBattles.reduce((best, b) => {
        const total = Object.values(b.casualties).reduce((s, n) => s + n, 0);
        const bestTotal = Object.values(best.casualties).reduce((s, n) => s + n, 0);
        return total > bestTotal ? b : best;
      });
      turningTime = biggest.startTime;
      turningHeadline = {
        en: `Major battle loss at ${fmt(biggest.startTime)} near (${biggest.location.x.toFixed(0)}, ${biggest.location.y.toFixed(0)})`,
        es: `Batalla clave al minuto ${fmt(biggest.startTime)} en (${biggest.location.x.toFixed(0)}, ${biggest.location.y.toFixed(0)})`,
      };
      turningDetail = {
        en: "Heavy engagement casualties tipped army numbers irreversibly and exposed economic infrastructure.",
        es: "El intercambio de bajas en esta batalla diezmó el ejército y dejó desprotegida la base y líneas de recolección.",
      };
      severity = "critical";
    }
  }

  // 2. Economic leak calculation
  let ecoHeadline = {
    en: "Economy maintained parity",
    es: "Economía en relativa paridad",
  };
  let ecoDetail = {
    en: "Villager counts remained close throughout the match.",
    es: "El número de aldeanos se mantuvo equilibrado durante gran parte de la partida.",
  };
  let ecoSeverity: "critical" | "high" | "medium" = "medium";

  if (villDiff >= 12) {
    ecoHeadline = {
      en: `Severe Town Center idle time (${villDiff} villager deficit)`,
      es: `Pérdida crítica de producción de aldeanos (-${villDiff} aldeanos)`,
    };
    ecoDetail = {
      en: `The winner produced ${winnerVills} villagers versus ${loserVills}. This represents several minutes of inactive Town Centers or uncompensated villager losses from raids.`,
      es: `El ganador produjo ${winnerVills} aldeanos frente a ${loserVills}. Esto evidencia Centro Urbano inactivo durante Feudal o aldeanos perdidos bajo presión.`,
    };
    ecoSeverity = "critical";
  } else if (villDiff >= 6) {
    ecoHeadline = {
      en: `Moderate economic deficit (${villDiff} fewer villagers)`,
      es: `Déficit económico moderado (-${villDiff} aldeanos)`,
    };
    ecoDetail = {
      en: `A ${villDiff} villager gap created a persistent resource deficit for military reinforcements.`,
      es: `La diferencia de ${villDiff} aldeanos redujo el flujo constante de recursos para reponer tropas en las batallas clave.`,
    };
    ecoSeverity = "high";
  } else if (eapmDiff > 25) {
    ecoHeadline = {
      en: `Execution speed disparity (eAPM gap: ${eapmDiff})`,
      es: `Diferencia de ritmo y microgestión (eAPM: ${loserEapm} vs ${winnerEapm})`,
    };
    ecoDetail = {
      en: "Higher opponent APM resulted in faster task queues, better army dodging, and quicker farm replenishment.",
      es: "La mayor velocidad de acciones del rival le permitió gestionar su economía mientras mantenía presión militar constante.",
    };
    ecoSeverity = "medium";
  }

  // 3. Missing Counter / Transition calculation
  const winnerMilitary = Object.entries(winnerStats?.unitsTrainedByType || {})
    .filter(([name]) => name !== "Villager")
    .sort(([, a], [, b]) => b - a);
  const loserMilitary = Object.entries(loserStats?.unitsTrainedByType || {})
    .filter(([name]) => name !== "Villager")
    .sort(([, a], [, b]) => b - a);

  const topWinnerUnit = winnerMilitary[0]?.[0] || "Cavalry/Archers";
  const loserTopUnits = loserMilitary.map(([u]) => u);

  let missingHeadline = {
    en: `Missing hard counter response to ${topWinnerUnit}`,
    es: `Falta de respuesta directa contra ${topWinnerUnit}`,
  };
  let missingDetail = {
    en: `Opponent heavily leaned into ${topWinnerUnit}. Transitioning to dedicated counter units was necessary to stabilize.`,
    es: `El rival basó su ejército en ${topWinnerUnit}. Faltó una transición rápida a unidades específicas de contraataque.`,
  };
  let counters: string[] = ["Pikemen", "Monks", "Skirmishers"];

  const topLower = topWinnerUnit.toLowerCase();
  if (topLower.includes("knight") || topLower.includes("cavalry") || topLower.includes("scout") || topLower.includes("hussar") || topLower.includes("paladin")) {
    counters = ["Pikemen / Halberdiers", "Monks", "Camels"];
    missingHeadline = {
      en: "Needed Pikemen / Monks against heavy Cavalry",
      es: "Faltaron Piqueros / Monjes contra la Caballería rival",
    };
    missingDetail = {
      en: `Opponent invested in ${topWinnerUnit}. Adding Monks with Sanctity or massing Pikemen with Armor upgrades would have stopped army snowballs.`,
      es: `El oponente acumuló ${topWinnerUnit}. Añadir Monjes para conversiones o una masa de piqueros con armadura habría frenado la ventaja.`,
    };
  } else if (topLower.includes("archer") || topLower.includes("crossbow") || topLower.includes("arbalest")) {
    counters = ["Elite Skirmishers", "Mangonels / Siege", "Knights with Armor"];
    missingHeadline = {
      en: "Needed Skirmishers / Mangonels against massed Archers",
      es: "Faltaron Guerrilleros / Mangonelas contra la masa de Arqueros",
    };
    missingDetail = {
      en: `Opponent massed ranged units (${topWinnerUnit}). Mangonel shots or high-pierce armor Skirmishers were essential to trade cost-effectively.`,
      es: `El rival concentró unidades a distancia (${topWinnerUnit}). El apoyo de Mangonelas o Guerrilleros con mejoras de armadura era indispensable.`,
    };
  } else if (topLower.includes("infantry") || topLower.includes("eagle") || topLower.includes("man-at-arms")) {
    counters = ["Crossbowmen", "Hand Cannoneers", "Scorpions"];
    missingHeadline = {
      en: "Needed ranged fire or Scorpions against Infantry push",
      es: "Faltó fuego a distancia o Escorpiones contra la Infantería",
    };
    missingDetail = {
      en: `Opponent deployed ${topWinnerUnit}. Massing archers or adding siege chokepoint defense was required.`,
      es: `El rival basó su ataque en ${topWinnerUnit}. Arqueros bien protegidos o armas de asedio habrían castigado la lentitud de su avance.`,
    };
  }

  // 4. Actionable tip
  const actionableTip = {
    headline: {
      en: "Primary Takeaway for Next Match",
      es: "Lección táctica para tu próxima partida",
    },
    detail: {
      en: `When playing on ${data.map.name}, prioritize uninterrupted villager production up to 35+ villagers before overcommitting to military fights, and scout your opponent's military buildings at 12:00 to start counter production immediately.`,
      es: `En mapas como ${data.map.name}, mantén la cola del Centro Urbano siempre activa con 35+ aldeanos antes de arriesgar tu ejército, y explora la base rival al minuto 12 para iniciar la producción del counter sin retraso.`,
    },
  };

  return {
    turningPoint: {
      timeSec: turningTime,
      formattedTime: fmt(turningTime),
      headline: turningHeadline,
      detail: turningDetail,
      severity,
    },
    economicLeak: {
      headline: ecoHeadline,
      detail: ecoDetail,
      villagerDeficit: Math.max(villDiff, 0),
      eapmDeficit: Math.max(eapmDiff, 0),
      severity: ecoSeverity,
    },
    missingTransition: {
      headline: missingHeadline,
      detail: missingDetail,
      recommendedCounters: counters,
    },
    actionableTip,
  };
}

export function buildReplayAiContext(
  data: ReplayData,
  extra: Record<string, unknown>,
) {
  const playerStats = (extra.playerStats || {}) as Record<number, ReplayExtraStats>;
  const settings = (extra.gameSettings || {}) as Record<string, string | boolean>;
  const actionCounts = (extra.actionCounts || {}) as Record<string, number>;
  const chats = (extra.chats || []) as Array<{ player: number; message: string }>;
  const rootCause = computeRootCauseAnalysis(data, extra);

  return {
    match: {
      map: data.map,
      duration: data.duration,
      version: data.version,
    },
    rootCauseAnalysis: rootCause,
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
  const context = buildReplayAiContext(replayData, extra);
  const rootCause = computeRootCauseAnalysis(replayData, extra);

  if (!hasOpenAIKey()) {
    return {
      ...getFallbackAnalysis(replayData, extra, locale),
      rootCause,
      aiContext: context,
    };
  }

  const chronicle = await generateTextResponse({
    surface: "replay",
    locale,
    context,
    messages: [
      {
        role: "user",
        content: locale === "es"
          ? "Analiza este replay y crea una crónica clara con momentos decisivos, errores de causa raíz, aciertos y consejos de mejora."
          : "Analyze this replay and produce a clear chronicle with turning points, root cause loss analysis, strong decisions, and improvement advice.",
      },
    ],
  });

  return { chronicle, raw: replayData, aiContext: context, rootCause };
}

function getFallbackAnalysis(data: ReplayData, extra: Record<string, unknown>, locale: AiLocale) {
  const duration = data.duration;
  const durMin = Math.floor(duration / 60);
  const durSec = duration % 60;
  const winner = data.players.find((p) => p.winner);
  const loser = data.players.find((p) => !p.winner);
  const playerStats = extra.playerStats as Record<number, { eapm: number; unitsTrainedByType: Record<string, number>; totalUnitsTrained: number; buildingsPlaced: Record<string, number>; totalBuildingsPlaced: number; militaryActions: number; economyActions: number }> | undefined;
  const multiPlayerBattles = data.battles.filter((b) => b.participants.length > 1);
  const rootCause = computeRootCauseAnalysis(data, extra);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const L: string[] = [];

  const labels = locale === "es"
    ? {
      matchChronicle: "Crónica de la Partida",
      rootCauseTitle: "Análisis Post-Mortem Táctico (Causa Raíz)",
      turningPoint: "Momento Decisivo",
      ecoLeak: "Fuga Económica",
      missingCounter: "Transición Faltante",
      tip: "Consejo para la Próxima Partida",
      engagements: "Enfrentamientos",
      playerStats: "Estadísticas de Jugador",
      wins: "gana",
      only: "Solo",
      addKey: "*Añade OPENAI_API_KEY al .env para obtener análisis táctico completo con IA y consejos de mejora.*",
    }
    : {
      matchChronicle: "Match Chronicle",
      rootCauseTitle: "Tactical Post-Mortem (Root Cause Analysis)",
      turningPoint: "Turning Point",
      ecoLeak: "Economic Leak",
      missingCounter: "Missing Counter Transition",
      tip: "Actionable Tip for Next Match",
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

  // Post-Mortem section
  L.push(`### 🎯 ${labels.rootCauseTitle}`);
  L.push(``);
  L.push(`- 💥 **${labels.turningPoint} (${rootCause.turningPoint.formattedTime})**: ${locale === "es" ? rootCause.turningPoint.headline.es : rootCause.turningPoint.headline.en}. ${locale === "es" ? rootCause.turningPoint.detail.es : rootCause.turningPoint.detail.en}`);
  L.push(`- 📉 **${labels.ecoLeak}**: ${locale === "es" ? rootCause.economicLeak.headline.es : rootCause.economicLeak.headline.en}. ${locale === "es" ? rootCause.economicLeak.detail.es : rootCause.economicLeak.detail.en}`);
  L.push(`- 🛡️ **${labels.missingCounter}**: ${locale === "es" ? rootCause.missingTransition.headline.es : rootCause.missingTransition.headline.en}. Counters recomendados: ${rootCause.missingTransition.recommendedCounters.join(", ")}.`);
  L.push(`- 💡 **${labels.tip}**: ${locale === "es" ? rootCause.actionableTip.detail.es : rootCause.actionableTip.detail.en}`);
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
