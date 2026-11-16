"use client";

import React from "react";
import { knotsToKmh } from "@/lib/utils";

interface SpeedometerProps {
  groundSpeedKnots: number;
}

export function Speedometer({ groundSpeedKnots }: SpeedometerProps) {
  const kmh = knotsToKmh(groundSpeedKnots);
  const mach = (groundSpeedKnots / 573.8).toFixed(2); // approximate Mach at cruise

  return (
    <div className="bg-[#0B0F19]/90 border border-slate-700/60 rounded-xl p-3 backdrop-blur-md">
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1.5">
        <span className="uppercase tracking-wider">Ground Speed</span>
        <span className="text-[#F59E0B] font-bold">Mach {mach}</span>
      </div>

      <div className="flex items-baseline justify-between font-mono mb-2">
        <span className="text-2xl font-bold text-[#F59E0B]">
          {groundSpeedKnots} <span className="text-xs font-normal text-slate-400">KTS</span>
        </span>
        <span className="text-sm font-semibold text-slate-300">
          {kmh} <span className="text-[10px] font-normal text-slate-400">KM/H</span>
        </span>
      </div>

      {/* Speed dial bar (relative to max 600 knots) */}
      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative border border-slate-700/50">
        <div
          className="h-full bg-gradient-to-r from-[#F59E0B]/50 to-[#F59E0B] rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
          style={{ width: `${Math.min(100, (groundSpeedKnots / 600) * 100)}%` }}
        />
      </div>
    </div>
  );
}

