"use client";

import Link from "next/link";
import { Star, Users, BookOpen, Swords } from "lucide-react";
import { useFavorites, type FavoriteType } from "@/hooks/useFavorites";
import { useLocale, useDictionary } from "@/i18n/I18nProvider";

const TYPE_ICON: Record<FavoriteType, typeof Star> = {
  player: Users,
  civ: Swords,
  buildorder: BookOpen,
};

const TYPE_ROUTE: Record<FavoriteType, string> = {
  player: "/players",
  civ: "/techtree",
  buildorder: "/learn",
};

export default function FavoritesSection() {
  const { favorites } = useFavorites();
  const locale = useLocale();
  const dict = useDictionary();

  if (favorites.length === 0) return null;

  const grouped: Record<FavoriteType, typeof favorites> = {
    player: [],
    civ: [],
    buildorder: [],
  };
  for (const f of favorites) {
    grouped[f.type].push(f);
  }

  return (
    <section className="mt-12 mb-8">
      <div className="flex items-center gap-2 mb-6">
        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
        <h2 className="text-xl font-medieval font-bold gold-gradient">
          {dict.home.favorites ?? "Your Favorites"}
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(["player", "civ", "buildorder"] as FavoriteType[]).map((type) => {
          const items = grouped[type];
          if (items.length === 0) return null;
          const Icon = TYPE_ICON[type];
          const route = TYPE_ROUTE[type];
          return (
            <div key={type} className="card">
              <div className="flex items-center gap-2 mb-3 text-sm text-gray-400">
                <Icon className="w-4 h-4" />
                <span className="uppercase tracking-wider">
                  {type === "player" && (dict.nav.players ?? "Players")}
                  {type === "civ" && (dict.nav.techtree ?? "Tech Tree")}
                  {type === "buildorder" && (dict.nav.learn ?? "Build Orders")}
                </span>
              </div>
              <div className="space-y-2">
                {items.slice(0, 5).map((f) => (
                  <Link
                    key={f.id}
                    href={`/${locale}${route}`}
                    className="flex items-center gap-2 text-sm text-gray-300 hover:text-aoe-accent transition-colors"
                  >
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 shrink-0" />
                    {f.name}
                  </Link>
                ))}
                {items.length > 5 && (
                  <span className="text-xs text-gray-500">+{items.length - 5} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
