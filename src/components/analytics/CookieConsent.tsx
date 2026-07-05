"use client";

import { useState, useEffect } from "react";
import { Cookie } from "lucide-react";
import { useDictionary } from "@/i18n/I18nProvider";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export default function CookieConsent() {
  const dict = useDictionary();
  const d = (dict as unknown as Record<string, Record<string, string>>).cookies;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem("cookie-consent")) {
        setVisible(true);
      }
    } catch {
      // localStorage unavailable — don't show the banner
    }
  }, []);

  if (!visible || !d) return null;

  function decide(consent: "granted" | "denied") {
    try {
      localStorage.setItem("cookie-consent", consent);
    } catch {
      // ignore
    }
    window.gtag?.("consent", "update", { analytics_storage: consent });
    setVisible(false);
  }

  return (
    <div
      role="dialog"
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:max-w-md z-[100] rounded-xl border border-aoe-border bg-aoe-card shadow-2xl p-4"
    >
      <div className="flex items-start gap-3">
        <Cookie className="w-5 h-5 text-aoe-accent shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-300 leading-relaxed mb-3">{d.message}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => decide("granted")}
              className="btn-primary !px-4 !py-1.5 text-sm"
            >
              {d.accept}
            </button>
            <button
              onClick={() => decide("denied")}
              className="btn-secondary !px-4 !py-1.5 text-sm"
            >
              {d.reject}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
