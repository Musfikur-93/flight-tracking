/**
 * mockFlightsSeed.ts
 * ──────────────────
 * Pre-configured seed data for 16 realistic active & scheduled flights.
 *
 * Covers:
 *  • Bangladesh domestic routes: DAC↔CXB, DAC↔CGP, DAC↔ZYL
 *  • International routes:  DAC↔LHR, DAC↔DXB, DAC↔DOH, DAC↔SIN,
 *                           LHR↔JFK, DXB↔JFK, SIN↔HND, BKK↔DEL, CDG↔JFK
 *
 * Each flight has:
 *  - Realistic departure time relative to "now"
 *  - Pre-computed great-circle flightPath (60 waypoints)
 *  - Phase-appropriate initial telemetry
 *  - routeProgressPercentage matching the departure offset
 */

import type { Flight } from "../core/types/flight.types";
import {
  generateGreatCircleWaypoints,
  calculateBearing,
  haversineDistance,
} from "../core/simulation/greatCircle";
import { computeTelemetry, deriveFlightPhase } from "../core/simulation/flightSimulator";
import type { Coordinates } from "../core/types/flight.types";

// ── Airport coordinate references ──────────────────────────────────────────
const COORDS: Record<string, Coordinates> = {
  DAC: { latitude: 23.8433, longitude: 90.3978 },
  CXB: { latitude: 21.4522, longitude: 91.9639 },
  CGP: { latitude: 22.2496, longitude: 91.8133 },
  ZYL: { latitude: 24.9632, longitude: 91.8677 },
  LHR: { latitude: 51.4700, longitude: -0.4543 },
  DXB: { latitude: 25.2532, longitude: 55.3657 },
  DOH: { latitude: 25.2731, longitude: 51.6080 },
  SIN: { latitude: 1.3644,  longitude: 103.9915 },
  JFK: { latitude: 40.6413, longitude: -73.7781 },
  HND: { latitude: 35.5494, longitude: 139.7798 },
  KUL: { latitude: 2.7456,  longitude: 101.7099 },
  CDG: { latitude: 49.0097, longitude: 2.5479 },
  BKK: { latitude: 13.6900, longitude: 100.7501 },
  DEL: { latitude: 28.5562, longitude: 77.1000 },
};

// ── Airline objects ────────────────────────────────────────────────────────
const AIRLINES = {
  BG: { name: "Biman Bangladesh Airlines", iata: "BG", icao: "BBC", brandColor: "#006B3F" },
  BS: { name: "US-Bangla Airlines",        iata: "BS", icao: "UBG", brandColor: "#E31837" },
  EK: { name: "Emirates",                  iata: "EK", icao: "UAE", brandColor: "#D71921" },
  QR: { name: "Qatar Airways",             iata: "QR", icao: "QTR", brandColor: "#5C0E32" },
  SQ: { name: "Singapore Airlines",        iata: "SQ", icao: "SIA", brandColor: "#003B5C" },
  BA: { name: "British Airways",           iata: "BA", icao: "BAW", brandColor: "#075AAA" },
  DL: { name: "Delta Air Lines",           iata: "DL", icao: "DAL", brandColor: "#003A70" },
};

// ── Airport objects ─────────────────────────────────────────────────────────
const AIRPORTS: Record<string, Flight["origin"]> = {
  DAC: { iata: "DAC", icao: "VGHS", name: "Hazrat Shahjalal International Airport", city: "Dhaka",      country: "Bangladesh",      coordinates: COORDS.DAC, timezone: "Asia/Dhaka" },
  CXB: { iata: "CXB", icao: "VGCB", name: "Cox's Bazar Airport",                   city: "Cox's Bazar", country: "Bangladesh",      coordinates: COORDS.CXB, timezone: "Asia/Dhaka" },
  CGP: { iata: "CGP", icao: "VGEG", name: "Shah Amanat International Airport",      city: "Chittagong", country: "Bangladesh",      coordinates: COORDS.CGP, timezone: "Asia/Dhaka" },
  ZYL: { iata: "ZYL", icao: "VGSY", name: "Osmani International Airport",           city: "Sylhet",     country: "Bangladesh",      coordinates: COORDS.ZYL, timezone: "Asia/Dhaka" },
  LHR: { iata: "LHR", icao: "EGLL", name: "London Heathrow Airport",                city: "London",     country: "United Kingdom",  coordinates: COORDS.LHR, timezone: "Europe/London" },
  DXB: { iata: "DXB", icao: "OMDB", name: "Dubai International Airport",            city: "Dubai",      country: "UAE",             coordinates: COORDS.DXB, timezone: "Asia/Dubai" },
  DOH: { iata: "DOH", icao: "OTHH", name: "Hamad International Airport",            city: "Doha",       country: "Qatar",           coordinates: COORDS.DOH, timezone: "Asia/Qatar" },
  SIN: { iata: "SIN", icao: "WSSS", name: "Singapore Changi Airport",               city: "Singapore",  country: "Singapore",       coordinates: COORDS.SIN, timezone: "Asia/Singapore" },
  JFK: { iata: "JFK", icao: "KJFK", name: "John F. Kennedy International Airport",  city: "New York",   country: "United States",   coordinates: COORDS.JFK, timezone: "America/New_York" },
  HND: { iata: "HND", icao: "RJTT", name: "Tokyo Haneda Airport",                   city: "Tokyo",      country: "Japan",           coordinates: COORDS.HND, timezone: "Asia/Tokyo" },
  CDG: { iata: "CDG", icao: "LFPG", name: "Charles de Gaulle Airport",              city: "Paris",      country: "France",          coordinates: COORDS.CDG, timezone: "Europe/Paris" },
  BKK: { iata: "BKK", icao: "VTBS", name: "Suvarnabhumi Airport",                   city: "Bangkok",    country: "Thailand",        coordinates: COORDS.BKK, timezone: "Asia/Bangkok" },
  DEL: { iata: "DEL", icao: "VIDP", name: "Indira Gandhi International Airport",    city: "New Delhi",  country: "India",           coordinates: COORDS.DEL, timezone: "Asia/Kolkata" },
};

// ═══════════════════════════════════════════════════════════════════════════
// SEED BUILDER HELPER
// ═══════════════════════════════════════════════════════════════════════════

interface SeedSpec {
  id: string;
  flightNumber: string;
  callsign: string;
  airlineKey: keyof typeof AIRLINES;
  aircraftModel: string;
  registration: string;
  maxAltFt: number;
  originKey: string;
  destinationKey: string;
  /** How many minutes ago the flight departed (positive = already flying) */
  minutesIntoFlight: number;
  /** Planned total flight duration in minutes */
  durationMinutes: number;
  status: Flight["status"];
  squawkCode?: string;
}

function buildFlight(spec: SeedSpec): Flight {
  const origin      = AIRPORTS[spec.originKey];
  const destination = AIRPORTS[spec.destinationKey];
  const airline     = AIRLINES[spec.airlineKey];

  const originCoords = COORDS[spec.originKey];
  const destCoords   = COORDS[spec.destinationKey];

  // Pre-compute great-circle waypoint spine
  const flightPath = generateGreatCircleWaypoints(originCoords, destCoords, 60);

  // Total route distance
  const { nm } = haversineDistance(originCoords, destCoords);

  // Route progress: how many minutes into a durationMinutes flight
  const rawProgress = Math.min(
    100,
    Math.max(0, (spec.minutesIntoFlight / spec.durationMinutes) * 100)
  );
  const routeProgressPercentage = Math.round(rawProgress * 10) / 10;

  // Current position via interpolation
  const fraction = routeProgressPercentage / 100;
  const idx      = Math.floor(fraction * (flightPath.length - 1));
  const upper    = Math.min(flightPath.length - 1, idx + 1);
  const local    = fraction * (flightPath.length - 1) - idx;
  const currentPosition: Coordinates = {
    latitude:  flightPath[idx].latitude  + (flightPath[upper].latitude  - flightPath[idx].latitude)  * local,
    longitude: flightPath[idx].longitude + (flightPath[upper].longitude - flightPath[idx].longitude) * local,
  };

  // Heading at current fraction
  const headingDegrees = Math.round(calculateBearing(originCoords, destCoords));

  // Phase-appropriate telemetry
  const cruiseAlt  = Math.round(spec.maxAltFt * 0.84);
  const baseTelem  = computeTelemetry(routeProgressPercentage, cruiseAlt, 490, spec.squawkCode ?? "1200");
  const phase      = deriveFlightPhase(routeProgressPercentage);

  // Timestamps
  const now            = new Date();
  const scheduledDep   = new Date(now.getTime() - spec.minutesIntoFlight * 60_000);
  const estimatedArr   = new Date(scheduledDep.getTime() + spec.durationMinutes * 60_000);
  const actualDep      = spec.minutesIntoFlight > 0
    ? new Date(scheduledDep.getTime() + 5 * 60_000).toISOString()  // 5-min taxi
    : undefined;

  const isDomestic = origin.country === destination.country;

  return {
    id:           spec.id,
    flightNumber: spec.flightNumber,
    callsign:     spec.callsign,
    airline,
    aircraft: {
      model:        spec.aircraftModel,
      registration: spec.registration,
      maxAltitudeFt: spec.maxAltFt,
      engines: spec.aircraftModel.includes("787") || spec.aircraftModel.includes("A350") ? 2
              : spec.aircraftModel.includes("A380") ? 4 : 2,
    },
    origin,
    destination,
    status:                  spec.status,
    currentPosition,
    telemetry: {
      ...baseTelem,
      headingDegrees,
    },
    routeProgressPercentage,
    flightPath,
    scheduledDeparture:     scheduledDep.toISOString(),
    actualDeparture:        actualDep,
    estimatedArrival:       estimatedArr.toISOString(),
    distanceNm:             Math.round(nm),
    durationMinutes:        spec.durationMinutes,
    phase,
    isDomestic,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// SEED SPECIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════

const seedSpecs: SeedSpec[] = [
  // ── Bangladesh → International ──────────────────────────────────────────
  {
    id: "BG-001-DAC-LHR",
    flightNumber: "BG 001",
    callsign: "BBC001",
    airlineKey: "BG",
    aircraftModel: "Boeing 787-8 Dreamliner",
    registration: "S2-AJX",
    maxAltFt: 43_000,
    originKey: "DAC",
    destinationKey: "LHR",
    minutesIntoFlight: 320,   // ~5h 20m in — well into cruise
    durationMinutes:   615,   // ~10h 15m total
    status: "active",
  },
  {
    id: "BG-021-DAC-DXB",
    flightNumber: "BG 021",
    callsign: "BBC021",
    airlineKey: "BG",
    aircraftModel: "Boeing 777-300ER",
    registration: "S2-AFO",
    maxAltFt: 43_100,
    originKey: "DAC",
    destinationKey: "DXB",
    minutesIntoFlight: 95,    // climbing
    durationMinutes:   270,   // ~4h 30m
    status: "active",
  },
  {
    id: "BG-049-DAC-DOH",
    flightNumber: "BG 049",
    callsign: "BBC049",
    airlineKey: "BG",
    aircraftModel: "Boeing 737-800",
    registration: "S2-AHM",
    maxAltFt: 41_000,
    originKey: "DAC",
    destinationKey: "DOH",
    minutesIntoFlight: 20,    // early climb
    durationMinutes:   240,
    status: "active",
  },

  // ── International → Bangladesh ──────────────────────────────────────────
  {
    id: "EK-582-DXB-DAC",
    flightNumber: "EK 582",
    callsign: "UAE582",
    airlineKey: "EK",
    aircraftModel: "Airbus A380-800",
    registration: "A6-EEX",
    maxAltFt: 43_000,
    originKey: "DXB",
    destinationKey: "DAC",
    minutesIntoFlight: 210,   // descending
    durationMinutes:   240,
    status: "active",
  },
  {
    id: "QR-638-DOH-DAC",
    flightNumber: "QR 638",
    callsign: "QTR638",
    airlineKey: "QR",
    aircraftModel: "Boeing 787-9 Dreamliner",
    registration: "A7-BHH",
    maxAltFt: 43_000,
    originKey: "DOH",
    destinationKey: "DAC",
    minutesIntoFlight: 145,
    durationMinutes:   230,
    status: "active",
  },
  {
    id: "SQ-446-SIN-DAC",
    flightNumber: "SQ 446",
    callsign: "SIA446",
    airlineKey: "SQ",
    aircraftModel: "Airbus A350-900",
    registration: "9V-SMC",
    maxAltFt: 43_100,
    originKey: "SIN",
    destinationKey: "DAC",
    minutesIntoFlight: 100,
    durationMinutes:   220,
    status: "active",
  },

  // ── Bangladesh Domestic Routes ──────────────────────────────────────────
  {
    id: "BS-141-DAC-CXB",
    flightNumber: "BS 141",
    callsign: "UBG141",
    airlineKey: "BS",
    aircraftModel: "ATR 72-600",
    registration: "S2-AHE",
    maxAltFt: 25_000,
    originKey: "DAC",
    destinationKey: "CXB",
    minutesIntoFlight: 25,
    durationMinutes:   60,
    status: "active",
    squawkCode: "1200",
  },
  {
    id: "BG-061-DAC-CGP",
    flightNumber: "BG 061",
    callsign: "BBC061",
    airlineKey: "BG",
    aircraftModel: "Bombardier Dash 8 Q400",
    registration: "S2-AFL",
    maxAltFt: 25_000,
    originKey: "DAC",
    destinationKey: "CGP",
    minutesIntoFlight: 35,
    durationMinutes:   65,
    status: "active",
  },
  {
    id: "BS-207-ZYL-DAC",
    flightNumber: "BS 207",
    callsign: "UBG207",
    airlineKey: "BS",
    aircraftModel: "ATR 72-600",
    registration: "S2-AHF",
    maxAltFt: 25_000,
    originKey: "ZYL",
    destinationKey: "DAC",
    minutesIntoFlight: 20,
    durationMinutes:   45,
    status: "active",
  },

  // ── Major International Routes ──────────────────────────────────────────
  {
    id: "BA-117-LHR-JFK",
    flightNumber: "BA 117",
    callsign: "BAW117",
    airlineKey: "BA",
    aircraftModel: "Boeing 777-300ER",
    registration: "G-STBB",
    maxAltFt: 43_000,
    originKey: "LHR",
    destinationKey: "JFK",
    minutesIntoFlight: 210,
    durationMinutes:   435,   // ~7h 15m
    status: "active",
  },
  {
    id: "EK-201-DXB-JFK",
    flightNumber: "EK 201",
    callsign: "UAE201",
    airlineKey: "EK",
    aircraftModel: "Airbus A380-800",
    registration: "A6-EDH",
    maxAltFt: 43_000,
    originKey: "DXB",
    destinationKey: "JFK",
    minutesIntoFlight: 560,
    durationMinutes:   825,   // ~13h 45m
    status: "active",
  },
  {
    id: "SQ-026-SIN-HND",
    flightNumber: "SQ 026",
    callsign: "SIA026",
    airlineKey: "SQ",
    aircraftModel: "Airbus A350-900ULR",
    registration: "9V-SGA",
    maxAltFt: 43_100,
    originKey: "SIN",
    destinationKey: "HND",
    minutesIntoFlight: 290,
    durationMinutes:   420,
    status: "active",
  },
  {
    id: "DL-401-JFK-LHR",
    flightNumber: "DL 401",
    callsign: "DAL401",
    airlineKey: "DL",
    aircraftModel: "Airbus A330-900neo",
    registration: "N402DX",
    maxAltFt: 41_000,
    originKey: "JFK",
    destinationKey: "LHR",
    minutesIntoFlight: 175,
    durationMinutes:   430,
    status: "active",
  },
  {
    id: "QR-007-DOH-LHR",
    flightNumber: "QR 007",
    callsign: "QTR007",
    airlineKey: "QR",
    aircraftModel: "Airbus A350-1000",
    registration: "A7-ANA",
    maxAltFt: 43_100,
    originKey: "DOH",
    destinationKey: "LHR",
    minutesIntoFlight: 0,     // scheduled, not departed yet
    durationMinutes:   420,
    status: "scheduled",
  },
  {
    id: "BG-003-LHR-DAC",
    flightNumber: "BG 003",
    callsign: "BBC003",
    airlineKey: "BG",
    aircraftModel: "Boeing 787-8 Dreamliner",
    registration: "S2-AJY",
    maxAltFt: 43_000,
    originKey: "LHR",
    destinationKey: "DAC",
    minutesIntoFlight: 580,   // descending, almost landed
    durationMinutes:   615,
    status: "active",
  },
  {
    id: "BS-401-DAC-KUL",
    flightNumber: "BS 401",
    callsign: "UBG401",
    airlineKey: "BS",
    aircraftModel: "Boeing 737-800",
    registration: "S2-AHL",
    maxAltFt: 41_000,
    originKey: "DAC",
    destinationKey: "DEL",
    minutesIntoFlight: 45,
    durationMinutes:   120,
    status: "delayed",
    squawkCode: "1200",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// GENERATE & EXPORT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * MOCK_FLIGHTS_SEED
 * ─────────────────
 * Array of 16 pre-built Flight objects ready for the MockFlightAdapter.
 * Call this function to get a fresh set with current timestamps.
 */
export function generateMockFlights(): Flight[] {
  return seedSpecs.map(buildFlight);
}

/** Static export (generated once at module load). Used as the adapter's initial state. */
export const MOCK_FLIGHTS_SEED: Flight[] = generateMockFlights();

