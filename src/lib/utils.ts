import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn — className utility
 * ──────────────────────
 * Combines clsx conditional class logic with tailwind-merge conflict resolution.
 * Use throughout the project instead of raw template literals.
 *
 * @example
 * cn("base-class", isActive && "active-class", className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * formatKnots — Convert knots to km/h
 */
export function knotsToKmh(knots: number): number {
  return Math.round(knots * 1.852);
}

/**
 * formatAltitude — Format altitude with comma separators
 */
export function formatAltitude(feet: number): string {
  return feet.toLocaleString("en-US") + " ft";
}

/**
 * formatSpeed — Format speed with unit labels
 */
export function formatSpeed(knots: number): string {
  return `${knots} KTS / ${knotsToKmh(knots)} KM/H`;
}

/**
 * formatBearing — Convert bearing degrees to compass direction
 */
export function bearingToCompass(deg: number): string {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
                      "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round(((deg % 360) + 360) % 360 / 22.5) % 16;
  return directions[index];
}

/**
 * formatVerticalRate — Format vertical speed with sign and unit
 */
export function formatVerticalRate(fpm: number): string {
  const sign = fpm >= 0 ? "+" : "";
  return `${sign}${fpm.toLocaleString("en-US")} FPM`;
}

/**
 * formatDuration — Format a duration in minutes to "Xh Ym" string
 */
export function formatDuration(minutes: number): string {
  const h = Math.floor(Math.abs(minutes) / 60);
  const m = Math.abs(minutes) % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

/**
 * clamp — Constrain a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

