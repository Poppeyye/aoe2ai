"use client";

import Link from "next/link";
import { Heart, ExternalLink, MessageCircle, Shield } from "lucide-react";
import { useDictionary, useLocale } from "@/i18n/I18nProvider";

export default function Footer() {
  const dict = useDictionary();
  const locale = useLocale();
  const d = dict.footer;

  return (
    <footer className="border-t border-aoe-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-gray-500">
          <div className="text-center md:text-left">
            <p className="flex items-center justify-center md:justify-start gap-1">
              {d.passion} <Heart className="w-4 h-4 text-red-500 fill-red-500" /> {d.for_community}
            </p>
            <p className="mt-2 text-gray-600">{d.no_ads}</p>
          </div>

          <div className="text-center">
            <p>
              {d.built_by}{" "}
              <a
                href="https://www.aoe2insights.com/user/12154050/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-aoe-accent hover:text-yellow-400 font-medium transition-colors"
              >
                popeeeeeeeye
              </a>{" "}
              {d.with_love}
            </p>
            <div className="flex items-center justify-center gap-4 mt-2">
              <a
                href="https://discordapp.com/users/777171410903629824"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[#5865F2] hover:text-[#7289DA] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                {d.contact}
              </a>
              <a
                href="https://ko-fi.com/popeeeeeeeye"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-aoe-accent hover:text-yellow-400 transition-colors"
              >
                <Heart className="w-4 h-4" />
                Ko-fi
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="text-center md:text-right space-y-2">
            <a
              href="https://ko-fi.com/popeeeeeeeye"
              target="_blank"
              rel="noopener noreferrer"
              className="text-aoe-accent hover:text-yellow-400 transition-colors font-medium"
            >
              {d.support}
            </a>
            <div>
              <Link
                href={`/${locale}/privacy`}
                className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-400 transition-colors text-xs"
              >
                <Shield className="w-3 h-3" />
                {locale === "es" ? "Privacidad" : "Privacy"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
