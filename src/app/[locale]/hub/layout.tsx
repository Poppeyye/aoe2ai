import type { Metadata } from "next";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isEs = locale === "es";
  const title = isEs
    ? "AoE2 Creator Hub — Los Mejores Creadores, Guías de YouTube y Torneos | AoE2.ai"
    : "AoE2 Creator Hub — Top YouTube Creators, Video Guides & Tournament Tracker | AoE2.ai";
  const description = isEs
    ? "Descubre los mejores creadores de contenido de Age of Empires II en español e inglés: NachoAoE, Mario Valle, Tatoh, Spirit of the Law, Hera, TheViper, T90 y seguimiento de torneos mundiales."
    : "Explore the best Age of Empires II content creators in English & Spanish: Hera, TheViper, Spirit of the Law, T90, NachoAoE, Mario Valle, Tatoh, plus pro tournament tracking.";

  return {
    title,
    description,
    alternates: {
      canonical: `https://aoe2.ai/${locale}/hub`,
      languages: {
        en: "https://aoe2.ai/en/hub",
        es: "https://aoe2.ai/es/hub",
      },
    },
    openGraph: {
      title,
      description,
      url: `https://aoe2.ai/${locale}/hub`,
      type: "website",
    },
  };
}

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
