/**
 * AoE2 DE civilization IDs from the aoe2lobby.com WebSocket API.
 * These use the game's internal 1-indexed civilization IDs (0 = Random/Gaia).
 */

export const CIV_NAMES: Record<number, string> = {
  0: "Random",
  1: "Britons",
  2: "Franks",
  3: "Goths",
  4: "Teutons",
  5: "Japanese",
  6: "Chinese",
  7: "Byzantines",
  8: "Persians",
  9: "Saracens",
  10: "Turks",
  11: "Vikings",
  12: "Mongols",
  13: "Celts",
  14: "Spanish",
  15: "Aztecs",
  16: "Mayans",
  17: "Huns",
  18: "Koreans",
  19: "Italians",
  20: "Hindustanis",
  21: "Incas",
  22: "Magyars",
  23: "Slavs",
  24: "Portuguese",
  25: "Ethiopians",
  26: "Malians",
  27: "Berbers",
  28: "Khmer",
  29: "Malay",
  30: "Burmese",
  31: "Vietnamese",
  32: "Bulgarians",
  33: "Cumans",
  34: "Lithuanians",
  35: "Tatars",
  36: "Burgundians",
  37: "Sicilians",
  38: "Poles",
  39: "Bohemians",
  40: "Dravidians",
  41: "Bengalis",
  42: "Gurjaras",
  43: "Romans",
  44: "Armenians",
  45: "Georgians",
};

export function getCivName(id: number): string {
  return CIV_NAMES[id] ?? `Unknown (${id})`;
}

export const SERVER_REGIONS: Record<number, string> = {
  0: "Automatic",
  1: "US East",
  2: "US West",
  3: "Southeast Asia",
  4: "Australia",
  5: "South America",
  6: "Korea",
  7: "Europe West",
  8: "Europe East",
  9: "Middle East",
  10: "India",
  11: "Japan",
  12: "South Africa",
  13: "UK",
};
