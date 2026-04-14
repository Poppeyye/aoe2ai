"use client";

import { createContext, useContext } from "react";
import type { Dictionary } from "./getDictionary";
import type { Locale } from "./config";

interface I18nContextType {
  dict: Dictionary;
  locale: Locale;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({
  dict,
  locale,
  children,
}: I18nContextType & { children: React.ReactNode }) {
  return (
    <I18nContext.Provider value={{ dict, locale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export function useDictionary() {
  return useI18n().dict;
}

export function useLocale() {
  return useI18n().locale;
}
