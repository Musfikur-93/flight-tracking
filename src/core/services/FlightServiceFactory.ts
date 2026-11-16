/**
 * FlightServiceFactory.ts
 * ───────────────────────
 * Factory providing instances of IFlightService.
 *
 * Checks process.env.DATA_SOURCE:
 *  - 'live' -> RealFlightAdapter (fetches from real API e.g. OpenSky / AviationStack)
 *  - anything else (or undefined) -> MockFlightAdapter (simulated in-memory engine)
 *
 * Implements a singleton cache so only one adapter instance runs per process,
 * ensuring seamless simulation state preservation.
 */

import type { IFlightService } from "../interfaces/IFlightService";
import { MockFlightAdapter } from "../adapters/MockFlightAdapter";
import { RealFlightAdapter } from "../adapters/RealFlightAdapter";

let cachedService: IFlightService | null = null;

export class FlightServiceFactory {
  /**
   * Returns the configured IFlightService implementation.
   */
  public static getFlightService(): IFlightService {
    if (cachedService) {
      return cachedService;
    }

    const dataSource = process.env.DATA_SOURCE?.toLowerCase().trim();

    if (dataSource === "live") {
      console.log("[FlightServiceFactory] Initializing RealFlightAdapter (Live Data)");
      cachedService = new RealFlightAdapter();
    } else {
      console.log("[FlightServiceFactory] Initializing MockFlightAdapter (Simulation Engine)");
      cachedService = new MockFlightAdapter({
        simulatedLatencyMs: 60,
        speedMultiplier: 1,
      });
    }

    return cachedService;
  }

  /**
   * Reset cached instance (useful for testing or switching data source dynamically).
   */
  public static resetInstance(): void {
    cachedService = null;
  }
}

