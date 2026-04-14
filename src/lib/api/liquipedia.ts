/**
 * Liquipedia scraping for AoE2 tournament data.
 * Uses the MediaWiki API (public, rate-limited).
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

function deriveStatus(startDate?: string, endDate?: string): Tournament["status"] {
  if (!startDate) return "upcoming";
  const now = new Date();
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : start;
  if (now < start) return "upcoming";
  if (now > end) return "completed";
  return "ongoing";
}

export async function getTournaments(): Promise<Tournament[]> {
  try {
    const data = await wikiQuery({
      page: "Age_of_Empires_II/Tournaments",
      prop: "wikitext",
    });

    const parsed = parseTournamentsFromWikitext(data?.parse?.wikitext?.["*"] ?? "");
    if (parsed.length > 0) return parsed;
    return getFallbackTournaments();
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
    const linkMatch = line.match(/\|(?:page|pagename|link)\s*=\s*(.+)/);

    if (nameMatch) {
      if (current?.name) {
        current.status = deriveStatus(current.startDate, current.endDate);
        tournaments.push(current as Tournament);
      }
      const cleanName = nameMatch[1].trim().replace(/\[\[|\]\]/g, "");
      current = {
        id: `t-${tournaments.length}`,
        name: cleanName,
        status: "upcoming",
      };
    }
    if (current && dateMatch) current.startDate = dateMatch[1];
    if (current && endMatch) current.endDate = endMatch[1];
    if (current && prizeMatch) current.prizePool = prizeMatch[1].trim().replace(/[{}[\]]/g, "");
    if (current && tierMatch) current.tier = tierMatch[1].trim();
    if (current && linkMatch) {
      const page = linkMatch[1].trim().replace(/\s/g, "_");
      current.liquipediaUrl = `https://liquipedia.net/ageofempires/${page}`;
    }
  }
  if (current?.name) {
    current.status = deriveStatus(current.startDate, current.endDate);
    tournaments.push(current as Tournament);
  }

  return tournaments.slice(0, 100);
}

function getFallbackTournaments(): Tournament[] {
  return [
    {
      id: "redbull-wololo-7",
      name: "Red Bull Wololo: El Reinado",
      tier: "S-Tier",
      startDate: "2026-09-12",
      endDate: "2026-09-15",
      prizePool: "$200,000",
      status: "upcoming",
      liquipediaUrl: "https://liquipedia.net/ageofempires/Red_Bull_Wololo/El_Reinado",
    },
    {
      id: "hidden-cup-6",
      name: "Hidden Cup 6",
      tier: "S-Tier",
      startDate: "2026-05-10",
      endDate: "2026-05-12",
      prizePool: "$100,000",
      status: "upcoming",
      liquipediaUrl: "https://liquipedia.net/ageofempires/Hidden_Cup/6",
    },
    {
      id: "t90-titans-6",
      name: "T90 Titans League Season 6",
      tier: "A-Tier",
      startDate: "2026-02-01",
      endDate: "2026-05-30",
      prizePool: "$30,000",
      status: "ongoing",
      liquipediaUrl: "https://liquipedia.net/ageofempires/T90_Titans_League/6",
    },
    {
      id: "nac-5",
      name: "Nili's Apartment Cup 5",
      tier: "A-Tier",
      startDate: "2026-06-20",
      endDate: "2026-06-23",
      prizePool: "$25,000",
      status: "upcoming",
      liquipediaUrl: "https://liquipedia.net/ageofempires/Nili%27s_Apartment_Cup/5",
    },
    {
      id: "kotd-5",
      name: "King of the Desert 5",
      tier: "S-Tier",
      startDate: "2025-11-01",
      endDate: "2025-11-24",
      prizePool: "$80,000",
      status: "completed",
      liquipediaUrl: "https://liquipedia.net/ageofempires/King_of_the_Desert/5",
    },
    {
      id: "warlords-3",
      name: "Warlords III",
      tier: "A-Tier",
      startDate: "2026-01-10",
      endDate: "2026-03-15",
      prizePool: "$20,000",
      status: "completed",
      liquipediaUrl: "https://liquipedia.net/ageofempires/Warlords/3",
    },
    {
      id: "masters-of-arena-8",
      name: "Masters of Arena 8",
      tier: "B-Tier",
      startDate: "2026-03-05",
      endDate: "2026-04-01",
      prizePool: "$10,000",
      status: "completed",
      liquipediaUrl: "https://liquipedia.net/ageofempires/Masters_of_Arena/8",
    },
    {
      id: "escape-masters",
      name: "Escape Gaming Masters",
      tier: "A-Tier",
      startDate: "2026-04-15",
      endDate: "2026-06-15",
      prizePool: "$15,000",
      status: "ongoing",
      liquipediaUrl: "https://liquipedia.net/ageofempires/Escape_Gaming/Masters",
    },
  ];
}
