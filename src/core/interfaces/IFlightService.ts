/**
 * IFlightService.ts
 * ─────────────────
 * The core service contract (interface) that decouples the UI layer
 * from any specific data source.
 *
 * All components, hooks, and API routes interact ONLY with this interface.
 * Swapping from mock to real data requires zero UI code changes —
 * only the adapter returned by FlightServiceFactory changes.
 *
 * Implementing adapters:
 *  - MockFlightAdapter   → uses in-memory simulation
 *  - RealFlightAdapter   → calls OpenSky / AviationStack APIs
 */

import type { Flight, Airport } from "../types/flight.types";
import type { FlightFilterParams } from "../types/filter.types";

export interface IFlightService {
  /**
   * Retrieve all currently tracked flights, optionally filtered.
   *
   * In mock mode: returns the current in-memory simulation state.
   * In live mode: fetches from the real-time API with caching.
   *
   * @param filters - Optional filter criteria (status, altitude, airline, etc.).
   * @returns Promise resolving to an array of matching Flight objects.
   */
  getAllLiveFlights(filters?: FlightFilterParams): Promise<Flight[]>;

  /**
   * Retrieve a single flight by its unique tracking ID.
   *
   * @param id - The flight's unique ID (e.g. "BG-001-DAC-LHR").
   * @returns Promise resolving to the Flight, or null if not found.
   */
  getFlightById(id: string): Promise<Flight | null>;

  /**
   * Free-text search across all flights.
   * Matches against: flight number, callsign, airline name,
   * origin city/IATA, destination city/IATA.
   *
   * @param query - Search string (e.g. "BG001", "Dhaka", "Emirates").
   * @returns Promise resolving to matching flights, sorted by relevance.
   */
  searchFlights(query: string): Promise<Flight[]>;

  /**
   * Retrieve all known airports in the system.
   * Used to render airport markers and populate filter dropdowns.
   *
   * @returns Promise resolving to array of Airport objects.
   */
  getAirports(): Promise<Airport[]>;
}

