"use client";

import { useState } from "react";
import { GraduationCap, Play, Loader2, Clipboard, AlertCircle } from "lucide-react";

interface Analysis {
  summary: string;
  keyTakeaways: string[];
  buildOrders: { name: string; steps: string[]; civ?: string }[];
  strategies: string[];
  answer?: string;
}

const POPULAR = [
  { channel: "Spirit of the Law", desc: "Deep statistical analysis of civilizations and game mechanics" },
  { channel: "Hera", desc: "Pro player guide to the most competitive map" },
  { channel: "T90Official", desc: "Entertaining cast with educational commentary" },
];

export default function LearnPage() {
  const [url, setUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [showTranscriptInput, setShowTranscriptInput] = useState(false);

  async function analyze() {
    if (!url.trim() && !transcript.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, transcript, question }),
      });
      const data = await res.json();
      setAnalysis(data);
    } catch {
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-medieval font-bold mb-2">
          <GraduationCap className="inline w-8 h-8 text-aoe-accent mr-2" />
          AoE2 Academy
        </h1>
        <p className="text-gray-400">
          Paste a YouTube video URL from any AoE2 creator. AI extracts
          strategies, build orders, and key takeaways.
        </p>
      </div>

      {/* URL input */}
      <div className="space-y-4 mb-8">
        <div className="flex gap-3">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste YouTube URL..."
            className="input-field flex-1"
          />
          <button onClick={analyze} className="btn-primary" disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
          </button>
        </div>

        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a specific question about the video (optional)..."
          className="input-field w-full"
        />
      </div>

      {/* Transcript paste fallback */}
      <div className="card mb-8">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">Transcript not available automatically</h3>
            <p className="text-sm text-gray-400 mb-3">
              YouTube blocks transcript requests from cloud servers. You can paste the transcript manually:
            </p>
            <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside mb-3">
              <li>Open the video on YouTube</li>
              <li>Click &quot;...more&quot; below the video description</li>
              <li>Click &quot;Show transcript&quot;</li>
              <li>Select all the text (Ctrl+A), copy (Ctrl+C) and paste below</li>
            </ol>
            <button
              onClick={() => setShowTranscriptInput(!showTranscriptInput)}
              className="btn-secondary !px-3 !py-1 text-sm flex items-center gap-2"
            >
              <Clipboard className="w-4 h-4" />
              Paste transcript manually
            </button>
            {showTranscriptInput && (
              <div className="mt-3">
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Paste the video transcript here..."
                  rows={6}
                  className="input-field w-full resize-y"
                />
                <button onClick={analyze} className="btn-primary mt-2" disabled={loading}>
                  Analyze with pasted transcript
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Popular creators */}
      {!analysis && (
        <div>
          <h2 className="section-title">Try These Videos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {POPULAR.map((p) => (
              <div key={p.channel} className="card">
                <h3 className="font-semibold text-white mb-2">{p.channel}</h3>
                <p className="text-sm text-gray-400">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analysis results */}
      {analysis && (
        <div className="space-y-6">
          {analysis.answer && (
            <div className="card">
              <h2 className="section-title">Your Question Answered</h2>
              <p className="text-gray-300 whitespace-pre-wrap">{analysis.answer}</p>
            </div>
          )}

          <div className="card">
            <h2 className="section-title">Summary</h2>
            <p className="text-gray-300 whitespace-pre-wrap">{analysis.summary}</p>
          </div>

          {analysis.keyTakeaways.length > 0 && (
            <div className="card">
              <h2 className="section-title">Key Takeaways</h2>
              <ul className="space-y-2">
                {analysis.keyTakeaways.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-aoe-accent mt-1">•</span> {t}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.buildOrders.length > 0 && (
            <div className="card">
              <h2 className="section-title">Build Orders Mentioned</h2>
              {analysis.buildOrders.map((bo, i) => (
                <div key={i} className="mb-4 p-4 bg-aoe-dark rounded-lg">
                  <h3 className="font-semibold text-aoe-accent mb-2">
                    {bo.name} {bo.civ && `(${bo.civ})`}
                  </h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300">
                    {bo.steps.map((s, j) => (
                      <li key={j}>{s}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => {
              setAnalysis(null);
              setUrl("");
              setTranscript("");
              setQuestion("");
            }}
            className="btn-secondary w-full"
          >
            Analyze Another Video
          </button>
        </div>
      )}
    </div>
  );
}
