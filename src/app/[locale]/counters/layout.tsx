import type { Metadata } from "next";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isEs = locale === "es";
  const title = isEs
    ? "Calculadora de Counters y Balance de Aldeanos AoE2 | AoE2.ai"
    : "AoE2 Counter Calculator & Villager Macro Balancer | AoE2.ai";
  const description = isEs
    ? "Calcula en tiempo real la mejor composición de unidades de contraataque y el número exacto de aldeanos en granjas, madera y oro para mantener producción militar continua en Age of Empires II."
    : "Calculate optimal unit counter compositions and exact villager distribution on food, wood, and gold to sustain continuous military production in Age of Empires II.";

  return {
    title,
    description,
    alternates: {
      canonical: `https://aoe2.ai/${locale}/counters`,
      languages: {
        en: "https://aoe2.ai/en/counters",
        es: "https://aoe2.ai/es/counters",
        "x-default": "https://aoe2.ai/en/counters",
      },
    },
    openGraph: {
      title,
      description,
      url: `https://aoe2.ai/${locale}/counters`,
      type: "website",
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
