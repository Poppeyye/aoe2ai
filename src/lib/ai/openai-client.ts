import OpenAI from "openai";

export const DEFAULT_AI_MODEL = process.env.OPENAI_MODEL || "gpt-5-mini";

let client: OpenAI | null = null;

export function hasOpenAIKey() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured. Add OPENAI_API_KEY to .env");
  }

  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  return client;
}
