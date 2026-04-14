import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SessionProvider from "@/components/auth/SessionProvider";
import { I18nProvider } from "@/i18n/I18nProvider";
import { getDictionary } from "@/i18n/getDictionary";
import { locales, type Locale, isValidLocale } from "@/i18n/config";

const inter = Inter({ subsets: ["latin"] });

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isValidLocale(params.locale)) return {};
  const dict = await getDictionary(params.locale);

  return {
    title: {
      default: dict.meta.title,
      template: `%s | AoE2.ai`,
    },
    description: dict.meta.description,
    metadataBase: new URL("https://aoe2.ai"),
    openGraph: {
      title: dict.meta.og_title,
      description: dict.meta.og_description,
      url: "https://aoe2.ai",
      siteName: "AoE2.ai",
      type: "website",
    },
    alternates: {
      languages: {
        en: "/en",
        es: "/es",
        "x-default": "/en",
      },
    },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!isValidLocale(params.locale)) notFound();

  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);

  return (
    <div className={`${inter.className} min-h-screen flex flex-col dark`}>
      <SessionProvider>
        <I18nProvider dict={dict} locale={locale}>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </I18nProvider>
      </SessionProvider>
    </div>
  );
}
