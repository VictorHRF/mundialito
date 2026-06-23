import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const MATCH_TIME_ZONE = "America/Mexico_City";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMatchDate(value: string) {
  const formatted = new Intl.DateTimeFormat("es-MX", {
    timeZone: MATCH_TIME_ZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));

  return `${formatted} · hora CDMX`;
}

export function isPredictionLocked(matchDate: string) {
  return new Date() >= new Date(matchDate);
}

export function getMatchDayInMexicoCity(value: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: MATCH_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

export function isGroupStage(stage: string) {
  const normalized = stage.toLowerCase();
  return normalized.includes("group") || normalized.includes("grupo");
}
