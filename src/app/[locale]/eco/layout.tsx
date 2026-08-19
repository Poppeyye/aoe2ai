import type { Metadata } from "next";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isEs = locale === "es";
  const title = isEs
    ? "Calculadora de Economía AoE2 — Aldeanos, Granjas y Tasas Reales | AoE2.ai"
    : "AoE2 Economy Calculator — Villagers, Farms & Real Gather Rates | AoE2.ai";
  const description = isEs
    ? "Calcula cuántos aldeanos necesitas en comida, madera y oro para producir sin parar en Age of Empires II. Costes de unidades, tiempos de creación, tasas de recolección y coste real de resembrar granjas, con datos del juego."
    : "Work out exactly how many villagers you need on food, wood and gold to keep production running in Age of Empires II. Real unit costs, training times, gather rates and the true wood cost of reseeding farms.";

  return {
    title,
    description,
    alternates: {
      canonical: `https://aoe2.ai/${locale}/eco`,
      languages: {
        en: "https://aoe2.ai/en/eco",
        es: "https://aoe2.ai/es/eco",
      },
    },
    openGraph: {
      title,
      description,
      url: `https://aoe2.ai/${locale}/eco`,
      type: "website",
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
