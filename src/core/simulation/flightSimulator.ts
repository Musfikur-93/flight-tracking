/**
 * flightSimulator.ts
 * ──────────────────
 * Client-side flight simulation engine.
 *
 * Responsibilities:
 *  1. Advance a flight's position along its great-circle route based on
 *     elapsed time and simulation speed.
 *  2. Compute realistic telemetry (altitude, speed, vertical rate, heading)
 *     based on the current phase of flight.
 *  3. Provide smooth 60 fps dead-reckoning between API / data ticks.
 *
 * Aviation Flight Phases (based on routeProgressPercentage):
 *  ┌─────────────────────────────────────────────────────────┐
 *  │  0% ──── 15%  │  15% ─────────── 85%  │  85% ─── 100% │
 *  │   CLIMB        │      CRUISE           │   DESCENT      │
 *  │  0 → 36,000ft  │  ~36,000ft (±200ft)  │  36,000 → 0ft │
 *  │  250→480 kts   │  460–520 kts         │  480→160 kts  │
 *  └─────────────────────────────────────────────────────────┘
 */

import type { Flight, Telemetry, FlightPhase, Coordinates } from "../types/flight.types";
import {
  interpolateGreatCircle,
  bearingAtFraction,
  haversineDistance,
  knotsToKmh,
} from "./greatCircle";

// ═══════════════════════════════════════════════════════════════════════════
// SIMULATION CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

/** Phase boundary: climb ends / cruise begins at this progress percentage. */
const CLIMB_END_PCT   = 15;

/** Phase boundary: cruise ends / descent begins at this progress percentage. */
const DESCENT_START_PCT = 85;

/** Typical long-haul cruise altitude in feet. */
const CRUISE_ALTITUDE_FT = 36_000;

/** Maximum typical cruise altitude (used for altitude bar scaling). */
export const MAX_ALTITUDE_FT = 43_000;

/** Cruise speed range in knots [min, max]. */
const CRUISE_SPEED_RANGE: [number, number] = [460, 520];

/** Climb initial speed (at rotation) in knots. */
const CLIMB_INITIAL_SPEED_KTS = 180;

/** Climb final speed (top of climb) in knots. */
const CLIMB_FINAL_SPEED_KTS = 485;

/** Descent approach speed in knots. */
const DESCENT_FINAL_SPEED_KTS = 160;

/** Typical max climb rate in feet per minute. */
const MAX_CLIMB_RATE_FPM = 2_500;

/** Typical max descent rate in feet per minute. */
const MAX_DESCENT_RATE_FPM = -2_200;

/** Micro-turbulence amplitude at cruise (±feet). */
const CRUISE_TURBULENCE_FT = 150;

/** Micro-turbulence amplitude at cruise for speed (±knots). */
const CRUISE_TURBULENCE_KTS = 12;

/** Earth circumference at equator in km (for speed → progress calculation). */
const EARTH_CIRCUMFERENCE_KM = 40_075;

// ═══════════════════════════════════════════════════════════════════════════
// PHASE DERIVATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * deriveFlightPhase
 * ─────────────────
 * Derive the current flight phase from route progress percentage.
 *
 * @param progressPct - Route progress [0, 100].
 * @returns FlightPhase string.
 */
export function deriveFlightPhase(progressPct: number): FlightPhase {
  if (progressPct <= 0 || progressPct >= 100) return "ground";
  if (progressPct < CLIMB_END_PCT)           return "climb";
  if (progressPct >= DESCENT_START_PCT)      return "descent";
  return "cruise";
}

// ═══════════════════════════════════════════════════════════════════════════
// TELEMETRY COMPUTATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * computeTelemetry
 * ─────────────────
 * Calculate realistic telemetry values for a given flight progress.
 *
 * Uses smooth interpolation (lerp) within each phase rather than hard
 * breakpoints, so transitions feel gradual and realistic.
 *
 * @param progressPct  - Route progress percentage [0, 100].
 * @param cruiseAltFt  - Target cruise altitude for this flight (default 36,000 ft).
 * @param cruiseSpeed  - Nominal cruise speed in knots (default 490 kts).
 * @param existingSquawk - Preserve squawk code from existing telemetry.
 * @returns Computed Telemetry object (heading computed separately).
 */
export function computeTelemetry(
  progressPct: number,
  cruiseAltFt:  number = CRUISE_ALTITUDE_FT,
  cruiseSpeed:  number = 490,
  existingSquawk?: string
): Omit<Telemetry, "headingDegrees"> {
  const phase = deriveFlightPhase(progressPct);

  // ── Deterministic noise (based on progress to avoid jitter on re-render) ──
  const noise = (amplitude: number, seed: number) =>
    Math.sin(progressPct * seed * 0.37 + seed) * amplitude;

  let altitudeFeet:    number;
  let groundSpeedKnots: number;
  let verticalRateFpm: number;

  if (phase === "ground") {
    // Parked at gate
    altitudeFeet     = 0;
    groundSpeedKnots = 0;
    verticalRateFpm  = 0;

  } else if (phase === "climb") {
    // Linear progress within climb phase: 0% → CLIMB_END_PCT
    const climbFraction = progressPct / CLIMB_END_PCT; // 0.0 → 1.0

    altitudeFeet = lerp(0, cruiseAltFt, smoothstep(climbFraction));

    groundSpeedKnots = lerp(
      CLIMB_INITIAL_SPEED_KTS,
      CLIMB_FINAL_SPEED_KTS,
      climbFraction
    );

    // Vertical rate is highest early in climb, tapers off approaching cruise
    verticalRateFpm = lerp(MAX_CLIMB_RATE_FPM, 100, climbFraction);

  } else if (phase === "cruise") {
    // Stable cruise with micro-turbulence
    const cruiseFraction =
      (progressPct - CLIMB_END_PCT) / (DESCENT_START_PCT - CLIMB_END_PCT);

    altitudeFeet =
      cruiseAltFt + noise(CRUISE_TURBULENCE_FT, 7.3 + cruiseFraction * 2);

    groundSpeedKnots =
      cruiseSpeed + noise(CRUISE_TURBULENCE_KTS, 3.1);

    // Near-zero vertical rate with small fluctuation
    verticalRateFpm = noise(120, 11.7);

  } else {
    // Descent: DESCENT_START_PCT → 100%
    const descentFraction =
      (progressPct - DESCENT_START_PCT) / (100 - DESCENT_START_PCT); // 0.0 → 1.0

    altitudeFeet = lerp(cruiseAltFt, 0, smoothstep(descentFraction));

    groundSpeedKnots = lerp(
      CLIMB_FINAL_SPEED_KTS,
      DESCENT_FINAL_SPEED_KTS,
      descentFraction
    );

    // Descent rate is strongest in the middle, gentle at top/bottom
    const descentPeak = Math.sin(descentFraction * Math.PI);
    verticalRateFpm = lerp(0, MAX_DESCENT_RATE_FPM, descentPeak);
  }

  return {
    altitudeFeet:     Math.max(0, Math.round(altitudeFeet)),
    groundSpeedKnots: Math.max(0, Math.round(groundSpeedKnots)),
    verticalRateFpm:  Math.round(verticalRateFpm),
    squawkCode:       existingSquawk ?? "1200",
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN SIMULATION TICK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * SimulationResult
 * ─────────────────
 * Return type of `calculateNextTelemetry`.
 */
export interface SimulationResult {
  /** New geographic position after the time step. */
  currentPosition: Coordinates;
  /** Updated telemetry matching the new position. */
  telemetry: Telemetry;
  /** Updated route progress [0, 100]. */
  routeProgressPercentage: number;
  /** Derived flight phase. */
  phase: FlightPhase;
  /** Whether the flight has completed its route (reached 100%). */
  isCompleted: boolean;
}

/**
 * calculateNextTelemetry
 * ──────────────────────
 * Advances a flight by `elapsedSeconds × speedMultiplier` seconds of
 * simulated time and returns updated position + telemetry.
 *
 * This is the core "tick" function called by the simulation loop.
 * It is pure (no side effects) — callers decide how to apply the result.
 *
 * Algorithm:
 *  1. Convert elapsed simulated time to distance travelled (speed × time).
 *  2. Express distance as a fraction of total route distance.
 *  3. Add fraction to current progress percentage.
 *  4. Look up new position on the pre-computed great-circle spine.
 *  5. Compute heading as the tangent bearing at the new fraction.
 *  6. Compute altitude, speed, vertical rate from the new phase.
 *
 * @param flight          - Current flight state.
 * @param elapsedSeconds  - Wall-clock seconds elapsed since last tick.
 * @param speedMultiplier - Simulation speed (1x normal, 5x fast, 10x turbo).
 * @returns Updated simulation state.
 */
export function calculateNextTelemetry(
  flight: Flight,
  elapsedSeconds: number,
  speedMultiplier: number = 1
): SimulationResult {
  const {
    currentPosition,
    telemetry,
    routeProgressPercentage,
    origin,
    destination,
    flightPath,
  } = flight;

  // ── 1. Guard: already at destination ────────────────────────────────────
  if (routeProgressPercentage >= 100) {
    return {
      currentPosition: destination.coordinates,
      telemetry: { ...telemetry, groundSpeedKnots: 0, verticalRateFpm: 0 },
      routeProgressPercentage: 100,
      phase: "ground",
      isCompleted: true,
    };
  }

  // ── 2. Compute distance travelled in this tick ───────────────────────────
  const speedKmh    = knotsToKmh(Math.max(telemetry.groundSpeedKnots, 1));
  const simulatedH  = (elapsedSeconds * speedMultiplier) / 3600; // hours
  const distKm      = speedKmh * simulatedH;

  // ── 3. Convert distance to fractional route progress ────────────────────
  // Total route distance from the pre-computed flightPath endpoints
  const totalDist   = haversineDistance(origin.coordinates, destination.coordinates);
  const totalDistKm = Math.max(totalDist.km, 1); // avoid division by zero

  const progressDelta = (distKm / totalDistKm) * 100;
  const newProgress   = Math.min(100, routeProgressPercentage + progressDelta);

  // ── 4. Interpolate new geographic position ───────────────────────────────
  const fraction = newProgress / 100;

  let newPosition: Coordinates;

  if (flightPath.length >= 2) {
    // Use the pre-computed spine for fast lookup (avoids re-computing slerp)
    newPosition = interpolateAlongSpine(flightPath, fraction);
  } else {
    // Fallback: compute directly
    newPosition = interpolateGreatCircle(
      origin.coordinates,
      destination.coordinates,
      fraction
    );
  }

  // ── 5. Compute heading ───────────────────────────────────────────────────
  const heading = bearingAtFraction(
    origin.coordinates,
    destination.coordinates,
    fraction
  );

  // ── 6. Compute phase-appropriate telemetry ───────────────────────────────
  const cruiseAlt   = flight.aircraft.maxAltitudeFt
    ? flight.aircraft.maxAltitudeFt * 0.84   // ~84% of max is typical cruise
    : CRUISE_ALTITUDE_FT;

  const baseTelemetry = computeTelemetry(
    newProgress,
    cruiseAlt,
    telemetry.groundSpeedKnots,
    telemetry.squawkCode
  );

  const newTelemetry: Telemetry = {
    ...baseTelemetry,
    headingDegrees: Math.round(heading),
  };

  const phase = deriveFlightPhase(newProgress);
  const isCompleted = newProgress >= 100;

  return {
    currentPosition:         newPosition,
    telemetry:               newTelemetry,
    routeProgressPercentage: Math.round(newProgress * 10) / 10,
    phase,
    isCompleted,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// BULK BATCH TICK (for multiple flights)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * tickAllFlights
 * ──────────────
 * Apply a simulation tick to every flight in an array.
 * Returns a new array with updated flight objects (immutable update pattern).
 *
 * @param flights         - Array of current flight states.
 * @param elapsedSeconds  - Wall-clock seconds since last tick.
 * @param speedMultiplier - Simulation speed multiplier.
 * @returns New array of updated flights.
 */
export function tickAllFlights(
  flights: Flight[],
  elapsedSeconds: number,
  speedMultiplier: number = 1
): Flight[] {
  return flights.map((flight) => {
    if (flight.status === "landed" || flight.status === "scheduled") {
      return flight; // Don't advance grounded / not-yet-departed flights
    }

    const result = calculateNextTelemetry(flight, elapsedSeconds, speedMultiplier);

    return {
      ...flight,
      currentPosition:         result.currentPosition,
      telemetry:               result.telemetry,
      routeProgressPercentage: result.routeProgressPercentage,
      phase:                   result.phase,
      status:                  result.isCompleted ? "landed" : flight.status,
    };
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// PRIVATE HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * lerp — Linear interpolation between a and b at ratio t [0, 1].
 */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.min(1, Math.max(0, t));
}

/**
 * smoothstep — Smooth Hermite interpolation (3t² − 2t³).
 * Produces an ease-in-out curve, avoiding abrupt starts/stops.
 */
function smoothstep(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
}

/**
 * interpolateAlongSpine
 * ─────────────────────
 * Fast lookup of the coordinate at `fraction` [0,1] along a pre-computed
 * array of evenly-spaced waypoints (the great-circle spine).
 *
 * Instead of recomputing the spherical interpolation from scratch, we:
 *  1. Scale fraction to an index in the waypoint array.
 *  2. Linear-interpolate between the two bounding waypoints.
 *
 * This is accurate enough for visual rendering and much faster.
 */
function interpolateAlongSpine(
  spine: Coordinates[],
  fraction: number
): Coordinates {
  const n = spine.length;
  if (n === 0) throw new Error("Empty flight path spine");
  if (n === 1) return { ...spine[0] };

  const scaledIndex = fraction * (n - 1);
  const lowerIndex  = Math.floor(scaledIndex);
  const upperIndex  = Math.min(n - 1, lowerIndex + 1);
  const localFrac   = scaledIndex - lowerIndex;

  const lower = spine[lowerIndex];
  const upper = spine[upperIndex];

  return {
    latitude:  lower.latitude  + (upper.latitude  - lower.latitude)  * localFrac,
    longitude: lower.longitude + (upper.longitude - lower.longitude) * localFrac,
  };
}

