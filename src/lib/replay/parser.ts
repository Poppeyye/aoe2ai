/**
 * AoE2 DE .aoe2record replay parser.
 *
 * Reverse-engineered from real DE replay files (VER 9.4) plus the
 * mgz Python parser (https://github.com/happyleavesaoc/aoc-mgz) as reference.
 *
 * Extracts: players, map, duration, eAPM, army composition, unit training,
 * building placements, battle zones, heatmap data, chat, and more.
 */

import type { ReplayData, ReplayPlayer, ReplayMap, Battle, TimelineEvent } from "@/types";

// ── AoE2 DE ID Mappings ──

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

const UNIT_NAMES: Record<number, string> = {
  4: "Archer", 5: "Hand Cannoneer", 6: "Elite Skirmisher", 7: "Skirmisher",
  8: "Longbowman", 11: "Mangudai", 13: "Fishing Ship", 17: "Trade Cog",
  24: "Cavalry Archer", 25: "Teutonic Knight", 35: "Battering Ram",
  36: "Bombard Cannon", 38: "Knight", 39: "Cavalry Archer",
  40: "Cataphract", 41: "Huskarl", 42: "Trebuchet",
  46: "Janissary", 73: "Militia", 74: "Man-at-Arms", 75: "Long Swordsman",
  77: "Two-Handed Swordsman", 83: "Villager", 93: "Spearman",
  125: "Monk", 128: "Trade Cart",
  185: "Slinger", 232: "Woad Raider", 239: "War Galley",
  250: "Longboat", 279: "Scorpion", 280: "Mangonel",
  281: "Throwing Axeman", 283: "Mameluke",
  291: "Samurai", 329: "Camel Rider", 330: "Heavy Camel Rider",
  331: "Trebuchet (Packed)", 358: "Pikeman", 359: "Halberdier",
  420: "Cannon Galleon", 422: "Capped Ram", 440: "Petard",
  441: "Hussar", 442: "Crossbowman", 448: "Scout Cavalry",
  473: "Two-Handed Swordsman", 530: "Siege Tower",
  542: "Heavy Scorpion", 545: "Transport Ship",
  546: "Light Cavalry", 548: "Siege Ram",
  550: "Onager", 553: "Elite Cavalry Archer", 554: "Arbalester",
  567: "Champion", 569: "Paladin", 588: "Siege Onager",
  691: "Elephant Archer", 725: "Genitour",
  751: "Eagle Scout", 752: "Eagle Warrior", 753: "Elite Eagle Warrior",
  771: "Condottiero",
  1001: "Organ Gun", 1004: "Caravel", 1007: "Camel Archer",
  1010: "Genitour", 1013: "Gbeto", 1015: "Shotel Warrior",
  1103: "Fire Galley", 1104: "Demolition Raft",
  1120: "Siege Elephant", 1122: "Ballista Elephant",
  1132: "Battle Elephant", 1134: "Elite Battle Elephant",
  1225: "Konnik", 1228: "Keshik", 1231: "Kipchak",
  1234: "Leitis", 1258: "Flaming Camel", 1263: "Steppe Lancer",
  1370: "Coustillier", 1379: "Serjeant", 1655: "Obuch",
  1658: "Hussite Wagon", 1699: "Flemish Militia",
  1701: "Urumi Swordsman", 1704: "Chakram Thrower",
  1707: "Thirisadai", 1709: "Shrivamsha Rider",
  1735: "Camel Scout", 1738: "Ghulam",
  1755: "Centurion", 1795: "Composite Bowman",
  1798: "Monaspa", 1901: "Dromon",
  1962: "Capped Ram",
};

const BUILDING_NAMES: Record<number, string> = {
  10: "Archery Range (alt)", 12: "Barracks", 45: "Dock",
  49: "Siege Workshop", 50: "Farm", 68: "Mill", 70: "House",
  72: "Wall", 79: "Watch Tower", 82: "Castle", 84: "Market",
  87: "Archery Range", 101: "Stable", 103: "Blacksmith",
  104: "Monastery", 109: "Town Center", 199: "Fish Trap",
  209: "University", 234: "Guard Tower", 235: "Keep",
  236: "Lumber Camp", 276: "Wonder", 487: "Gate",
  562: "Lumber Camp", 584: "Mining Camp", 598: "Outpost",
  621: "Fortified Wall", 789: "Palisade Wall", 790: "Palisade Gate",
};

const ACTION_LABELS: Record<number, string> = {
  0: "interact", 1: "stop", 3: "move", 10: "create", 19: "research",
  20: "build", 21: "game", 30: "repair", 31: "multiqueue",
  35: "wall", 37: "delete", 39: "attackground", 41: "tribute",
  45: "attackground_de", 100: "spec", 101: "order", 102: "build_de",
  103: "queue", 104: "formation", 105: "resign", 106: "waypoint",
  107: "stance", 108: "guard", 109: "follow", 110: "patrol",
  111: "townbell", 114: "backtowork", 117: "droprelic",
  120: "gather_de", 129: "de_queue", 130: "de_queue2",
  135: "de_attackmove", 136: "de_autoscout", 255: "postgame",
};

// ── Exported types ──

export interface PlayerStats {
  playerId: number;
  eapm: number;
  eapmOverTime: Array<{ minute: number; eapm: number }>;
  unitsTrainedByType: Record<string, number>;
  totalUnitsTrained: number;
  buildingsPlaced: Record<string, number>;
  totalBuildingsPlaced: number;
  militaryActions: number;
  economyActions: number;
  actionsPerMinute: Record<string, number>;
}

// ── Main entry point ──

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

  const rawSlots = parsePlayerSlots(header);
  const activePlayers = rawSlots.filter((s) => !s.name.startsWith("NONE:")).slice(0, numPlayers);
  const players = activePlayers.length > 0
    ? activePlayers.map((s, i) => toReplayPlayer(s, i))
    : Array.from({ length: numPlayers }, (_, i) => emptyPlayer(i));

  const map = parseMapInfo(header);
  const gameSettings = parseGameSettings(header);

  const bodyStart = 8 + headerLen;
  const body = buf.slice(bodyStart);
  const bodyResult = parseBody(body, map.size.x, numPlayers);

  if (bodyResult.resignPlayerId > 0) {
    players.forEach((p) => {
      p.winner = p.index !== bodyResult.resignPlayerId;
    });
  }

  const duration = bodyResult.durationSec > 0
    ? bodyResult.durationSec
    : (bodyResult.postgameDuration || 0);

  return {
    version,
    map,
    duration,
    players,
    actions: [],
    battles: bodyResult.battles,
    timeline: bodyResult.timeline,
    ...({
      chats: bodyResult.chats,
      gameSettings,
      actionCounts: bodyResult.actionCounts,
      heatmapData: bodyResult.heatmapData,
      militaryEvents: bodyResult.militaryEvents,
      playerStats: bodyResult.playerStats,
    } as Record<string, unknown>),
  };
}

// ════════════════════════════════════════════
// ── HEADER PARSING
// ════════════════════════════════════════════

interface RawSlot { name: string; colorId: number; civId: number; profileId: number; }

function parsePlayerSlots(header: Buffer): RawSlot[] {
  const slots: RawSlot[] = [];
  const limit = Math.min(header.length, 6000);
  const ffPositions: number[] = [];
  for (let i = 200; i < limit - 20; i++) {
    if (header[i] === 0xff && header[i + 1] <= 7 && header[i + 2] <= 45) ffPositions.push(i);
  }
  for (const ffPos of ffPositions) {
    if (slots.length >= 8) break;
    const colorId = header[ffPos + 1];
    const civId = header[ffPos + 2];
    const ns = findNameSep(header, ffPos + 3, ffPos + 200);
    if (ns < 0) continue;
    const nameLen = header.readUInt16LE(ns + 2);
    if (nameLen < 2 || nameLen > 60) continue;
    const name = header.toString("ascii", ns + 4, ns + 4 + nameLen);
    if (!/^[\x20-\x7e]+$/.test(name) || name.startsWith("NONE:")) continue;
    if (slots.some((s) => s.name === name)) continue;
    let afterNames = ns + 4 + nameLen;
    const sep2 = findNameSep(header, afterNames, afterNames + nameLen + 10);
    if (sep2 >= 0) afterNames = sep2 + 4 + header.readUInt16LE(sep2 + 2);
    let profileId = 0;
    if (afterNames + 8 < header.length) {
      const v = header.readUInt32LE(afterNames);
      if (v < 10) profileId = header.readUInt32LE(afterNames + 4);
    }
    slots.push({ name, colorId, civId, profileId });
  }
  return slots;
}

function findNameSep(buf: Buffer, from: number, to: number): number {
  for (let i = from; i < Math.min(to, buf.length - 4); i++) {
    if (buf[i] === 0x60 && buf[i + 1] === 0x0a) {
      const len = buf.readUInt16LE(i + 2);
      if (len >= 2 && len <= 60 && i + 4 + len <= buf.length && buf[i + 4] >= 32 && buf[i + 4] < 127) return i;
    }
  }
  return -1;
}

function parseMapInfo(header: Buffer): ReplayMap {
  const text = extractSettingsText(header);
  const loc = text.match(/Location: ([^\n\x00]+)/);
  const size = text.match(/\[(\d+)\]/);
  return {
    name: loc?.[1]?.trim() || "Unknown Map",
    size: { x: size ? parseInt(size[1]) : 200, y: size ? parseInt(size[1]) : 200 },
  };
}

interface GameSettings {
  gameType: string; mapStyle: string; location: string; mapSize: string;
  startingAge: string; endingAge: string; resources: string;
  populationLimit: string; gameSpeed: string; teamsLocked: boolean;
}

function parseGameSettings(header: Buffer): GameSettings {
  const text = extractSettingsText(header);
  const get = (k: string) => text.match(new RegExp(`${k}: ([^\\n\\x00]+)`))?.[1]?.trim() || "";
  return {
    gameType: text.match(/\(([^)]+Game)/)?.[1] || "",
    mapStyle: get("Map Style"), location: get("Location"), mapSize: get("Map Size"),
    startingAge: get("Starting Age"), endingAge: get("Ending Age"),
    resources: get("Resources"), populationLimit: get("Population Limit"),
    gameSpeed: get("Game Speed"), teamsLocked: get("Teams Locked") === "Yes",
  };
}

function extractSettingsText(header: Buffer): string {
  const from = Math.max(0, header.length - 50000);
  for (let i = from; i < header.length - 20; i++) {
    if (header.toString("ascii", i, i + 9) === "Location:") {
      const s = Math.max(from, i - 300);
      const e = Math.min(header.length, i + 600);
      let t = "";
      for (let j = s; j < e; j++) {
        const c = header[j];
        t += (c >= 32 && c < 127) ? String.fromCharCode(c) : "\n";
      }
      return t;
    }
  }
  return "";
}

// ════════════════════════════════════════════
// ── BODY PARSING
// ════════════════════════════════════════════

interface ChatMsg { timeSec: number; player: number; message: string; }
interface MilitaryEvent { timeSec: number; playerId: number; type: string; x: number; y: number; targetId?: number; unitCount?: number; }
interface HeatmapPoint { x: number; y: number; type: string; playerId: number; timeSec: number; }

interface BodyResult {
  durationSec: number;
  chats: ChatMsg[];
  actionCounts: Record<string, number>;
  militaryEvents: MilitaryEvent[];
  heatmapData: HeatmapPoint[];
  battles: Battle[];
  timeline: TimelineEvent[];
  resignPlayerId: number;
  postgameDuration: number;
  playerStats: Record<number, PlayerStats>;
}

function parseBody(body: Buffer, mapSize: number, numPlayers: number): BodyResult {
  const chats: ChatMsg[] = [];
  const actionCounts: Record<string, number> = {};
  const militaryEvents: MilitaryEvent[] = [];
  const heatmapData: HeatmapPoint[] = [];
  const timeline: TimelineEvent[] = [];
  let resignPlayerId = 0;
  let postgameDuration = 0;

  // Per-player tracking
  const pActions: Record<number, number[]> = {};
  const pUnits: Record<number, Record<string, number>> = {};
  const pBuildings: Record<number, Record<string, number>> = {};
  const pMilitary: Record<number, number> = {};
  const pEconomy: Record<number, number> = {};
  for (let p = 1; p <= numPlayers; p++) {
    pActions[p] = [];
    pUnits[p] = {};
    pBuildings[p] = {};
    pMilitary[p] = 0;
    pEconomy[p] = 0;
  }

  let gameTimeMs = 0;
  const streamOff = findOperationStreamStart(body);
  let off = streamOff;

  for (let iter = 0; iter < 10_000_000 && off < body.length - 4; iter++) {
    const opType = body.readUInt32LE(off);

    if (opType === 2) {
      if (off + 8 > body.length) break;
      const timeInc = body.readUInt32LE(off + 4);
      if (timeInc > 5_000_000) break;
      gameTimeMs += timeInc;
      off += 8;
      if (off + 4 <= body.length && body.readUInt32LE(off) === 0) {
        off += 8 + 4 + 4;
        if (off + 4 > body.length) break;
        const seq = body.readUInt32LE(off); off += 4;
        if (seq > 0 && off + 332 <= body.length) off += 332;
        off += 8;
      }
    } else if (opType === 3) {
      if (off + 16 > body.length) break;
      off += 16;
    } else if (opType === 4) {
      if (off + 12 > body.length) break;
      const chatLen = body.readUInt32LE(off + 8);
      if (chatLen <= 0 || chatLen > 100_000 || off + 12 + chatLen > body.length) break;
      const chatText = body.slice(off + 12, off + 12 + chatLen);
      try {
        const str = chatText.toString("utf8").replace(/\0/g, "");
        if (str.startsWith("{")) {
          const obj = JSON.parse(str);
          chats.push({ timeSec: Math.floor(gameTimeMs / 1000), player: obj.player ?? 0, message: obj.message ?? str });
        }
      } catch { /* skip */ }
      off += 12 + chatLen;
    } else if (opType === 1) {
      if (off + 8 > body.length) break;
      const actionLen = body.readUInt32LE(off + 4);
      if (actionLen <= 0 || actionLen > 500_000 || off + 8 + actionLen + 4 > body.length) break;

      const d = body.slice(off + 8, off + 8 + actionLen);
      const aType = d[0];
      const playerId = d[1];
      const label = ACTION_LABELS[aType] || `action_${aType}`;
      actionCounts[label] = (actionCounts[label] || 0) + 1;
      const timeSec = Math.floor(gameTimeMs / 1000);

      // Track eAPM (all meaningful player actions)
      if (playerId >= 1 && playerId <= numPlayers) {
        if (!pActions[playerId]) pActions[playerId] = [];
        pActions[playerId].push(timeSec);
      }

      // Parse specific action types
      switch (aType) {
        case 0: { // interact
          if (d.length >= 16) {
            const targetId = d.readUInt32LE(4);
            const x = d.readFloatLE(8);
            const y = d.readFloatLE(12);
            if (isValidCoord(x, y, mapSize)) {
              heatmapData.push({ x, y, type: "interact", playerId, timeSec });
              if (targetId > 0 && targetId !== 0xFFFFFFFF) {
                militaryEvents.push({ timeSec, playerId, type: "attack", x, y, targetId, unitCount: 1 });
                if (pMilitary[playerId] !== undefined) pMilitary[playerId]++;
              }
            }
          }
          break;
        }
        case 3: { // move
          if (d.length >= 16) {
            const x = d.readFloatLE(8);
            const y = d.readFloatLE(12);
            if (isValidCoord(x, y, mapSize)) {
              heatmapData.push({ x, y, type: "move", playerId, timeSec });
            }
          }
          break;
        }
        case 102: { // build_de
          if (d.length >= 20) {
            const x = d.readFloatLE(8);
            const y = d.readFloatLE(12);
            const buildingType = d.readUInt32LE(16);
            if (isValidCoord(x, y, mapSize)) {
              heatmapData.push({ x, y, type: "build", playerId, timeSec });
              const bName = BUILDING_NAMES[buildingType] || `Building #${buildingType}`;
              if (pBuildings[playerId]) pBuildings[playerId][bName] = (pBuildings[playerId][bName] || 0) + 1;
              if (pEconomy[playerId] !== undefined) pEconomy[playerId]++;
              if (buildingType !== 70 && buildingType !== 562) {
                timeline.push({ time: timeSec, playerId, type: "build", description: `Player ${playerId} builds ${bName} at (${x.toFixed(0)},${y.toFixed(0)})` });
              }
            }
          }
          break;
        }
        case 120: { // gather_de
          if (d.length >= 16) {
            const x = d.readFloatLE(8);
            const y = d.readFloatLE(12);
            if (isValidCoord(x, y, mapSize)) {
              heatmapData.push({ x, y, type: "gather", playerId, timeSec });
              if (pEconomy[playerId] !== undefined) pEconomy[playerId]++;
            }
          }
          break;
        }
        case 129: { // de_queue (unit training)
          if (d.length >= 16) {
            const buildingLineId = d.readUInt16LE(10);
            const unitTypeId = d.readUInt16LE(12);
            const queueAmount = d.readUInt16LE(14);
            const unitName = UNIT_NAMES[unitTypeId] || `Unit #${unitTypeId}`;
            const fromBuilding = BUILDING_NAMES[buildingLineId] || `Building #${buildingLineId}`;
            const count = Math.max(queueAmount, 1);
            if (pUnits[playerId]) pUnits[playerId][unitName] = (pUnits[playerId][unitName] || 0) + count;
            if (unitTypeId !== 83) {
              if (pMilitary[playerId] !== undefined) pMilitary[playerId]++;
            }
          }
          break;
        }
        case 45: // attackground_de
        case 39: { // attackground
          if (d.length >= 16) {
            const x = d.readFloatLE(8);
            const y = d.readFloatLE(12);
            if (isValidCoord(x, y, mapSize)) {
              heatmapData.push({ x, y, type: "attack_ground", playerId, timeSec });
              militaryEvents.push({ timeSec, playerId, type: "attack_ground", x, y });
              if (pMilitary[playerId] !== undefined) pMilitary[playerId]++;
            }
          }
          break;
        }
        case 110: // patrol
        case 135: { // de_attackmove
          if (d.length >= 16) {
            const x = d.readFloatLE(8);
            const y = d.length >= 52 ? d.readFloatLE(48) : d.readFloatLE(12);
            if (isValidCoord(x, y, mapSize)) {
              heatmapData.push({ x, y, type: aType === 135 ? "attack_move" : "patrol", playerId, timeSec });
              if (aType === 135) militaryEvents.push({ timeSec, playerId, type: "attack_move", x, y });
              if (pMilitary[playerId] !== undefined) pMilitary[playerId]++;
            }
          }
          break;
        }
        case 105: { // resign
          resignPlayerId = playerId;
          break;
        }
      }

      off += 8 + actionLen + 4;
    } else {
      break;
    }
  }

  const durationSec = Math.floor(gameTimeMs / 1000);
  const battles = detectBattles(militaryEvents, mapSize);

  if (resignPlayerId > 0) {
    timeline.push({ time: durationSec, playerId: resignPlayerId, type: "resign", description: `Player ${resignPlayerId} resigned` });
  }

  // Build per-player stats
  const playerStats: Record<number, PlayerStats> = {};
  for (let p = 1; p <= numPlayers; p++) {
    const actions = pActions[p] || [];
    const durMin = durationSec / 60;
    const eapm = durMin > 0 ? Math.round(actions.length / durMin) : 0;

    // eAPM per minute
    const eapmOverTime: Array<{ minute: number; eapm: number }> = [];
    const maxMin = Math.ceil(durationSec / 60);
    for (let m = 0; m < maxMin; m++) {
      const count = actions.filter((t) => t >= m * 60 && t < (m + 1) * 60).length;
      eapmOverTime.push({ minute: m, eapm: count });
    }

    const units = pUnits[p] || {};
    const buildings = pBuildings[p] || {};

    playerStats[p] = {
      playerId: p,
      eapm,
      eapmOverTime,
      unitsTrainedByType: units,
      totalUnitsTrained: Object.values(units).reduce((s, n) => s + n, 0),
      buildingsPlaced: buildings,
      totalBuildingsPlaced: Object.values(buildings).reduce((s, n) => s + n, 0),
      militaryActions: pMilitary[p] || 0,
      economyActions: pEconomy[p] || 0,
      actionsPerMinute: {},
    };
  }

  return {
    durationSec, chats, actionCounts, militaryEvents, heatmapData,
    battles, timeline, resignPlayerId, postgameDuration, playerStats,
  };
}

// ── Operation stream start detection ──

function findOperationStreamStart(body: Buffer): number {
  const candidates = [24, 28, 20, 16, 32, 36, 12, 8, 0];
  let bestOff = 24, bestScore = 0;
  for (const start of candidates) {
    if (start >= body.length - 8) continue;
    let off = start, syncs = 0, actions = 0;
    for (let i = 0; i < 2000 && off < body.length - 8; i++) {
      const op = body.readUInt32LE(off);
      if (op === 2) {
        const t = body.readUInt32LE(off + 4);
        if (t > 5_000_000) break;
        syncs++; off += 8;
        if (off + 4 <= body.length && body.readUInt32LE(off) === 0) {
          off += 8 + 4 + 4;
          if (off + 4 > body.length) break;
          const seq = body.readUInt32LE(off); off += 4;
          if (seq > 0 && off + 332 <= body.length) off += 332;
          off += 8;
        }
      } else if (op === 3) { off += 16; }
      else if (op === 1) {
        const len = body.readUInt32LE(off + 4);
        if (len > 0 && len < 100_000 && off + 8 + len + 4 <= body.length) { actions++; off += 8 + len + 4; }
        else break;
      } else if (op === 4) {
        const len = body.readUInt32LE(off + 8);
        if (len > 0 && len < 100_000 && off + 12 + len <= body.length) off += 12 + len;
        else break;
      } else break;
    }
    const score = syncs * 2 + actions * 5;
    if (score > bestScore) { bestScore = score; bestOff = start; }
  }
  return bestOff;
}

// ── Battle detection ──

function detectBattles(events: MilitaryEvent[], mapSize: number): Battle[] {
  if (events.length === 0) return [];
  const WINDOW = 30;
  const DIST = mapSize * 0.15;
  const battles: Battle[] = [];
  const used = new Set<number>();

  for (let i = 0; i < events.length; i++) {
    if (used.has(i)) continue;
    const seed = events[i];
    const cluster: MilitaryEvent[] = [seed];
    used.add(i);
    for (let j = i + 1; j < events.length; j++) {
      if (used.has(j)) continue;
      const ev = events[j];
      if (ev.timeSec - seed.timeSec > WINDOW) break;
      const dx = ev.x - seed.x, dy = ev.y - seed.y;
      if (Math.sqrt(dx * dx + dy * dy) < DIST) { cluster.push(ev); used.add(j); }
    }
    if (cluster.length >= 3) {
      const participants = Array.from(new Set(cluster.map((e) => e.playerId)));
      const avgX = cluster.reduce((s, e) => s + e.x, 0) / cluster.length;
      const avgY = cluster.reduce((s, e) => s + e.y, 0) / cluster.length;
      const casualties: Record<number, number> = {};
      cluster.forEach((e) => { casualties[e.playerId] = (casualties[e.playerId] || 0) + (e.unitCount || 1); });
      battles.push({
        id: battles.length + 1,
        startTime: cluster[0].timeSec,
        endTime: cluster[cluster.length - 1].timeSec,
        location: { x: avgX, y: avgY },
        participants,
        casualties,
      });
    }
  }
  return battles;
}

// ── Helpers ──

function isValidCoord(x: number, y: number, mapSize: number): boolean {
  return Number.isFinite(x) && Number.isFinite(y) && x >= 0 && y >= 0 && x <= mapSize + 10 && y <= mapSize + 10;
}

function toReplayPlayer(slot: RawSlot, index: number): ReplayPlayer {
  return {
    index: index + 1, name: slot.name,
    civ: CIV_NAMES[slot.civId] || (slot.civId ? `Civ ${slot.civId}` : "Random"),
    civId: slot.civId, team: index + 1, color: slot.colorId, winner: false,
    military: { unitsKilled: 0, unitsLost: 0, buildingsRazed: 0, buildingsLost: 0, largestArmy: 0 },
    economy: { foodCollected: 0, woodCollected: 0, goldCollected: 0, stoneCollected: 0, tradeGold: 0, relicGold: 0, villagerHigh: 0 },
  };
}

function emptyPlayer(index: number): ReplayPlayer {
  return toReplayPlayer({ name: `Player ${index + 1}`, colorId: index, civId: 0, profileId: 0 }, index);
}

export { CIV_NAMES, UNIT_NAMES, BUILDING_NAMES };
