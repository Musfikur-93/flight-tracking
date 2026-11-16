"use client";

import { useQuery } from "@tanstack/react-query";
import type { Flight } from "@/core/types/flight.types";

interface FlightDetailApiResponse {
  success: boolean;
  timestamp: string;
  data: Flight;
  error?: string;
}

async function fetchFlightDetail(id: string): Promise<Flight> {
  const res = await fetch(`/api/flights/${encodeURIComponent(id)}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch flight ${id}: ${res.statusText}`);
  }

  const json: FlightDetailApiResponse = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.error || `Flight ${id} not found`);
  }

  return json.data;
}

export function useFlightDetail(flightId: string | null, enabled: boolean = true) {
  const query = useQuery({
    queryKey: ["flight-detail", flightId],
    queryFn: () => (flightId ? fetchFlightDetail(flightId) : null),
    enabled: Boolean(flightId) && enabled,
    refetchInterval: 2000,
    staleTime: 1500,
  });

  return {
    flight: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

