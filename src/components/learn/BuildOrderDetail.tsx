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
  Volume2,
  VolumeX,
  FastForward,
  Rewind,
  Sparkles,
  Headphones,
} from "lucide-react";
import { useDictionary } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import type { BuildOrder, BuildOrderDifficulty } from "@/lib/aoe2/build-orders";

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
  const isEs = locale === "es";
  const name = isEs ? bo.nameEs : bo.name;
  const tips = isEs ? bo.tipsEs : bo.tips;
  const diffConfig = DIFFICULTY_CONFIG[bo.difficulty];
  const DiffIcon = diffConfig.icon;

  const [timerStep, setTimerStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [stepSeconds, setStepSeconds] = useState(25); // ~25s per villager in standard AoE2 tempo
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceTesting, setVoiceTesting] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSpokenStepRef = useRef<number>(-1);

  // Play pleasant dual-tone chime using Web Audio API
  const playChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }, []);

  // Voice speech synthesis
  const speakTask = useCallback((text: string) => {
    if (!voiceEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    playChime();

    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = isEs ? "es-ES" : "en-US";
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      // Select matching voice if available
      const voices = window.speechSynthesis.getVoices();
      const matchVoice = voices.find((v) =>
        isEs ? v.lang.startsWith("es") : v.lang.startsWith("en"),
      );
      if (matchVoice) utterance.voice = matchVoice;

      window.speechSynthesis.speak(utterance);
    }, 120);
  }, [voiceEnabled, isEs, playChime]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    stop();
    setRunning(true);

    // Speak initial step if starting from step 0
    if (lastSpokenStepRef.current !== timerStep) {
      lastSpokenStepRef.current = timerStep;
      const text = isEs ? bo.steps[timerStep]?.taskEs : bo.steps[timerStep]?.task;
      if (text) speakTask(text);
    }

    intervalRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  }, [stop, timerStep, isEs, bo.steps, speakTask]);

  const pause = useCallback(() => {
    setRunning(false);
    stop();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, [stop]);

  const reset = useCallback(() => {
    stop();
    setRunning(false);
    setTimerStep(0);
    setElapsed(0);
    lastSpokenStepRef.current = -1;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, [stop]);

  // Step trigger based on elapsed time & step interval
  useEffect(() => {
    if (!running) return;

    const calculatedStep = Math.min(
      Math.floor(elapsed / stepSeconds),
      bo.steps.length - 1,
    );

    if (calculatedStep !== timerStep) {
      setTimerStep(calculatedStep);
      if (lastSpokenStepRef.current !== calculatedStep) {
        lastSpokenStepRef.current = calculatedStep;
        const taskText = isEs
          ? bo.steps[calculatedStep]?.taskEs
          : bo.steps[calculatedStep]?.task;
        if (taskText) speakTask(taskText);
      }
    }
  }, [elapsed, running, stepSeconds, bo.steps, timerStep, isEs, speakTask]);

  // Adjust timing (+10s / -10s) for in-game sync
  const adjustTime = (deltaSeconds: number) => {
    setElapsed((prev) => Math.max(prev + deltaSeconds, 0));
  };

  const jumpToStep = (index: number) => {
    setTimerStep(index);
    setElapsed(index * stepSeconds);
    lastSpokenStepRef.current = index;
    const taskText = isEs ? bo.steps[index]?.taskEs : bo.steps[index]?.task;
    if (taskText) speakTask(taskText);
  };

  const testVoice = () => {
    setVoiceTesting(true);
    const sampleText = isEs
      ? "Voz de entrenador activada. 6 aldeanos a ovejas bajo el Centro Urbano."
      : "Voice coach enabled. 6 villagers to sheep under the Town Center.";
    speakTask(sampleText);
    setTimeout(() => setVoiceTesting(false), 2000);
  };

  useEffect(() => {
    return stop;
  }, [stop]);

  const progressPct = ((elapsed % stepSeconds) / stepSeconds) * 100;

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href={`/${locale}/learn`}
        className="text-sm text-gray-400 hover:text-aoe-accent transition-colors mb-6 flex items-center gap-1"
      >
        <ChevronUp className="w-4 h-4" />
        {d.back}
      </Link>

      {/* Header Info */}
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

      {/* Voice Coach & Metronome Controller */}
      <div className="card mb-6 border-aoe-accent/40 bg-gradient-to-br from-aoe-accent/10 via-aoe-card to-aoe-dark relative overflow-hidden">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-aoe-accent/20 flex items-center justify-center border border-aoe-accent/30">
              <Headphones className="w-4 h-4 text-aoe-accent" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base flex items-center gap-2">
                {isEs ? "Entrenador de Voz en Directo" : "Live Audio Voice Coach"}
                <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30">
                  NO ALT-TAB
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                {isEs
                  ? "Canta las órdenes por voz sincronizadas con tu reloj de partida."
                  : "Speaks instructions aloud in sync with your match timer."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all",
                voiceEnabled
                  ? "bg-aoe-accent/20 text-aoe-accent border-aoe-accent/40"
                  : "bg-aoe-dark text-gray-500 border-aoe-border",
              )}
            >
              {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              {voiceEnabled ? (isEs ? "Voz ON" : "Voice ON") : (isEs ? "Voz Silenciada" : "Muted")}
            </button>
            <button
              onClick={testVoice}
              disabled={voiceTesting || !voiceEnabled}
              className="btn-secondary text-xs !px-2.5 !py-1.5 text-gray-300 disabled:opacity-40"
              title={isEs ? "Probar voz" : "Test voice"}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Big Control Buttons */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {!running ? (
            <button
              onClick={start}
              className="btn-primary !px-5 !py-2.5 text-sm flex items-center gap-2 font-bold shadow-lg"
            >
              <Play className="w-4 h-4 fill-current" />
              {isEs ? "Iniciar Entrenador" : "Start Voice Coach"}
            </button>
          ) : (
            <button
              onClick={pause}
              className="btn-secondary !px-5 !py-2.5 text-sm flex items-center gap-2 font-bold"
            >
              <Pause className="w-4 h-4 fill-current" />
              {d.pause}
            </button>
          )}

          <button
            onClick={reset}
            className="btn-secondary !px-3.5 !py-2.5 text-sm flex items-center gap-1.5 text-gray-400 hover:text-white"
          >
            <RotateCcw className="w-4 h-4" />
            {d.reset}
          </button>

          {/* Sync In-Game Time Adjustments */}
          <div className="flex items-center gap-1 bg-aoe-dark/70 p-1 rounded-lg border border-aoe-border">
            <button
              onClick={() => adjustTime(-10)}
              className="px-2.5 py-1 text-xs text-gray-300 hover:text-white hover:bg-aoe-card rounded transition-colors flex items-center gap-0.5"
              title={isEs ? "Atrasar 10s" : "Rewind 10s"}
            >
              <Rewind className="w-3 h-3" /> -10s
            </button>
            <button
              onClick={() => adjustTime(10)}
              className="px-2.5 py-1 text-xs text-gray-300 hover:text-white hover:bg-aoe-card rounded transition-colors flex items-center gap-0.5"
              title={isEs ? "Adelantar 10s" : "Fast forward 10s"}
            >
              +10s <FastForward className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-400 ml-auto">
            <span>
              {d.elapsed}: <span className="text-aoe-accent font-mono font-bold text-base">{formatElapsed(elapsed)}</span>
            </span>
            <span className="text-aoe-border">|</span>
            <span className="font-medium text-white">
              {d.step_x_of_y
                .replace("{current}", String(timerStep + 1))
                .replace("{total}", String(bo.steps.length))}
            </span>
          </div>
        </div>

        {/* Current Active Step Highlight Callout */}
        {running && bo.steps[timerStep] && (
          <div className="bg-aoe-dark/90 border border-aoe-accent rounded-xl p-4 shadow-inner mb-3">
            <div className="flex items-center justify-between text-xs text-aoe-accent uppercase font-bold tracking-wider mb-1.5">
              <span>{isEs ? "ORDEN ACTUAL EN CURSO:" : "CURRENT ACTIVE TASK:"}</span>
              <span className="font-mono">Pop: {bo.steps[timerStep].pop}</span>
            </div>
            <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
              {isEs ? bo.steps[timerStep].taskEs : bo.steps[timerStep].task}
            </p>

            {/* Countdown bar to next step */}
            <div className="w-full bg-aoe-card rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-aoe-accent h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Step Tempo Selector */}
        <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-aoe-border/40 flex-wrap gap-2">
          <span>{isEs ? "Ritmo de paso:" : "Pacing preset:"}</span>
          <div className="flex gap-2">
            {[
              { label: isEs ? "Partida estándar (25s)" : "Standard Game (25s)", val: 25 },
              { label: isEs ? "Rápido (15s)" : "Fast Practice (15s)", val: 15 },
              { label: isEs ? "Principiante (35s)" : "Beginner (35s)", val: 35 },
            ].map((preset) => (
              <button
                key={preset.val}
                onClick={() => setStepSeconds(preset.val)}
                className={cn(
                  "px-2 py-0.5 rounded text-[11px] transition-colors",
                  stepSeconds === preset.val
                    ? "bg-aoe-accent text-aoe-dark font-bold"
                    : "bg-aoe-dark text-gray-400 hover:text-white",
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Steps List */}
      <div className="card mb-6">
        <h2 className="section-title !text-lg !mb-4 flex items-center gap-2">
          <Castle className="w-5 h-5 text-aoe-accent" />
          {d.steps}
        </h2>
        <div className="space-y-1.5">
          {bo.steps.map((step, i) => {
            const isActive = i === timerStep;
            const isDone = running && i < timerStep;
            return (
              <div
                key={i}
                onClick={() => jumpToStep(i)}
                className={cn(
                  "flex items-start gap-3 px-3.5 py-3 rounded-lg transition-all duration-300 cursor-pointer",
                  isActive && "bg-aoe-accent/20 border border-aoe-accent shadow-md",
                  isDone && "opacity-50 hover:opacity-80",
                  !isActive && !isDone && "hover:bg-aoe-dark/70 border border-transparent",
                )}
              >
                <span
                  className={cn(
                    "shrink-0 w-11 text-center text-xs font-mono font-bold py-1 rounded",
                    step.pop === "F"
                      ? "bg-blue-500/20 text-blue-400"
                      : step.pop === "C"
                        ? "bg-purple-500/20 text-purple-400"
                        : step.pop === "—"
                          ? "bg-aoe-dark text-gray-500"
                          : "bg-aoe-dark text-aoe-accent border border-aoe-border",
                  )}
                >
                  {step.pop === "F" ? "FEU" : step.pop === "C" ? "CAS" : step.pop}
                </span>
                <span className={cn("text-sm leading-relaxed", isActive ? "text-white font-semibold" : "text-gray-300")}>
                  {isEs ? step.taskEs : step.task}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tips */}
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
