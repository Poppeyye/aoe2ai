import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import WebSocket from "ws";

export const dynamic = "force-dynamic";

const LOBBY_WS_URL = "wss://data.aoe2lobby.com/ws/";
const PING_INTERVAL_MS = 30_000;

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const ip = getClientIp(req);
    const { allowed, resetAt } = checkRateLimit(`match-detect:${ip}`, 5, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)) } },
      );
    }

    const profileId = req.nextUrl.searchParams.get("profileId");
    if (!profileId) {
      return NextResponse.json(
        { error: "profileId query parameter is required" },
        { status: 400 },
      );
    }

    const pid = parseInt(profileId, 10);
    if (Number.isNaN(pid)) {
      return NextResponse.json(
        { error: "Invalid profileId" },
        { status: 400 },
      );
    }

    const encoder = new TextEncoder();
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    const ws = new WebSocket(LOBBY_WS_URL);
    let pingTimer: ReturnType<typeof setInterval> | null = null;
    let closed = false;
    let matchesSubscribed = false;

    const cleanup = () => {
      if (closed) return;
      closed = true;
      if (pingTimer) clearInterval(pingTimer);
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
      writer.close().catch(() => {});
    };

    const sendSSE = (event: string, data: unknown) => {
      if (closed) return;
      const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
      writer.write(encoder.encode(payload)).catch(() => cleanup());
    };

    const subscribeSpectateMatches = () => {
      if (matchesSubscribed || ws.readyState !== WebSocket.OPEN) return;
      matchesSubscribed = true;
      ws.send(JSON.stringify({
        action: "subscribe",
        type: "matches",
        context: "spectate",
      }));
    };

    ws.on("open", () => {
      ws.send(JSON.stringify({
        action: "subscribe",
        type: "players",
        context: "spectate",
        ids: [String(pid)],
      }));
      ws.send(JSON.stringify({
        action: "subscribe",
        type: "players",
        context: "lobby",
        ids: [String(pid)],
      }));
      // Subscribe immediately so users who start listening after the game began
      // still get the current spectate_match_all snapshot.
      subscribeSpectateMatches();

      pingTimer = setInterval(() => {
        sendSSE("ping", { ts: Date.now() });
      }, PING_INTERVAL_MS);
    });

    ws.on("message", (raw: WebSocket.RawData) => {
      try {
        const msg = JSON.parse(raw.toString());

        if (msg.player_status) {
          const playerData = msg.player_status[String(pid)] ?? msg.player_status[pid];
          if (playerData) {
            sendSSE("status", {
              status: playerData.status,
              matchid: playerData.matchid ?? null,
              steam_lobbyid: playerData.steam_lobbyid ?? null,
            });

            if (playerData.matchid && playerData.status === "spectate") {
              subscribeSpectateMatches();
            }
          }
        }

        if (msg.spectate_match_all) {
          const matches = msg.spectate_match_all;
          for (const [matchId, matchData] of Object.entries(matches)) {
            const match = matchData as Record<string, unknown>;
            const slots = match.slots as Record<string, { profileid?: number }> | undefined;
            if (slots) {
              const hasPlayer = Object.values(slots).some(s => Number(s.profileid) === pid);
              if (hasPlayer) {
                sendSSE("match", { matchid: matchId, ...match });
                break;
              }
            }
          }
        }

        if (msg.spectate_match_update) {
          const matches = msg.spectate_match_update;
          for (const [matchId, matchData] of Object.entries(matches)) {
            const match = matchData as Record<string, unknown>;
            const slots = match.slots as Record<string, { profileid?: number }> | undefined;
            if (slots) {
              const hasPlayer = Object.values(slots).some(s => Number(s.profileid) === pid);
              if (hasPlayer) {
                sendSSE("match", { matchid: matchId, ...match });
              }
            }
          }
        }
      } catch {
        // ignore malformed messages
      }
    });

    ws.on("error", () => cleanup());
    ws.on("close", () => cleanup());

    req.signal.addEventListener("abort", () => cleanup());

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("Match detect error:", error);
    return NextResponse.json(
      { error: "Failed to start match detection" },
      { status: 500 },
    );
  }
}
