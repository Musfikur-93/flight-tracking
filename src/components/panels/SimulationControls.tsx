"use client";

import React, { useEffect, useState } from "react";
import { Play, Pause, RotateCcw, Clock, FastForward } from "lucide-react";
import { useTrackerStore } from "@/store/useTrackerStore";

const SPEED_OPTIONS = [1, 2, 5, 10];

export function SimulationControls() {
  const isPaused = useTrackerStore((s) => s.isSimulationPaused);
  const simulationSpeed = useTrackerStore((s) => s.simulationSpeed);
  const togglePause = useTrackerStore((s) => s.toggleSimulationPause);
  const setSimulationSpeed = useTrackerStore((s) => s.setSimulationSpeed);
  const resetSimulation = useTrackerStore((s) => s.resetSimulation);

  // Live UTC Clock
  const [utcTime, setUtcTime] = useState<string>("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setUtcTime(
        now.toISOString().substring(11, 19) + " UTC"
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0B0F19]/90 border border-slate-700/70 backdrop-blur-2xl shadow-2xl select-none">
      {/* Play / Pause Toggle */}
      <button
        type="button"
        onClick={togglePause}
        title={isPaused ? "Resume Simulation" : "Pause Simulation"}
        className={`p-2 rounded-xl transition-all flex items-center justify-center ${
          isPaused
            ? "bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/50 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
            : "bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40 shadow-[0_0_12px_rgba(0,240,255,0.25)]"
        }`}
      >
        {isPaused ? <Play size={16} className="fill-current" /> : <Pause size={16} className="fill-current" />}
      </button>

      {/* Speed Multipliers */}
      <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
        <FastForward size={14} className="text-slate-500 ml-1 mr-0.5" />
        {SPEED_OPTIONS.map((speed) => {
          const isActive = simulationSpeed === speed;
          return (
            <button
              key={speed}
              type="button"
              onClick={() => setSimulationSpeed(speed)}
              className={`px-2 py-1 rounded-lg font-mono text-[11px] font-bold transition-all ${
                isActive
                  ? "bg-[#00F0FF] text-[#070B14] shadow-[0_0_8px_rgba(0,240,255,0.4)]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {speed}x
            </button>
          );
        })}
      </div>

      {/* Reset Simulation */}
      <button
        type="button"
        onClick={resetSimulation}
        title="Reset Simulation Clock"
        className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
      >
        <RotateCcw size={15} />
      </button>

      {/* UTC Clock Badge */}
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-xs text-slate-300">
        <Clock size={13} className="text-[#00F0FF]" />
        <span>{utcTime || "00:00:00 UTC"}</span>
      </div>
    </div>
  );
}

