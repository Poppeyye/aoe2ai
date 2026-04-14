"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useLocale } from "@/i18n/I18nProvider";

export function useRequireAuth() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const locale = useLocale();

  const loginUrl = `/${locale}/login?callbackUrl=${encodeURIComponent(pathname)}`;

  return {
    session,
    status,
    isAuthenticated: !!session,
    isLoading: status === "loading",
    loginUrl,
  };
}
