import type { Metadata } from "next";
import Link from "next/link";
import {
  Brain, Shield, Swords, Target, Trophy, Flame,
  CheckCircle2, AlertTriangle, ArrowRight, Sparkles, BookOpen, Clock,
} from "lucide-react";
import JsonLd from "@/components/seo/JsonLd";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isEs = locale === "es";
  const title = isEs
    ? "Cómo Vencer a la IA Extrema en AoE2 DE — Guía Definitiva y Estrategias | AoE2.ai"
    : "How to Beat the Extreme AI in AoE2 DE — Definitive Guide & Build Orders | AoE2.ai";
  const description = isEs
    ? "Descubre cómo derrotar a la IA Extrema en Age of Empires II: Definitive Edition. Estrategias infalibles: Tower Rush, 21 Pop Arqueros, Fast Castle y trucos de microgestión."
    : "Learn how to defeat the Extreme AI in Age of Empires II: Definitive Edition. Proven strategies: Tower Rush, 21-Pop Archer Flush, Fast Castle, and AI behavioral exploits.";

  return {
    title,
    description,
    alternates: {
      canonical: `https://aoe2.ai/${locale}/guides/how-to-beat-extreme-ai`,
      languages: {
        en: "https://aoe2.ai/en/guides/how-to-beat-extreme-ai",
        es: "https://aoe2.ai/es/guides/how-to-beat-extreme-ai",
      },
    },
    openGraph: {
      title,
      description,
      url: `https://aoe2.ai/${locale}/guides/how-to-beat-extreme-ai`,
      type: "article",
    },
  };
}

export default function BeatExtremeAiGuidePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const isEs = locale === "es";

  const faqs = [
    {
      q: isEs ? "¿La IA Extrema hace trampas o tiene recursos gratis?" : "Does the Extreme AI cheat or get free resources?",
      a: isEs
        ? "No. En Definitive Edition, la IA Extrema no recibe recursos gratis ni tiene visión completa del mapa. Juega bajo las mismas reglas que un jugador humano, pero tiene un tiempo de inactividad de Centro Urbano prácticamente nulo (0s idle time) y microgestión perfecta al esquivar proyectiles balísticos."
        : "No. In Definitive Edition, the Extreme AI does not receive free resources or full map vision. It plays under the exact same rules as human players, but has virtually zero Town Center idle time and superhuman projectile dodging micro.",
    },
    {
      q: isEs ? "¿Cuál es la forma más fácil de ganar a la IA Extrema?" : "What is the easiest strategy to beat the Extreme AI?",
      a: isEs
        ? "La estrategia más fácil es el Tower Rush (Trush) con civilizaciones como Incas, Coreanos o Españoles. Al colocar una torre sobre su madera o bayas en Feudal temprano, el script de la IA entra en pánico y manda decenas de aldeanos a atacar la torre a pie, perdiendo su economía por completo."
        : "The easiest strategy is the Tower Rush (Trush) with civilizations like Incas, Koreans, or Spanish. Placing an aggressive tower on their main woodline or berries in early Feudal causes the AI script to panic and suicide villagers trying to melee the tower.",
    },
    {
      q: isEs ? "¿Qué civilización es mejor para vencer a la IA?" : "Which civilization is best for beating the AI?",
      a: isEs
        ? "Los Francos (por su economía estable y jinetes con +20% de vida), los Británicos (por su rango superior que supera la micro de la IA) y los Godos (porque la IA no sabe reaccionar ante una masa infinita de Huskarls en Imperial)."
        : "Franks (for their effortless food economy and +20% HP knights), Britons (for superior range that out-ranges AI archer micro), and Goths (because the AI struggles to handle an endless flood of Huskarls in Imperial).",
    },
    {
      q: isEs ? "¿Por qué la IA esquiva tan bien las flechas de mis arqueros?" : "Why does the AI dodge archer arrows so well?",
      a: isEs
        ? "La IA detecta la trayectoria del proyectil en el frame de disparo y mueve cada unidad individualmente. Para neutralizar esto, investiga Balística en la Universidad lo antes posible o usa Mangonelas disparando al suelo (Attack Ground) donde la IA va a retroceder."
        : "The AI calculates incoming projectile trajectories on the exact fire frame and splits individual units. To counter this, research Ballistics at the University immediately or use Mangonels firing on ground (Attack Ground) where the AI clusters.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: f.a,
            },
          })),
        }}
      />

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <Link href={`/${locale}`} className="hover:text-gray-300">
          AoE2.ai
        </Link>
        <span>/</span>
        <Link href={`/${locale}/learn`} className="hover:text-gray-300">
          {isEs ? "Guías" : "Guides"}
        </Link>
        <span>/</span>
        <span className="text-aoe-accent font-medium">
          {isEs ? "Cómo Vencer a la IA Extrema" : "How to Beat Extreme AI"}
        </span>
      </nav>

      {/* Hero Header */}
      <div className="card border-aoe-accent/40 bg-gradient-to-br from-aoe-accent/10 via-aoe-card to-aoe-dark p-6 sm:p-8 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-aoe-accent/20 border border-aoe-accent/30 text-aoe-accent text-xs font-semibold mb-3">
          <Brain className="w-3.5 h-3.5" />
          {isEs ? "Guía Maestra de Inteligencia Artificial" : "Master AI Strategy Guide"}
        </div>
        <h1 className="text-3xl sm:text-4xl font-medieval font-bold gold-gradient mb-3">
          {isEs ? "Cómo Vencer a la IA Extrema en Age of Empires II" : "How to Beat the Extreme AI in Age of Empires II"}
        </h1>
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
          {isEs
            ? "La IA Extrema de AoE2 DE puede parecer invencible por su velocidad y microgestión sobrehumana. Sin embargo, sufre de debilidades de comportamiento críticas que puedes explotar para ganar el 100% de tus partidas."
            : "The Extreme AI in AoE2 DE can feel unbeatable with its relentless tempo and frame-perfect dodging micro. However, it suffers from structural decision-making flaws that you can exploit to win 100% of your games."}
        </p>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-aoe-accent" />
            {isEs ? "8 min de lectura" : "8 min read"}
          </span>
          <span className="flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-yellow-500" />
            {isEs ? "Actualizado para el meta actual" : "Updated for current DE patch"}
          </span>
        </div>
      </div>

      {/* Strengths vs Weaknesses Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="card border-red-500/30 bg-red-500/5">
          <h2 className="text-base font-bold text-red-400 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            {isEs ? "Las Fortalezas de la IA Extrema" : "Extreme AI Superpowers"}
          </h2>
          <ul className="space-y-2 text-xs text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-red-400 font-bold">&bull;</span>
              <span><strong>0s TC Idle Time:</strong> {isEs ? "Produce aldeanos sin parar y optimiza granjas a la perfección." : "Produces villagers continuously without any Town Center idling."}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 font-bold">&bull;</span>
              <span><strong>Micro de Esquive Balístico:</strong> {isEs ? "Mueve arqueros individualmente para esquivar flechas sin Balística." : "Dodges arrows and mangonel shots by microing each unit on projectile release."}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 font-bold">&bull;</span>
              <span><strong>Conversiones de Monjes Instantáneas:</strong> {isEs ? "Convierte jinetes aislados en el rango máximo de forma perfecta." : "Converts incoming heavy cavalry instantaneously at maximum range."}</span>
            </li>
          </ul>
        </div>

        <div className="card border-green-500/30 bg-green-500/5">
          <h2 className="text-base font-bold text-green-400 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            {isEs ? "Las Debilidades Explotables de la IA" : "Exploitable AI Weaknesses"}
          </h2>
          <ul className="space-y-2 text-xs text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-green-400 font-bold">&bull;</span>
              <span><strong>Pánico ante Torres (Trush):</strong> {isEs ? "Manda aldeanos a atacar torres a cuerpo a cuerpo y descompensa su economía." : "Sends villagers to melee forward towers, causing catastrophic economic collapse."}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 font-bold">&bull;</span>
              <span><strong>No Sabe Manejar Muros (Quickwalls):</strong> {isEs ? "La IA no rompe empalizadas de forma inteligente si colocas arqueros detrás." : "Cannot breach well-defended palisade chokepoints with ranged support."}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 font-bold">&bull;</span>
              <span><strong>Vulnerabilidad a Raids de Jinetes:</strong> {isEs ? "En Castillos, 4 jinetes en su maderera paralizan a todos sus aldeanos." : "Four Knights raiding secondary woodlines will freeze all their gatherers in fear."}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* The 4 Proven Strategies */}
      <div className="space-y-6 mb-12">
        <h2 className="section-title flex items-center gap-2">
          <Swords className="w-5 h-5 text-aoe-accent" />
          {isEs ? "Las 4 Estrategias Infalibles para Derrotarla" : "The 4 Proven Strategies to Win"}
        </h2>

        {/* Strategy 1 */}
        <div className="card p-6 border-l-4 border-l-aoe-accent">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              {isEs ? "Estrategia 1: El Tower Rush (Trush) Temprano" : "Strategy 1: Early Tower Rush (Trush)"}
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30">
              {isEs ? "Dificultad: Muy Fácil" : "Difficulty: Very Easy"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-4">
            {isEs
              ? "Pica a Feudal con 19-20 de población y envía 4 aldeanos a minar piedra. Al subir, manda 4 aldeanos a construir una torre pegada a su madera principal y oro. La IA mandará de 8 a 12 aldeanos a golpear la torre con los puños mientras tus aldeanos guarnecidos disparan flechas. Perderán la partida en 5 minutos."
              : "Advance to Feudal Age at 19-20 pop and put 4 villagers on stone. As soon as Feudal finishes, send 4 forward villagers to build a watch tower covering their main woodline or gold. The AI will pull 8-12 villagers to melee the tower while your garrisoned units pick them off effortlessly."}
          </p>
          <div className="bg-aoe-dark p-3 rounded-lg border border-aoe-border text-xs text-gray-300">
            <strong>{isEs ? "Civs Recomendadas:" : "Best Civs:"}</strong> Incas, Koreans, Spanish, Teutons.
          </div>
        </div>

        {/* Strategy 2 */}
        <div className="card p-6 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" />
              {isEs ? "Estrategia 2: 21 Pop Arqueros + Flecha Emplumada" : "Strategy 2: 21-Pop Archer Flush with Fletching"}
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
              {isEs ? "Dificultad: Estándar Competitivo" : "Difficulty: Standard Competitive"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-4">
            {isEs
              ? "Abre a 21 de población con 2 Galerías de Tiro. Construye Herrería e investiga Flecha Emplumada inmediatamente. Mantén a tus arqueros en grupo compacto (10+) y ataca sus bayas o madera. Amuralla tu propia base para evitar que sus exploradores te hagan daño."
              : "Execute a standard 21-pop 2-Range Archer opening. Build a Blacksmith and research Fletching the second Feudal completes. Keep your archers grouped (10+) and patrol their exposed resources. Wall your home base with palisades to prevent scout harass."}
          </p>
          <div className="bg-aoe-dark p-3 rounded-lg border border-aoe-border text-xs text-gray-300">
            <strong>{isEs ? "Civs Recomendadas:" : "Best Civs:"}</strong> Britons, Mayans, Ethiopians, Vietnamese.
          </div>
        </div>

        {/* Strategy 3 */}
        <div className="card p-6 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              {isEs ? "Estrategia 3: Fast Castle + Muro de Jinetes con Armadura" : "Strategy 3: Fast Castle into +2 Armor Knights"}
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
              {isEs ? "Dificultad: Media" : "Difficulty: Medium"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-4">
            {isEs
              ? "Amuralla tu base en Dark Age y haz un Fast Castle limpio (26-28 pop). Al llegar a Castillos a los 16:00, levanta 2 Establos e investiga Líneas de Sangre y Armadura de Malla en la herrería. Con +2 de armadura, los arqueros de la IA en Feudal solo hacen 1 de daño a tus jinetes. Arrasa sus campamentos y gana la partida."
              : "Wall your base during Dark Age and execute a clean Fast Castle (26-28 pop). Upon hitting Castle Age at ~16:00, build 2 Stables and immediately research Bloodlines and Chain Barding Armor. With +2 armor, the AI's Feudal archers deal only 1 damage per shot. Wipe their base with heavy cavalry."}
          </p>
          <div className="bg-aoe-dark p-3 rounded-lg border border-aoe-border text-xs text-gray-300">
            <strong>{isEs ? "Civs Recomendadas:" : "Best Civs:"}</strong> Franks, Berbers, Teutons, Lithuanians.
          </div>
        </div>

        {/* Strategy 4 */}
        <div className="card p-6 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-purple-400" />
              {isEs ? "Estrategia 4: Castillo Ofensivo en Arena + Mangonelas" : "Strategy 4: Arena Castle Drop + Mangonels"}
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
              {isEs ? "Dificultad: Fácil (Mapas Cerrados)" : "Difficulty: Easy (Closed Maps)"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-4">
            {isEs
              ? "En mapas cerrados como Arena o Hideout, mina 650 de piedra en Dark/Feudal. Al pasar a Castillos, lleva 8 aldeanos a su puerta y planta un Castillo ofensivo. Añade un Taller de Asedio con 2 Mangonelas y tira sus murallas. La IA no sabe contrarrestar un asedio temprano tras un castillo."
              : "On closed maps like Arena or Hideout, gather 650 stone on the way to Castle Age. Send 8 forward villagers to their gate and drop an aggressive Castle. Follow up with a Siege Workshop and 2 Mangonels to breach their walls and destroy their main Town Center."}
          </p>
          <div className="bg-aoe-dark p-3 rounded-lg border border-aoe-border text-xs text-gray-300">
            <strong>{isEs ? "Civs Recomendadas:" : "Best Civs:"}</strong> Spanish, Poles, Turks, Bohemians.
          </div>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="card mb-10">
        <h2 className="section-title flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-aoe-accent" />
          {isEs ? "Preguntas Frecuentes sobre la IA Extrema" : "Extreme AI Frequently Asked Questions"}
        </h2>
        <div className="space-y-4">
          {faqs.map((f, i) => (
            <div key={i} className="p-4 rounded-lg bg-aoe-dark border border-aoe-border/60">
              <h3 className="text-sm font-semibold text-white mb-1.5 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                {f.q}
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed pl-6">
                {f.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA to AI Agent */}
      <div className="card border-aoe-accent/40 bg-gradient-to-r from-aoe-accent/10 via-aoe-card to-aoe-dark p-6 text-center">
        <h2 className="text-lg font-bold text-white mb-2 flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-aoe-accent" />
          {isEs ? "¿Quieres practicar con un asistente de IA personalizado?" : "Want to practice with a personalized AI coach?"}
        </h2>
        <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto mb-4">
          {isEs
            ? "Pregúntale a nuestro Agente de IA para recibir build orders paso a paso, tiempos exactos de aldeanos y cómo reaccionar si la IA te ataca antes de tiempo."
            : "Ask our AI Agent for step-by-step build orders, exact villager counts, and real-time adjustments if the AI tries an unexpected rush."}
        </p>
        <Link
          href={`/${locale}/agent`}
          className="btn-primary inline-flex items-center gap-2 text-sm"
        >
          <Sparkles className="w-4 h-4" />
          {isEs ? "Consultar al Agente IA" : "Ask the AI Agent"}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
