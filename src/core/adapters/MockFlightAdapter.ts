/**
 * MockFlightAdapter.ts
 * ─────────────────────
 * In-memory flight simulation adapter implementing IFlightService.
 *
 * Features:
 *  - Holds all flight states in memory (initialized from seed data).
 *  - Advances simulation on every data access call (time-based dead-reckoning).
 *  - Applies FlightFilterParams for filtering / searching.
 *  - Simulates realistic network latency (configurable).
 *  - Thread-safe singleton pattern via module-level state.
 */

import type { IFlightService } from "../interfaces/IFlightService";
import type { Flight, Airport } from "../types/flight.types";
import type { FlightFilterParams } from "../types/filter.types";
import { tickAllFlights } from "../simulation/flightSimulator";
import { generateMockFlights } from "../../data/mockFlightsSeed";
import airportsData from "../../data/mockAirports.json";

// ═══════════════════════════════════════════════════════════════════════════
// ADAPTER CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

interface MockAdapterConfig {
  /** Simulated API latency in milliseconds (default: 80ms) */
  simulatedLatencyMs?: number;
  /** Simulation speed multiplier (default: 1 — real time) */
  speedMultiplier?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// MODULE-LEVEL SIMULATION STATE
// ═══════════════════════════════════════════════════════════════════════════

// Singleton state — shared across all adapter instances in this process.
// This avoids re-initializing flights on every API route call.
let _flights: Flight[]   = [];
let _lastTickTime: number = Date.now();
let _initialized          = false;

function ensureInitialized(): void {
  if (!_initialized) {
    _flights     = generateMockFlights();
    _lastTickTime = Date.now();
    _initialized  = true;
  }
}

function advanceSimulation(speedMultiplier: number): void {
  const now     = Date.now();
  const elapsed = (now - _lastTickTime) / 1000; // seconds since last tick
  _lastTickTime = now;

  if (elapsed > 0 && elapsed < 60) {
    // Guard: ignore ticks > 60s (e.g. after server sleep)
    _flights = tickAllFlights(_flights, elapsed, speedMultiplier);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FILTER ENGINE
// ═══════════════════════════════════════════════════════════════════════════

function applyFilters(flights: Flight[], filters: FlightFilterParams): Flight[] {
  let result = [...flights];

  // ── Status filter ──────────────────────────────────────────────────────
  if (filters.status && filters.status.length > 0) {
    result = result.filter((f) => filters.status!.includes(f.status));
  }

  // ── Airline filter ─────────────────────────────────────────────────────
  if (filters.airlineIata) {
    const code = filters.airlineIata.toUpperCase();
    result = result.filter((f) => f.airline.iata === code);
  }

  // ── Altitude filters ───────────────────────────────────────────────────
  if (filters.minAltitudeFt !== undefined) {
    result = result.filter((f) => f.telemetry.altitudeFeet >= filters.minAltitudeFt!);
  }
  if (filters.maxAltitudeFt !== undefined) {
    result = result.filter((f) => f.telemetry.altitudeFeet <= filters.maxAltitudeFt!);
  }

  // ── Domestic / international filter ───────────────────────────────────
  if (filters.isDomestic !== undefined) {
    result = result.filter((f) => f.isDomestic === filters.isDomestic);
  }

  // ── Origin / destination filters ──────────────────────────────────────
  if (filters.originIata) {
    const iata = filters.originIata.toUpperCase();
    result = result.filter((f) => f.origin.iata === iata);
  }
  if (filters.destinationIata) {
    const iata = filters.destinationIata.toUpperCase();
    result = result.filter((f) => f.destination.iata === iata);
  }

  // ── Full-text query filter ─────────────────────────────────────────────
  if (filters.query && filters.query.trim().length > 0) {
    result = applyQueryFilter(result, filters.query.trim());
  }

  // ── Limit ──────────────────────────────────────────────────────────────
  if (filters.limit !== undefined && filters.limit > 0) {
    result = result.slice(0, filters.limit);
  }

  return result;
}

/**
 * applyQueryFilter
 * ─────────────────
 * Scores each flight against the query string and returns matching results
 * ordered by relevance score (highest first).
 */
function applyQueryFilter(flights: Flight[], query: string): Flight[] {
  const q = query.toLowerCase();

  const scored = flights
    .map((f) => {
      let score = 0;

      // Exact flight number match → highest priority
      if (f.flightNumber.toLowerCase().replace(/\s/g, "") === q.replace(/\s/g, "")) score += 100;
      else if (f.flightNumber.toLowerCase().includes(q)) score += 50;

      // Callsign match
      if (f.callsign.toLowerCase().includes(q)) score += 40;

      // Airline name match
      if (f.airline.name.toLowerCase().includes(q)) score += 30;

      // Airline IATA code
      if (f.airline.iata.toLowerCase() === q) score += 35;

      // Origin / destination city or IATA
      if (f.origin.city.toLowerCase().includes(q))       score += 25;
      if (f.destination.city.toLowerCase().includes(q))  score += 25;
      if (f.origin.iata.toLowerCase() === q)             score += 30;
      if (f.destination.iata.toLowerCase() === q)        score += 30;

      return { flight: f, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map((x) => x.flight);
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK FLIGHT ADAPTER CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class MockFlightAdapter implements IFlightService {
  private readonly latencyMs:       number;
  private readonly speedMultiplier: number;

  constructor(config: MockAdapterConfig = {}) {
    this.latencyMs       = config.simulatedLatencyMs ?? 80;
    this.speedMultiplier = config.speedMultiplier    ?? 1;
    ensureInitialized();
  }

  // ── Simulated network delay ──────────────────────────────────────────────
  private async delay(): Promise<void> {
    if (this.latencyMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.latencyMs));
    }
  }

  // ── Advance simulation state before every read ───────────────────────────
  private tick(): void {
    advanceSimulation(this.speedMultiplier);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // IFlightService Implementation
  // ─────────────────────────────────────────────────────────────────────────

  async getAllLiveFlights(filters: FlightFilterParams = {}): Promise<Flight[]> {
    this.tick();
    await this.delay();
    return applyFilters(_flights, filters);
  }

  async getFlightById(id: string): Promise<Flight | null> {
    this.tick();
    await this.delay();
    return _flights.find((f) => f.id === id) ?? null;
  }

  async searchFlights(query: string): Promise<Flight[]> {
    this.tick();
    await this.delay();
    if (!query.trim()) return [..._flights];
    return applyQueryFilter(_flights, query.trim());
  }

  async getAirports(): Promise<Airport[]> {
    await this.delay();
    return airportsData as Airport[];
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Simulation Control (extra methods for SimulationControls UI)
  // ─────────────────────────────────────────────────────────────────────────

  /** Reset all flights to their seed state. */
  reset(): void {
    _flights      = generateMockFlights();
    _lastTickTime = Date.now();
  }

  /** Get the current simulation speed multiplier. */
  getSpeedMultiplier(): number {
    return this.speedMultiplier;
  }

  /** Return a snapshot of internal flights (for debugging). */
  snapshot(): Flight[] {
    return [..._flights];
  }
}

