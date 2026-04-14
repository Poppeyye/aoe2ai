import type { Metadata } from "next";
import { getDictionary } from "@/i18n/getDictionary";
import { isValidLocale, type Locale } from "@/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isValidLocale(params.locale)) return {};
  const dict = await getDictionary(params.locale as Locale);
  const d = dict.tournaments;
  return {
    title: d.title,
    description: d.subtitle,
    openGraph: { title: d.title, description: d.subtitle },
    alternates: {
      languages: {
        en: `/en/tournaments`,
        es: `/es/tournaments`,
      },
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
