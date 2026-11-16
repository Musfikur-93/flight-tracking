/**
 * greatCircle.ts
 * ──────────────
 * Spherical geodesic math library for the Flight Tracker simulation engine.
 *
 * All functions operate on the WGS-84 ellipsoid approximated as a sphere
 * (mean Earth radius = 6371.0088 km). The error introduced by this
 * approximation is ≤ 0.5%, which is acceptable for visual flight simulation.
 *
 * References:
 *  - Haversine formula: R. Sinnott, "Virtues of the Haversine", Sky & Telescope, 1984
 *  - Initial bearing / forward azimuth: Movable Type Scripts (Chris Veness)
 *  - Spherical interpolation: Glen Fielder, "Spherical Linear Interpolation"
 */

import type { Coordinates } from "../types/flight.types";

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

/** Mean Earth radius in kilometres (IUGG 1980). */
const EARTH_RADIUS_KM = 6371.0088;

/** Kilometres per nautical mile (exact by BIPM). */
const KM_PER_NM = 1.852;

/** Degrees → radians conversion factor. */
const DEG2RAD = Math.PI / 180;

/** Radians → degrees conversion factor. */
const RAD2DEG = 180 / Math.PI;

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Convert degrees to radians.
 */
function toRad(deg: number): number {
  return deg * DEG2RAD;
}

/**
 * Convert radians to degrees.
 */
function toDeg(rad: number): number {
  return rad * RAD2DEG;
}

/**
 * Normalize a bearing angle to the range [0, 360).
 */
function normalizeBearing(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

// ═══════════════════════════════════════════════════════════════════════════
// HAVERSINE DISTANCE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * haversineDistance
 * ─────────────────
 * Calculates the great-circle distance between two points on Earth using
 * the Haversine formula.
 *
 * The Haversine formula is numerically stable for small distances
 * (unlike the spherical law of cosines which loses precision near 0°).
 *
 * Formula:
 *   a = sin²(Δφ/2) + cos φ₁ · cos φ₂ · sin²(Δλ/2)
 *   c = 2 · atan2(√a, √(1-a))
 *   d = R · c
 *
 * @param from - Origin coordinate.
 * @param to   - Destination coordinate.
 * @returns Object with distance in both kilometres and nautical miles.
 */
export function haversineDistance(
  from: Coordinates,
  to: Coordinates
): { km: number; nm: number } {
  const φ1 = toRad(from.latitude);
  const φ2 = toRad(to.latitude);
  const Δφ = toRad(to.latitude  - from.latitude);
  const Δλ = toRad(to.longitude - from.longitude);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const km = EARTH_RADIUS_KM * c;

  return { km, nm: km / KM_PER_NM };
}

// ═══════════════════════════════════════════════════════════════════════════
// INITIAL BEARING (FORWARD AZIMUTH)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * calculateBearing
 * ─────────────────
 * Computes the initial bearing (forward azimuth) from point `from` to
 * point `to` on the surface of a sphere.
 *
 * The bearing is the compass direction you would face at `from` to travel
 * the shortest path to `to` along the great circle.
 *
 * Formula:
 *   θ = atan2(sin Δλ · cos φ₂,
 *             cos φ₁ · sin φ₂ − sin φ₁ · cos φ₂ · cos Δλ)
 *
 * @param from - Origin coordinate.
 * @param to   - Target coordinate.
 * @returns Initial bearing in degrees [0, 360). 0° = North, 90° = East.
 */
export function calculateBearing(from: Coordinates, to: Coordinates): number {
  const φ1 = toRad(from.latitude);
  const φ2 = toRad(to.latitude);
  const Δλ = toRad(to.longitude - from.longitude);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  return normalizeBearing(toDeg(Math.atan2(y, x)));
}

// ═══════════════════════════════════════════════════════════════════════════
// GREAT-CIRCLE INTERMEDIATE POINT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * interpolateGreatCircle
 * ──────────────────────
 * Finds the intermediate point at a given fraction along the great-circle
 * arc between `from` and `to`.
 *
 * Uses spherical linear interpolation (SLERP) adapted for geographic
 * coordinates. This gives a point exactly on the great-circle arc —
 * unlike linear lat/lng interpolation which produces a shorter chord path.
 *
 * Formula:
 *   A = sin((1−f)·d) / sin d
 *   B = sin(f·d)     / sin d
 *   x = A·cos φ₁·cos λ₁ + B·cos φ₂·cos λ₂
 *   y = A·cos φ₁·sin λ₁ + B·cos φ₂·sin λ₂
 *   z = A·sin φ₁        + B·sin φ₂
 *   φᵢ = atan2(z, √(x²+y²))
 *   λᵢ = atan2(y, x)
 *
 * @param from     - Start coordinate.
 * @param to       - End coordinate.
 * @param fraction - Progress ratio [0.0, 1.0]. 0 = `from`, 1 = `to`.
 * @returns The intermediate coordinate at `fraction` along the arc.
 */
export function interpolateGreatCircle(
  from: Coordinates,
  to: Coordinates,
  fraction: number
): Coordinates {
  // Guard edge cases
  if (fraction <= 0) return { ...from };
  if (fraction >= 1) return { ...to };

  const φ1 = toRad(from.latitude);
  const λ1 = toRad(from.longitude);
  const φ2 = toRad(to.latitude);
  const λ2 = toRad(to.longitude);

  // Angular distance between the two points
  const Δφ = φ2 - φ1;
  const Δλ = λ2 - λ1;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const d = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // angular distance in radians

  // Handle antipodal points (d ≈ π) — pick arbitrary great circle
  if (Math.abs(Math.sin(d)) < 1e-10) {
    return {
      latitude:  from.latitude  + fraction * (to.latitude  - from.latitude),
      longitude: from.longitude + fraction * (to.longitude - from.longitude),
    };
  }

  // SLERP weights
  const A = Math.sin((1 - fraction) * d) / Math.sin(d);
  const B = Math.sin(fraction       * d) / Math.sin(d);

  // Convert to Cartesian, interpolate, convert back
  const x =
    A * Math.cos(φ1) * Math.cos(λ1) +
    B * Math.cos(φ2) * Math.cos(λ2);
  const y =
    A * Math.cos(φ1) * Math.sin(λ1) +
    B * Math.cos(φ2) * Math.sin(λ2);
  const z =
    A * Math.sin(φ1) +
    B * Math.sin(φ2);

  const φi = Math.atan2(z, Math.sqrt(x * x + y * y));
  const λi = Math.atan2(y, x);

  return {
    latitude:  toDeg(φi),
    longitude: toDeg(λi),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// GREAT-CIRCLE WAYPOINT ARRAY GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

/**
 * generateGreatCircleWaypoints
 * ─────────────────────────────
 * Generates an array of evenly-spaced coordinates along the great-circle
 * arc between `from` and `to`.
 *
 * The result is used to:
 *  1. Render the curved route polyline on the Leaflet/MapLibre map.
 *  2. Pre-compute the interpolation spine for the flight simulator.
 *
 * More points = smoother curve. 60 points is sufficient for routes up to
 * 18,000 km. Short routes (< 1000 km) can use 20 points.
 *
 * @param from      - Departure airport coordinates.
 * @param to        - Arrival airport coordinates.
 * @param numPoints - Number of waypoints to generate (includes endpoints). Default 60.
 * @returns Array of Coordinates ordered from origin to destination.
 */
export function generateGreatCircleWaypoints(
  from: Coordinates,
  to: Coordinates,
  numPoints: number = 60
): Coordinates[] {
  if (numPoints < 2) return [{ ...from }, { ...to }];

  const waypoints: Coordinates[] = [];

  for (let i = 0; i < numPoints; i++) {
    const fraction = i / (numPoints - 1);
    waypoints.push(interpolateGreatCircle(from, to, fraction));
  }

  return waypoints;
}

// ═══════════════════════════════════════════════════════════════════════════
// BEARING AT ARBITRARY POINT ALONG ROUTE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * bearingAtFraction
 * ─────────────────
 * Calculates the aircraft heading at a given route progress fraction by
 * computing the bearing between the point just before and just after the
 * given fraction. This gives the instantaneous tangent direction.
 *
 * Used to rotate aircraft markers on the map to match actual flight direction.
 *
 * @param from      - Departure coordinates.
 * @param to        - Arrival coordinates.
 * @param fraction  - Route progress [0.0, 1.0].
 * @param epsilon   - Small offset used to compute the tangent (default 0.001).
 * @returns Bearing in degrees [0, 360).
 */
export function bearingAtFraction(
  from: Coordinates,
  to: Coordinates,
  fraction: number,
  epsilon: number = 0.001
): number {
  const f1 = Math.max(0, fraction - epsilon);
  const f2 = Math.min(1, fraction + epsilon);

  const p1 = interpolateGreatCircle(from, to, f1);
  const p2 = interpolateGreatCircle(from, to, f2);

  return calculateBearing(p1, p2);
}

// ═══════════════════════════════════════════════════════════════════════════
// DESTINATION FROM BEARING + DISTANCE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * destinationPoint
 * ─────────────────
 * Given a start point, initial bearing, and distance, calculates the
 * destination coordinate. Useful for dead-reckoning.
 *
 * @param origin       - Start coordinate.
 * @param bearingDeg   - Initial bearing in degrees.
 * @param distanceKm   - Distance to travel in kilometres.
 * @returns Destination coordinate.
 */
export function destinationPoint(
  origin: Coordinates,
  bearingDeg: number,
  distanceKm: number
): Coordinates {
  const δ = distanceKm / EARTH_RADIUS_KM; // angular distance in radians
  const θ = toRad(bearingDeg);
  const φ1 = toRad(origin.latitude);
  const λ1 = toRad(origin.longitude);

  const φ2 = Math.asin(
    Math.sin(φ1) * Math.cos(δ) +
    Math.cos(φ1) * Math.sin(δ) * Math.cos(θ)
  );

  const λ2 =
    λ1 +
    Math.atan2(
      Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
      Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2)
    );

  return {
    latitude:  toDeg(φ2),
    longitude: toDeg(((λ2 + 3 * Math.PI) % (2 * Math.PI)) - Math.PI), // normalize λ to −180..+180
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// CONVENIENCE RE-EXPORTS & UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/** Convert kilometres to nautical miles. */
export const kmToNm = (km: number): number => km / KM_PER_NM;

/** Convert nautical miles to kilometres. */
export const nmToKm = (nm: number): number => nm * KM_PER_NM;

/** Convert knots to km/h. */
export const knotsToKmh = (knots: number): number => knots * KM_PER_NM;

/** Convert km/h to knots. */
export const kmhToKnots = (kmh: number): number => kmh / KM_PER_NM;

export { normalizeBearing };

