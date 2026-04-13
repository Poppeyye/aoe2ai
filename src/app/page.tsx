import Link from "next/link";
import {
  Swords,
  Upload,
  BookOpen,
  Users,
  Trophy,
  Radio,
  GraduationCap,
} from "lucide-react";

const TOOLS = [
  {
    href: "/agent",
    icon: Swords,
    title: "The Definitive Agent",
    desc: "Your AI-powered AoE2 assistant. Ask about matchups, strategies, unit counters, build orders — with real-time tool access to game data.",
    tag: "Live",
  },
  {
    href: "/replay",
    icon: Upload,
    title: "Replay Analyzer",
    desc: "Upload a .aoe2record file and get an AI-generated chronicle of the match with battle detection, army composition analysis, and tactical insights.",
    tag: "Live",
  },
  {
    href: "/techtree",
    icon: BookOpen,
    title: "Tech Tree Explorer",
    desc: "Browse all civilizations with their bonuses, unique units, and technologies. Compare two civs side-by-side to plan your strategy.",
  },
  {
    href: "/players",
    icon: Users,
    title: "Player Lookup",
    desc: "Browse the official leaderboard or look up any player by profile ID. View ELO, recent matches with civ picks, rating changes, and win rates.",
  },
  {
    href: "/tournaments",
    icon: Trophy,
    title: "Tournaments",
    desc: "Live results, brackets, and schedules from the biggest AoE2 tournaments. Follow Red Bull Wololo, T90 Titans League, and more.",
    tag: "LIVE",
  },
  {
    href: "/live",
    icon: Radio,
    title: "Live Game Tracker",
    desc: "Track your games in real-time. Get instant opponent scouting, matchup analysis, and strategy tips the moment you start a match.",
    tag: "New",
  },
  {
    href: "/learn",
    icon: GraduationCap,
    title: "AoE2 Academy",
    desc: "Paste a YouTube video URL from T90, Spirit of the Law, Hera, or any AoE2 creator. AI extracts key strategies, build orders, and answers your questions.",
  },
];

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      {/* Hero */}
      <section className="text-center mb-20">
        <h1 className="text-4xl md:text-6xl font-medieval font-bold mb-6">
          Your <span className="gold-gradient">AI advantage</span> for Age of
          Empires II
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
          Scout opponents, analyze matchups, understand your replays, and turn
          game knowledge into practical decisions fast.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/agent" className="btn-primary text-lg">
            Try the AI Agent
          </Link>
          <Link href="/live" className="btn-secondary text-lg">
            Analyze a Matchup
          </Link>
          <Link href="/replay" className="btn-secondary text-lg">
            Upload a Replay
          </Link>
        </div>
      </section>

      {/* Quick actions */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-20">
        <Link href="/agent" className="card hover:border-aoe-accent/50 transition-colors group">
          <h3 className="font-semibold text-white mb-2 group-hover:text-aoe-accent transition-colors">
            Ask the Agent
          </h3>
          <p className="text-sm text-gray-400">
            Fast help for civ matchups, unit counters, strategies and build
            order ideas.
          </p>
        </Link>
        <Link href="/live" className="card hover:border-aoe-accent/50 transition-colors group">
          <h3 className="font-semibold text-white mb-2 group-hover:text-aoe-accent transition-colors">
            Scout Before Queueing
          </h3>
          <p className="text-sm text-gray-400">
            Check an opponent, the civ matchup and map plan before or during a
            ranked game.
          </p>
        </Link>
        <Link href="/replay" className="card hover:border-aoe-accent/50 transition-colors group">
          <h3 className="font-semibold text-white mb-2 group-hover:text-aoe-accent transition-colors">
            Review What Happened
          </h3>
          <p className="text-sm text-gray-400">
            Turn a replay into an AI battle chronicle with key timings, swings
            and mistakes.
          </p>
        </Link>
      </section>

      {/* All tools */}
      <section>
        <h2 className="text-center text-3xl font-medieval font-bold mb-12">
          Everything in the platform
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="card hover:border-aoe-accent/50 transition-all duration-300 group hover:glow"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-aoe-accent/10 text-aoe-accent group-hover:bg-aoe-accent/20 transition-colors">
                  <tool.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-white group-hover:text-aoe-accent transition-colors">
                      {tool.title}
                    </h3>
                    {tool.tag && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                        {tool.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats bar */}
      <section className="mt-20 text-center">
        <div className="flex flex-wrap justify-center gap-12 text-gray-400">
          <div>
            <div className="text-3xl font-bold text-white">45+</div>
            <div className="text-sm">Civilizations</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">7</div>
            <div className="text-sm">Tools</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">ES / EN</div>
            <div className="text-sm">Languages</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">100%</div>
            <div className="text-sm">Free</div>
          </div>
        </div>
      </section>
    </div>
  );
}
