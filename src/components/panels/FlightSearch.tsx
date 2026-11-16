"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, X, Plane, ArrowRight } from "lucide-react";
import { useTrackerStore } from "@/store/useTrackerStore";
import { useFlightTracker } from "@/hooks/useFlightTracker";
import { Badge } from "@/components/common/Badge";
import type { Flight } from "@/core/types/flight.types";

export function FlightSearch() {
  const { flights } = useFlightTracker();
  const setSelectedFlight = useTrackerStore((s) => s.setSelectedFlight);

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter flights matching query
  const matchingFlights = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return flights.filter((f) => {
      const flightNum = f.flightNumber.toLowerCase().replace(/\s/g, "");
      const callsign = f.callsign.toLowerCase();
      const airline = f.airline.name.toLowerCase();
      const originCity = f.origin.city.toLowerCase();
      const destCity = f.destination.city.toLowerCase();
      const originIata = f.origin.iata.toLowerCase();
      const destIata = f.destination.iata.toLowerCase();
      const cleanQ = q.replace(/\s/g, "");

      return (
        flightNum.includes(cleanQ) ||
        callsign.includes(q) ||
        airline.includes(q) ||
        originCity.includes(q) ||
        destCity.includes(q) ||
        originIata.includes(q) ||
        destIata.includes(q)
      );
    }).slice(0, 8); // max 8 results in dropdown
  }, [flights, query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (flight: Flight) => {
    setSelectedFlight(flight.id);
    setQuery("");
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || matchingFlights.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % matchingFlights.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + matchingFlights.length) % matchingFlights.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (matchingFlights[highlightedIndex]) {
        handleSelect(matchingFlights[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md select-none">
      {/* Search Input Box */}
      <div className="relative flex items-center bg-[#0B0F19]/85 backdrop-blur-xl border border-slate-700/60 rounded-xl px-3.5 py-2.5 shadow-2xl focus-within:border-[#00F0FF]/60 focus-within:shadow-[0_0_20px_rgba(0,240,255,0.2)] transition-all">
        <Search size={18} className="text-slate-400 mr-2.5 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search flight (e.g. BG 001, Dhaka, Emirates)..."
          className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-400 outline-none font-sans"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="p-1 hover:text-slate-200 text-slate-400"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Autocomplete Suggestions Dropdown */}
      {isOpen && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0B0F19]/95 backdrop-blur-2xl border border-slate-700/80 rounded-xl overflow-hidden shadow-2xl z-[1200] max-h-80 overflow-y-auto">
          {matchingFlights.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-slate-400 font-mono">
              No matching flights found
            </div>
          ) : (
            <div className="py-1 divide-y divide-slate-800/60">
              {matchingFlights.map((flight, index) => {
                const isHighlighted = index === highlightedIndex;
                return (
                  <div
                    key={flight.id}
                    onClick={() => handleSelect(flight)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                      isHighlighted ? "bg-[#00F0FF]/10 text-slate-100" : "hover:bg-slate-800/40 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-[#00F0FF]">
                        <Plane size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-[#00F0FF]">
                            {flight.flightNumber}
                          </span>
                          <span className="text-xs text-slate-400">
                            {flight.airline.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
                          <span>{flight.origin.city} ({flight.origin.iata})</span>
                          <ArrowRight size={11} className="text-slate-500" />
                          <span>{flight.destination.city} ({flight.destination.iata})</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={flight.status === "active" ? "active" : flight.status === "delayed" ? "delayed" : "scheduled"} size="xs" />
                      <span className="text-[10px] font-mono text-slate-400">
                        {flight.telemetry.altitudeFeet.toLocaleString()} FT
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

