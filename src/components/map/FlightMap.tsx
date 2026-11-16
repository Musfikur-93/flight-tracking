"use client";

import dynamic from "next/dynamic";
import React from "react";

// Dynamically import Leaflet map with SSR disabled
const FlightMapInner = dynamic(
  () => import("./FlightMapInner").then((mod) => mod.FlightMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#070B14] radar-grid-bg text-[#00F0FF]">
        <div className="relative w-16 h-16 flex items-center justify-center mb-4">
          <div className="absolute inset-0 rounded-full border border-[#00F0FF]/30 animate-ping"></div>
          <div className="w-8 h-8 rounded-full border-2 border-t-[#00F0FF] border-r-transparent border-b-[#00F0FF]/30 border-l-transparent animate-spin"></div>
        </div>
        <p className="font-mono text-xs uppercase tracking-widest text-slate-400">
          Initializing Radar Canvas...
        </p>
      </div>
    ),
  }
);

export function FlightMap() {
  return <FlightMapInner />;
}

