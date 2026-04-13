/**
 * AoE2 DE .aoe2record replay parser.
 *
 * Reverse-engineered from real DE replay files (VER 9.4) and community efforts:
 * - https://github.com/happyleavesaoc/aoc-mgz (Python reference)
 * - https://github.com/librematch/delta-play-replay
 *
 * File layout:
 *   [uint32 LE] header_length
 *   [uint32 LE] next_chapter (0 = single chapter)
 *   [header_length bytes] zlib-deflateRaw compressed header
 *   [remaining bytes] body (postgame chats + game operations)
 *
 * Inflated header contains:
 *   "VER 9.4\0" | game/lobby settings | player slot table | AI data |
 *   map data | scenario data | game settings text block (near end)
 *
 * Player slot format (per slot, found via 0x60 0x0a separator scanning):
 *   ... [0xFF] [colorId] [civByte?] [8-byte hash] [uint32 data...] ...
 *   [0x60 0x0a] [uint16 nameLen] [name ASCII] (repeated twice)
 *   [post-name fields: uint32 slotType, uint32 profileId, ...]
 */

import type { ReplayData, ReplayPlayer, ReplayMap, Battle, TimelineEvent } from "@/types";

const CIV_NAMES: Record<number, string> = {
  1: "Britons", 2: "Franks", 3: "Goths", 4: "Teutons",
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
  const buf = Buffer.from(buffer);
  const headerLen = buf.readUInt32LE(0);

  let header: Buffer;
  try {
    const zlib = await import("zlib");
    header = zlib.inflateRawSync(buf.slice(8, 8 + headerLen));
  } catch {
    throw new Error("Failed to decompress replay header. File may be corrupted.");
  }

  const version = header.toString("ascii", 0, 7).replace(/\0/g, "").trim();
  const numPlayersField = header.readUInt32LE(168);
  const numPlayers = numPlayersField >= 2 && numPlayersField <= 8 ? numPlayersField : 2;

  const playerSlots = parsePlayerSlots(header);
  const players = playerSlots
    .filter((s) => !s.name.startsWith("NONE:"))
    .slice(0, numPlayers)
    .map((s, i) => toReplayPlayer(s, i));

  if (players.length === 0) {
    for (let i = 0; i < numPlayers; i++) players.push(emptyPlayer(i));
  }

  const map = parseMapInfo(header);
  const gameSettings = parseGameSettings(header);

  const bodyStart = 8 + headerLen;
  const body = buf.slice(bodyStart);
  const { chats } = parseBody(body);

  return {
    version,
    map,
    duration: 0,
    players,
    actions: [],
    battles: [],
    timeline: buildTimeline(chats, players),
    ...({ chats, gameSettings } as Record<string, unknown>),
  };
}

// ── Player slot parsing ──

interface RawSlot {
  name: string;
  colorId: number;
  civId: number;
  profileId: number;
}

function parsePlayerSlots(header: Buffer): RawSlot[] {
  const slots: RawSlot[] = [];
  const limit = Math.min(header.length, 6000);

  // Scan for the 0x60 0x0a separator that precedes player names.
  // Each player has TWO consecutive name entries (display + internal).
  // Before the first separator there's: [0xFF] [color] [byte2] [8-byte hash] ...

  // First, locate all 0xFF markers that denote player slot entries.
  // Pattern: [0xFF] [colorId 0-7] [civId 0-45] [hash bytes...]
  // followed later by [0x60 0x0a] [uint16 nameLen] [name ascii] (x2)
  const ffPositions: number[] = [];
  for (let i = 200; i < limit - 20; i++) {
    if (
      header[i] === 0xff &&
      header[i + 1] >= 0 && header[i + 1] <= 7 &&
      header[i + 2] >= 0 && header[i + 2] <= 45
    ) {
      ffPositions.push(i);
    }
  }

  for (const ffPos of ffPositions) {
    if (slots.length >= 8) break;

    const colorId = header[ffPos + 1];
    const civId = header[ffPos + 2];

    // Find the next name separator after this 0xFF marker
    const nameSearch = findNameSeparator(header, ffPos + 3, ffPos + 200);
    if (nameSearch < 0) continue;

    const nameLen = header.readUInt16LE(nameSearch + 2);
    if (nameLen < 2 || nameLen > 60) continue;
    const name = header.toString("ascii", nameSearch + 4, nameSearch + 4 + nameLen);
    if (!/^[\x20-\x7e]+$/.test(name)) continue;
    if (name.startsWith("NONE:")) continue;

    // Avoid duplicates
    if (slots.some((s) => s.name === name)) continue;

    // Skip second name copy, find profile ID after
    let afterNames = nameSearch + 4 + nameLen;
    const sep2 = findNameSeparator(header, afterNames, afterNames + nameLen + 10);
    if (sep2 >= 0) {
      afterNames = sep2 + 4 + header.readUInt16LE(sep2 + 2);
    }

    let profileId = 0;
    if (afterNames + 8 < header.length) {
      const v = header.readUInt32LE(afterNames);
      if (v < 10) profileId = header.readUInt32LE(afterNames + 4);
    }

    slots.push({ name, colorId, civId, profileId });
  }

  return slots;
}

function findNameSeparator(buf: Buffer, from: number, to: number): number {
  for (let i = from; i < Math.min(to, buf.length - 4); i++) {
    if (buf[i] === 0x60 && buf[i + 1] === 0x0a) {
      const len = buf.readUInt16LE(i + 2);
      if (len >= 2 && len <= 60 && i + 4 + len <= buf.length) {
        const sample = buf[i + 4];
        if (sample >= 32 && sample < 127) return i;
      }
    }
  }
  return -1;
}

// ── Map and settings ──

function parseMapInfo(header: Buffer): ReplayMap {
  const text = extractSettingsText(header);
  const loc = text.match(/Location: ([^\n\x00]+)/);
  const size = text.match(/\[(\d+)\]/);

  return {
    name: loc?.[1]?.trim() || "Unknown Map",
    size: {
      x: size ? parseInt(size[1]) : 200,
      y: size ? parseInt(size[1]) : 200,
    },
  };
}

interface GameSettings {
  gameType: string;
  mapStyle: string;
  location: string;
  mapSize: string;
  startingAge: string;
  endingAge: string;
  resources: string;
  populationLimit: string;
  gameSpeed: string;
  teamsLocked: boolean;
  fixedPositions: boolean;
}

function parseGameSettings(header: Buffer): GameSettings {
  const text = extractSettingsText(header);
  const get = (key: string) => text.match(new RegExp(`${key}: ([^\\n\\x00]+)`))?.[1]?.trim() || "";
  const gameType = text.match(/\(([^)]+Game)/)?.[1] || "";

  return {
    gameType,
    mapStyle: get("Map Style"),
    location: get("Location"),
    mapSize: get("Map Size"),
    startingAge: get("Starting Age"),
    endingAge: get("Ending Age"),
    resources: get("Resources"),
    populationLimit: get("Population Limit"),
    gameSpeed: get("Game Speed"),
    teamsLocked: get("Teams Locked") === "Yes",
    fixedPositions: get("Fixed Positions") === "Yes",
  };
}

function extractSettingsText(header: Buffer): string {
  const from = Math.max(0, header.length - 50000);
  for (let i = from; i < header.length - 20; i++) {
    if (header.toString("ascii", i, i + 9) === "Location:") {
      const start = Math.max(from, i - 300);
      const end = Math.min(header.length, i + 600);
      let text = "";
      for (let j = start; j < end; j++) {
        const c = header[j];
        if (c >= 32 && c < 127) text += String.fromCharCode(c);
        else text += "\n";
      }
      return text;
    }
  }
  return "";
}

// ── Body parsing (chats) ──

interface ChatMessage {
  gameTimeSec: number;
  player: number;
  message: string;
  channel: number;
  tauntNumber: number;
}

function parseBody(body: Buffer) {
  const chats: ChatMessage[] = [];

  // Scan for JSON chat objects in the body
  const str = body.toString("utf8");
  let pos = 0;
  while (true) {
    const idx = str.indexOf('{"player":', pos);
    if (idx === -1) break;
    pos = idx + 1;

    let depth = 0;
    let end = idx;
    for (let i = idx; i < Math.min(idx + 500, body.length); i++) {
      if (body[i] === 0x7b) depth++;
      if (body[i] === 0x7d) depth--;
      if (depth === 0) { end = i + 1; break; }
    }

    try {
      const obj = JSON.parse(str.substring(idx, end));
      chats.push({
        gameTimeSec: 0,
        player: obj.player ?? 0,
        message: obj.message ?? "",
        channel: obj.channel ?? 0,
        tauntNumber: obj.tauntNumber ?? -1,
      });
    } catch { /* skip */ }
  }

  return { chats, gameTimeMs: 0, actionCounts: {} };
}

// ── Helpers ──

function toReplayPlayer(slot: RawSlot, index: number): ReplayPlayer {
  return {
    index: index + 1,
    name: slot.name,
    civ: CIV_NAMES[slot.civId] || (slot.civId ? `Civ ${slot.civId}` : "Random"),
    civId: slot.civId,
    team: index + 1,
    color: slot.colorId,
    winner: false,
    military: { unitsKilled: 0, unitsLost: 0, buildingsRazed: 0, buildingsLost: 0, largestArmy: 0 },
    economy: { foodCollected: 0, woodCollected: 0, goldCollected: 0, stoneCollected: 0, tradeGold: 0, relicGold: 0, villagerHigh: 0 },
  };
}

function emptyPlayer(index: number): ReplayPlayer {
  return toReplayPlayer({ name: `Player ${index + 1}`, colorId: index, civId: 0, profileId: 0 }, index);
}

function buildTimeline(chats: ChatMessage[], _players: ReplayPlayer[]): TimelineEvent[] {
  return chats
    .filter((c) => c.message)
    .map((c) => ({
      time: c.gameTimeSec,
      playerId: c.player,
      type: "resign" as const,
      description: `Player ${c.player}: ${c.message}`,
    }));
}

export { CIV_NAMES };
