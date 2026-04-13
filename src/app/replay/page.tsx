"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalysisResult {
  chronicle: string;
  players: { name: string; civ: string; winner: boolean }[];
  map: string;
  duration: number;
}

export default function ReplayPage() {
  const [dragging, setDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith(".aoe2record")) {
      setError("Please upload a .aoe2record file");
      return;
    }

    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("replay", file);

      const res = await fetch("/api/replay", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to analyze replay");
    } finally {
      setAnalyzing(false);
    }
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-medieval font-bold mb-2">Replay Analyzer</h1>
        <p className="text-gray-400">
          Upload a .aoe2record file for AI-powered match chronicle, battle
          detection, and deep stats
        </p>
      </div>

      {!result && (
        <div
          className={cn(
            "card !p-12 border-2 border-dashed text-center cursor-pointer transition-all duration-300",
            dragging
              ? "border-aoe-accent bg-aoe-accent/5"
              : "border-aoe-border hover:border-aoe-accent/50"
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".aoe2record";
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) handleFile(file);
            };
            input.click();
          }}
        >
          {analyzing ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-aoe-accent" />
              <p className="text-gray-300">Parsing replay file...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <Upload className="w-12 h-12 text-gray-500" />
              <p className="text-gray-300">
                Drop your .aoe2record file here or click to browse
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-6 card !border-red-500/50 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-6 mt-8">
          {/* Match Overview */}
          <div className="card">
            <h2 className="section-title flex items-center gap-2">
              <FileText className="w-5 h-5 text-aoe-accent" />
              Match Overview
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <div className="text-xs text-gray-500 uppercase">Map</div>
                <div className="font-medium">{result.map}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase">Duration</div>
                <div className="font-medium">
                  {Math.floor(result.duration / 60)} min
                </div>
              </div>
            </div>
          </div>

          {/* Players */}
          <div className="card">
            <h2 className="section-title">Teams</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.players.map((p, i) => (
                <div
                  key={i}
                  className={cn(
                    "p-4 rounded-lg border",
                    p.winner
                      ? "border-green-500/30 bg-green-500/5"
                      : "border-red-500/30 bg-red-500/5"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-sm text-gray-400">{p.civ}</div>
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium px-2 py-1 rounded",
                        p.winner
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      )}
                    >
                      {p.winner ? "Winner" : "Defeated"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Chronicle */}
          <div className="card">
            <h2 className="section-title">AI Chronicle</h2>
            <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap">
              {result.chronicle}
            </div>
          </div>

          <button
            onClick={() => {
              setResult(null);
              setError(null);
            }}
            className="btn-secondary w-full"
          >
            Analyze Another Replay
          </button>
        </div>
      )}
    </div>
  );
}
