/**
 * Liquipedia scraping for AoE2 tournament data.
 * Uses the MediaWiki API (public, rate-limited).
 * Ref: https://liquipedia.net/ageofempires/api.php
 */

import type { Tournament } from "@/types";

const LIQUIPEDIA_API = "https://liquipedia.net/ageofempires/api.php";
const USER_AGENT = "AoE2AI/1.0 (https://aoe2.ai; contact@aoe2.ai)";

async function wikiQuery(params: Record<string, string>) {
  const url = new URL(LIQUIPEDIA_API);
  url.searchParams.set("action", "parse");
  url.searchParams.set("format", "json");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error(`Liquipedia API error: ${res.status}`);
  return res.json();
}

export async function getTournaments(): Promise<Tournament[]> {
  try {
    const data = await wikiQuery({
      page: "Age_of_Empires_II/Tournaments",
      prop: "wikitext",
    });

    return parseTournamentsFromWikitext(data?.parse?.wikitext?.["*"] ?? "");
  } catch {
    return getFallbackTournaments();
  }
}

function parseTournamentsFromWikitext(wikitext: string): Tournament[] {
  const tournaments: Tournament[] = [];
  const lines = wikitext.split("\n");

  let current: Partial<Tournament> | null = null;
  for (const line of lines) {
    const nameMatch = line.match(/\|name\s*=\s*(.+)/);
    const dateMatch = line.match(/\|sdate\s*=\s*(\d{4}-\d{2}-\d{2})/);
    const endMatch = line.match(/\|edate\s*=\s*(\d{4}-\d{2}-\d{2})/);
    const prizeMatch = line.match(/\|prizepool\s*=\s*(.+)/);
    const tierMatch = line.match(/\|tier\s*=\s*(.+)/);

    if (nameMatch) {
      if (current?.name) tournaments.push(current as Tournament);
      current = {
        id: `t-${tournaments.length}`,
        name: nameMatch[1].trim(),
        status: "upcoming",
      };
    }
    if (current && dateMatch) current.startDate = dateMatch[1];
    if (current && endMatch) current.endDate = endMatch[1];
    if (current && prizeMatch) current.prizePool = prizeMatch[1].trim();
    if (current && tierMatch) current.tier = tierMatch[1].trim();
  }
  if (current?.name) tournaments.push(current as Tournament);

  return tournaments.slice(0, 50);
}

function getFallbackTournaments(): Tournament[] {
  return [
    {
      id: "redbull-wololo",
      name: "Red Bull Wololo: Legacy",
      tier: "S-Tier",
      startDate: "2025-10-01",
      endDate: "2025-10-05",
      prizePool: "$200,000",
      status: "upcoming",
    },
    {
      id: "t90-titans",
      name: "T90 Titans League Season 5",
      tier: "A-Tier",
      startDate: "2025-06-01",
      endDate: "2025-08-30",
      prizePool: "$30,000",
      status: "ongoing",
    },
    {
      id: "hidden-cup",
      name: "Hidden Cup 5",
      tier: "S-Tier",
      startDate: "2024-11-15",
      endDate: "2024-11-17",
      prizePool: "$100,000",
      status: "completed",
    },
  ];
}
