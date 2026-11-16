"use client";

import React from "react";
import { bearingToCompass } from "@/lib/utils";
import { Navigation } from "lucide-react";

interface CompassHeadingProps {
  headingDegrees: number;
  squawkCode?: string;
}

export function CompassHeading({ headingDegrees, squawkCode }: CompassHeadingProps) {
  const cardinal = bearingToCompass(headingDegrees);

  return (
    <div className="bg-[#0B0F19]/90 border border-slate-700/60 rounded-xl p-3 backdrop-blur-md flex items-center justify-between">
      {/* Heading Value */}
      <div>
        <div className="text-xs text-slate-400 font-mono uppercase tracking-wider mb-1">
          True Heading
        </div>
        <div className="font-mono flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-100">
            {headingDegrees}°
          </span>
          <span className="text-sm font-semibold text-[#00F0FF]">
            {cardinal}
          </span>
        </div>
        {squawkCode && (
          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
            Squawk: <span className="text-[#10B981] font-bold">{squawkCode}</span>
          </div>
        )}
      </div>

      {/* Mini Compass Rose */}
      <div className="relative w-12 h-12 rounded-full border border-slate-700 bg-slate-900/80 flex items-center justify-center shrink-0 shadow-inner">
        <span className="absolute top-0.5 text-[8px] font-mono font-bold text-slate-400">N</span>
        <span className="absolute bottom-0.5 text-[8px] font-mono font-bold text-slate-600">S</span>
        <span className="absolute right-1 text-[8px] font-mono font-bold text-slate-600">E</span>
        <span className="absolute left-1 text-[8px] font-mono font-bold text-slate-600">W</span>
        <div
          className="transition-transform duration-300 ease-out text-[#00F0FF]"
          style={{ transform: `rotate(${headingDegrees}deg)` }}
        >
          <Navigation size={18} className="fill-[#00F0FF]/30" />
        </div>
      </div>
    </div>
  );
}

