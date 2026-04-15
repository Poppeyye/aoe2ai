"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { readAssistantStream, type AssistantLocale, type AssistantSurface } from "@/components/ai/chat-stream";
import type { ToolActivity } from "@/components/ai/ToolActivityPanel";

interface Options {
  surface: AssistantSurface;
  locale: AssistantLocale;
  context?: unknown;
  prompt: string;
  enabled: boolean;
  resetKey: string;
}

export function useStreamedAssistant({
  surface,
  locale,
  context,
  prompt,
  enabled,
  resetKey,
}: Options) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activities, setActivities] = useState<ToolActivity[]>([]);
  const runIdRef = useRef(0);

  const run = useCallback(async () => {
    if (!enabled || !prompt) return;

    const runId = ++runIdRef.current;
    setText("");
    setError(null);
    setLoading(true);
    setActivities([]);

    try {
      await readAssistantStream(
        {
          surface,
          locale,
          context,
          messages: [{ role: "user", content: prompt }],
        },
        (event) => {
          if (runIdRef.current !== runId) return;

          if (event.type === "text_delta") {
            setText((prev) => prev + (event.text || ""));
            return;
          }

          if (event.type === "tool_call" && event.toolName) {
            const toolName = event.toolName;
            setActivities((prev) => [
              ...prev,
              { id: `${toolName}-${prev.length}`, toolName, status: "running", args: event.args },
            ]);
            return;
          }

          if (event.type === "tool_result" && event.toolName) {
            const toolName = event.toolName;
            setActivities((prev) =>
              prev.map((activity) =>
                activity.toolName === toolName && activity.status === "running"
                  ? { ...activity, status: "done" }
                  : activity
              )
            );
            return;
          }

          if (event.type === "error") {
            setError(event.error || "Streaming failed");
          }
        },
      );
      if (runIdRef.current === runId) {
        setActivities((prev) => prev.map((activity) => ({ ...activity, status: "done" })));
      }
    } catch (err) {
      if (runIdRef.current === runId) {
        setError(err instanceof Error ? err.message : "Streaming failed");
      }
    } finally {
      if (runIdRef.current === runId) {
        setLoading(false);
      }
    }
  }, [context, enabled, locale, prompt, surface]);

  useEffect(() => {
    if (!enabled) {
      setText("");
      setError(null);
      setLoading(false);
      setActivities([]);
      return;
    }

    void run();
  }, [enabled, resetKey, run]);

  return {
    text,
    loading,
    error,
    activities,
    retry: run,
  };
}
