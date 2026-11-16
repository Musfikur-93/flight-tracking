"use client";

import React from "react";
import { Plus, Minus, Compass, Home, Radio } from "lucide-react";
import { useMap } from "react-leaflet";
import { DEFAULT_VIEWPORT, useTrackerStore } from "@/store/useTrackerStore";

interface MapControlsProps {
  isRadarSweepActive: boolean;
  onToggleRadarSweep: () => void;
  showAirports: boolean;
  onToggleAirports: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  isRadarSweepActive,
  onToggleRadarSweep,
  showAirports,
  onToggleAirports,
}) => {
  const map = useMap();
  const setSelectedFlight = useTrackerStore((s) => s.setSelectedFlight);

  const handleZoomIn = () => map.zoomIn();
  const handleZoomOut = () => map.zoomOut();

  const handleResetHome = () => {
    map.flyTo(DEFAULT_VIEWPORT.center, DEFAULT_VIEWPORT.zoom, {
      duration: 1.5,
      easeLinearity: 0.25,
    });
    setSelectedFlight(null);
  };

  return (
    <div className="absolute right-4 bottom-24 z-[1000] flex flex-col gap-2 select-none">
      {/* Zoom Controls */}
      <div className="flex flex-col rounded-xl overflow-hidden bg-[#0B0F19]/90 border border-slate-700/60 backdrop-blur-md shadow-2xl">
        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-2.5 text-slate-300 hover:text-[#00F0FF] hover:bg-slate-800/60 transition-colors border-b border-slate-700/60"
        >
          <Plus size={18} />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-2.5 text-slate-300 hover:text-[#00F0FF] hover:bg-slate-800/60 transition-colors"
        >
          <Minus size={18} />
        </button>
      </div>

      {/* Navigation & Radar Features */}
      <div className="flex flex-col rounded-xl overflow-hidden bg-[#0B0F19]/90 border border-slate-700/60 backdrop-blur-md shadow-2xl">
        <button
          type="button"
          onClick={handleResetHome}
          title="Reset to Hub (Dhaka)"
          className="p-2.5 text-slate-300 hover:text-[#00F0FF] hover:bg-slate-800/60 transition-colors border-b border-slate-700/60"
        >
          <Home size={18} />
        </button>
        <button
          type="button"
          onClick={onToggleRadarSweep}
          title={isRadarSweepActive ? "Disable Radar Sweep" : "Enable Radar Sweep"}
          className={`p-2.5 transition-colors border-b border-slate-700/60 ${
            isRadarSweepActive ? "text-[#00F0FF] bg-[#00F0FF]/15" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Radio size={18} />
        </button>
        <button
          type="button"
          onClick={onToggleAirports}
          title={showAirports ? "Hide Airports" : "Show Airports"}
          className={`p-2.5 transition-colors font-mono text-[10px] font-bold ${
            showAirports ? "text-[#10B981] bg-[#10B981]/15" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          APT
        </button>
      </div>
    </div>
  );
};

