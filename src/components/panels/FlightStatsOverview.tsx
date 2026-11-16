"use client";

import React, { useMemo } from "react";
import { Plane, Compass, Gauge, Building2 } from "lucide-react";
import { useFlightTracker } from "@/hooks/useFlightTracker";

export function FlightStatsOverview() {
  const { flights } = useFlightTracker();

  const stats = useMemo(() => {
    const total = flights.length;
    const airborne = flights.filter((f) => f.status === "active").length;
    const airlinesSet = new Set(flights.map((f) => f.airline.iata));

    // Calculate average ground speed of airborne aircraft
    const activeFlights = flights.filter((f) => f.status === "active" && f.telemetry.groundSpeedKnots > 0);
    const avgSpeed =
      activeFlights.length > 0
        ? Math.round(
            activeFlights.reduce((acc, f) => acc + f.telemetry.groundSpeedKnots, 0) /
              activeFlights.length
          )
        : 0;

    return {
      total,
      airborne,
      airlinesCount: airlinesSet.size,
      avgSpeed,
    };
  }, [flights]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 select-none">
      {/* Airborne */}
      <div className="bg-[#0B0F19]/85 backdrop-blur-xl border border-slate-700/60 rounded-xl px-3.5 py-2 shadow-2xl flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF] shrink-0">
          <Plane size={16} />
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Airborne</div>
          <div className="font-mono font-bold text-base text-[#00F0FF] leading-none mt-0.5">
            {stats.airborne} <span className="text-[11px] font-normal text-slate-500">/ {stats.total}</span>
          </div>
        </div>
      </div>

      {/* Avg Speed */}
      <div className="bg-[#0B0F19]/85 backdrop-blur-xl border border-slate-700/60 rounded-xl px-3.5 py-2 shadow-2xl flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B] shrink-0">
          <Gauge size={16} />
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Avg Speed</div>
          <div className="font-mono font-bold text-base text-[#F59E0B] leading-none mt-0.5">
            {stats.avgSpeed} <span className="text-[10px] font-normal text-slate-500">KTS</span>
          </div>
        </div>
      </div>

      {/* Airlines */}
      <div className="bg-[#0B0F19]/85 backdrop-blur-xl border border-slate-700/60 rounded-xl px-3.5 py-2 shadow-2xl flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] shrink-0">
          <Building2 size={16} />
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Airlines</div>
          <div className="font-mono font-bold text-base text-[#10B981] leading-none mt-0.5">
            {stats.airlinesCount} <span className="text-[10px] font-normal text-slate-500">Fleet</span>
          </div>
        </div>
      </div>

      {/* Airspaces */}
      <div className="bg-[#0B0F19]/85 backdrop-blur-xl border border-slate-700/60 rounded-xl px-3.5 py-2 shadow-2xl flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6] shrink-0">
          <Compass size={16} />
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Radar Feed</div>
          <div className="font-mono font-bold text-base text-[#8B5CF6] leading-none mt-0.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
            <span>Live 60fps</span>
          </div>
        </div>
      </div>
    </div>
  );
}

