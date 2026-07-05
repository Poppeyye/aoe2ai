"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  ChevronUp,
  Swords,
  Shield,
  Castle,
  Target,
  MapPin,
} from "lucide-react";
import { useDictionary } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import type { BuildOrder, BuildOrderDifficulty } from "@/lib/aoe2/build-orders";

const STEP_DURATION_SECONDS = 10;

const DIFFICULTY_CONFIG: Record<BuildOrderDifficulty, { color: string; icon: typeof Swords }> = {
  beginner: { color: "bg-green-500/20 text-green-400 border-green-500/30", icon: Shield },
  intermediate: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Swords },
  advanced: { color: "bg-red-500/20 text-red-400 border-red-500/30", icon: Target },
};

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function BuildOrderDetail({
  bo,
  locale,
}: {
  bo: BuildOrder;
  locale: string;
}) {
  const dict = useDictionary();
  const d = dict.learn;
  const [timerStep, setTimerStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isEs = locale === "es";
  const name = isEs ? bo.nameEs : bo.name;
  const tips = isEs ? bo.tipsEs : bo.tips;
  const diffConfig = DIFFICULTY_CONFIG[bo.difficulty];
  const DiffIcon = diffConfig.icon;

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    stop();
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        if (next > 0 && next % STEP_DURATION_SECONDS === 0) {
          setTimerStep((s) => (s < bo.steps.length - 1 ? s + 1 : s));
        }
        return next;
      });
    }, 1000);
  }, [stop, bo.steps.length]);

  const pause = useCallback(() => {
    setRunning(false);
    stop();
  }, [stop]);

  const reset = useCallback(() => {
    stop();
    setRunning(false);
    setTimerStep(0);
    setElapsed(0);
  }, [stop]);

  useEffect(() => {
    return stop;
  }, [stop]);

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href={`/${locale}/learn`}
        className="text-sm text-gray-400 hover:text-aoe-accent transition-colors mb-6 flex items-center gap-1"
      >
        <ChevronUp className="w-4 h-4" />
        {d.back}
      </Link>

      <div className="card mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-medieval font-bold text-white">{name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full border flex items-center gap-1", diffConfig.color)}>
                <DiffIcon className="w-3 h-3" />
                {d[bo.difficulty]}
              </span>
              {bo.maps.map((m) => (
                <span key={m} className="text-xs px-2.5 py-1 rounded-full bg-aoe-dark border border-aoe-border text-gray-300 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-2">
          <span className="text-sm text-gray-400">{d.good_for}:</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {bo.civs.map((c) => (
              <span key={c} className="text-xs px-2 py-0.5 rounded bg-aoe-accent/10 text-aoe-accent border border-aoe-accent/20">
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Timer className="w-5 h-5 text-aoe-accent" />
          <h2 className="font-semibold text-white">{d.start_timer}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3 mb-2">
          {!running ? (
            <button onClick={start} className="btn-primary !px-4 !py-2 text-sm flex items-center gap-2">
              <Play className="w-4 h-4" />
              {d.start_timer}
            </button>
          ) : (
            <button onClick={pause} className="btn-secondary !px-4 !py-2 text-sm flex items-center gap-2">
              <Pause className="w-4 h-4" />
              {d.pause}
            </button>
          )}
          <button onClick={reset} className="btn-secondary !px-4 !py-2 text-sm flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            {d.reset}
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-400 ml-auto">
            <span>{d.elapsed}: <span className="text-white font-mono">{formatElapsed(elapsed)}</span></span>
            <span className="text-aoe-border">|</span>
            <span>
              {d.step_x_of_y
                .replace("{current}", String(timerStep + 1))
                .replace("{total}", String(bo.steps.length))}
            </span>
          </div>
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="section-title !text-lg !mb-4 flex items-center gap-2">
          <Castle className="w-5 h-5 text-aoe-accent" />
          {d.steps}
        </h2>
        <div className="space-y-1">
          {bo.steps.map((step, i) => {
            const isActive = running && i === timerStep;
            const isDone = running && i < timerStep;
            return (
              <div
                key={i}
                className={cn(
                  "flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all duration-300",
                  isActive && "bg-aoe-accent/15 border border-aoe-accent/40",
                  isDone && "opacity-50",
                  !isActive && !isDone && "hover:bg-aoe-dark/50"
                )}
              >
                <span
                  className={cn(
                    "shrink-0 w-10 text-center text-xs font-mono font-bold py-1 rounded",
                    step.pop === "F"
                      ? "bg-blue-500/20 text-blue-400"
                      : step.pop === "C"
                        ? "bg-purple-500/20 text-purple-400"
                        : step.pop === "—"
                          ? "bg-aoe-dark text-gray-500"
                          : "bg-aoe-dark text-aoe-accent"
                  )}
                >
                  {step.pop === "F" ? "FEU" : step.pop === "C" ? "CAS" : step.pop}
                </span>
                <span className={cn("text-sm", isActive ? "text-white font-medium" : "text-gray-300")}>
                  {isEs ? step.taskEs : step.task}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <h2 className="section-title !text-lg !mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-aoe-accent" />
          {d.tips}
        </h2>
        <ul className="space-y-3">
          {tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
              <span className="text-aoe-accent mt-0.5 shrink-0">▸</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
