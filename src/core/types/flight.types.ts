/**
 * flight.types.ts
 * ───────────────
 * Core domain contracts for the Flight Tracker system.
 * All UI, simulation, and adapter code references ONLY these types —
 * never raw API payloads. This is the single source of truth.
 */

// ═══════════════════════════════════════════════════════════════════════════
// PRIMITIVES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * WGS-84 geographic coordinate pair.
 * Latitude: -90 to +90, Longitude: -180 to +180
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// FLIGHT STATUS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Operational state of a flight at any given moment.
 *
 * - scheduled  : Flight is booked but has not departed yet.
 * - active     : Airborne and en-route.
 * - landed     : Has touched down at destination.
 * - delayed    : Departure or arrival pushed back; may be airborne.
 * - diverted   : Redirected to an airport other than the planned destination.
 */
export type FlightStatus =
  | "scheduled"
  | "active"
  | "landed"
  | "delayed"
  | "diverted";

// ═══════════════════════════════════════════════════════════════════════════
// TELEMETRY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Real-time avionics data for an airborne aircraft.
 * Updated every simulation tick or API poll cycle.
 */
export interface Telemetry {
  /** Barometric altitude in feet above mean sea level (AMSL). e.g. 36000 */
  altitudeFeet: number;

  /** Over-ground speed in knots. e.g. 485 */
  groundSpeedKnots: number;

  /**
   * Vertical speed in feet per minute.
   * Positive  → climbing  (+2000 fpm typical climb)
   * Negative  → descending (-1800 fpm typical descent)
   * Near zero → level cruise
   */
  verticalRateFpm: number;

  /**
   * Magnetic/true heading the aircraft nose points toward.
   * Range: 0 (North) → 359 degrees, clockwise.
   */
  headingDegrees: number;

  /**
   * Mode-S transponder squawk code (4 octal digits).
   * Special codes: "7500" hijack, "7600" radio failure, "7700" emergency.
   * "1200" is the default VFR code.
   */
  squawkCode?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// AIRPORT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Airport entity with ICAO/IATA identifiers, human-readable labels,
 * and precise geographic coordinates.
 */
export interface Airport {
  /** 3-letter IATA code. e.g. "DAC", "JFK", "LHR" */
  iata: string;

  /** 4-letter ICAO code. e.g. "VGHS", "KJFK", "EGLL" */
  icao: string;

  /** Full official airport name. e.g. "Hazrat Shahjalal International Airport" */
  name: string;

  /** City/municipality served. e.g. "Dhaka" */
  city: string;

  /** Country name. e.g. "Bangladesh" */
  country: string;

  /** Runway threshold coordinates (centroid of airport area). */
  coordinates: Coordinates;

  /** IANA timezone string. e.g. "Asia/Dhaka" */
  timezone?: string;

  /** Elevation above mean sea level in feet. e.g. 30 */
  elevationFt?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// AIRLINE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Airline operator metadata.
 */
export interface Airline {
  /** Full airline name. e.g. "Biman Bangladesh Airlines" */
  name: string;

  /** 2-letter IATA carrier code. e.g. "BG", "EK", "QR" */
  iata: string;

  /** 3-letter ICAO operator code. e.g. "BBC", "UAE", "QTR" */
  icao?: string;

  /** Public URL to the airline logo (SVG or PNG). */
  logoUrl?: string;

  /** Primary brand color for UI display. e.g. "#006B3F" for Biman */
  brandColor?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// AIRCRAFT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Physical aircraft details.
 */
export interface Aircraft {
  /** Full model name. e.g. "Boeing 787-9 Dreamliner", "Airbus A380-800" */
  model: string;

  /** Tail registration number. e.g. "S2-AJX", "A6-EEX" */
  registration: string;

  /** ICAO Mode-S 24-bit address (hex string). e.g. "a3c5f9" */
  icao24?: string;

  /** Number of engines. e.g. 2 or 4 */
  engines?: number;

  /** Typical maximum cruising altitude in feet. e.g. 43000 */
  maxAltitudeFt?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// WAYPOINT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * A single point along a planned or flown flight route.
 */
export interface Waypoint {
  /** Geographic position. */
  coordinates: Coordinates;

  /** Estimated/actual time over this waypoint (ISO 8601). */
  timestamp?: string;

  /** Altitude at this waypoint in feet. */
  altitudeFt?: number;

  /** Named fix or VOR/NDB identifier. e.g. "SOSIM", "DAC" */
  fixName?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// FLIGHT PHASE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Derived vertical phase of flight, computed from routeProgressPercentage.
 *
 * - ground  : On the ground (0% or 100%)
 * - climb   : Ascending to cruise altitude (0%–15%)
 * - cruise  : Level flight at cruise altitude (15%–85%)
 * - descent : Descending towards destination (85%–100%)
 */
export type FlightPhase = "ground" | "climb" | "cruise" | "descent";

// ═══════════════════════════════════════════════════════════════════════════
// FLIGHT  (Primary Entity)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Complete flight entity representing one scheduled/active/completed trip.
 * This is the canonical data structure passed between all layers
 * (adapters → service → hooks → UI components).
 */
export interface Flight {
  /**
   * Globally unique tracking identifier.
   * Format: "{airline-iata}-{flight-number}-{date}" e.g. "BG-001-20261028"
   */
  id: string;

  /**
   * IATA flight designator. e.g. "BG 001", "EK 582"
   * Used for display and search.
   */
  flightNumber: string;

  /**
   * ATC voice callsign. e.g. "BBC001", "UAE582"
   * Used by air traffic control.
   */
  callsign: string;

  /** Airline operating this flight. */
  airline: Airline;

  /** Physical aircraft assigned to this flight. */
  aircraft: Aircraft;

  /** Departure airport. */
  origin: Airport;

  /** Arrival airport. */
  destination: Airport;

  /** Current operational state. */
  status: FlightStatus;

  /**
   * Most recent known position (updated each simulation tick / API poll).
   * Drives the aircraft marker on the radar map.
   */
  currentPosition: Coordinates;

  /**
   * Real-time avionics data corresponding to currentPosition.
   */
  telemetry: Telemetry;

  /**
   * How far along the route this flight is, expressed as 0.0 – 100.0.
   * Drives the progress bar in the telemetry drawer.
   * 0 = at origin gate, 100 = at destination gate.
   */
  routeProgressPercentage: number;

  /**
   * Pre-computed great-circle waypoints from origin to destination.
   * Used to:
   *  1. Render the curved route polyline on the map.
   *  2. Interpolate smooth aircraft positions between API ticks.
   */
  flightPath: Coordinates[];

  // ── Schedule & Times ───────────────────────────────────────────────────

  /** Published scheduled departure time (ISO 8601 UTC). */
  scheduledDeparture: string;

  /** Actual off-block / wheels-up time, if known (ISO 8601 UTC). */
  actualDeparture?: string;

  /** Estimated arrival time at destination gate (ISO 8601 UTC). */
  estimatedArrival: string;

  /** Actual touchdown / on-block time, if known (ISO 8601 UTC). */
  actualArrival?: string;

  // ── Route Metadata ─────────────────────────────────────────────────────

  /** Total great-circle distance in nautical miles. */
  distanceNm?: number;

  /** Planned total flight duration in minutes. */
  durationMinutes?: number;

  /** Computed flight phase from routeProgressPercentage. */
  phase?: FlightPhase;

  /**
   * Whether this is a domestic flight (both airports in the same country).
   * Used for the "Domestic" filter.
   */
  isDomestic?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY TYPES
// ═══════════════════════════════════════════════════════════════════════════

/** Partial flight update payload — used by the simulation engine tick. */
export type FlightUpdate = Pick<
  Flight,
  "id" | "currentPosition" | "telemetry" | "routeProgressPercentage"
> & { phase?: FlightPhase };

/** Lightweight summary for list views and search results. */
export type FlightSummary = Pick<
  Flight,
  | "id"
  | "flightNumber"
  | "callsign"
  | "airline"
  | "origin"
  | "destination"
  | "status"
  | "currentPosition"
  | "telemetry"
  | "routeProgressPercentage"
  | "estimatedArrival"
  | "isDomestic"
>;

