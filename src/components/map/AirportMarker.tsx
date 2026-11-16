"use client";

import React, { useMemo } from "react";
import { Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import type { Airport } from "@/core/types/flight.types";

interface AirportMarkerProps {
  airport: Airport;
  isOrigin?: boolean;
  isDestination?: boolean;
}

export const AirportMarker: React.FC<AirportMarkerProps> = ({
  airport,
  isOrigin,
  isDestination,
}) => {
  const icon = useMemo(() => {
    let borderColor = "#38BDF8";
    let bgColor = "rgba(14, 165, 233, 0.2)";
    let labelColor = "#38BDF8";

    if (isOrigin) {
      borderColor = "#00F0FF";
      bgColor = "rgba(0, 240, 255, 0.25)";
      labelColor = "#00F0FF";
    } else if (isDestination) {
      borderColor = "#10B981";
      bgColor = "rgba(16, 185, 129, 0.25)";
      labelColor = "#10B981";
    }

    const html = `
      <div class="relative flex items-center justify-center cursor-pointer select-none">
        <div class="w-3.5 h-3.5 rounded-full border-2" style="border-color: ${borderColor}; background-color: ${bgColor}; box-shadow: 0 0 8px ${borderColor};">
          <div class="w-1 h-1 mx-auto my-0.5 rounded-full" style="background-color: ${borderColor};"></div>
        </div>
        <div class="absolute -bottom-4 font-mono font-bold text-[9px] px-1 rounded bg-[#070B14]/90 border border-slate-700/60" style="color: ${labelColor};">
          ${airport.iata}
        </div>
      </div>
    `;

    return L.divIcon({
      html,
      className: "airport-marker-icon",
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  }, [airport.iata, isOrigin, isDestination]);

  return (
    <Marker
      position={[airport.coordinates.latitude, airport.coordinates.longitude]}
      icon={icon}
    >
      <Tooltip direction="bottom" offset={[0, 12]} opacity={0.95}>
        <div className="bg-[#0B0F19]/95 border border-[#1E2D42] text-slate-200 px-2 py-1.5 rounded shadow-lg backdrop-blur-md font-mono text-[11px]">
          <div className="font-bold text-[#00F0FF]">{airport.name} ({airport.iata})</div>
          <div className="text-slate-400 text-[10px]">{airport.city}, {airport.country}</div>
          {airport.elevationFt !== undefined && (
            <div className="text-slate-500 text-[9px] mt-0.5">Elevation: {airport.elevationFt} FT</div>
          )}
        </div>
      </Tooltip>
    </Marker>
  );
};

