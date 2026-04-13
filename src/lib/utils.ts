import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatGameTime(timestampMs: number): string {
  return new Date(timestampMs * 1000).toLocaleString();
}

export function winRate(wins: number, losses: number): string {
  const total = wins + losses;
  if (total === 0) return "0%";
  return `${((wins / total) * 100).toFixed(1)}%`;
}

export function ratingChange(change: number): string {
  if (change > 0) return `+${change}`;
  return `${change}`;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
