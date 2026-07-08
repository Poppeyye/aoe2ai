import { SERVER_REGIONS } from "@/lib/aoe2/civs";

export type MatchSource = "spectate" | "lobby";
export type MatchKind = "ranked" | "lobby" | "ew_ranked" | "ew_lobby";
export type ScoutLeaderboard = "rm_1v1" | "rm_team" | "ew_1v1" | "ew_team";

export interface LobbySettingRow {
  label: string;
  value: string;
}

export function isEmpireWarsMatch(match: Record<string, unknown>): boolean {
  return match.ew_mode === true || match.mode === 12;
}

function looksLikeCustomLobby(match: Record<string, unknown>): boolean {
  const desc = typeof match.description === "string" ? match.description.trim() : "";
  return desc.length > 0;
}

/** Classify whether this is ranked automatch, custom lobby, or Empire Wars. */
export function classifyMatch(
  match: Record<string, unknown>,
  matchSource?: MatchSource,
): MatchKind {
  const isEw = isEmpireWarsMatch(match);
  const custom =
    matchSource === "lobby" ||
    (matchSource === "spectate" && looksLikeCustomLobby(match));

  if (custom) return isEw ? "ew_lobby" : "lobby";
  return isEw ? "ew_ranked" : "ranked";
}

export function getMatchKindLabel(kind: MatchKind, locale: "en" | "es"): string {
  const labels: Record<MatchKind, { en: string; es: string }> = {
    ranked: { en: "Ranked", es: "Ranked" },
    lobby: { en: "Custom Lobby", es: "Lobby custom" },
    ew_ranked: { en: "Ranked EW", es: "Ranked EW" },
    ew_lobby: { en: "EW Lobby", es: "Lobby EW" },
  };
  return labels[kind][locale];
}

export function inferScoutLeaderboard(
  match: Record<string, unknown>,
  isTeamGame: boolean,
): ScoutLeaderboard {
  const isEw = isEmpireWarsMatch(match);
  if (isTeamGame) return isEw ? "ew_team" : "rm_team";
  return isEw ? "ew_1v1" : "rm_1v1";
}

export function scoutLeaderboardToRm(lb: ScoutLeaderboard): "rm_1v1" | "rm_team" {
  return lb === "rm_team" || lb === "ew_team" ? "rm_team" : "rm_1v1";
}

const GAME_SPEEDS: Record<number, { en: string; es: string }> = {
  0: { en: "Slow", es: "Lento" },
  1: { en: "Casual", es: "Casual" },
  2: { en: "Normal", es: "Normal" },
  3: { en: "Fast", es: "Rápido" },
  4: { en: "Extra Fast", es: "Extra rápido" },
};

const AGES: Record<number, { en: string; es: string }> = {
  0: { en: "Dark Age", es: "Edad Oscura" },
  1: { en: "Feudal Age", es: "Edad Feudal" },
  2: { en: "Castle Age", es: "Edad Castillos" },
  3: { en: "Imperial Age", es: "Edad Imperial" },
};

const GAME_MODES: Record<number, { en: string; es: string }> = {
  0: { en: "Random Map", es: "Mapa aleatorio" },
  1: { en: "Regicide", es: "Regicidio" },
  2: { en: "Death Match", es: "Death Match" },
  3: { en: "Scenario", es: "Escenario" },
  4: { en: "Custom", es: "Personalizado" },
  5: { en: "King of the Hill", es: "Rey de la colina" },
  6: { en: "Wonder Race", es: "Carrera de maravillas" },
  7: { en: "Defend the Wonder", es: "Defiende la maravilla" },
  8: { en: "Turbo Random Map", es: "Mapa aleatorio turbo" },
  9: { en: "Capture the Relic", es: "Captura la reliquia" },
  10: { en: "Sudden Death", es: "Muerte súbita" },
  11: { en: "Battle Royale", es: "Battle Royale" },
  12: { en: "Empire Wars", es: "Empire Wars" },
};

const REVEAL_MAP: Record<number, { en: string; es: string }> = {
  0: { en: "Normal", es: "Normal" },
  1: { en: "Explored", es: "Explorado" },
  2: { en: "All Visible", es: "Todo visible" },
};

const RESOURCES: Record<number, { en: string; es: string }> = {
  0: { en: "Standard", es: "Estándar" },
  1: { en: "Low", es: "Bajos" },
  2: { en: "Medium", es: "Medios" },
  3: { en: "High", es: "Altos" },
  4: { en: "Ultra High", es: "Ultra altos" },
  5: { en: "Infinite", es: "Infinitos" },
};

function pickLabel(map: Record<number, { en: string; es: string }>, id: unknown, locale: "en" | "es"): string | null {
  if (typeof id !== "number" || !(id in map)) return null;
  return map[id][locale];
}

function yesNo(value: unknown, locale: "en" | "es"): string {
  return value ? (locale === "es" ? "Sí" : "Yes") : (locale === "es" ? "No" : "No");
}

function addRow(rows: LobbySettingRow[], label: string, value: string | null | undefined) {
  if (value) rows.push({ label, value });
}

export function formatLobbySettings(
  match: Record<string, unknown>,
  locale: "en" | "es",
): LobbySettingRow[] {
  const es = locale === "es";
  const rows: LobbySettingRow[] = [];

  if (match.matchSource === "spectate" || match.matchSource === "lobby") {
    const kind = classifyMatch(match, match.matchSource as MatchSource);
    addRow(rows, es ? "Tipo" : "Type", getMatchKindLabel(kind, locale));
  }

  const server = typeof match.server === "number" ? SERVER_REGIONS[match.server] : null;
  addRow(rows, es ? "Servidor" : "Server", server ?? (typeof match.server === "number" ? `Server ${match.server}` : null));

  if (typeof match.map_name === "string" && match.map_name) {
    addRow(rows, es ? "Mapa" : "Map", match.map_name);
  }

  if (typeof match.description === "string" && match.description.trim()) {
    addRow(rows, es ? "Lobby" : "Lobby", match.description.trim());
  }

  if (typeof match.population === "number" && match.population > 0) {
    addRow(rows, es ? "Población" : "Population", String(match.population));
  }

  addRow(rows, es ? "Velocidad" : "Speed", pickLabel(GAME_SPEEDS, match.speed, locale));
  addRow(rows, es ? "Edad inicial" : "Starting age", pickLabel(AGES, match.starting_age, locale));

  const endingAge = pickLabel(AGES, match.ending_age, locale);
  if (endingAge && match.ending_age !== 3) {
    addRow(rows, es ? "Edad final" : "Ending age", endingAge);
  }

  addRow(rows, es ? "Modo" : "Mode", pickLabel(GAME_MODES, match.mode, locale));
  addRow(rows, es ? "Recursos" : "Resources", pickLabel(RESOURCES, match.resources, locale));
  addRow(rows, es ? "Exploración del mapa" : "Map reveal", pickLabel(REVEAL_MAP, match.reveal_map, locale));

  if (typeof match.treaty_length === "number" && match.treaty_length > 0) {
    addRow(rows, es ? "Tratado" : "Treaty", `${match.treaty_length} min`);
  }

  if (typeof match.slots_taken === "number" && typeof match.slots_total === "number") {
    addRow(rows, es ? "Jugadores" : "Players", `${match.slots_taken}/${match.slots_total}`);
  }

  if (match.lock_teams === true) {
    addRow(rows, es ? "Equipos bloqueados" : "Teams locked", yesNo(true, locale));
  }

  if (match.team_together === true) {
    addRow(rows, es ? "Equipos juntos" : "Team together", yesNo(true, locale));
  }

  if (match.team_positions === true) {
    addRow(rows, es ? "Posiciones fijas" : "Team positions", yesNo(true, locale));
  }

  if (match.hide_civilizations === true) {
    addRow(rows, es ? "Civs ocultas" : "Hidden civs", yesNo(true, locale));
  }

  if (match.shared_exploration === true) {
    addRow(rows, es ? "Exploración compartida" : "Shared exploration", yesNo(true, locale));
  }

  if (match.turbo_mode === true) {
    addRow(rows, es ? "Turbo" : "Turbo", yesNo(true, locale));
  }

  if (match.cheats === true) {
    addRow(rows, es ? "Trucos" : "Cheats", yesNo(true, locale));
  }

  if (match.password === true) {
    addRow(rows, es ? "Con contraseña" : "Password", yesNo(true, locale));
  }

  if (match.record === true) {
    addRow(rows, es ? "Grabación" : "Recording", yesNo(true, locale));
  }

  if (typeof match.ranked_dm === "number" && match.ranked_dm > 0) {
    addRow(rows, es ? "Ranked DM" : "Ranked DM", yesNo(true, locale));
  }

  if (typeof match.matchid === "string" || typeof match.matchid === "number") {
    addRow(rows, es ? "ID partida" : "Match ID", String(match.matchid));
  }

  if (typeof match.steam_lobbyid === "string" || typeof match.steam_lobbyid === "number") {
    addRow(rows, "Steam Lobby", String(match.steam_lobbyid));
  }

  return rows;
}
