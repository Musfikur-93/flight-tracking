"use client";

import React, { useState } from "react";
import { Filter, X, ChevronDown, Check } from "lucide-react";
import { useTrackerStore } from "@/store/useTrackerStore";
import { QUICK_FILTERS, QuickFilterId } from "@/core/types/filter.types";

export function FlightFilterBar() {
  const filterParams = useTrackerStore((s) => s.filterParams);
  const setFilters = useTrackerStore((s) => s.setFilters);
  const resetFilters = useTrackerStore((s) => s.resetFilters);

  const [isAltMenuOpen, setIsAltMenuOpen] = useState(false);

  // Check which quick filter is active
  const isAll = !filterParams.status && filterParams.isDomestic === undefined && !filterParams.minAltitudeFt;
  const isAirborne = filterParams.status?.includes("active") && filterParams.status.length === 1 && filterParams.minAltitudeFt === undefined && filterParams.isDomestic === undefined;
  const isDomestic = filterParams.isDomestic === true;
  const isInternational = filterParams.isDomestic === false && filterParams.minAltitudeFt === undefined;
  const isDelayed = filterParams.status?.includes("delayed") && filterParams.status.length === 1;
  const isLongHaul = filterParams.minAltitudeFt === 30000;

  const getActiveFilterId = (): QuickFilterId => {
    if (isDomestic) return "domestic";
    if (isLongHaul) return "longHaul";
    if (isInternational) return "international";
    if (isAirborne) return "airborne";
    if (isDelayed) return "delayed";
    return "all";
  };

  const activeId = getActiveFilterId();

  const handleSelectQuickFilter = (id: QuickFilterId) => {
    if (id === "all") {
      resetFilters();
    } else if (id === "airborne") {
      setFilters({ status: ["active"], isDomestic: undefined, minAltitudeFt: undefined });
    } else if (id === "domestic") {
      setFilters({ isDomestic: true, status: undefined, minAltitudeFt: undefined });
    } else if (id === "international") {
      setFilters({ isDomestic: false, minAltitudeFt: undefined });
    } else if (id === "delayed") {
      setFilters({ status: ["delayed"], isDomestic: undefined, minAltitudeFt: undefined });
    } else if (id === "longHaul") {
      setFilters({ isDomestic: false, minAltitudeFt: 30000, status: ["active"] });
    }
  };

  const hasActiveFilters = !isAll;

  return (
    <div className="flex items-center gap-2 overflow-x-auto select-none py-1 scrollbar-none">
      {/* Quick Filter Pills */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0B0F19]/80 backdrop-blur-xl border border-slate-700/60 shadow-xl">
        {QUICK_FILTERS.map((qf) => {
          const isActive = activeId === qf.id;
          return (
            <button
              key={qf.id}
              type="button"
              onClick={() => handleSelectQuickFilter(qf.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                isActive
                  ? "bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40 shadow-[0_0_12px_rgba(0,240,255,0.25)]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent"
              }`}
            >
              <span>{qf.icon}</span>
              <span>{qf.label}</span>
            </button>
          );
        })}
      </div>

      {/* Altitude Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsAltMenuOpen((prev) => !prev)}
          className={`px-3 py-2 rounded-xl text-xs font-mono font-medium bg-[#0B0F19]/80 backdrop-blur-xl border transition-all flex items-center gap-1.5 shadow-xl ${
            filterParams.minAltitudeFt
              ? "border-[#00F0FF]/50 text-[#00F0FF] bg-[#00F0FF]/10"
              : "border-slate-700/60 text-slate-300 hover:text-slate-100"
          }`}
        >
          <Filter size={13} />
          <span>
            {filterParams.minAltitudeFt ? `> ${filterParams.minAltitudeFt / 1000}k FT` : "Altitude"}
          </span>
          <ChevronDown size={13} />
        </button>

        {isAltMenuOpen && (
          <div className="absolute top-full left-0 mt-2 w-44 rounded-xl bg-[#0B0F19]/95 backdrop-blur-2xl border border-slate-700/80 shadow-2xl p-1 z-[1200] font-mono text-xs">
            <button
              type="button"
              onClick={() => {
                setFilters({ minAltitudeFt: undefined });
                setIsAltMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800/60 flex items-center justify-between"
            >
              <span>Any Altitude</span>
              {!filterParams.minAltitudeFt && <Check size={14} className="text-[#00F0FF]" />}
            </button>
            <button
              type="button"
              onClick={() => {
                setFilters({ minAltitudeFt: 10000 });
                setIsAltMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800/60 flex items-center justify-between"
            >
              <span>&gt; 10,000 FT</span>
              {filterParams.minAltitudeFt === 10000 && <Check size={14} className="text-[#00F0FF]" />}
            </button>
            <button
              type="button"
              onClick={() => {
                setFilters({ minAltitudeFt: 30000 });
                setIsAltMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800/60 flex items-center justify-between"
            >
              <span>&gt; 30,000 FT (Cruise)</span>
              {filterParams.minAltitudeFt === 30000 && <Check size={14} className="text-[#00F0FF]" />}
            </button>
          </div>
        )}
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={resetFilters}
          className="px-2.5 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-red-400 bg-[#0B0F19]/80 backdrop-blur-xl border border-slate-700/60 hover:border-red-500/40 transition-colors flex items-center gap-1 shadow-xl"
          title="Reset all filters"
        >
          <X size={14} />
          <span className="hidden sm:inline">Reset</span>
        </button>
      )}
    </div>
  );
}

