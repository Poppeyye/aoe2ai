import Link from "next/link";
import Image from "next/image";
import {
  Swords,
  Upload,
  BookOpen,
  Users,
  Radio,
  GraduationCap,
  UserCircle,
  ChevronRight,
  Zap,
  Shield,
  Eye,
  Tv,
  Calculator,
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
  const isEs = locale === "es";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="relative pt-14 pb-16 md:pt-20 md:pb-20 text-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-aoe-accent/[0.03] rounded-full blur-3xl" />
          <Image
            src="/home-arena-micro.png"
            alt=""
            width={1024}
            height={682}
            priority
            aria-hidden="true"
            className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-[520px] xl:w-[620px] opacity-[0.12] mix-blend-luminosity"
            style={{
              maskImage:
                "linear-gradient(to left, black 35%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 20%, black 75%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to left, black 35%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 20%, black 75%, transparent 100%)",
              maskComposite: "intersect",
              WebkitMaskComposite: "source-in",
            }}
          />
        </div>
        <div className="relative max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-medieval font-bold mb-5 leading-tight tracking-tight">
            {d.hero_pre}{" "}
            <span className="gold-gradient">{d.hero_highlight}</span>{" "}
            {d.hero_post}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-9 leading-relaxed">
            {d.hero_subtitle}
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <Link
              href={`/${locale}/live`}
              className="btn-primary text-base sm:text-lg inline-flex items-center gap-2 shadow-lg"
            >
              <Eye className="w-5 h-5" />
              {d.cta_matchup}
            </Link>
            <Link
              href={`/${locale}/agent`}
              className="btn-secondary text-base sm:text-lg inline-flex items-center gap-2"
            >
              <Swords className="w-5 h-5" />
              {d.cta_agent}
            </Link>
          </div>
        </div>
      </section>

      {/* Featured: Live Match Detection */}
      <section className="mb-16">
        <Link
          href={`/${locale}/profile`}
          className="group block relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.07] via-aoe-card to-aoe-card p-6 md:p-8 hover:border-amber-500/40 transition-colors"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/[0.04] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-amber-500/15 flex items-center justify-center">
              <Zap className="w-7 h-7 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl md:text-2xl font-bold text-amber-100 group-hover:text-amber-300 transition-colors">
                  {d.profile_hero_title}
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  New
                </span>
              </div>
              <p className="text-gray-400 leading-relaxed max-w-2xl">
                {d.profile_hero_desc}
              </p>
            </div>
            <div className="flex-shrink-0 hidden md:flex items-center gap-2 text-amber-400 font-medium group-hover:gap-3 transition-all">
              {d.profile_hero_cta}
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        </Link>
      </section>

      <FavoritesSection />

      {/* Before the Game */}
      <ToolSection
        icon={Radio}
        iconClass="text-emerald-400"
        title={d.cat_before}
        description={d.cat_before_desc}
        columns={3}
      >
        <ToolCard
          href={`/${locale}/live`}
          icon={Radio}
          title={d.tool_live_title}
          desc={d.tool_live_desc}
          accent="green"
        />
        <ToolCard
          href={`/${locale}/profile`}
          icon={UserCircle}
          title={d.tool_profile_title}
          desc={d.tool_profile_desc}
        />
        <ToolCard
          href={`/${locale}/learn`}
          icon={GraduationCap}
          title={d.tool_learn_title}
          desc={d.tool_learn_desc}
        />
      </ToolSection>

      {/* Game Knowledge */}
      <ToolSection
        icon={BookOpen}
        iconClass="text-purple-400"
        title={d.cat_knowledge}
        description={d.cat_knowledge_desc}
        columns={3}
      >
        <ToolCard
          href={`/${locale}/agent`}
          icon={Swords}
          title={d.tool_agent_title}
          desc={d.tool_agent_desc}
          tag="AI"
          accent="amber"
        />
        <ToolCard
          href={`/${locale}/counters`}
          icon={Shield}
          title={isEs ? "Calculadora de counters" : "Counter calculator"}
          desc={
            isEs
              ? "Qué unidades contrarrestan a cada composición enemiga y qué te cuesta producirlas."
              : "Which units answer any enemy composition, and what producing them actually costs."
          }
          accent="green"
        />
        <ToolCard
          href={`/${locale}/eco`}
          icon={Calculator}
          title={isEs ? "Calculadora de economía" : "Economy calculator"}
          desc={
            isEs
              ? "Cuántos aldeanos necesitas en comida, madera y oro para no parar de producir. Datos reales del juego."
              : "How many villagers each resource needs to keep production running. Straight from the game data."
          }
          tag="New"
          accent="blue"
        />
        <ToolCard
          href={`/${locale}/matchups`}
          icon={Swords}
          title={isEs ? "Enfrentamientos de civs" : "Civ matchups"}
          desc={
            isEs
              ? "Compara dos civilizaciones edad por edad: aperturas, picos de poder y counters clave."
              : "Compare two civilizations age by age: openings, power spikes and the counters that decide it."
          }
        />
        <ToolCard
          href={`/${locale}/techtree`}
          icon={BookOpen}
          title={d.tool_techtree_title}
          desc={d.tool_techtree_desc}
        />
        <ToolCard
          href={`/${locale}/hub`}
          icon={Tv}
          title={isEs ? "Creator Hub" : "Creator Hub"}
          desc={
            isEs
              ? "Los mejores creadores en español e inglés, torneos en curso y qué ha cambiado el último parche."
              : "The best creators in English and Spanish, live tournaments, and what the latest patch changed."
          }
          accent="purple"
        />
      </ToolSection>

      {/* After the Game */}
      <ToolSection
        icon={Upload}
        iconClass="text-blue-400"
        title={d.cat_after}
        description={d.cat_after_desc}
        columns={2}
      >
        <ToolCard
          href={`/${locale}/replay`}
          icon={Upload}
          title={d.tool_replay_title}
          desc={d.tool_replay_desc}
          tag="AI"
          accent="blue"
        />
        <ToolCard
          href={`/${locale}/players`}
          icon={Users}
          title={d.tool_players_title}
          desc={d.tool_players_desc}
        />
      </ToolSection>

      {/* About + FAQ (SEO content) */}
      <HomeSeoContent dict={dict} />

      {/* Stats + Ko-fi */}
      <section className="py-12 border-t border-aoe-border">
        <div className="flex flex-wrap justify-center gap-12 text-gray-400 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">45+</div>
            <div className="text-sm">{d.stat_civs}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">11</div>
            <div className="text-sm">{d.stat_tools}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">ES / EN</div>
            <div className="text-sm">{d.stat_languages}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">100%</div>
            <div className="text-sm">{d.stat_free}</div>
          </div>
        </div>
        <div className="text-center">
          <a
            href="https://ko-fi.com/popeeeeeeeye"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-aoe-accent/20 bg-aoe-accent/5 text-aoe-accent hover:bg-aoe-accent/10 hover:border-aoe-accent/40 transition-all text-sm font-medium"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
              <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
              <line x1="6" x2="6" y1="2" y2="4" />
              <line x1="10" x2="10" y1="2" y2="4" />
              <line x1="14" x2="14" y1="2" y2="4" />
            </svg>
            {isEs
              ? "Apoya este proyecto en Ko-fi"
              : "Support this project on Ko-fi"}
          </a>
        </div>
      </section>
    </div>
  );
}

function ToolSection({
  icon: Icon,
  iconClass,
  title,
  description,
  columns,
  children,
}: {
  icon: typeof Swords;
  iconClass: string;
  title: string;
  description: string;
  columns: 2 | 3;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-16">
      <div className="flex items-center gap-3 mb-1.5">
        <Icon className={`w-5 h-5 ${iconClass}`} />
        <h2 className="text-2xl font-medieval font-bold text-white">{title}</h2>
      </div>
      <p className="text-sm text-gray-500 mb-6 ml-8">{description}</p>
      <div
        className={
          columns === 2
            ? "grid grid-cols-1 md:grid-cols-2 gap-4"
            : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        }
      >
        {children}
      </div>
    </section>
  );
}

interface HomeSeoDict {
  about_title: string;
  about_p1: string;
  about_p2: string;
  faq_title: string;
  faq: { q: string; a: string }[];
}

function HomeSeoContent({ dict }: { dict: Record<string, unknown> }) {
  const seo = dict.home_seo as HomeSeoDict | undefined;
  if (!seo) return null;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: seo.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <section className="py-12 border-t border-aoe-border">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-medieval font-bold text-white mb-4">
          {seo.about_title}
        </h2>
        <p className="text-gray-400 leading-relaxed mb-3">{seo.about_p1}</p>
        <p className="text-gray-400 leading-relaxed mb-10">{seo.about_p2}</p>

        <h2 className="text-2xl font-medieval font-bold text-white mb-6">
          {seo.faq_title}
        </h2>
        <div className="space-y-3">
          {seo.faq.map((item, i) => (
            <details
              key={i}
              className="group rounded-xl border border-aoe-border bg-aoe-card/50 px-5 py-4"
            >
              <summary className="cursor-pointer list-none flex items-center justify-between gap-3 font-semibold text-white">
                {item.q}
                <ChevronRight className="w-4 h-4 text-gray-500 shrink-0 transition-transform group-open:rotate-90" />
              </summary>
              <p className="text-sm text-gray-400 leading-relaxed mt-3">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

const ACCENT_COLORS = {
  amber: {
    bg: "bg-amber-500/10",
    bgHover: "group-hover:bg-amber-500/20",
    text: "text-amber-400",
    border: "hover:border-amber-500/40",
    tagBg: "bg-amber-500/20",
    tagText: "text-amber-400",
  },
  green: {
    bg: "bg-green-500/10",
    bgHover: "group-hover:bg-green-500/20",
    text: "text-green-400",
    border: "hover:border-green-500/40",
    tagBg: "bg-green-500/20",
    tagText: "text-green-400",
  },
  blue: {
    bg: "bg-blue-500/10",
    bgHover: "group-hover:bg-blue-500/20",
    text: "text-blue-400",
    border: "hover:border-blue-500/40",
    tagBg: "bg-blue-500/20",
    tagText: "text-blue-400",
  },
  purple: {
    bg: "bg-purple-500/10",
    bgHover: "group-hover:bg-purple-500/20",
    text: "text-purple-400",
    border: "hover:border-purple-500/40",
    tagBg: "bg-purple-500/20",
    tagText: "text-purple-400",
  },
  default: {
    bg: "bg-aoe-accent/10",
    bgHover: "group-hover:bg-aoe-accent/20",
    text: "text-aoe-accent",
    border: "hover:border-aoe-accent/50",
    tagBg: "bg-aoe-accent/20",
    tagText: "text-aoe-accent",
  },
} as const;

type AccentKey = keyof typeof ACCENT_COLORS;

function ToolCard({
  href,
  icon: Icon,
  title,
  desc,
  tag,
  accent,
}: {
  href: string;
  icon: typeof Swords;
  title: string;
  desc: string;
  tag?: string;
  accent?: AccentKey;
}) {
  const c = ACCENT_COLORS[accent || "default"];

  return (
    <Link
      href={href}
      className={`group card h-full ${c.border} transition-colors duration-200`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex-shrink-0 p-3 rounded-xl ${c.bg} ${c.text} ${c.bgHover} transition-colors`}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="font-semibold text-white group-hover:text-aoe-accent transition-colors">
              {title}
            </h3>
            {tag && (
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${c.tagBg} ${c.tagText}`}
              >
                {tag}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
        </div>
      </div>
    </Link>
  );
}
