"use client";

import { Heart } from "lucide-react";
import { useDictionary } from "@/i18n/I18nProvider";

export default function Footer() {
  const dict = useDictionary();
  const d = dict.footer;

  return (
    <footer className="border-t border-aoe-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 text-center text-sm text-gray-500">
        <p className="flex items-center justify-center gap-1">
          {d.passion} <Heart className="w-4 h-4 text-red-500 fill-red-500" /> {d.for_community}
        </p>
        <p className="mt-2">{d.no_ads}</p>
        <p className="mt-3">
          <a
            href="https://ko-fi.com/popeeeeeeeye"
            target="_blank"
            rel="noopener noreferrer"
            className="text-aoe-accent hover:text-yellow-400 transition-colors"
          >
            {d.support}
          </a>
        </p>
      </div>
    </footer>
  );
}
