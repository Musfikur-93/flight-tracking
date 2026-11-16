import React from "react";
import Link from "next/link";
import { ArrowLeft, Plane, MapPin, Gauge, Clock, Shield, Compass } from "lucide-react";
import { FlightServiceFactory } from "@/core/services/FlightServiceFactory";
import { Badge } from "@/components/common/Badge";
import { GlassCard } from "@/components/common/GlassCard";
import { formatAltitude, formatSpeed, formatDuration, bearingToCompass } from "@/lib/utils";

interface FlightDetailPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function FlightDetailPage({ params }: FlightDetailPageProps) {
  const resolvedParams = await params;
  const flightId = decodeURIComponent(resolvedParams.id);

  const flightService = FlightServiceFactory.getFlightService();
  const flight = await flightService.getFlightById(flightId);

  if (!flight) {
    return (
      <div className="min-h-screen cockpit-bg radar-grid-bg flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-mono font-bold text-red-400 mb-2">Flight Not Found</h1>
        <p className="text-slate-400 font-mono text-sm mb-6">
          No telemetry stream available for ID: {flightId}
        </p>
        <Link
          href="/"
          className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 font-mono text-xs hover:border-[#00F0FF] transition-colors"
        >
          Return to Radar Dashboard
        </Link>
      </div>
    );
  }

  const cardinal = bearingToCompass(flight.telemetry.headingDegrees);

  return (
    <div className="min-h-screen cockpit-bg text-slate-200 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-[#070B14]/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-[#00F0FF] border border-slate-700 transition-colors flex items-center gap-1.5 font-mono text-xs"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back to Radar</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="font-mono font-extrabold text-xl text-[#00F0FF]">
              {flight.flightNumber}
            </h1>
            <span className="text-slate-500 font-mono">/</span>
            <span className="font-mono text-sm text-slate-300">{flight.callsign}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            variant={
              flight.status === "active"
                ? "active"
                : flight.status === "delayed"
                ? "delayed"
                : "scheduled"
            }
            size="md"
            pulseDot
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Route Header Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-[#0B0F19]/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
          {/* Origin */}
          <div className="space-y-1">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-widest">Origin</div>
            <div className="text-4xl font-mono font-black text-[#00F0FF]">{flight.origin.iata}</div>
            <div className="text-base font-semibold text-slate-100">{flight.origin.name}</div>
            <div className="text-xs text-slate-400 font-mono">
              {flight.origin.city}, {flight.origin.country}
            </div>
            <div className="text-xs text-[#00F0FF] font-mono pt-2">
              Scheduled Departure: {new Date(flight.scheduledDeparture).toUTCString()}
            </div>
          </div>

          {/* Flight Path Graphic */}
          <div className="flex flex-col items-center justify-center py-4 px-2 text-center space-y-2">
            <div className="text-xs font-mono text-[#F59E0B] font-bold">
              {flight.durationMinutes ? formatDuration(flight.durationMinutes) : "Non-stop"}
            </div>
            <div className="w-full flex items-center gap-2">
              <div className="h-0.5 flex-1 bg-slate-700" />
              <div className="w-8 h-8 rounded-full bg-[#00F0FF]/15 border border-[#00F0FF]/40 flex items-center justify-center text-[#00F0FF]">
                <Plane size={16} />
              </div>
              <div className="h-0.5 flex-1 bg-slate-700" />
            </div>
            <div className="text-xs font-mono text-slate-400">
              Progress: <span className="text-[#00F0FF] font-bold">{flight.routeProgressPercentage}%</span> ({flight.distanceNm?.toLocaleString()} NM)
            </div>
          </div>

          {/* Destination */}
          <div className="space-y-1 md:text-right">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-widest">Destination</div>
            <div className="text-4xl font-mono font-black text-[#10B981]">{flight.destination.iata}</div>
            <div className="text-base font-semibold text-slate-100">{flight.destination.name}</div>
            <div className="text-xs text-slate-400 font-mono">
              {flight.destination.city}, {flight.destination.country}
            </div>
            <div className="text-xs text-[#10B981] font-mono pt-2">
              Estimated Arrival: {new Date(flight.estimatedArrival).toUTCString()}
            </div>
          </div>
        </div>

        {/* Telemetry Metric Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <GlassCard variant="panel" accentTop>
            <div className="text-xs font-mono text-slate-400 uppercase mb-1">Baro Altitude</div>
            <div className="text-3xl font-mono font-bold text-[#00F0FF]">
              {flight.telemetry.altitudeFeet.toLocaleString()} <span className="text-xs font-normal">FT</span>
            </div>
            <div className="text-xs font-mono text-slate-400 mt-1">
              Rate: {flight.telemetry.verticalRateFpm >= 0 ? `+${flight.telemetry.verticalRateFpm}` : flight.telemetry.verticalRateFpm} FPM
            </div>
          </GlassCard>

          <GlassCard variant="panel" accentTop>
            <div className="text-xs font-mono text-slate-400 uppercase mb-1">Ground Speed</div>
            <div className="text-3xl font-mono font-bold text-[#F59E0B]">
              {flight.telemetry.groundSpeedKnots} <span className="text-xs font-normal">KTS</span>
            </div>
            <div className="text-xs font-mono text-slate-400 mt-1">
              Mach {(flight.telemetry.groundSpeedKnots / 573.8).toFixed(2)}
            </div>
          </GlassCard>

          <GlassCard variant="panel" accentTop>
            <div className="text-xs font-mono text-slate-400 uppercase mb-1">Heading / Track</div>
            <div className="text-3xl font-mono font-bold text-slate-100">
              {flight.telemetry.headingDegrees}° <span className="text-base text-[#00F0FF]">{cardinal}</span>
            </div>
            <div className="text-xs font-mono text-slate-400 mt-1">
              Squawk: {flight.telemetry.squawkCode ?? "1200"}
            </div>
          </GlassCard>

          <GlassCard variant="panel" accentTop>
            <div className="text-xs font-mono text-slate-400 uppercase mb-1">Aircraft & Tail</div>
            <div className="text-xl font-mono font-bold text-slate-100 truncate">
              {flight.aircraft.registration}
            </div>
            <div className="text-xs font-mono text-slate-400 mt-1 truncate">
              {flight.aircraft.model}
            </div>
          </GlassCard>
        </div>

        {/* Technical Specs & Waypoint Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Airline & Aircraft Profile */}
          <div className="bg-[#0B0F19]/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 font-mono text-xs">
            <h3 className="font-bold text-sm text-[#00F0FF] uppercase tracking-wider flex items-center gap-2">
              <Shield size={16} /> Airframe & Operator Intelligence
            </h3>
            <div className="divide-y divide-slate-800/80">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Carrier Operator:</span>
                <span className="font-semibold text-slate-100">{flight.airline.name}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Carrier IATA / ICAO:</span>
                <span className="font-semibold text-slate-100">{flight.airline.iata} / {flight.airline.icao ?? "--"}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Aircraft Model:</span>
                <span className="font-semibold text-slate-100">{flight.aircraft.model}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Tail Registration:</span>
                <span className="font-semibold text-[#00F0FF]">{flight.aircraft.registration}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Max Cruising Ceiling:</span>
                <span className="font-semibold text-slate-100">{flight.aircraft.maxAltitudeFt?.toLocaleString() ?? "43,000"} FT</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Operational Domain:</span>
                <span className="font-semibold text-[#10B981]">{flight.isDomestic ? "Domestic Airspace" : "Cross-Border International"}</span>
              </div>
            </div>
          </div>

          {/* Current Telemetry Coordinates */}
          <div className="bg-[#0B0F19]/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 font-mono text-xs">
            <h3 className="font-bold text-sm text-[#00F0FF] uppercase tracking-wider flex items-center gap-2">
              <Compass size={16} /> Live Geodesic Telemetry
            </h3>
            <div className="divide-y divide-slate-800/80">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Current Latitude:</span>
                <span className="font-semibold text-[#00F0FF]">{flight.currentPosition.latitude.toFixed(5)}° N</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Current Longitude:</span>
                <span className="font-semibold text-[#00F0FF]">{flight.currentPosition.longitude.toFixed(5)}° E</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Current Phase:</span>
                <span className="font-semibold text-amber-400 uppercase">{flight.phase ?? "Cruise"}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Planned Great Circle Waypoints:</span>
                <span className="font-semibold text-slate-100">{flight.flightPath?.length ?? 60} Coordinates</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Data Source:</span>
                <span className="font-semibold text-emerald-400">IFlightService Adapter</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

