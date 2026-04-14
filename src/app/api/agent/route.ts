import { NextRequest, NextResponse } from "next/server";
import { runAgent } from "@/lib/ai/agent";
import { generateTextResponse, streamTextResponse } from "@/lib/ai/runtime";
import type { AiLocale, AiSurface } from "@/lib/ai/tools";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const MAX_REQUESTS = 30;
const WINDOW_MS = 60_000;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { allowed, remaining, resetAt } = checkRateLimit(`agent:${ip}`, MAX_REQUESTS, WINDOW_MS);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
            "X-RateLimit-Remaining": "0",
          },
        },
      );
    }

    const {
      messages,
      locale,
      surface,
      context,
      stream = true,
    } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array required" }, { status: 400 });
    }

    const resolvedLocale = (locale === "es" ? "es" : "en") as AiLocale;
    const resolvedSurface = (surface === "live" || surface === "replay" ? surface : "agent") as AiSurface;
    if (!stream) {
      const content = resolvedSurface === "agent"
        ? await runAgent(messages, resolvedLocale, context)
        : await generateTextResponse({
          surface: resolvedSurface,
          locale: resolvedLocale,
          messages,
          context,
        });
      return NextResponse.json({ content });
    }

    const encoder = new TextEncoder();
    const eventStream = resolvedSurface === "agent"
      ? streamTextResponse({
        surface: "agent",
        locale: resolvedLocale,
        messages,
        context,
      })
      : streamTextResponse({
        surface: resolvedSurface,
        locale: resolvedLocale,
        messages,
        context,
      });

    const body = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of eventStream) {
            controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
          }
        } catch (error) {
          controller.enqueue(encoder.encode(`${JSON.stringify({
            type: "error",
            error: error instanceof Error ? error.message : "Failed to process request",
          })}\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(body, {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (error) {
    console.error("Agent error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to process request",
      },
      { status: 500 }
    );
  }
}
