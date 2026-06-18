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
