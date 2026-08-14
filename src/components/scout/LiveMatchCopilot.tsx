"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic, MicOff, Volume2, VolumeX, Square, RotateCcw,
  Swords, Shield, Crosshair, Castle, ArrowUpRight, FastForward,
  Send, Sparkles, AlertTriangle, Check, Copy, Radio,
  ChevronDown, ChevronUp, Loader2, Play, Flame, MapPin, Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import MarkdownMessage from "@/components/ai/MarkdownMessage";
import { readAssistantStream, type ClientAssistantStreamEvent } from "@/components/ai/chat-stream";

export interface LiveMatchCopilotProps {
  locale: "en" | "es";
  initialMyCiv?: string;
  initialOpponentCiv?: string;
  initialOpponentName?: string;
  initialMap?: string;
  initialOpponentElo?: number;
  initialOpponentPlaystyle?: string;
  scoutContext?: Record<string, unknown>;
  className?: string;
}

const POPULAR_CIVS = [
  "Franks", "Britons", "Mayans", "Byzantines", "Mongols", "Teutons",
  "Goths", "Japanese", "Chinese", "Persians", "Saracens", "Turks",
  "Vikings", "Aztecs", "Huns", "Koreans", "Italians", "Hindustanis",
  "Incas", "Magyars", "Slavs", "Portuguese", "Ethiopians", "Malians",
  "Berbers", "Khmer", "Malay", "Burmese", "Vietnamese", "Bulgarians",
  "Tatars", "Cumans", "Lithuanians", "Burgundians", "Sicilians",
  "Poles", "Bohemians", "Dravidians", "Bengalis", "Gurjaras", "Romans",
  "Armenians", "Georgians",
];

const POPULAR_MAPS = [
  "Arabia", "Arena", "Black Forest", "Nomad", "Runestones",
  "Hideout", "Fortress", "Megarandom", "Four Lakes", "Golden Pit",
  "Ghost Lake", "Yucatan", "Islands", "African Clearing",
];

interface QuickChip {
  id: string;
  icon: typeof Swords;
  color: string;
  badge: { en: string; es: string };
  title: { en: string; es: string };
  prompt: { en: string; es: string };
}

const QUICK_CHIPS: QuickChip[] = [
  {
    id: "scout_rush",
    icon: Swords,
    color: "from-amber-500/20 to-orange-500/10 border-amber-500/40 text-amber-300 hover:border-amber-400",
    badge: { en: "FEUDAL RUSH", es: "RUSH FEUDAL" },
    title: {
      en: "Scout Rush incoming",
      es: "Me está rusheando con Scouts",
    },
    prompt: {
      en: "Emergency! The opponent is rushing me with Scouts in Feudal Age. How do I defend my woodline and resources right now, and what is my counter-attack?",
      es: "¡Emergencia! El rival me está rusheando con Scouts en Edad Feudal. ¿Cómo defiendo mi campamento maderero y recursos ahora mismo, y cuál es mi contragolpe?",
    },
  },
  {
    id: "archer_push",
    icon: Crosshair,
    color: "from-blue-500/20 to-cyan-500/10 border-blue-500/40 text-blue-300 hover:border-blue-400",
    badge: { en: "RANGED PUSH", es: "PRESIÓN A DISTANCIA" },
    title: {
      en: "Archer push on woodline",
      es: "Viene con masa de Arqueros en mi madera",
    },
    prompt: {
      en: "Alert! The opponent has an Archer mass pushing into my woodline and exposed villagers. How do I react immediately to minimize losses and turn the game around?",
      es: "¡Alerta! El rival viene con una masa de Arqueros atacando mi campamento maderero y recursos exteriores. ¿Cómo reacciono de inmediato para no perder aldeanos y dar la vuelta?",
    },
  },
  {
    id: "monk_siege",
    icon: Shield,
    color: "from-purple-500/20 to-indigo-500/10 border-purple-500/40 text-purple-300 hover:border-purple-400",
    badge: { en: "CASTLE SMUSH", es: "ASALTO ASIGNADO" },
    title: {
      en: "Monk + Siege push",
      es: "Ataque de Monjes y Asedio",
    },
    prompt: {
      en: "Danger! The opponent is doing a Monk + Siege (Mangonels/Rams) push against my base in Castle Age. How do I stop conversions and destroy their siege equipment?",
      es: "¡Peligro! Me están haciendo un push de Monjes con Mangonelas y Arietes en Edad de los Castillos. ¿Cómo evito las conversiones y destruyo su asedio?",
    },
  },
  {
    id: "castle_drop",
    icon: Castle,
    color: "from-red-500/20 to-rose-500/10 border-red-500/40 text-red-300 hover:border-red-400",
    badge: { en: "FORWARD DROP", es: "CASTILLO OFENSIVO" },
    title: {
      en: "Forward Castle Drop",
      es: "Me está plantando un Castillo delante",
    },
    prompt: {
      en: "Urgent! The opponent is building a forward Castle right outside my walls / on my face. Should I fight the builders, batter it, or relocate my economy?",
      es: "¡Urgente! El rival acaba de meter aldeanos hacia delante y me está plantando un Castillo en la cara. ¿Peleo a los constructores, me echo hacia atrás o cómo me adapto?",
    },
  },
  {
    id: "tower_rush",
    icon: ArrowUpRight,
    color: "from-yellow-500/20 to-amber-500/10 border-yellow-500/40 text-yellow-300 hover:border-yellow-400",
    badge: { en: "TRUSH ALERT", es: "TORRES ENEMIGAS" },
    title: {
      en: "Tower Rush on resources",
      es: "Tower Rush en mis recursos",
    },
    prompt: {
      en: "Enemy towers! The opponent is Tower Rushing (Trush) my main gold and woodline with forward villagers. How do I counter-tower or relocate effectively?",
      es: "¡Torres enemigas! Me están haciendo Tower Rush (Trush) en mis recursos principales. ¿Meto contra-torre, subo a Feudal rápido o cómo me defiendo?",
    },
  },
  {
    id: "fast_castle",
    icon: FastForward,
    color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-300 hover:border-emerald-400",
    badge: { en: "BOOM PUNISH", es: "CASTIGO BOOM" },
    title: {
      en: "Walling for Fast Castle",
      es: "Se está amurallando para Fast Castle",
    },
    prompt: {
      en: "The opponent is fully walled, playing passive, and going for Fast Castle or 3-TC Boom. How do I breach their walls, punish their greed, or out-scale them?",
      es: "El rival se ha cerrado completamente en muralla y está haciendo Fast Castle o Boom de 3 TCs. ¿Cómo rompo sus murallas, castigo su codicia o me preparo?",
    },
  },
];

function playTacticalChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // First tone (659.25 Hz - E5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.18, now + 0.03);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.18);

    // Second tone (880 Hz - A5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0, now + 0.12);
    gain2.gain.linearRampToValueAtTime(0.22, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.42);
  } catch {
    // Non-blocking if audio blocked by browser policy
  }
}

function extractSpokenSummary(fullText: string): string {
  // Strip markdown headers, lists, emojis, asterisks
  const clean = fullText
    .replace(/^#+\s+/gm, "")
    .replace(/\*\*/g, "")
    .replace(/[*_`]/g, "")
    .replace(/[⚔️🏹✝️🏰🗼🏃🚨⚙️🔄💡🎯🛡️⚡👑📊🗺️⚠️✅❌💥📉]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^(Paso \d+|Step \d+|🚨|⚙️|🔄)\s*[-:]?\s*/gim, "")
    .trim();

  // Extract first 2 complete sentences
  const sentences = clean.match(/[^.!?]+[.!?]+/g);
  if (sentences && sentences.length > 0) {
    const combined = sentences.slice(0, 2).join(" ").trim();
    return combined.length > 280 ? combined.slice(0, 280) + "..." : combined;
  }
  return clean.slice(0, 200).trim();
}

function getLocalTacticalFallback(situationId: string, myCiv: string, opponentCiv: string, locale: "en" | "es"): string {
  if (locale === "es") {
    switch (situationId) {
      case "scout_rush":
        return `Siendo ${myCiv} contra ${opponentCiv}: mete inmediatamente 3 a 4 piqueros en tu campamento maderero y amuralla las bayas con empalizadas cortas. Sube rápido a Castillos para sacar jinetes con armadura.`;
      case "archer_push":
        return `Siendo ${myCiv} contra ${opponentCiv}: mete 1 galería de tiro y produce 5 guerrilleros con armadura de proyectil en herrería. Protege tus recolectores de madera bajo el radio de tu Centro Urbano.`;
      case "monk_siege":
        return `Siendo ${myCiv} contra ${opponentCiv}: saca 4 exploradores o caballería ligera para matar los monjes sin riesgo de conversión. Usa tus propios jinetes o mangonela para destruir su asedio.`;
      case "castle_drop":
        return `Siendo ${myCiv} contra ${opponentCiv}: si no puedes rodear a sus aldeanos con ejército de inmediato, no sacrifiques tropas; retira tus aldeanos hacia atrás, reubica recursos y sube a Imperial para sacar trabucos.`;
      case "tower_rush":
        return `Siendo ${myCiv} contra ${opponentCiv}: si la torre enemiga está en rango, coloca una contra-torre defensiva con 4 aldeanos y ataca la base enemiga desprotegida con exploradores o arqueros.`;
      case "fast_castle":
        return `Siendo ${myCiv} contra ${opponentCiv}: el rival es codicioso y no tiene ejército; presiona sus murallas con arqueros o arietes, o aprovecha para expandir 3 Centros Urbanos con ventaja económica.`;
      default:
        return `Siendo ${myCiv} contra ${opponentCiv}: mantén la producción constante de aldeanos, amuralla tus recursos principales y prepara la contracomposición adecuada según el ejército enemigo.`;
    }
  } else {
    switch (situationId) {
      case "scout_rush":
        return `Playing ${myCiv} vs ${opponentCiv}: immediately queue 3 to 4 spearmen on your woodline and small-wall your berries. Reach Castle Age quickly to deploy armored knights.`;
      case "archer_push":
        return `Playing ${myCiv} vs ${opponentCiv}: build an Archery Range and produce 5 skirmishers with armor from the blacksmith. Keep exposed woodchoppers safe under Town Center fire.`;
      case "monk_siege":
        return `Playing ${myCiv} vs ${opponentCiv}: produce 4 light cavalry to snipe monks immune to conversion. Use knights or your own mangonel to crush their siege weapons.`;
      case "castle_drop":
        return `Playing ${myCiv} vs ${opponentCiv}: if you cannot surround their builders immediately, do not suicide units; fall back, relocate your eco safely, and rush Imperial Age for trebuchets.`;
      case "tower_rush":
        return `Playing ${myCiv} vs ${opponentCiv}: if their tower threatens your key resource, place a defensive counter-tower with 4 villagers and counter-attack their open base.`;
      case "fast_castle":
        return `Playing ${myCiv} vs ${opponentCiv}: the opponent is greedy without an army; breach their walls with archers and rams, or boom on 3 Town Centers to out-scale them.`;
      default:
        return `Playing ${myCiv} vs ${opponentCiv}: maintain non-stop villager production, wall vulnerable resources, and prepare the hard counter unit composition.`;
    }
  }
}

export default function LiveMatchCopilot({
  locale,
  initialMyCiv = "Franks",
  initialOpponentCiv = "Mongols",
  initialOpponentName = "Opponent",
  initialMap = "Arabia",
  initialOpponentElo = 1250,
  initialOpponentPlaystyle = "Standard",
  scoutContext,
  className,
}: LiveMatchCopilotProps) {
  // Matchup configuration state
  const [myCiv, setMyCiv] = useState(initialMyCiv || "Franks");
  const [opponentCiv, setOpponentCiv] = useState(initialOpponentCiv || "Mongols");
  const [opponentName] = useState(initialOpponentName || "Opponent");
  const [mapName, setMapName] = useState(initialMap || "Arabia");
  const [opponentElo, setOpponentElo] = useState(initialOpponentElo || 1250);
  const [opponentPlaystyle, setOpponentPlaystyle] = useState(initialOpponentPlaystyle || "cavalry");
  const [isEditingMatchup, setIsEditingMatchup] = useState(false);

  // Sync props when they change from live detection
  useEffect(() => {
    if (initialMyCiv) setMyCiv(initialMyCiv);
    if (initialOpponentCiv) setOpponentCiv(initialOpponentCiv);
    if (initialMap) setMapName(initialMap);
    if (initialOpponentElo) setOpponentElo(initialOpponentElo);
    if (initialOpponentPlaystyle) setOpponentPlaystyle(initialOpponentPlaystyle);
  }, [initialMyCiv, initialOpponentCiv, initialMap, initialOpponentElo, initialOpponentPlaystyle]);

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [hasSpeechRecognition, setHasSpeechRecognition] = useState(true);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // TTS Voice Output state
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [spokenTakeaway, setSpokenTakeaway] = useState<string>("");

  // AI query & response state
  const [queryInput, setQueryInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<string>("");
  const [lastPromptTitle, setLastPromptTitle] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const submitQuestionRef = useRef<(text: string, title: string, chipId?: string) => Promise<void>>();

  // Initialize Web Speech Recognition
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognitionClass =
      (window as unknown as { SpeechRecognition: any }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition: any }).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setHasSpeechRecognition(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = locale === "es" ? "es-ES" : "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
        setTranscript("");
      };

      recognition.onresult = (event: any) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const current = final || interim;
        setTranscript(current);

        if (final && final.trim().length > 2) {
          submitQuestionRef.current?.(final.trim(), final.trim());
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === "not-allowed") {
          setSpeechError(
            locale === "es"
              ? "Permiso de micrófono no otorgado. Habilítalo en tu navegador."
              : "Microphone permission denied. Enable it in your browser."
          );
        } else if (event.error !== "no-speech") {
          setSpeechError(event.error);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch {
      setHasSpeechRecognition(false);
    }

    return () => {
      recognitionRef.current?.abort();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [locale]);

  const toggleListening = useCallback(() => {
    if (!hasSpeechRecognition) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      try {
        recognitionRef.current?.start();
      } catch {
        recognitionRef.current?.stop();
        setTimeout(() => {
          try {
            recognitionRef.current?.start();
          } catch {
            // failed to restart
          }
        }, 150);
      }
    }
  }, [isListening, hasSpeechRecognition]);

  // Spoken voice playback
  const speakAdvice = useCallback(
    (textToSpeak: string) => {
      if (!autoSpeak || typeof window === "undefined" || !("speechSynthesis" in window)) return;

      window.speechSynthesis.cancel();

      const punchline = extractSpokenSummary(textToSpeak);
      if (!punchline) return;

      setSpokenTakeaway(punchline);
      playTacticalChime();

      const utterance = new SpeechSynthesisUtterance(punchline);
      utterance.lang = locale === "es" ? "es-ES" : "en-US";
      utterance.rate = 1.06;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const langCode = locale === "es" ? "es" : "en";
      const preferred = voices.find(
        (v) =>
          v.lang.startsWith(langCode) &&
          (v.name.includes("Google") ||
            v.name.includes("Natural") ||
            v.name.includes("Premium") ||
            v.name.includes("Samantha") ||
            v.name.includes("Monica") ||
            v.name.includes("Jorge"))
      );
      if (preferred) utterance.voice = preferred;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 160);
    },
    [autoSpeak, locale]
  );

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const replayVoice = useCallback(() => {
    if (spokenTakeaway) {
      speakAdvice(spokenTakeaway);
    } else if (currentResponse) {
      speakAdvice(currentResponse);
    }
  }, [spokenTakeaway, currentResponse, speakAdvice]);

  // Main Prompt Submitter
  const submitQuestion = useCallback(
    async (questionText: string, displayTitle: string, situationChipId?: string) => {
      if (!questionText.trim()) return;

      // Stop listening if active
      if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
      }

      setLastPromptTitle(displayTitle);
      setQueryInput("");
      setTranscript("");
      setIsLoading(true);
      setCurrentResponse("");
      stopSpeaking();

      abortControllerRef.current?.abort();
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const matchPrompt =
        locale === "es"
          ? `[SITUACIÓN TÁCTICA EN PARTIDA EN VIVO]\n` +
            `• Mi Civilización: ${myCiv}\n` +
            `• Civilización Rival: ${opponentCiv}\n` +
            `• Mapa: ${mapName}\n` +
            `• ELO Rival: ${opponentElo}\n` +
            `• Estilo Rival: ${opponentPlaystyle}\n\n` +
            `EMERGENCIA / PREGUNTA:\n"${questionText}"\n\n` +
            `Por favor, responde con instrucciones tácticas urgentes:\n` +
            `1. Empieza con 1-2 frases concisas de orden directa (sin markdown) para el audio TTS en auriculares.\n` +
            `2. 🚨 Respuesta Inmediata (unidades, micro, empalizadas).\n` +
            `3. ⚙️ Ajuste Económico (reubicación de aldeanos, granjas, mercado).\n` +
            `4. 🔄 Contragolpe & Transición (Castillos, contracomposición y condición de victoria).`
          : `[LIVE IN-GAME TACTICAL SITUATION]\n` +
            `• My Civilization: ${myCiv}\n` +
            `• Opponent Civilization: ${opponentCiv}\n` +
            `• Map: ${mapName}\n` +
            `• Opponent ELO: ${opponentElo}\n` +
            `• Opponent Playstyle: ${opponentPlaystyle}\n\n` +
            `EMERGENCY / QUESTION:\n"${questionText}"\n\n` +
            `Please respond with urgent live tactical coaching:\n` +
            `1. Start with 1-2 concise direct command sentences (no markdown) for headphone TTS audio.\n` +
            `2. 🚨 Immediate Defense (units to queue, micro, small-walls).\n` +
            `3. ⚙️ Eco Adjustment (villager movement, farms, market).\n` +
            `4. 🔄 Counter-Attack & Tech Transition (Castle Age, counter composition & win condition).`;

      const combinedContext = {
        myCiv,
        opponentCiv,
        map: mapName,
        opponentElo,
        opponentPlaystyle,
        ...(scoutContext || {}),
      };

      let accumulatedText = "";

      try {
        await readAssistantStream(
          {
            surface: "live",
            locale,
            context: combinedContext,
            messages: [{ role: "user", content: matchPrompt }],
          },
          (event: ClientAssistantStreamEvent) => {
            if (event.type === "text_delta" && event.text) {
              accumulatedText += event.text;
              setCurrentResponse((prev) => prev + event.text);
            }
          }
        );

        if (accumulatedText.trim()) {
          speakAdvice(accumulatedText);
        } else {
          throw new Error("Empty response");
        }
      } catch {
        // Fallback to offline rule-based tactical engine advice
        const fallbackPunchline = getLocalTacticalFallback(situationChipId || "default", myCiv, opponentCiv, locale);
        const fallbackFull =
          locale === "es"
            ? `${fallbackPunchline}\n\n` +
              `### 🚨 Respuesta Inmediata\n` +
              `* Protege tus aldeanos expuestos amurallando con empalizadas cortas o casas.\n` +
              `* Produce la unidad de contraataque directo desde tu edificio militar principal.\n\n` +
              `### ⚙️ Ajuste Económico\n` +
              `* Prioriza madera y granjas bajo el Centro Urbano para asegurar el avance de edad.\n` +
              `* Usa el Mercado si necesitas comprar recursos críticos para subir de edad.\n\n` +
              `### 🔄 Contragolpe & Transición\n` +
              `* Sube a Edad de los Castillos y castiga la sobre-extensión del rival con jinetes o asedio.`
            : `${fallbackPunchline}\n\n` +
              `### 🚨 Immediate Defense\n` +
              `* Protect exposed villagers with quick house/palisade small-walls.\n` +
              `* Queue direct counter-units from your primary military building.\n\n` +
              `### ⚙️ Eco Adjustment\n` +
              `* Prioritize wood and farm placement under Town Center protection to secure age-up.\n` +
              `* Use the Market if necessary to balance critical age-up resources.\n\n` +
              `### 🔄 Counter-Attack & Transition\n` +
              `* Reach Castle Age and punish the opponent's overcommitment with armored cavalry or siege.`;

        setCurrentResponse(fallbackFull);
        speakAdvice(fallbackPunchline);
      } finally {
        setIsLoading(false);
      }
    },
    [
      isListening,
      myCiv,
      opponentCiv,
      mapName,
      opponentElo,
      opponentPlaystyle,
      locale,
      scoutContext,
      stopSpeaking,
      speakAdvice,
    ]
  );
  submitQuestionRef.current = submitQuestion;

  const copyAdvice = useCallback(() => {
    if (!currentResponse) return;
    navigator.clipboard.writeText(currentResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [currentResponse]);

  return (
    <div
      className={cn(
        "rounded-2xl border border-amber-500/40 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-amber-950/20 p-5 shadow-2xl backdrop-blur-md relative overflow-hidden",
        className
      )}
    >
      {/* Background HUD Grid Accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Top Header & Status Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap pb-4 border-b border-amber-500/20">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center border transition-all",
                isListening
                  ? "bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse"
                  : isSpeaking
                  ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-400"
              )}
            >
              {isListening ? (
                <Radio className="w-5 h-5 animate-spin text-red-400" />
              ) : isSpeaking ? (
                <Volume2 className="w-5 h-5 animate-pulse text-amber-300" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </div>
            {isListening && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medieval font-bold gold-gradient flex items-center gap-2">
                {locale === "es" ? "Copiloto Táctico en Vivo" : "Live Tactical Voice Copilot"}
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 text-green-400 animate-ping" />
                VOICE HUD
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {locale === "es"
                ? "Respuesta hablada por voz en tiempo real para jugar sin salir de la partida"
                : "Real-time spoken voice feedback so you can play without alt-tabbing"}
            </p>
          </div>
        </div>

        {/* Audio controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={cn(
              "btn-secondary text-xs !px-3 !py-1.5 flex items-center gap-1.5 transition-colors",
              autoSpeak
                ? "border-green-500/40 text-green-300 bg-green-500/10"
                : "border-slate-700 text-slate-400 bg-slate-800/60"
            )}
            title={
              autoSpeak
                ? locale === "es"
                  ? "Audio activado: el copiloto hablará en voz alta"
                  : "Audio enabled: copilot will speak aloud"
                : locale === "es"
                ? "Audio silenciado"
                : "Audio muted"
            }
          >
            {autoSpeak ? <Volume2 className="w-3.5 h-3.5 text-green-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{autoSpeak ? (locale === "es" ? "Voz ON" : "Voice ON") : (locale === "es" ? "Voz OFF" : "Muted")}</span>
          </button>

          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="btn-secondary text-xs !px-2.5 !py-1.5 border-red-500/40 text-red-400 bg-red-500/10 hover:bg-red-500/20 flex items-center gap-1"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>{locale === "es" ? "Parar" : "Stop"}</span>
            </button>
          )}

          {currentResponse && !isSpeaking && (
            <button
              onClick={replayVoice}
              className="btn-secondary text-xs !px-2.5 !py-1.5 border-amber-500/30 text-amber-300 hover:border-amber-400 flex items-center gap-1"
              title={locale === "es" ? "Repetir voz por auriculares" : "Replay voice advice in headphones"}
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span>{locale === "es" ? "Escuchar" : "Replay"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Match Context Bar */}
      <div className="my-3.5 rounded-xl bg-slate-900/80 border border-slate-700/60 p-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
              {locale === "es" ? "Match Activo:" : "Active Match:"}
            </span>

            {/* My Civ */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-500/10 border border-green-500/30 text-green-300 font-medium">
              <Shield className="w-3 h-3 text-green-400" />
              <span>{myCiv}</span>
              <span className="text-[10px] text-green-400/70">({locale === "es" ? "Tú" : "You"})</span>
            </div>

            <span className="text-amber-500 font-bold text-xs">VS</span>

            {/* Opponent Civ */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/30 text-red-300 font-medium">
              <Swords className="w-3 h-3 text-red-400" />
              <span>{opponentCiv}</span>
              {opponentName && opponentName !== "Opponent" && (
                <span className="text-[10px] text-red-400/70 truncate max-w-[90px]">({opponentName})</span>
              )}
            </div>

            {/* Map */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>{mapName}</span>
            </div>

            {/* ELO & Playstyle */}
            {opponentElo > 0 && (
              <span className="text-slate-400 text-xs flex items-center gap-1 bg-slate-800/60 px-2 py-0.5 rounded">
                <Target className="w-3 h-3 text-amber-400" />
                {opponentElo} ELO
              </span>
            )}

            {opponentPlaystyle && opponentPlaystyle !== "Standard" && (
              <span className="text-purple-300 text-xs flex items-center gap-1 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded">
                <Flame className="w-3 h-3 text-purple-400" />
                {opponentPlaystyle}
              </span>
            )}
          </div>

          <button
            onClick={() => setIsEditingMatchup(!isEditingMatchup)}
            className="text-xs text-amber-400/90 hover:text-amber-300 flex items-center gap-1 transition-colors underline underline-offset-2"
          >
            <span>{isEditingMatchup ? (locale === "es" ? "Cerrar" : "Close") : (locale === "es" ? "Ajustar Matchup" : "Edit Matchup")}</span>
            {isEditingMatchup ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Inline Matchup Editor */}
        {isEditingMatchup && (
          <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-2.5 animate-in fade-in duration-200">
            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                {locale === "es" ? "Mi Civilización" : "My Civ"}
              </label>
              <select
                value={myCiv}
                onChange={(e) => setMyCiv(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
              >
                {POPULAR_CIVS.map((civ) => (
                  <option key={`my-${civ}`} value={civ}>
                    {civ}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                {locale === "es" ? "Civ Rival" : "Opponent Civ"}
              </label>
              <select
                value={opponentCiv}
                onChange={(e) => setOpponentCiv(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
              >
                {POPULAR_CIVS.map((civ) => (
                  <option key={`opp-${civ}`} value={civ}>
                    {civ}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                {locale === "es" ? "Mapa" : "Map"}
              </label>
              <select
                value={mapName}
                onChange={(e) => setMapName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
              >
                {POPULAR_MAPS.map((m) => (
                  <option key={`map-${m}`} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                {locale === "es" ? "ELO Rival" : "Opponent ELO"}
              </label>
              <input
                type="number"
                value={opponentElo}
                onChange={(e) => setOpponentElo(Number(e.target.value) || 1200)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Big Tactical Voice Input & Quick Dictation Bar */}
      <div className="mb-4">
        <div className="relative flex items-center gap-2">
          {/* Big Pulsing Mic Button */}
          <button
            onClick={toggleListening}
            className={cn(
              "h-12 px-5 rounded-xl font-bold flex items-center justify-center gap-2.5 transition-all shrink-0 select-none shadow-lg",
              isListening
                ? "bg-red-600 hover:bg-red-500 text-white shadow-red-500/50 ring-4 ring-red-500/30 animate-pulse"
                : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20"
            )}
            title={locale === "es" ? "Pulsa para hablar o dictar tu emergencia" : "Click to speak or dictate your situation"}
          >
            {isListening ? (
              <>
                <MicOff className="w-5 h-5 text-white animate-bounce" />
                <span className="text-sm uppercase tracking-wider">{locale === "es" ? "Escuchando..." : "Listening..."}</span>
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                <span className="text-sm uppercase tracking-wider font-extrabold">
                  {locale === "es" ? "Hablar al Copiloto" : "Speak to Copilot"}
                </span>
              </>
            )}
          </button>

          {/* Text Input / Live Transcript Box */}
          <div className="relative flex-1">
            <input
              type="text"
              value={isListening ? transcript : queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && queryInput.trim()) {
                  submitQuestion(queryInput.trim(), queryInput.trim());
                }
              }}
              placeholder={
                isListening
                  ? locale === "es"
                    ? "Habla ahora... Di tu pregunta o situación táctica"
                    : "Listening... Speak your tactical situation"
                  : locale === "es"
                  ? "O escribe tu consulta (ej. '¿Cómo me defiendo de arqueros en mi madera?')..."
                  : "Or type your situation (e.g. 'How do I defend archers on my woodline?')..."
              }
              className={cn(
                "w-full h-12 bg-slate-800/80 border rounded-xl pl-4 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none transition-all",
                isListening
                  ? "border-red-500/60 ring-2 ring-red-500/20 text-red-200"
                  : "border-slate-700/80 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
              )}
            />

            {queryInput.trim() && !isLoading && (
              <button
                onClick={() => submitQuestion(queryInput.trim(), queryInput.trim())}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center hover:bg-amber-400 transition-colors shadow"
              >
                <Send className="w-4 h-4" />
              </button>
            )}

            {isLoading && (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
              </div>
            )}
          </div>
        </div>

        {speechError && (
          <div className="mt-2 text-xs text-red-400 flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 rounded-md p-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>{speechError}</span>
          </div>
        )}

        {!hasSpeechRecognition && (
          <div className="mt-2 text-xs text-amber-400/80 flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-md px-3 py-1.5">
            <Radio className="w-3.5 h-3.5 shrink-0" />
            <span>
              {locale === "es"
                ? "Reconocimiento de voz nativo no disponible en este navegador. Usa los 6 botones de situación rápida o escribe."
                : "Speech recognition not available in this browser. Use the 6 quick combat chips below or type."}
            </span>
          </div>
        )}
      </div>

      {/* 6 Quick Combat Situation Chips (1-Click Fast Prompts) */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>{locale === "es" ? "Situaciones Tácticas Rápidas (1 Clic)" : "Quick Combat Situations (1-Click)"}</span>
          </div>
          <span className="text-[11px] text-slate-400">
            {locale === "es" ? "Pulsa para respuesta hablada instantánea" : "Click for instant spoken advice"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {QUICK_CHIPS.map((chip) => {
            const Icon = chip.icon;
            const title = locale === "es" ? chip.title.es : chip.title.en;
            const prompt = locale === "es" ? chip.prompt.es : chip.prompt.en;
            const badge = locale === "es" ? chip.badge.es : chip.badge.en;

            return (
              <button
                key={chip.id}
                onClick={() => submitQuestion(prompt, title, chip.id)}
                disabled={isLoading}
                className={cn(
                  "group text-left p-3 rounded-xl border bg-gradient-to-br transition-all duration-200 relative overflow-hidden flex flex-col justify-between hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none shadow-md",
                  chip.color
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-slate-950/60 text-slate-300 border border-slate-700/50">
                    {badge}
                  </span>
                  <div className="w-6 h-6 rounded-md bg-slate-950/40 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                    <Play className="w-3 h-3 fill-current" />
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Icon className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="text-xs font-bold text-white group-hover:text-amber-200 transition-colors leading-snug">
                    {title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && !currentResponse && (
        <div className="rounded-xl border border-amber-500/30 bg-slate-900/90 p-5 my-3 animate-pulse">
          <div className="flex items-center gap-3 mb-3">
            <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
            <span className="text-sm font-semibold text-amber-200">
              {locale === "es"
                ? `Calculando respuesta táctica para ${myCiv} vs ${opponentCiv}...`
                : `Calculating tactical defense for ${myCiv} vs ${opponentCiv}...`}
            </span>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-slate-800 rounded w-3/4" />
            <div className="h-3 bg-slate-800 rounded w-5/6" />
            <div className="h-3 bg-slate-800 rounded w-2/3" />
          </div>
        </div>
      )}

      {/* Tactical Response Card */}
      {currentResponse && (
        <div className="rounded-xl border border-amber-500/40 bg-slate-950/90 p-5 mt-4 space-y-4 shadow-xl animate-in fade-in duration-300">
          {/* Header of Response */}
          <div className="flex items-center justify-between gap-2 flex-wrap pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  {lastPromptTitle || (locale === "es" ? "Instrucción Táctica" : "Tactical Directive")}
                </h4>
                <span className="text-[11px] text-slate-400">
                  {myCiv} vs {opponentCiv} &bull; {mapName}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyAdvice}
                className="btn-secondary text-xs !px-2.5 !py-1 border-slate-700 text-slate-300 hover:border-amber-400 flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copied ? (locale === "es" ? "Copiado" : "Copied") : (locale === "es" ? "Copiar" : "Copy")}</span>
              </button>
            </div>
          </div>

          {/* Spoken Audio Banner (What was spoken into the headphones) */}
          {spokenTakeaway && (
            <div className="rounded-lg bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/40 p-3.5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 mt-0.5">
                <Volume2 className={cn("w-4 h-4 text-amber-300", isSpeaking && "animate-pulse")} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                    {locale === "es" ? "Resumen de Voz (Auriculares)" : "Voice Takeaway (Headphones)"}
                  </span>
                  {isSpeaking && (
                    <span className="text-[10px] font-bold text-green-400 flex items-center gap-1 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      {locale === "es" ? "HABLANDO..." : "SPEAKING..."}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-amber-100 leading-relaxed italic">
                  &ldquo;{spokenTakeaway}&rdquo;
                </p>
              </div>
            </div>
          )}

          {/* Full Markdown Breakdown */}
          <div className="prose-aoe text-sm text-slate-200">
            <MarkdownMessage content={currentResponse} />
          </div>
        </div>
      )}
    </div>
  );
}
