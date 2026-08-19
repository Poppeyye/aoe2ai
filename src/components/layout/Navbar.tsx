"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  Menu, X, Swords, LogOut, User, Upload, BookOpen, Users,
  Radio, GraduationCap, UserCircle, Shield, BarChart3, Tv,
  Calculator, ChevronDown,
} from "lucide-react";
import { useDictionary, useLocale } from "@/i18n/I18nProvider";
import { isAdminEmail } from "@/lib/admin";
import LanguageSwitcher from "./LanguageSwitcher";

const PRIMARY_LINKS = [
  { path: "/agent", key: "agent" as const, icon: Swords },
  { path: "/live", key: "live" as const, icon: Radio },
  { path: "/replay", key: "replay" as const, icon: Upload },
  { path: "/learn", key: "learn" as const, icon: GraduationCap },
];

const TOOL_LINKS = [
  { path: "/counters", key: "counters" as const, icon: Shield },
  { path: "/eco", key: "eco" as const, icon: Calculator },
  { path: "/matchups", key: "matchups" as const, icon: Swords },
  { path: "/techtree", key: "techtree" as const, icon: BookOpen },
  { path: "/hub", key: "hub" as const, icon: Tv },
  { path: "/players", key: "players" as const, icon: Users },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dict = useDictionary();
  const locale = useLocale();
  const { data: session } = useSession();

  useEffect(() => {
    setToolsOpen(false);
    setUserMenuOpen(false);
    setOpen(false);
  }, [pathname]);

  const href = (path: string) => `/${locale}${path}`;
  const isActive = (path: string) => pathname === href(path);
  const toolsActive = TOOL_LINKS.some((item) => isActive(item.path));

  return (
    <nav className="sticky top-0 z-50 bg-aoe-dark/95 backdrop-blur-md border-b border-aoe-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href={`/${locale}`} className="flex items-center gap-2 group">
            <Swords className="w-6 h-6 text-aoe-accent group-hover:rotate-12 transition-transform" />
            <span className="font-medieval text-xl font-bold gold-gradient">
              AoE2.ai
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {PRIMARY_LINKS.map((item) => (
              <Link
                key={item.path}
                href={href(item.path)}
                className={cn(
                  "nav-link px-3 py-2 rounded-md inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-medium",
                  isActive(item.path) && "nav-link-active bg-aoe-accent/10"
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{dict.nav[item.key]}</span>
              </Link>
            ))}

            <div className="relative">
              <button
                onClick={() => setToolsOpen(!toolsOpen)}
                className={cn(
                  "nav-link px-3 py-2 rounded-md inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-medium",
                  (toolsOpen || toolsActive) && "nav-link-active bg-aoe-accent/10"
                )}
              >
                <span>{locale === "es" ? "Herramientas" : "Tools"}</span>
                <ChevronDown
                  className={cn("w-3.5 h-3.5 transition-transform", toolsOpen && "rotate-180")}
                />
              </button>

              {toolsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setToolsOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute left-0 mt-2 w-56 rounded-xl border border-aoe-border bg-aoe-card shadow-2xl overflow-hidden z-20 py-1">
                    {TOOL_LINKS.map((item) => (
                      <Link
                        key={item.path}
                        href={href(item.path)}
                        onClick={() => setToolsOpen(false)}
                        className={cn(
                          "flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors",
                          isActive(item.path)
                            ? "text-aoe-accent bg-aoe-accent/10"
                            : "text-gray-400 hover:text-white hover:bg-aoe-dark/60"
                        )}
                      >
                        <item.icon className="w-4 h-4 shrink-0" />
                        {dict.nav[item.key]}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <LanguageSwitcher />
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-aoe-border hover:border-aoe-accent/50 transition-colors"
                >
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt=""
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <User className="w-5 h-5 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-300 max-w-[120px] truncate">
                    {session.user?.name || session.user?.email}
                  </span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg border border-aoe-border bg-aoe-card shadow-xl">
                    <div className="px-4 py-3 border-b border-aoe-border">
                      <div className="text-sm text-white font-medium truncate">
                        {session.user?.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {session.user?.email}
                      </div>
                    </div>
                    <Link
                      href={`/${locale}/profile`}
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-aoe-dark/50 transition-colors"
                    >
                      <UserCircle className="w-4 h-4" /> {dict.nav.profile}
                    </Link>
                    {isAdminEmail(session.user?.email) && (
                      <Link
                        href={`/${locale}/admin`}
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-aoe-accent hover:text-yellow-300 hover:bg-aoe-accent/10 transition-colors font-medium border-t border-aoe-border/50"
                      >
                        <BarChart3 className="w-4 h-4" /> {locale === "es" ? "Panel Admin" : "Admin Hub"}
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        signOut({ callbackUrl: `/${locale}` });
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-aoe-dark/50 transition-colors border-t border-aoe-border/50"
                    >
                      <LogOut className="w-4 h-4" /> {dict.login.signout}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href={`/${locale}/login?callbackUrl=${encodeURIComponent(pathname)}`} className="btn-secondary text-sm !px-4 !py-2">
                {dict.nav.login}
              </Link>
            )}
          </div>

          <button
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {open && (
          <div className="lg:hidden pb-4 border-t border-aoe-border mt-2 pt-4">
            <div className="flex flex-col gap-1">
              {PRIMARY_LINKS.map((item) => (
                <Link
                  key={item.path}
                  href={href(item.path)}
                  className={cn(
                    "nav-link px-3 py-2 rounded-md inline-flex items-center gap-2",
                    isActive(item.path) && "nav-link-active bg-aoe-accent/10"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {dict.nav[item.key]}
                </Link>
              ))}

              <div className="mt-3 mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                {locale === "es" ? "Herramientas" : "Tools"}
              </div>
              {TOOL_LINKS.map((item) => (
                <Link
                  key={item.path}
                  href={href(item.path)}
                  className={cn(
                    "nav-link px-3 py-2 rounded-md inline-flex items-center gap-2",
                    isActive(item.path) && "nav-link-active bg-aoe-accent/10"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {dict.nav[item.key]}
                </Link>
              ))}

              {session && (
                <Link
                  href={`/${locale}/profile`}
                  className={cn(
                    "nav-link px-3 py-2 rounded-md inline-flex items-center gap-2 mt-3",
                    isActive("/profile") && "nav-link-active bg-aoe-accent/10"
                  )}
                >
                  <UserCircle className="w-4 h-4" />
                  {dict.nav.profile}
                </Link>
              )}
              {session && isAdminEmail(session.user?.email) && (
                <Link
                  href={`/${locale}/admin`}
                  className={cn(
                    "nav-link px-3 py-2 rounded-md inline-flex items-center gap-2 text-aoe-accent",
                    isActive("/admin") && "nav-link-active bg-aoe-accent/10"
                  )}
                >
                  <BarChart3 className="w-4 h-4" />
                  {locale === "es" ? "Panel Admin" : "Admin Hub"}
                </Link>
              )}
              <div className="flex items-center justify-between mt-3 px-3">
                <LanguageSwitcher />
                {session ? (
                  <button
                    onClick={() => {
                      setOpen(false);
                      signOut({ callbackUrl: `/${locale}` });
                    }}
                    className="btn-secondary text-sm flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> {dict.login.signout}
                  </button>
                ) : (
                  <Link
                    href={`/${locale}/login?callbackUrl=${encodeURIComponent(pathname)}`}
                    className="btn-secondary text-sm"
                  >
                    {dict.nav.login}
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
