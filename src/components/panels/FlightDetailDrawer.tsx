"use client";

import React from "react";
import Link from "next/link";
import { X, Plane, ExternalLink, MapPin, Calendar, Clock, Crosshair } from "lucide-react";
import { useTrackerStore } from "@/store/useTrackerStore";
import { useFlightDetail } from "@/hooks/useFlightDetail";
import { Badge } from "@/components/common/Badge";
import { AltitudeMeter } from "@/components/telemetry/AltitudeMeter";
import { Speedometer } from "@/components/telemetry/Speedometer";
import { CompassHeading } from "@/components/telemetry/CompassHeading";
import { formatDuration } from "@/lib/utils";

export function FlightDetailDrawer() {
  const selectedFlightId = useTrackerStore((s) => s.selectedFlightId);
  const isDrawerOpen = useTrackerStore((s) => s.isTelemetryDrawerOpen);
  const setSelectedFlight = useTrackerStore((s) => s.setSelectedFlight);
  const setMapViewport = useTrackerStore((s) => s.setMapViewport);

  const { flight, isLoading } = useFlightDetail(selectedFlightId, isDrawerOpen);

  if (!isDrawerOpen || !selectedFlightId) return null;

  const handleClose = () => {
    setSelectedFlight(null);
  };

  const handleFocus = () => {
    if (flight) {
      setMapViewport({
        center: [flight.currentPosition.latitude, flight.currentPosition.longitude],
        zoom: 7,
      });
    }
  };

  return (
    <div className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-[#070B14]/95 backdrop-blur-2xl border-l border-slate-700/80 shadow-[-20px_0_50px_rgba(0,0,0,0.8)] z-[1100] flex flex-col slide-in-right select-none overflow-hidden">
      {/* ── Drawer Header ────────────────────────────────────────── */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF]">
            <Plane size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-lg text-slate-100">
                {flight ? flight.flightNumber : "Loading..."}
              </span>
              {flight && (
                <Badge
                  variant={
                    flight.status === "active"
                      ? "active"
                      : flight.status === "delayed"
                      ? "delayed"
                      : "scheduled"
                  }
                  size="xs"
                  pulseDot
                />
              )}
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {flight?.airline.name} • {flight?.callsign}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClose}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* ── Drawer Content ────────────────────────────────────────── */}
      {isLoading && !flight ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 font-mono text-xs gap-3">
          <div className="w-6 h-6 rounded-full border-2 border-t-[#00F0FF] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <span>Synchronizing Telemetry...</span>
        </div>
      ) : flight ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* ── Route Card ───────────────────────────────────────── */}
          <div className="bg-[#0B0F19]/90 border border-slate-700/60 rounded-xl p-4 backdrop-blur-md">
            {/* Origin & Destination Codes */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-2xl font-mono font-bold text-[#00F0FF]">
                  {flight.origin.iata}
                </div>
                <div className="text-xs text-slate-300">{flight.origin.city}</div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Dep: {new Date(flight.scheduledDeparture).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>

              <div className="flex flex-col items-center px-2">
                <span className="text-[10px] font-mono text-slate-400 mb-1">
                  {flight.durationMinutes ? formatDuration(flight.durationMinutes) : "--"}
                </span>
                <div className="w-16 h-0.5 bg-slate-700 relative flex items-center justify-center">
                  <Plane size={14} className="text-[#00F0FF] absolute" />
                </div>
                <span className="text-[9px] font-mono text-slate-400 mt-1 uppercase">
                  {flight.phase ?? "Airborne"}
                </span>
              </div>

              <div className="text-right">
                <div className="text-2xl font-mono font-bold text-[#10B981]">
                  {flight.destination.iata}
                </div>
                <div className="text-xs text-slate-300">{flight.destination.city}</div>
                <div className="text-[10px] text-slate-400 font-mono">
                  ETA: {new Date(flight.estimatedArrival).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>Route Progress</span>
                <span className="text-[#00F0FF] font-bold">
                  {flight.routeProgressPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-[#00F0FF] rounded-full transition-all duration-300"
                  style={{ width: `${flight.routeProgressPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* ── Telemetry Readout Gauges ──────────────────────────── */}
          <div className="space-y-2.5">
            <AltitudeMeter
              altitudeFeet={flight.telemetry.altitudeFeet}
              verticalRateFpm={flight.telemetry.verticalRateFpm}
              maxAltitudeFt={flight.aircraft.maxAltitudeFt}
            />

            <Speedometer groundSpeedKnots={flight.telemetry.groundSpeedKnots} />

            <CompassHeading
              headingDegrees={flight.telemetry.headingDegrees}
              squawkCode={flight.telemetry.squawkCode}
            />
          </div>

          {/* ── Aircraft Specs Card ──────────────────────────────── */}
          <div className="bg-[#0B0F19]/90 border border-slate-700/60 rounded-xl p-3 backdrop-blur-md space-y-2 text-xs font-mono">
            <div className="text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800 pb-1">
              Aircraft Specifications
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <div>
                <span className="text-slate-400">Model: </span>
                <span className="font-semibold text-slate-100">{flight.aircraft.model}</span>
              </div>
              <div>
                <span className="text-slate-400">Registration: </span>
                <span className="font-semibold text-[#00F0FF]">{flight.aircraft.registration}</span>
              </div>
              <div>
                <span className="text-slate-400">Engines: </span>
                <span>{flight.aircraft.engines ?? 2} Jet Turbofan</span>
              </div>
              <div>
                <span className="text-slate-400">Airspace: </span>
                <span>{flight.isDomestic ? "Domestic BD" : "International"}</span>
              </div>
            </div>
          </div>

          {/* ── Action Buttons ───────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              type="button"
              onClick={handleFocus}
              className="py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Crosshair size={14} className="text-[#00F0FF]" />
              <span>Center Radar</span>
            </button>

            <Link
              href={`/flights/${encodeURIComponent(flight.id)}`}
              className="py-2.5 px-3 rounded-xl bg-[#00F0FF]/15 hover:bg-[#00F0FF]/25 text-[#00F0FF] border border-[#00F0FF]/40 font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-[0_0_15px_rgba(0,240,255,0.2)]"
            >
              <span>Full Cockpit</span>
              <ExternalLink size={13} />
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

