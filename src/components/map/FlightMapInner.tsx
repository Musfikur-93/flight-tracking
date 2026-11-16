"use client";

import React, { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useTrackerStore, DEFAULT_VIEWPORT } from "@/store/useTrackerStore";
import { useFlightTracker } from "@/hooks/useFlightTracker";
import type { Flight, Airport } from "@/core/types/flight.types";
import { PlaneMarker } from "./PlaneMarker";
import { FlightPathLine } from "./FlightPathLine";
import { AirportMarker } from "./AirportMarker";
import { MapControls } from "./MapControls";

// Premium Dark Radar Tile Layers (ESRI Dark Gray Canvas — 100% Free, Zero API Key, No Watermarks)
const TILE_LAYER_BASE =
  "https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}";
const TILE_LAYER_LABELS =
  "https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Esri, DeLorme, NAVTEQ';

/**
 * Controller component inside MapContainer to react to external state
 * like camera pans when a flight is selected.
 */
function MapCameraHandler({ selectedFlight }: { selectedFlight: Flight | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedFlight) {
      map.flyTo(
        [selectedFlight.currentPosition.latitude, selectedFlight.currentPosition.longitude],
        Math.max(map.getZoom(), 6),
        { duration: 1.2, easeLinearity: 0.3 }
      );
    }
  }, [selectedFlight?.id, map]);

  return null;
}

export function FlightMapInner() {
  const { flights } = useFlightTracker();
  const selectedFlightId = useTrackerStore((s) => s.selectedFlightId);
  const setSelectedFlight = useTrackerStore((s) => s.setSelectedFlight);

  const [isRadarSweepActive, setIsRadarSweepActive] = useState<boolean>(true);
  const [showAirports, setShowAirports] = useState<boolean>(true);
  const [airports, setAirports] = useState<Airport[]>([]);

  // Fetch all airports once
  useEffect(() => {
    fetch("/api/airports")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setAirports(data.data);
        }
      })
      .catch((err) => console.error("Error loading airports:", err));
  }, []);

  // Currently selected flight entity
  const selectedFlight = useMemo(() => {
    return flights.find((f) => f.id === selectedFlightId) || null;
  }, [flights, selectedFlightId]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#070B14]">
      {/* ── Leaflet Vector Map ─────────────────────────────────────── */}
      <MapContainer
        center={DEFAULT_VIEWPORT.center}
        zoom={DEFAULT_VIEWPORT.zoom}
        zoomControl={false}
        attributionControl={false}
        className="w-full h-full"
        style={{ width: "100%", height: "100%", background: "#070B14" }}
        minZoom={2}
        maxZoom={12}
      >
        {/* Dark Gray Radar Base Map */}
        <TileLayer url={TILE_LAYER_BASE} attribution={TILE_ATTRIBUTION} maxZoom={16} />
        {/* Crisp Geographic City & Country Labels */}
        <TileLayer url={TILE_LAYER_LABELS} maxZoom={16} opacity={0.85} />

        {/* Camera handler */}
        <MapCameraHandler selectedFlight={selectedFlight} />

        {/* ── Standalone Airport Markers (when airport toggle is active) ─ */}
        {showAirports &&
          airports.map((airport) => (
            <AirportMarker key={airport.iata} airport={airport} />
          ))}

        {/* ── Selected Flight Path Arc ─────────────────────────────── */}
        {selectedFlight && <FlightPathLine flight={selectedFlight} />}

        {/* ── Aircraft Markers ─────────────────────────────────────── */}
        {flights.map((flight) => (
          <PlaneMarker
            key={flight.id}
            flight={flight}
            isSelected={flight.id === selectedFlightId}
            onSelect={(f) => setSelectedFlight(f.id)}
          />
        ))}

        {/* ── Map HUD & Controls ───────────────────────────────────── */}
        <MapControls
          isRadarSweepActive={isRadarSweepActive}
          onToggleRadarSweep={() => setIsRadarSweepActive((prev) => !prev)}
          showAirports={showAirports}
          onToggleAirports={() => setShowAirports((prev) => !prev)}
        />
      </MapContainer>

      {/* ── Radar Sweep Effect Overlay (Placed on top of map) ────────── */}
      {isRadarSweepActive && (
        <div className="pointer-events-none absolute inset-0 z-[450] flex items-center justify-center overflow-hidden">
          <div className="relative w-[1100px] h-[1100px] rounded-full border border-[#00F0FF]/15">
            {/* Concentric distance rings */}
            <div className="absolute inset-28 rounded-full border border-[#00F0FF]/10"></div>
            <div className="absolute inset-56 rounded-full border border-[#00F0FF]/10"></div>
            <div className="absolute inset-84 rounded-full border border-[#00F0FF]/15"></div>
            {/* Crosshairs */}
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[#00F0FF]/10 -translate-x-1/2"></div>
            <div className="absolute left-0 right-0 top-1/2 h-px bg-[#00F0FF]/10 -translate-y-1/2"></div>
            {/* Rotating radar scanning sweep beam */}
            <div className="absolute inset-0 rounded-full radar-sweep bg-[conic-gradient(from_0deg,transparent_0deg,transparent_310deg,rgba(0,240,255,0.12)_360deg)]"></div>
          </div>
        </div>
      )}
    </div>
  );
}
