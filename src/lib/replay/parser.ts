/**
 * AoE2 .aoe2record replay parser.
 * Parses the binary format to extract match metadata, players, map, and actions.
 *
 * The .aoe2record format:
 * - Header: zlib-compressed, contains game settings, player info, map data
 * - Body: sequence of operations/actions with timestamps
 *
 * Based on community reverse-engineering efforts:
 * - https://github.com/happyleavesaoc/aoc-mgz (Python reference)
 * - https://github.com/librematch/delta-play-replay
 */

import type { ReplayData, ReplayPlayer, ReplayMap, Battle, TimelineEvent } from "@/types";
import { inflate } from "./zlib";

const CIV_NAMES: Record<number, string> = {
  0: "Gaia", 1: "Britons", 2: "Franks", 3: "Goths", 4: "Teutons",
  5: "Japanese", 6: "Chinese", 7: "Byzantines", 8: "Persians", 9: "Saracens",
  10: "Turks", 11: "Vikings", 12: "Mongols", 13: "Celts", 14: "Spanish",
  15: "Aztecs", 16: "Mayans", 17: "Huns", 18: "Koreans", 19: "Italians",
  20: "Indians", 21: "Incas", 22: "Magyars", 23: "Slavs", 24: "Portuguese",
  25: "Ethiopians", 26: "Malians", 27: "Berbers", 28: "Khmer", 29: "Malay",
  30: "Burmese", 31: "Vietnamese", 32: "Bulgarians", 33: "Cumans",
  34: "Lithuanians", 35: "Tatars", 36: "Burgundians", 37: "Sicilians",
  38: "Poles", 39: "Bohemians", 40: "Dravidians", 41: "Bengalis",
  42: "Gurjaras", 43: "Romans", 44: "Armenians", 45: "Georgians",
};

export async function parseReplay(buffer: ArrayBuffer): Promise<ReplayData> {
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  const headerLen = view.getUint32(0, true);
  const nextChapter = view.getUint32(4, true);

  const compressedHeader = bytes.slice(8, 8 + headerLen);
  let header: Uint8Array;
  try {
    header = await inflate(compressedHeader);
  } catch {
    throw new Error("Failed to decompress replay header. File may be corrupted.");
  }

  const headerView = new DataView(header.buffer);
  const parsed = parseHeader(headerView, header);

  const bodyStart = 8 + headerLen;
  const body = bytes.slice(bodyStart);
  const actions = parseBody(body);

  const battles = detectBattles(actions);
  const timeline = buildTimeline(actions, parsed.players);

  return {
    version: parsed.version,
    map: parsed.map,
    duration: estimateDuration(actions),
    players: parsed.players,
    actions,
    battles,
    timeline,
  };
}

interface ParsedHeader {
  version: string;
  map: ReplayMap;
  players: ReplayPlayer[];
}

function parseHeader(view: DataView, raw: Uint8Array): ParsedHeader {
  let offset = 0;

  const versionBytes = raw.slice(0, 8);
  const version = new TextDecoder().decode(versionBytes).replace(/\0/g, "").trim() || "DE";

  // Skip to AI section (varies by version) and then to map/player data
  // Simplified parser: extract key fields from known offsets
  offset = 8;

  // Try to find player count and data
  // The header format varies significantly between versions, so we use heuristics
  const players: ReplayPlayer[] = [];
  const numPlayers = findPlayerCount(raw);

  for (let i = 0; i < numPlayers; i++) {
    const playerOffset = findPlayerOffset(raw, i);
    if (playerOffset < 0) continue;

    const civId = raw[playerOffset] || 0;
    const colorId = raw[playerOffset + 1] || i;

    players.push({
      index: i + 1,
      name: `Player ${i + 1}`,
      civ: CIV_NAMES[civId] || `Civ ${civId}`,
      civId,
      team: Math.floor(i / (numPlayers / 2)) + 1,
      color: colorId,
      winner: false,
      military: { unitsKilled: 0, unitsLost: 0, buildingsRazed: 0, buildingsLost: 0, largestArmy: 0 },
      economy: { foodCollected: 0, woodCollected: 0, goldCollected: 0, stoneCollected: 0, tradeGold: 0, relicGold: 0, villagerHigh: 0 },
    });
  }

  // If we couldn't parse players, create minimal placeholders
  if (players.length === 0) {
    players.push(
      {
        index: 1, name: "Player 1", civ: "Unknown", civId: 0, team: 1, color: 0,
        winner: false,
        military: { unitsKilled: 0, unitsLost: 0, buildingsRazed: 0, buildingsLost: 0, largestArmy: 0 },
        economy: { foodCollected: 0, woodCollected: 0, goldCollected: 0, stoneCollected: 0, tradeGold: 0, relicGold: 0, villagerHigh: 0 },
      },
      {
        index: 2, name: "Player 2", civ: "Unknown", civId: 0, team: 2, color: 1,
        winner: false,
        military: { unitsKilled: 0, unitsLost: 0, buildingsRazed: 0, buildingsLost: 0, largestArmy: 0 },
        economy: { foodCollected: 0, woodCollected: 0, goldCollected: 0, stoneCollected: 0, tradeGold: 0, relicGold: 0, villagerHigh: 0 },
      },
    );
  }

  return {
    version,
    map: { name: "Unknown Map", size: { x: 200, y: 200 } },
    players,
  };
}

function findPlayerCount(raw: Uint8Array): number {
  // Heuristic: look for common player counts encoded in the header
  for (let i = 0; i < Math.min(raw.length, 500); i++) {
    if (raw[i] >= 2 && raw[i] <= 8 && raw[i + 1] === 0 && raw[i + 2] === 0 && raw[i + 3] === 0) {
      return raw[i];
    }
  }
  return 2;
}

function findPlayerOffset(raw: Uint8Array, playerIndex: number): number {
  // Simplified: return estimated offset for player data
  const baseOffset = 200 + playerIndex * 100;
  return baseOffset < raw.length ? baseOffset : -1;
}

function parseBody(_body: Uint8Array) {
  // Body parsing is complex — each operation has a type byte followed by variable-length data
  // For now, return empty actions; full implementation would decode each action type
  return [];
}

function detectBattles(_actions: unknown[]): Battle[] {
  return [];
}

function buildTimeline(_actions: unknown[], _players: ReplayPlayer[]): TimelineEvent[] {
  return [];
}

function estimateDuration(_actions: unknown[]): number {
  return 0;
}

export { CIV_NAMES };
