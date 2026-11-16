"use client";

import React, { useMemo } from "react";
import { Polyline } from "react-leaflet";
import type { Flight } from "@/core/types/flight.types";
import { AirportMarker } from "./AirportMarker";

interface FlightPathLineProps {
  flight: Flight;
}

export const FlightPathLine: React.FC<FlightPathLineProps> = ({ flight }) => {
  const { flightPath, currentPosition, routeProgressPercentage, origin, destination } = flight;

  // Split waypoints into historical flown route and future planned route
  const { flownCoordinates, remainingCoordinates } = useMemo(() => {
    if (!flightPath || flightPath.length === 0) {
      return { flownCoordinates: [], remainingCoordinates: [] };
    }

    const fraction = Math.min(100, Math.max(0, routeProgressPercentage)) / 100;
    const splitIndex = Math.floor(fraction * (flightPath.length - 1));

    const flown = flightPath.slice(0, splitIndex + 1).map((pt) => [pt.latitude, pt.longitude] as [number, number]);
    // Append precise current position
    flown.push([currentPosition.latitude, currentPosition.longitude]);

    const remaining = [[currentPosition.latitude, currentPosition.longitude] as [number, number]];
    const futureWaypoints = flightPath.slice(splitIndex + 1).map((pt) => [pt.latitude, pt.longitude] as [number, number]);
    remaining.push(...futureWaypoints);

    return {
      flownCoordinates: flown,
      remainingCoordinates: remaining,
    };
  }, [flightPath, currentPosition, routeProgressPercentage]);

  return (
    <>
      {/* ── Flown Trajectory: Solid Neon Cyan with subtle glow ────── */}
      {flownCoordinates.length > 1 && (
        <>
          {/* Subtle Outer Glow */}
          <Polyline
            positions={flownCoordinates}
            pathOptions={{
              color: "#00F0FF",
              weight: 5,
              opacity: 0.25,
              lineCap: "round",
            }}
          />
          {/* Core Solid Line */}
          <Polyline
            positions={flownCoordinates}
            pathOptions={{
              color: "#00F0FF",
              weight: 2.5,
              opacity: 0.95,
              lineCap: "round",
            }}
          />
        </>
      )}

      {/* ── Remaining Trajectory: Dashed Cyan Line ────────────────── */}
      {remainingCoordinates.length > 1 && (
        <Polyline
          positions={remainingCoordinates}
          pathOptions={{
            color: "#38BDF8",
            weight: 2,
            opacity: 0.6,
            dashArray: "6, 8",
            lineCap: "round",
          }}
        />
      )}

      {/* ── Origin & Destination Airport Beacons ──────────────────── */}
      {origin && <AirportMarker airport={origin} isOrigin />}
      {destination && <AirportMarker airport={destination} isDestination />}
    </>
  );
};

