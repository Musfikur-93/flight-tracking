"use client";

import React, { useMemo } from "react";
import { Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import type { Flight } from "@/core/types/flight.types";

interface PlaneMarkerProps {
  flight: Flight;
  isSelected: boolean;
  onSelect: (flight: Flight) => void;
}

/**
 * Returns detailed realistic top-down SVG geometry based on aircraft category.
 */
function getAircraftSvg(model: string, isSelected: boolean, primaryColor: string) {
  const isA380 = model.toLowerCase().includes("a380");
  const isTurboprop = model.toLowerCase().includes("atr") || model.toLowerCase().includes("dash");

  // Body fill and stroke gradients
  const strokeColor = primaryColor;
  const fillColor = isSelected ? "rgba(0, 240, 255, 0.45)" : "rgba(15, 23, 42, 0.9)";
  const wingFill = isSelected ? "rgba(0, 240, 255, 0.3)" : "rgba(30, 41, 59, 0.85)";
  const engineColor = isSelected ? "#00F0FF" : "#94A3B8";

  if (isA380) {
    // ── Superjumbo Quad-Engine (Airbus A380) ───────────────────────────
    return `
      <svg viewBox="0 0 64 64" width="46" height="46" class="overflow-visible">
        <!-- Drop Shadow / Radar Silhouette -->
        <g filter="drop-shadow(0 2px 5px rgba(0,0,0,0.85))">
          <!-- Main Swept Wings -->
          <path d="M 32 18 L 4 36 C 3 37 3.5 38.5 5 38.5 L 9 38.5 L 32 30 L 55 38.5 L 59 38.5 C 60.5 38.5 61 37 60 36 L 32 18 Z" 
                fill="${wingFill}" stroke="${strokeColor}" stroke-width="1.2" stroke-linejoin="round"/>
          
          <!-- 4 Turbofan Engines -->
          <rect x="14" y="27" width="3" height="7" rx="1.5" fill="${engineColor}" stroke="${strokeColor}" stroke-width="0.8"/>
          <rect x="22" y="24" width="3" height="7" rx="1.5" fill="${engineColor}" stroke="${strokeColor}" stroke-width="0.8"/>
          <rect x="39" y="24" width="3" height="7" rx="1.5" fill="${engineColor}" stroke="${strokeColor}" stroke-width="0.8"/>
          <rect x="47" y="27" width="3" height="7" rx="1.5" fill="${engineColor}" stroke="${strokeColor}" stroke-width="0.8"/>

          <!-- Horizontal Tail Stabilizers -->
          <path d="M 32 50 L 16 57 C 15 57.5 15.5 58.5 17 58.5 L 32 54 L 47 58.5 C 48.5 58.5 49 57.5 48 57 L 32 50 Z" 
                fill="${wingFill}" stroke="${strokeColor}" stroke-width="1" />

          <!-- Double-Decker Fuselage -->
          <path d="M 32 3 C 29.5 7 28.5 15 28.5 28 L 28.5 48 C 28.5 54 30.5 59 32 61 C 33.5 59 35.5 54 35.5 48 L 35.5 28 C 35.5 15 34.5 7 32 3 Z" 
                fill="${fillColor}" stroke="${strokeColor}" stroke-width="1.4" />

          <!-- Cockpit Windshield -->
          <path d="M 30.5 8 C 31.2 7.2 32.8 7.2 33.5 8 L 34 9.5 C 33 10 31 10 30 9.5 Z" fill="#00F0FF" opacity="0.9"/>
          
          <!-- Wingtip Nav Lights -->
          <circle cx="4" cy="37" r="1.2" fill="#EF4444" />
          <circle cx="60" cy="37" r="1.2" fill="#10B981" />
        </g>
      </svg>
    `;
  }

  if (isTurboprop) {
    // ── Regional Turboprop (ATR 72 / Dash 8) ───────────────────────────
    return `
      <svg viewBox="0 0 64 64" width="40" height="40" class="overflow-visible">
        <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.85))">
          <!-- Straight High Wings -->
          <path d="M 32 24 L 5 25 C 4 25 3.5 26.5 4.5 27 L 7 27.5 L 32 27 L 57 27.5 L 59.5 27 C 60.5 26.5 60 25 59 25 L 32 24 Z" 
                fill="${wingFill}" stroke="${strokeColor}" stroke-width="1.2" />

          <!-- Propeller Nacelles & Spinners -->
          <rect x="18" y="21" width="3.5" height="9" rx="1.5" fill="${engineColor}" stroke="${strokeColor}" stroke-width="0.8"/>
          <ellipse cx="19.7" cy="20.5" rx="4" ry="1" fill="#00F0FF" opacity="0.6"/>
          <rect x="42.5" y="21" width="3.5" height="9" rx="1.5" fill="${engineColor}" stroke="${strokeColor}" stroke-width="0.8"/>
          <ellipse cx="44.2" cy="20.5" rx="4" ry="1" fill="#00F0FF" opacity="0.6"/>

          <!-- T-Tail Stabilizer -->
          <path d="M 32 54 L 18 55 C 17 55 17 56.5 18 56.8 L 32 56.8 L 46 56.8 C 47 56.5 47 55 46 55 L 32 54 Z" 
                fill="${wingFill}" stroke="${strokeColor}" stroke-width="1" />

          <!-- Slender Fuselage -->
          <path d="M 32 5 C 30.5 8 29.5 16 29.5 28 L 29.5 50 C 29.5 55 31 58 32 60 C 33 58 34.5 55 34.5 50 L 34.5 28 C 34.5 16 33.5 8 32 5 Z" 
                fill="${fillColor}" stroke="${strokeColor}" stroke-width="1.3" />

          <!-- Cockpit Window -->
          <path d="M 30.5 9 C 31.2 8.5 32.8 8.5 33.5 9 L 34 10.2 C 33 10.6 31 10.6 30 10.2 Z" fill="#00F0FF" opacity="0.9"/>
          
          <!-- Nav Lights -->
          <circle cx="4" cy="26" r="1.2" fill="#EF4444" />
          <circle cx="60" cy="26" r="1.2" fill="#10B981" />
        </g>
      </svg>
    `;
  }

  // ── Commercial Twin-Jetliner (Boeing 787 / 777 / A350 / B737) ─────────
  return `
    <svg viewBox="0 0 64 64" width="42" height="42" class="overflow-visible">
      <g filter="drop-shadow(0 2px 5px rgba(0,0,0,0.85))">
        <!-- Swept-back Wings with Raked Wingtips -->
        <path d="M 32 18 L 6 34.5 C 4.5 35.5 5 37 6.5 37 L 11 36.5 L 32 29 L 53 36.5 L 57.5 37 C 59 37 59.5 35.5 58 34.5 L 32 18 Z" 
              fill="${wingFill}" stroke="${strokeColor}" stroke-width="1.3" stroke-linejoin="round"/>

        <!-- Twin Turbofan Jet Engines -->
        <rect x="18.5" y="25" width="3.5" height="8" rx="1.75" fill="${engineColor}" stroke="${strokeColor}" stroke-width="0.9"/>
        <rect x="42" y="25" width="3.5" height="8" rx="1.75" fill="${engineColor}" stroke="${strokeColor}" stroke-width="0.9"/>

        <!-- Horizontal Tailplanes -->
        <path d="M 32 49 L 17 56 C 16 56.5 16.5 57.5 18 57.5 L 32 53.5 L 46 57.5 C 47.5 57.5 48 56.5 47 56 L 32 49 Z" 
              fill="${wingFill}" stroke="${strokeColor}" stroke-width="1.1" stroke-linejoin="round"/>

        <!-- Sleek Aerodynamic Fuselage -->
        <path d="M 32 3 C 30 6.5 29 14 29 26 L 29 46 C 29 52 30.8 57 32 60 C 33.2 57 35 52 35 46 L 35 26 C 35 14 34 6.5 32 3 Z" 
              fill="${fillColor}" stroke="${strokeColor}" stroke-width="1.4" />

        <!-- Cockpit Glass Strip -->
        <path d="M 30.5 7.5 C 31.2 6.8 32.8 6.8 33.5 7.5 L 34 9 C 33 9.6 31 9.6 30 9 Z" fill="#00F0FF" opacity="0.95"/>

        <!-- Red/Green Wingtip Strobe Lights -->
        <circle cx="5.5" cy="35.5" r="1.3" fill="#EF4444" />
        <circle cx="58.5" cy="35.5" r="1.3" fill="#10B981" />
      </g>
    </svg>
  `;
}

export const PlaneMarker: React.FC<PlaneMarkerProps> = ({
  flight,
  isSelected,
  onSelect,
}) => {
  const isEmergency = flight.telemetry.squawkCode === "7700";
  const heading = flight.telemetry.headingDegrees ?? 0;
  const altitudeFt = flight.telemetry.altitudeFeet;
  const flightLevel = Math.round(altitudeFt / 100);
  const verticalRate = flight.telemetry.verticalRateFpm;

  // Rate symbol: climbing, descending, or level
  const trendArrow = verticalRate > 150 ? "▲" : verticalRate < -150 ? "▼" : "▶";
  const trendColor = verticalRate > 150 ? "#10B981" : verticalRate < -150 ? "#F59E0B" : "#00F0FF";

  // Color theme per flight state
  let primaryColor = "#00F0FF";
  let glowColor = "rgba(0, 240, 255, 0.4)";

  if (isEmergency) {
    primaryColor = "#EF4444";
    glowColor = "rgba(239, 68, 68, 0.7)";
  } else if (flight.status === "delayed") {
    primaryColor = "#F59E0B";
    glowColor = "rgba(245, 158, 11, 0.55)";
  } else if (flight.status === "landed") {
    primaryColor = "#10B981";
    glowColor = "rgba(16, 185, 129, 0.45)";
  }

  // Generate realistic aircraft SVG
  const planeSvg = useMemo(() => {
    return getAircraftSvg(flight.aircraft.model, isSelected, primaryColor);
  }, [flight.aircraft.model, isSelected, primaryColor]);

  // Leaflet custom divIcon
  const icon = useMemo(() => {
    const size = 80;

    // Pulse selection beacon
    const pulseRing = isSelected
      ? `<div class="absolute inset-4 rounded-full border-2 border-[#00F0FF] animate-ping opacity-60"></div>
         <div class="absolute inset-5 rounded-full border border-[#00F0FF]/40"></div>`
      : isEmergency
      ? `<div class="absolute inset-4 rounded-full border-2 border-red-500 animate-ping opacity-80"></div>`
      : "";

    // Speed vector length (proportional to ground speed)
    const speedVectorHeight = Math.min(24, Math.max(10, (flight.telemetry.groundSpeedKnots / 500) * 20));

    const html = `
      <div class="relative w-[${size}px] h-[${size}px] flex items-center justify-center cursor-pointer select-none group">
        ${pulseRing}

        <!-- 1. ROTATABLE AIRCRAFT & SPEED VECTOR -->
        <div 
          class="relative flex items-center justify-center transition-transform duration-500 ease-out"
          style="transform: rotate(${heading}deg); filter: drop-shadow(0 0 6px ${glowColor});"
        >
          <!-- Forward Velocity Vector Leader Line -->
          <div 
            class="absolute bottom-full left-1/2 -translate-x-1/2 w-[1.5px] bg-gradient-to-t from-[${primaryColor}] to-transparent pointer-events-none"
            style="height: ${speedVectorHeight}px;"
          ></div>

          <!-- Top-down Realistic Aircraft SVG -->
          <div class="relative flex items-center justify-center">
            ${planeSvg}
          </div>
        </div>

        <!-- 2. COCKPIT ATC RADAR DATA TAG (Always visible, realistic flight block) -->
        <div class="absolute left-[54%] top-[10%] pointer-events-none z-10 flex flex-col font-mono text-[9px] leading-[1.15] bg-[#070B14]/85 border border-[#1E2D42]/80 backdrop-blur-sm px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap group-hover:border-[#00F0FF]/60 transition-colors">
          <div class="font-bold flex items-center gap-1 text-[${primaryColor}]">
            <span>${flight.flightNumber.replace(/\s+/g, "")}</span>
            <span style="color: ${trendColor}; font-size: 8px;">${trendArrow}</span>
          </div>
          <div class="text-slate-300 flex items-center gap-1 text-[8.5px]">
            <span>FL${flightLevel > 0 ? flightLevel : "GND"}</span>
            <span class="text-slate-500">•</span>
            <span class="text-slate-400">${flight.telemetry.groundSpeedKnots}k</span>
          </div>
        </div>
      </div>
    `;

    return L.divIcon({
      html,
      className: "plane-marker-icon",
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  }, [flight, isSelected, isEmergency, heading, primaryColor, glowColor, planeSvg, flightLevel, trendArrow, trendColor]);

  return (
    <Marker
      position={[flight.currentPosition.latitude, flight.currentPosition.longitude]}
      icon={icon}
      eventHandlers={{
        click: () => onSelect(flight),
      }}
    >
      <Tooltip
        direction="top"
        offset={[0, -24]}
        opacity={0.98}
        className="radar-tooltip"
      >
        <div className="bg-[#0B0F19]/98 border border-[#00F0FF]/40 text-slate-200 px-2.5 py-2 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-xl font-mono text-[11px] leading-tight flex flex-col gap-1 min-w-[170px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1">
            <span className="font-bold text-sm text-[#00F0FF]">{flight.flightNumber}</span>
            <span className="text-[10px] text-slate-400 font-semibold">{flight.aircraft.registration}</span>
          </div>
          <div className="text-[10px] text-slate-300 font-medium">
            {flight.airline.name}
          </div>
          <div className="text-[10px] text-slate-200 font-semibold flex items-center justify-between">
            <span>{flight.origin.iata} ({flight.origin.city})</span>
            <span className="text-[#00F0FF]">→</span>
            <span>{flight.destination.iata} ({flight.destination.city})</span>
          </div>
          <div className="grid grid-cols-2 gap-1 pt-1 border-t border-slate-800 text-[9.5px] text-slate-400">
            <div>Alt: <span className="text-slate-200 font-bold">{flight.telemetry.altitudeFeet.toLocaleString()} FT</span></div>
            <div>Spd: <span className="text-slate-200 font-bold">{flight.telemetry.groundSpeedKnots} KTS</span></div>
            <div>Track: <span className="text-slate-200 font-bold">{flight.telemetry.headingDegrees}°</span></div>
            <div>V/S: <span className="text-slate-200 font-bold">{flight.telemetry.verticalRateFpm >= 0 ? `+${flight.telemetry.verticalRateFpm}` : flight.telemetry.verticalRateFpm}</span></div>
          </div>
        </div>
      </Tooltip>
    </Marker>
  );
};
