"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  Menu, X, Swords, LogOut, User, Upload, BookOpen, Users,
  Trophy, Radio, GraduationCap, UserCircle,
} from "lucide-react";
import { useDictionary, useLocale } from "@/i18n/I18nProvider";
import LanguageSwitcher from "./LanguageSwitcher";

const NAV_KEYS = [
  { path: "/agent", key: "agent" as const, icon: Swords },
  { path: "/replay", key: "replay" as const, icon: Upload },
  { path: "/techtree", key: "techtree" as const, icon: BookOpen },
  { path: "/players", key: "players" as const, icon: Users },
  { path: "/tournaments", key: "tournaments" as const, icon: Trophy },
  { path: "/live", key: "live" as const, icon: Radio },
  { path: "/learn", key: "learn" as const, icon: GraduationCap },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dict = useDictionary();
  const locale = useLocale();
  const { data: session } = useSession();

  const items = NAV_KEYS.map((item) => ({
    href: `/${locale}${item.path}`,
    label: dict.nav[item.key],
    icon: item.icon,
  }));

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
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "nav-link px-3 py-2 rounded-md inline-flex items-center gap-1.5",
                  pathname === item.href && "nav-link-active bg-aoe-accent/10"
                )}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            ))}
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
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        signOut({ callbackUrl: `/${locale}` });
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-aoe-dark/50 transition-colors"
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
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {open && (
          <div className="lg:hidden pb-4 border-t border-aoe-border mt-2 pt-4">
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "nav-link px-3 py-2 rounded-md inline-flex items-center gap-2",
                    pathname === item.href && "nav-link-active bg-aoe-accent/10"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
              {session && (
                <Link
                  href={`/${locale}/profile`}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "nav-link px-3 py-2 rounded-md inline-flex items-center gap-2",
                    pathname === `/${locale}/profile` && "nav-link-active bg-aoe-accent/10"
                  )}
                >
                  <UserCircle className="w-4 h-4" />
                  {dict.nav.profile}
                </Link>
              )}
              <div className="flex items-center justify-between mt-2 px-3">
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
                    onClick={() => setOpen(false)}
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
