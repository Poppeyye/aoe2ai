"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "@/i18n/I18nProvider";
import { locales } from "@/i18n/config";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(newLocale: string) {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    const newPath = segments.join("/");

    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;SameSite=Lax`;
    router.push(newPath);
  }

  return (
    <div className="flex items-center gap-0.5 bg-aoe-dark rounded-lg p-0.5 border border-aoe-border">
      {locales.map((l) => (
        <button
          key={l}
          onClick={() => switchLocale(l)}
          className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase transition-colors ${
            locale === l
              ? "bg-aoe-accent text-aoe-dark"
              : "text-gray-400 hover:text-white"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
