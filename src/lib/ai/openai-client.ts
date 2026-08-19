import OpenAI from "openai";

const configuredModel = process.env.OPENAI_MODEL?.trim();
const LEGACY_MODELS = new Set(["gpt-5.4-mini", "gpt-5-mini", "gpt-4o-mini", "gpt-4o"]);

export const DEFAULT_AI_MODEL =
  configuredModel && !LEGACY_MODELS.has(configuredModel)
    ? configuredModel
    : "gpt-5.6-luna";

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
