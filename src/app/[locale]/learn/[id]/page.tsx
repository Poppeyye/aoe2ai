import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BUILD_ORDERS, getBuildOrder } from "@/lib/aoe2/build-orders";
import BuildOrderDetail from "@/components/learn/BuildOrderDetail";
import { isValidLocale } from "@/i18n/config";
import { locales } from "@/i18n/config";

interface PageProps {
  params: { locale: string; id: string };
}

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    BUILD_ORDERS.map((bo) => ({ locale, id: bo.id })),
  );
}

export function generateMetadata({ params }: PageProps): Metadata {
  if (!isValidLocale(params.locale)) return {};
  const bo = getBuildOrder(params.id);
  if (!bo) return {};

  const isEs = params.locale === "es";
  const name = isEs ? bo.nameEs : bo.name;
  const title = isEs
    ? `${name} — Build Order AoE2 DE paso a paso`
    : `${name} — AoE2 DE Build Order Step by Step`;
  const description = isEs
    ? `Build order ${name} para Age of Empires II: guía paso a paso con ${bo.steps.length} pasos, temporizador de práctica y consejos. Ideal para ${bo.maps.join(", ")} con ${bo.civs.slice(0, 3).join(", ")}.`
    : `${name} build order for Age of Empires II: step-by-step guide with ${bo.steps.length} steps, practice timer, and tips. Great on ${bo.maps.join(", ")} with ${bo.civs.slice(0, 3).join(", ")}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://aoe2.ai/${params.locale}/learn/${bo.id}`,
      images: [{ url: "https://aoe2.ai/og-image.png", width: 1200, height: 630 }],
    },
    alternates: {
      canonical: `https://aoe2.ai/${params.locale}/learn/${bo.id}`,
      languages: {
        en: `/en/learn/${bo.id}`,
        es: `/es/learn/${bo.id}`,
      },
    },
  };
}

export default function BuildOrderPage({ params }: PageProps) {
  if (!isValidLocale(params.locale)) notFound();
  const bo = getBuildOrder(params.id);
  if (!bo) notFound();

  const isEs = params.locale === "es";
  const name = isEs ? bo.nameEs : bo.name;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description: isEs
      ? `Build order ${name} para Age of Empires II: Definitive Edition`
      : `${name} build order for Age of Empires II: Definitive Edition`,
    inLanguage: params.locale,
    step: bo.steps.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: `${step.pop !== "—" ? `Pop ${step.pop}: ` : ""}${isEs ? step.taskEs : step.task}`,
    })),
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BuildOrderDetail bo={bo} locale={params.locale} />
    </div>
  );
}
