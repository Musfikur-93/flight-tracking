/**
 * filter.types.ts
 * ───────────────
 * Type definitions for all flight search & filter parameters.
 * Consumed by IFlightService, Zustand store, and API query strings.
 */

import type { FlightStatus } from "./flight.types";

// ═══════════════════════════════════════════════════════════════════════════
// FILTER PARAMETERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * FlightFilterParams
 * ──────────────────
 * Composable, all-optional filter criteria passed to the data service.
 * Undefined fields are treated as "no constraint" (match all).
 *
 * @example
 * // Only show active international flights above 30,000 ft
 * const filters: FlightFilterParams = {
 *   status: ["active"],
 *   isDomestic: false,
 *   minAltitudeFt: 30000,
 * };
 */
export interface FlightFilterParams {
  /**
   * Free-text search string.
   * Matched against: flight number, callsign, airline name,
   * origin city/IATA, destination city/IATA.
   * e.g. "BG001", "Dhaka", "Emirates"
   */
  query?: string;

  /**
   * Filter by one or more operational statuses.
   * An empty array or undefined matches all statuses.
   * e.g. ["active", "delayed"]
   */
  status?: FlightStatus[];

  /**
   * Filter by IATA airline code.
   * e.g. "BG" for Biman Bangladesh, "EK" for Emirates.
   */
  airlineIata?: string;

  /**
   * Minimum altitude threshold in feet (inclusive).
   * Flights at or above this altitude are included.
   * e.g. 30000 to show only high-altitude cruise traffic.
   */
  minAltitudeFt?: number;

  /**
   * Maximum altitude threshold in feet (inclusive).
   * Flights at or below this altitude are included.
   */
  maxAltitudeFt?: number;

  /**
   * When true  → show only domestic flights (same country origin & destination).
   * When false → show only international flights.
   * When undefined → no filter applied.
   */
  isDomestic?: boolean;

  /**
   * Filter by origin airport IATA code.
   * e.g. "DAC" to see all departures from Dhaka.
   */
  originIata?: string;

  /**
   * Filter by destination airport IATA code.
   * e.g. "LHR" to see all flights headed to London Heathrow.
   */
  destinationIata?: string;

  /**
   * Maximum number of results to return.
   * Defaults to unlimited when undefined.
   */
  limit?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// QUICK FILTER PRESETS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Named filter presets that map to a FlightFilterParams object.
 * Drives the quick-filter chips in the FlightFilterBar UI.
 */
export type QuickFilterId =
  | "all"
  | "airborne"
  | "domestic"
  | "international"
  | "delayed"
  | "longHaul";

/**
 * Preset definitions for each QuickFilterId.
 */
export const QUICK_FILTER_PRESETS: Record<QuickFilterId, FlightFilterParams> = {
  all: {},

  airborne: {
    status: ["active"],
  },

  domestic: {
    isDomestic: true,
  },

  international: {
    isDomestic: false,
  },

  delayed: {
    status: ["delayed"],
  },

  longHaul: {
    isDomestic: false,
    minAltitudeFt: 30000,
    status: ["active"],
  },
};

/** Display metadata for rendering filter chips in the UI */
export interface QuickFilter {
  id: QuickFilterId;
  label: string;
  icon?: string;
  params: FlightFilterParams;
}

export const QUICK_FILTERS: QuickFilter[] = [
  { id: "all",           label: "All Flights",        icon: "🌐", params: QUICK_FILTER_PRESETS.all },
  { id: "airborne",      label: "In Flight",          icon: "✈️", params: QUICK_FILTER_PRESETS.airborne },
  { id: "domestic",      label: "Domestic",           icon: "🏠", params: QUICK_FILTER_PRESETS.domestic },
  { id: "international", label: "International",      icon: "🌍", params: QUICK_FILTER_PRESETS.international },
  { id: "delayed",       label: "Delayed",            icon: "⏳", params: QUICK_FILTER_PRESETS.delayed },
  { id: "longHaul",      label: "Long Haul",          icon: "🛫", params: QUICK_FILTER_PRESETS.longHaul },
];

// ═══════════════════════════════════════════════════════════════════════════
// SORT OPTIONS
// ═══════════════════════════════════════════════════════════════════════════

export type SortField =
  | "flightNumber"
  | "airline"
  | "origin"
  | "destination"
  | "status"
  | "altitude"
  | "speed"
  | "progress";

export type SortDirection = "asc" | "desc";

export interface SortParams {
  field: SortField;
  direction: SortDirection;
}

