/**
 * RealFlightAdapter.ts
 * ─────────────────────
 * Real-world API adapter implementing IFlightService.
 * Connects to OpenSky Network ADS-B REST API (or AviationStack).
 *
 * OpenSky API details:
 *  - Endpoint: https://opensky-network.org/api/states/all
 *  - Rate limit: Anonymous = 1 request per 10s; Authenticated = 1 request per 5s.
 *  - Includes an in-memory TTL cache (10 seconds) to prevent hitting rate limits.
 *
 * To activate live mode:
 *  1. In .env.local set: DATA_SOURCE=live
 *  2. (Optional) set: OPENSKY_USERNAME=... and OPENSKY_PASSWORD=...
 */

import type { IFlightService } from "../interfaces/IFlightService";
import type { Flight, Airport, FlightStatus } from "../types/flight.types";
import type { FlightFilterParams } from "../types/filter.types";
import { generateGreatCircleWaypoints } from "../simulation/greatCircle";
import airportsData from "../../data/mockAirports.json";

// Raw OpenSky state vector array index mapping:
// 0: icao24 (string)
// 1: callsign (string | null)
// 2: origin_country (string)
// 3: time_position (number | null)
// 4: last_contact (number)
// 5: longitude (number | null)
// 6: latitude (number | null)
// 7: baro_altitude (number | null - meters)
// 8: on_ground (boolean)
// 9: velocity (number | null - m/s)
// 10: true_track (number | null - degrees)
// 11: vertical_rate (number | null - m/s)
// 12: sensors (number[] | null)
// 13: geo_altitude (number | null - meters)
// 14: squawk (string | null)
// 15: spi (boolean)
// 16: position_source (number)
type OpenSkyStateVector = [
  string,
  string | null,
  string,
  number | null,
  number,
  number | null,
  number | null,
  number | null,
  boolean,
  number | null,
  number | null,
  number | null,
  number[] | null,
  number | null,
  string | null,
  boolean,
  number
];

interface OpenSkyResponse {
  time: number;
  states: OpenSkyStateVector[] | null;
}

export class RealFlightAdapter implements IFlightService {
  private cache: Flight[] = [];
  private lastFetchTime: number = 0;
  private readonly CACHE_TTL_MS = 10_000; // 10 seconds cache to respect rate limit

  private getAuthHeader(): Record<string, string> {
    const username = process.env.OPENSKY_USERNAME;
    const password = process.env.OPENSKY_PASSWORD;
    if (username && password) {
      const basic = Buffer.from(`${username}:${password}`).toString("base64");
      return { Authorization: `Basic ${basic}` };
    }
    return {};
  }

  /**
   * Normalizes raw OpenSky state vector into domain Flight entity.
   */
  private normalizeState(state: OpenSkyStateVector, index: number): Flight | null {
    const icao24 = state[0];
    const rawCallsign = state[1]?.trim() ?? `FLT-${icao24.toUpperCase()}`;
    const country = state[2] ?? "Unknown";
    const lon = state[5];
    const lat = state[6];
    const baroAltitudeMeters = state[7];
    const onGround = state[8];
    const velocityMps = state[9];
    const trueTrack = state[10];
    const verticalRateMps = state[11];
    const squawk = state[14];

    // Must have valid geographic coordinates
    if (lat === null || lon === null || isNaN(lat) || isNaN(lon)) {
      return null;
    }

    // Conversions: meters -> feet, m/s -> knots
    const altitudeFeet = baroAltitudeMeters !== null ? Math.round(baroAltitudeMeters * 3.28084) : 32000;
    const groundSpeedKnots = velocityMps !== null ? Math.round(velocityMps * 1.94384) : 460;
    const verticalRateFpm = verticalRateMps !== null ? Math.round(verticalRateMps * 196.85) : 0;
    const headingDegrees = trueTrack !== null ? Math.round(trueTrack) : 0;

    const status: FlightStatus = onGround ? "landed" : "active";

    // Approximate airline & airport mapping for UI consistency
    const callsignPrefix = rawCallsign.substring(0, 3).toUpperCase();
    const carrierName = country.includes("United") ? "United Airlines" : `${country} Air Transport`;

    const originAirport: Airport = {
      iata: "DEP",
      icao: "ZZZZ",
      name: `${country} International Airport`,
      city: country,
      country: country,
      coordinates: { latitude: lat - 2, longitude: lon - 2 },
    };

    const destAirport: Airport = {
      iata: "ARR",
      icao: "ZZZZ",
      name: "Destination Airfield",
      city: "Destination",
      country: "Global",
      coordinates: { latitude: lat + 2, longitude: lon + 2 },
    };

    const flightPath = generateGreatCircleWaypoints(
      originAirport.coordinates,
      destAirport.coordinates,
      20
    );

    return {
      id: `live-${icao24}`,
      flightNumber: rawCallsign,
      callsign: rawCallsign,
      airline: {
        name: carrierName,
        iata: callsignPrefix.substring(0, 2),
        icao: callsignPrefix,
      },
      aircraft: {
        model: "Commercial Jetliner (ADS-B)",
        registration: icao24.toUpperCase(),
        icao24,
      },
      origin: originAirport,
      destination: destAirport,
      status,
      currentPosition: {
        latitude: lat,
        longitude: lon,
      },
      telemetry: {
        altitudeFeet,
        groundSpeedKnots,
        verticalRateFpm,
        headingDegrees,
        squawkCode: squawk ?? "1200",
      },
      routeProgressPercentage: 50,
      flightPath,
      scheduledDeparture: new Date(Date.now() - 3600 * 1000).toISOString(),
      estimatedArrival: new Date(Date.now() + 3600 * 1000).toISOString(),
      isDomestic: false,
    };
  }

  private async fetchOpenSkyStates(): Promise<Flight[]> {
    const now = Date.now();
    if (this.cache.length > 0 && now - this.lastFetchTime < this.CACHE_TTL_MS) {
      return this.cache;
    }

    try {
      const response = await fetch("https://opensky-network.org/api/states/all", {
        headers: {
          Accept: "application/json",
          ...this.getAuthHeader(),
        },
        next: { revalidate: 10 },
      });

      if (!response.ok) {
        console.warn(`[RealFlightAdapter] OpenSky returned status ${response.status}. Using cached/fallback data.`);
        return this.cache;
      }

      const json: OpenSkyResponse = await response.json();
      if (!json.states || !Array.isArray(json.states)) {
        return this.cache;
      }

      // Convert top 40 live airplanes
      const parsed: Flight[] = [];
      for (let i = 0; i < json.states.length && parsed.length < 50; i++) {
        const flight = this.normalizeState(json.states[i], i);
        if (flight) parsed.push(flight);
      }

      this.cache = parsed;
      this.lastFetchTime = now;
      return parsed;
    } catch (err) {
      console.error("[RealFlightAdapter] Network error fetching OpenSky states:", err);
      return this.cache;
    }
  }

  async getAllLiveFlights(filters?: FlightFilterParams): Promise<Flight[]> {
    const flights = await this.fetchOpenSkyStates();
    if (!filters) return flights;

    let res = [...flights];
    if (filters.status && filters.status.length > 0) {
      res = res.filter((f) => filters.status!.includes(f.status));
    }
    if (filters.minAltitudeFt !== undefined) {
      res = res.filter((f) => f.telemetry.altitudeFeet >= filters.minAltitudeFt!);
    }
    if (filters.query) {
      const q = filters.query.toLowerCase();
      res = res.filter(
        (f) =>
          f.flightNumber.toLowerCase().includes(q) ||
          f.airline.name.toLowerCase().includes(q)
      );
    }
    return res;
  }

  async getFlightById(id: string): Promise<Flight | null> {
    const flights = await this.getAllLiveFlights();
    return flights.find((f) => f.id === id) ?? null;
  }

  async searchFlights(query: string): Promise<Flight[]> {
    return this.getAllLiveFlights({ query });
  }

  async getAirports(): Promise<Airport[]> {
    return airportsData as Airport[];
  }
}
