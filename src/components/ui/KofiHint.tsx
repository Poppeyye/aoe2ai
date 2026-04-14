"use client";

import { Heart } from "lucide-react";
import { useLocale } from "@/i18n/I18nProvider";

export default function KofiHint() {
  const locale = useLocale();

  return (
    <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-aoe-accent/5 border border-aoe-accent/10 text-sm text-gray-500">
      <Heart className="w-3.5 h-3.5 text-aoe-accent shrink-0" />
      <span>
        {locale === "es"
          ? "¿Te resulta útil?"
          : "Finding this useful?"}{" "}
        <a
          href="https://ko-fi.com/popeeeeeeeye"
          target="_blank"
          rel="noopener noreferrer"
          className="text-aoe-accent hover:text-yellow-400 font-medium transition-colors"
        >
          {locale === "es" ? "Apoya el proyecto" : "Support the project"}
        </a>
      </span>
    </div>
  );
}
