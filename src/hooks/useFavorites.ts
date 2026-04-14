"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

export type FavoriteType = "player" | "civ" | "buildorder";

export interface FavoriteItem {
  type: FavoriteType;
  id: string;
  name: string;
  meta?: Record<string, unknown>;
  addedAt: number;
}

function getStorageKey(userId: string): string {
  return `aoe2ai_favorites_${userId}`;
}

function loadFavorites(userId: string): FavoriteItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFavorites(userId: string, items: FavoriteItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(getStorageKey(userId), JSON.stringify(items));
}

export function useFavorites() {
  const { data: session } = useSession();
  const userId = session?.user?.email || "anonymous";
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    setFavorites(loadFavorites(userId));
  }, [userId]);

  const add = useCallback(
    (type: FavoriteType, id: string, name: string, meta?: Record<string, unknown>) => {
      setFavorites((prev) => {
        const exists = prev.some((f) => f.type === type && f.id === id);
        if (exists) return prev;
        const next = [...prev, { type, id, name, meta, addedAt: Date.now() }];
        saveFavorites(userId, next);
        return next;
      });
    },
    [userId],
  );

  const remove = useCallback(
    (type: FavoriteType, id: string) => {
      setFavorites((prev) => {
        const next = prev.filter((f) => !(f.type === type && f.id === id));
        saveFavorites(userId, next);
        return next;
      });
    },
    [userId],
  );

  const toggle = useCallback(
    (type: FavoriteType, id: string, name: string, meta?: Record<string, unknown>) => {
      const exists = favorites.some((f) => f.type === type && f.id === id);
      if (exists) remove(type, id);
      else add(type, id, name, meta);
    },
    [favorites, add, remove],
  );

  const isFavorite = useCallback(
    (type: FavoriteType, id: string) => favorites.some((f) => f.type === type && f.id === id),
    [favorites],
  );

  const getByType = useCallback(
    (type: FavoriteType) => favorites.filter((f) => f.type === type),
    [favorites],
  );

  return { favorites, add, remove, toggle, isFavorite, getByType };
}
