"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFavorites, type FavoriteType } from "@/hooks/useFavorites";

interface FavoriteButtonProps {
  type: FavoriteType;
  id: string;
  name: string;
  meta?: Record<string, unknown>;
  size?: "sm" | "md";
  className?: string;
}

export default function FavoriteButton({
  type,
  id,
  name,
  meta,
  size = "md",
  className,
}: FavoriteButtonProps) {
  const { toggle, isFavorite } = useFavorites();
  const active = isFavorite(type, id);

  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <button
      onClick={(e) => {
        // Prevent navigation when rendered inside a Link card
        e.preventDefault();
        e.stopPropagation();
        toggle(type, id, name, meta);
      }}
      className={cn(
        "transition-colors",
        active
          ? "text-yellow-400 hover:text-yellow-300"
          : "text-gray-600 hover:text-yellow-400",
        className,
      )}
      title={active ? "Remove from favorites" : "Add to favorites"}
    >
      <Star className={cn(iconSize, active && "fill-current")} />
    </button>
  );
}
