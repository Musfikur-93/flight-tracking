"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { formatAltitude, formatVerticalRate } from "@/lib/utils";

interface AltitudeMeterProps {
  altitudeFeet: number;
  verticalRateFpm: number;
  maxAltitudeFt?: number;
}

export function AltitudeMeter({
  altitudeFeet,
  verticalRateFpm,
  maxAltitudeFt = 43000,
}: AltitudeMeterProps) {
  const percentage = Math.min(100, Math.max(0, (altitudeFeet / maxAltitudeFt) * 100));

  const isClimbing = verticalRateFpm > 100;
  const isDescending = verticalRateFpm < -100;

  return (
    <div className="bg-[#0B0F19]/90 border border-slate-700/60 rounded-xl p-3 backdrop-blur-md">
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1.5">
        <span className="uppercase tracking-wider">Altitude</span>
        <span className="flex items-center gap-1 font-bold">
          {isClimbing ? (
            <span className="text-emerald-400 flex items-center">
              <ArrowUpRight size={13} /> {formatVerticalRate(verticalRateFpm)}
            </span>
          ) : isDescending ? (
            <span className="text-amber-400 flex items-center">
              <ArrowDownRight size={13} /> {formatVerticalRate(verticalRateFpm)}
            </span>
          ) : (
            <span className="text-slate-400 flex items-center">
              <Minus size={13} /> Level Flight
            </span>
          )}
        </span>
      </div>

      <div className="flex items-baseline justify-between font-mono mb-2">
        <span className="text-2xl font-bold text-[#00F0FF]">
          {formatAltitude(altitudeFeet)}
        </span>
        <span className="text-[11px] text-slate-400">
          Max {maxAltitudeFt.toLocaleString()} FT
        </span>
      </div>

      {/* Visual Altitude Bar */}
      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative border border-slate-700/50">
        <div
          className="h-full bg-gradient-to-r from-[#00F0FF]/50 to-[#00F0FF] rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(0,240,255,0.5)]"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

