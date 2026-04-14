import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "@/i18n/config";

const PUBLIC_FILE = /\.(.*)$/;

function getLocaleFromHeaders(request: NextRequest): string {
  const acceptLang = request.headers.get("accept-language");
  if (!acceptLang) return defaultLocale;

  const preferred = acceptLang
    .split(",")
    .map((lang) => {
      const [code, q] = lang.trim().split(";q=");
      return { code: code.split("-")[0].toLowerCase(), q: q ? parseFloat(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { code } of preferred) {
    if (locales.includes(code as (typeof locales)[number])) return code;
  }
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return NextResponse.next();

  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  const locale =
    cookieLocale && locales.includes(cookieLocale as (typeof locales)[number])
      ? cookieLocale
      : getLocaleFromHeaders(request);

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|favicon\\.ico|.*\\..*).*)"],
};
