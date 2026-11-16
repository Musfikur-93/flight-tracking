"use client";

import React from "react";
import { FlightMap } from "@/components/map/FlightMap";
import { FlightSearch } from "@/components/panels/FlightSearch";
import { FlightFilterBar } from "@/components/panels/FlightFilterBar";
import { FlightStatsOverview } from "@/components/panels/FlightStatsOverview";
import { FlightDetailDrawer } from "@/components/panels/FlightDetailDrawer";
import { SimulationControls } from "@/components/panels/SimulationControls";
import { Radio } from "lucide-react";

export default function RadarDashboard() {
  return (
    <main className="fixed inset-0 overflow-hidden bg-[#070B14]">
      {/* ── Layer 1: Full-screen Vector Radar Map ─────────────────── */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <FlightMap />
      </div>

      {/* ── Layer 2: Floating Top Tactical Control Header ─────────── */}
      <header className="absolute top-4 left-4 right-4 z-[900] pointer-events-none flex flex-col gap-2.5">
        {/* Top Row: Branding + Search + Stats Overview */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Logo Brand Pill */}
          <div className="pointer-events-auto flex items-center gap-3 bg-[#0B0F19]/90 backdrop-blur-2xl border border-slate-700/70 rounded-2xl px-4 py-2.5 shadow-2xl shrink-0">
            <div className="w-8 h-8 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/40 flex items-center justify-center text-[#00F0FF]">
              <Radio size={18} className="animate-pulse" />
            </div>
            <div>
              <div className="font-mono font-extrabold text-sm text-[#00F0FF] tracking-wider leading-none">
                FLIGHT TRACKER
              </div>
              <div className="text-[10px] font-mono text-slate-400 leading-none mt-1">
                Aviation Radar HUD • ADS-B
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="pointer-events-auto flex-1 min-w-[280px] max-w-md">
            <FlightSearch />
          </div>

          {/* KPI Ribbon (visible on lg+ screens) */}
          <div className="pointer-events-auto hidden lg:block">
            <FlightStatsOverview />
          </div>
        </div>

        {/* Filter Bar Chips */}
        <div className="pointer-events-auto self-start">
          <FlightFilterBar />
        </div>
      </header>

      {/* ── Layer 3: Floating Bottom Dock: Simulation Controls ────── */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[900] pointer-events-auto">
        <SimulationControls />
      </div>

      {/* ── Layer 4: Slide-over Telemetry Cockpit Drawer ──────────── */}
      <FlightDetailDrawer />
    </main>
  );
}
