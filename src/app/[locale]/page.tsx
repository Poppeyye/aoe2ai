import Link from "next/link";
import {
  Swords,
  Upload,
  BookOpen,
  Users,
  Trophy,
  Radio,
  GraduationCap,
  UserCircle,
} from "lucide-react";
import { getDictionary } from "@/i18n/getDictionary";
import type { Locale } from "@/i18n/config";
import { isValidLocale } from "@/i18n/config";
import { notFound } from "next/navigation";
import FavoritesSection from "@/components/home/FavoritesSection";

export default async function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isValidLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);
  const d = dict.home;

  const TOOLS = [
    { href: `/${locale}/agent`, icon: Swords, title: d.tool_agent_title, desc: d.tool_agent_desc, tag: "Live" },
    { href: `/${locale}/replay`, icon: Upload, title: d.tool_replay_title, desc: d.tool_replay_desc, tag: "Live" },
    { href: `/${locale}/techtree`, icon: BookOpen, title: d.tool_techtree_title, desc: d.tool_techtree_desc },
    { href: `/${locale}/players`, icon: Users, title: d.tool_players_title, desc: d.tool_players_desc },
    { href: `/${locale}/tournaments`, icon: Trophy, title: d.tool_tournaments_title, desc: d.tool_tournaments_desc, tag: "LIVE" },
    { href: `/${locale}/live`, icon: Radio, title: d.tool_live_title, desc: d.tool_live_desc, tag: "New" },
    { href: `/${locale}/profile`, icon: UserCircle, title: d.tool_profile_title, desc: d.tool_profile_desc, tag: "New" },
    { href: `/${locale}/learn`, icon: GraduationCap, title: d.tool_learn_title, desc: d.tool_learn_desc },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <section className="text-center mb-20">
        <h1 className="text-4xl md:text-6xl font-medieval font-bold mb-6">
          {d.hero_pre} <span className="gold-gradient">{d.hero_highlight}</span>{" "}
          {d.hero_post}
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
          {d.hero_subtitle}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href={`/${locale}/agent`} className="btn-primary text-lg">
            {d.cta_agent}
          </Link>
          <Link href={`/${locale}/live`} className="btn-secondary text-lg">
            {d.cta_matchup}
          </Link>
          <Link href={`/${locale}/replay`} className="btn-secondary text-lg">
            {d.cta_replay}
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-20">
        <Link href={`/${locale}/agent`} className="card hover:border-aoe-accent/50 transition-colors group">
          <h3 className="font-semibold text-white mb-2 group-hover:text-aoe-accent transition-colors">
            {d.quick_agent_title}
          </h3>
          <p className="text-sm text-gray-400">{d.quick_agent_desc}</p>
        </Link>
        <Link href={`/${locale}/live`} className="card hover:border-aoe-accent/50 transition-colors group">
          <h3 className="font-semibold text-white mb-2 group-hover:text-aoe-accent transition-colors">
            {d.quick_scout_title}
          </h3>
          <p className="text-sm text-gray-400">{d.quick_scout_desc}</p>
        </Link>
        <Link href={`/${locale}/replay`} className="card hover:border-aoe-accent/50 transition-colors group">
          <h3 className="font-semibold text-white mb-2 group-hover:text-aoe-accent transition-colors">
            {d.quick_replay_title}
          </h3>
          <p className="text-sm text-gray-400">{d.quick_replay_desc}</p>
        </Link>
      </section>

      <FavoritesSection />

      <section>
        <h2 className="text-center text-3xl font-medieval font-bold mb-12">
          {d.all_tools}
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

      <section className="mt-20 text-center">
        <div className="flex flex-wrap justify-center gap-12 text-gray-400">
          <div>
            <div className="text-3xl font-bold text-white">45+</div>
            <div className="text-sm">{d.stat_civs}</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">7</div>
            <div className="text-sm">{d.stat_tools}</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">ES / EN</div>
            <div className="text-sm">{d.stat_languages}</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">100%</div>
            <div className="text-sm">{d.stat_free}</div>
          </div>
        </div>
        <div className="mt-10">
          <a
            href="https://ko-fi.com/popeeeeeeeye"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-aoe-accent/20 bg-aoe-accent/5 text-aoe-accent hover:bg-aoe-accent/10 hover:border-aoe-accent/40 transition-all text-sm font-medium"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg>
            {locale === "es" ? "Apoya este proyecto en Ko-fi" : "Support this project on Ko-fi"}
          </a>
        </div>
      </section>
    </div>
  );
}
