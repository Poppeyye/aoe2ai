import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "@/i18n/config";

const PUBLIC_FILE = /\.(.*)$/;

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

const BOT_UA_PATTERNS = [
  /curl\//i,
  /python-requests/i,
  /scrapy/i,
  /wget\//i,
  /httpclient/i,
  /java\//i,
  /libwww-perl/i,
  /php\//i,
];

function isBlockedBot(ua: string | null): boolean {
  if (!ua || ua.length < 5) return true;
  return BOT_UA_PATTERNS.some((pattern) => pattern.test(ua));
}

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

function addSecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Block abusive bots on API routes (allow search engine crawlers and legitimate tools)
  if (pathname.startsWith("/api")) {
    const ua = request.headers.get("user-agent");
    if (isBlockedBot(ua)) {
      return new NextResponse(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
    return addSecurityHeaders(NextResponse.next());
  }

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return addSecurityHeaders(NextResponse.next());

  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  const locale =
    cookieLocale && locales.includes(cookieLocale as (typeof locales)[number])
      ? cookieLocale
      : getLocaleFromHeaders(request);

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  return addSecurityHeaders(NextResponse.redirect(url));
}

export const config = {
  matcher: ["/((?!_next|favicon\\.ico|.*\\..*).*)"],
};
