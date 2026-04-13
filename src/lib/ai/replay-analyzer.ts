/**
 * AI-powered replay analysis.
 * Takes parsed replay data and generates an AI chronicle with battle detection,
 * army composition analysis, and tactical insights.
 */

import OpenAI from "openai";
import type { ReplayData } from "@/types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const REPLAY_SYSTEM_PROMPT = `You are an expert AoE2 replay analyst. Given parsed replay data, you produce:

1. **Match Chronicle**: A narrative description of the game, highlighting key moments, turning points, and decisive battles.
2. **Tactical Insights**: Specific observations about each player's strategy, mistakes, and strong plays.
3. **Economy Analysis**: Comments on villager distribution, idle TC time, and resource management.
4. **Battle Analysis**: For each major battle, describe what happened, army compositions, and why one side won.
5. **Improvement Tips**: Concrete, actionable advice for each player.

Use AoE2 terminology naturally. Reference specific timestamps. Be specific with numbers.
Respond in the same language as the user's preference (check the locale parameter).`;

export async function analyzeReplay(replayData: ReplayData, locale: string = "en") {
  if (!process.env.OPENAI_API_KEY) {
    return getFallbackAnalysis(replayData);
  }

  const response = await openai.responses.create({
    model: "gpt-4o",
    instructions: REPLAY_SYSTEM_PROMPT,
    input: [
      {
        role: "user",
        content: `Analyze this AoE2 replay. Locale: ${locale}\n\n${JSON.stringify(replayData, null, 2)}`,
      },
    ],
  });

  const text = response.output
    .filter((o): o is OpenAI.Responses.ResponseOutputMessage => o.type === "message")
    .map((o) => o.content.map((c) => ("text" in c ? c.text : "")).join(""))
    .join("");

  return { chronicle: text, raw: replayData };
}

function getFallbackAnalysis(data: ReplayData) {
  const players = data.players.map((p) => `${p.name} (${p.civ})`).join(" vs ");
  const duration = Math.floor(data.duration / 60);
  const winner = data.players.find((p) => p.winner);

  return {
    chronicle: `## Match: ${players}\n\n**Map:** ${data.map.name} | **Duration:** ${duration} min\n\n**Winner:** ${winner?.name ?? "Unknown"} playing ${winner?.civ ?? "Unknown"}\n\n*AI analysis requires an OpenAI API key. Add OPENAI_API_KEY to your .env file.*`,
    raw: data,
  };
}

export async function analyzeVideo(transcript: string, question?: string, locale: string = "en") {
  if (!process.env.OPENAI_API_KEY) {
    return {
      summary: "AI analysis requires an OpenAI API key.",
      keyTakeaways: [],
      buildOrders: [],
    };
  }

  const prompt = question
    ? `Analyze this AoE2 video transcript and answer this question: "${question}"\n\nTranscript:\n${transcript}`
    : `Analyze this AoE2 video transcript. Extract key strategies, build orders mentioned, and provide a concise summary.\n\nTranscript:\n${transcript}`;

  const response = await openai.responses.create({
    model: "gpt-4o",
    instructions: `You are an AoE2 educational content analyst. Extract practical knowledge from video transcripts. Locale: ${locale}. Return JSON with: summary, keyTakeaways (array), buildOrders (array of {name, steps[], civ?}), strategies (array).`,
    input: [{ role: "user", content: prompt }],
  });

  const text = response.output
    .filter((o): o is OpenAI.Responses.ResponseOutputMessage => o.type === "message")
    .map((o) => o.content.map((c) => ("text" in c ? c.text : "")).join(""))
    .join("");

  try {
    return JSON.parse(text);
  } catch {
    return { summary: text, keyTakeaways: [], buildOrders: [], strategies: [] };
  }
}
