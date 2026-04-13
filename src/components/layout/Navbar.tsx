"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Menu, X, Swords } from "lucide-react";

const NAV_ITEMS = [
  { href: "/agent", label: "Agent" },
  { href: "/replay", label: "Replay Analyzer" },
  { href: "/techtree", label: "Tech Tree" },
  { href: "/players", label: "Players" },
  { href: "/tournaments", label: "Tournaments" },
  { href: "/live", label: "Live Tracker" },
  { href: "/learn", label: "Academy" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-aoe-dark/95 backdrop-blur-md border-b border-aoe-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <Swords className="w-6 h-6 text-aoe-accent group-hover:rotate-12 transition-transform" />
            <span className="font-medieval text-xl font-bold gold-gradient">
              AoE2.ai
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "nav-link px-3 py-2 rounded-md",
                  pathname === item.href && "nav-link-active bg-aoe-accent/10"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link href="/login" className="btn-secondary text-sm !px-4 !py-2">
              Login
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile nav */}
        {open && (
          <div className="lg:hidden pb-4 border-t border-aoe-border mt-2 pt-4">
            <div className="flex flex-col gap-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "nav-link px-3 py-2 rounded-md",
                    pathname === item.href && "nav-link-active bg-aoe-accent/10"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <Link href="/login" className="btn-secondary text-sm text-center mt-2">
                Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
