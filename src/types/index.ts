// ── Player & Leaderboard ──

export interface Player {
  profileId: number;
  steamId?: string;
  name: string;
  country?: string;
  rating: number;
  rank: number;
  wins: number;
  losses: number;
  drops: number;
  streak: number;
  highestRating: number;
  lastMatchTime?: number;
}

export interface LeaderboardEntry extends Player {
  leaderboardId: LeaderboardType;
}

export type LeaderboardType =
  | "rm_1v1"
  | "rm_team"
  | "ew_1v1"
  | "ew_team";

export const LEADERBOARD_IDS: Record<LeaderboardType, number> = {
  rm_1v1: 3,
  rm_team: 4,
  ew_1v1: 13,
  ew_team: 14,
};

// ── Match ──

export interface Match {
  matchId: string;
  started: number;
  finished?: number;
  mapType: number;
  mapName?: string;
  ranked: boolean;
  ratingType: number;
  players: MatchPlayer[];
  server?: string;
}

export interface MatchPlayer {
  profileId: number;
  name: string;
  civ: number;
  civName?: string;
  team: number;
  rating?: number;
  ratingChange?: number;
  won?: boolean;
  color: number;
}

// ── Civilization & Tech Tree ──

export interface Civilization {
  id: number;
  name: string;
  expansion: string;
  armyType: string;
  uniqueUnit: string[];
  uniqueTech: string[];
  teamBonus: string;
  civBonus: string[];
}

export interface Unit {
  id: number;
  name: string;
  description: string;
  age: number;
  cost: Record<string, number>;
  hitPoints: number;
  attack: number;
  armor: string;
  range?: number;
  lineOfSight: number;
  speed: number;
  buildTime: number;
}

export interface Technology {
  id: number;
  name: string;
  description: string;
  age: number;
  cost: Record<string, number>;
  researchTime: number;
}

// ── Replay ──

export interface ReplayData {
  version: string;
  map: ReplayMap;
  duration: number;
  players: ReplayPlayer[];
  actions: ReplayAction[];
  battles: Battle[];
  timeline: TimelineEvent[];
}

export interface ReplayMap {
  name: string;
  size: { x: number; y: number };
  seed?: number;
  terrain?: number[][];
}

export interface ReplayPlayer {
  index: number;
  name: string;
  civ: string;
  civId: number;
  team: number;
  color: number;
  rating?: number;
  winner: boolean;
  feudalTime?: number;
  castleTime?: number;
  imperialTime?: number;
  score?: number;
  military: MilitaryStats;
  economy: EconomyStats;
}

export interface MilitaryStats {
  unitsKilled: number;
  unitsLost: number;
  buildingsRazed: number;
  buildingsLost: number;
  largestArmy: number;
}

export interface EconomyStats {
  foodCollected: number;
  woodCollected: number;
  goldCollected: number;
  stoneCollected: number;
  tradeGold: number;
  relicGold: number;
  villagerHigh: number;
}

export interface ReplayAction {
  timestamp: number;
  playerId: number;
  type: string;
  details: Record<string, unknown>;
}

export interface Battle {
  id: number;
  startTime: number;
  endTime: number;
  location: { x: number; y: number };
  participants: number[];
  casualties: Record<number, number>;
  winner?: number;
}

export interface TimelineEvent {
  time: number;
  playerId: number;
  type: "age_up" | "research" | "build" | "attack" | "resign" | "tribute";
  description: string;
}

// ── AI Agent ──

export interface AgentMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  toolCalls?: ToolCall[];
  timestamp: number;
}

export interface ToolCall {
  name: string;
  arguments: Record<string, unknown>;
  result?: string;
}

// ── Academy ──

export interface VideoAnalysis {
  videoId: string;
  title: string;
  channel: string;
  summary: string;
  keyTakeaways: string[];
  buildOrders: BuildOrder[];
  strategies: string[];
}

export interface BuildOrder {
  name: string;
  civ?: string;
  steps: string[];
  popCount?: number;
}
