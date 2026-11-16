"use client";

import { useQuery } from "@tanstack/react-query";
import { useTrackerStore } from "@/store/useTrackerStore";
import type { Flight } from "@/core/types/flight.types";
import { useEffect, useRef, useState } from "react";
import { calculateNextTelemetry } from "@/core/simulation/flightSimulator";

interface FlightsApiResponse {
  success: boolean;
  timestamp: string;
  count: number;
  data: Flight[];
  error?: string;
}

async function fetchFlights(filterParams: Record<string, any>): Promise<Flight[]> {
  const params = new URLSearchParams();

  if (filterParams.query) params.set("query", filterParams.query);
  if (filterParams.status && filterParams.status.length > 0) {
    params.set("status", filterParams.status.join(","));
  }
  if (filterParams.airlineIata) params.set("airlineIata", filterParams.airlineIata);
  if (filterParams.minAltitudeFt !== undefined) {
    params.set("minAltitudeFt", String(filterParams.minAltitudeFt));
  }
  if (filterParams.maxAltitudeFt !== undefined) {
    params.set("maxAltitudeFt", String(filterParams.maxAltitudeFt));
  }
  if (filterParams.isDomestic !== undefined) {
    params.set("isDomestic", String(filterParams.isDomestic));
  }

  const res = await fetch(`/api/flights?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch flights: ${res.statusText}`);
  }

  const json: FlightsApiResponse = await res.json();
  if (!json.success) {
    throw new Error(json.error || "Failed to retrieve flight data");
  }

  return json.data;
}

export function useFlightTracker() {
  const filterParams = useTrackerStore((s) => s.filterParams);
  const isSimulationPaused = useTrackerStore((s) => s.isSimulationPaused);
  const simulationSpeed = useTrackerStore((s) => s.simulationSpeed);

  // TanStack Query: auto-poll every 3000ms unless paused
  const query = useQuery({
    queryKey: ["flights", filterParams],
    queryFn: () => fetchFlights(filterParams),
    refetchInterval: isSimulationPaused ? false : 3000,
    staleTime: 2000,
  });

  // Client-side local dead-reckoning state for smooth 60fps rendering between 3s network ticks
  const [interpolatedFlights, setInterpolatedFlights] = useState<Flight[]>([]);
  const lastFrameTimeRef = useRef<number>(Date.now());
  const flightsRef = useRef<Flight[]>([]);

  // Update flightsRef whenever fresh server data arrives
  useEffect(() => {
    if (query.data) {
      flightsRef.current = query.data;
      setInterpolatedFlights(query.data);
      lastFrameTimeRef.current = Date.now();
    }
  }, [query.data]);

  // RequestAnimationFrame dead-reckoning loop (smooth motion between server polls)
  useEffect(() => {
    if (isSimulationPaused) return;

    let animId: number;

    const tick = () => {
      const now = Date.now();
      const deltaSec = (now - lastFrameTimeRef.current) / 1000;
      lastFrameTimeRef.current = now;

      // Only interpolate if delta is reasonable (less than 1 second per frame)
      if (deltaSec > 0 && deltaSec < 1 && flightsRef.current.length > 0) {
        flightsRef.current = flightsRef.current.map((flight) => {
          if (flight.status !== "active") return flight;
          const next = calculateNextTelemetry(flight, deltaSec, simulationSpeed);
          return {
            ...flight,
            currentPosition: next.currentPosition,
            telemetry: next.telemetry,
            routeProgressPercentage: next.routeProgressPercentage,
            phase: next.phase,
          };
        });
        setInterpolatedFlights([...flightsRef.current]);
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isSimulationPaused, simulationSpeed]);

  return {
    flights: interpolatedFlights.length > 0 ? interpolatedFlights : query.data ?? [],
    rawFlights: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
    timestamp: query.dataUpdatedAt,
  };
}

