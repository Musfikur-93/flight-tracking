import { create } from "zustand";
import type { FlightFilterParams } from "@/core/types/filter.types";

export interface MapViewport {
  center: [number, number]; // [lat, lng]
  zoom: number;
  pitch?: number;
  bearing?: number;
}

export const DEFAULT_VIEWPORT: MapViewport = {
  center: [23.8433, 90.3978], // Centered around Bangladesh / South Asia hub
  zoom: 4,
};

export const INITIAL_FILTER_PARAMS: FlightFilterParams = {};

export interface TrackerStoreState {
  // ── Selection & Focus ──────────────────────────────────────────────
  selectedFlightId: string | null;
  hoveredFlightId: string | null;
  isTelemetryDrawerOpen: boolean;

  // ── Search & Filter ────────────────────────────────────────────────
  searchQuery: string;
  filterParams: FlightFilterParams;

  // ── Map Viewport ───────────────────────────────────────────────────
  mapViewport: MapViewport;

  // ── Simulation Engine State ────────────────────────────────────────
  simulationSpeed: number; // 1x, 2x, 5x, 10x
  isSimulationPaused: boolean;

  // ── Actions ────────────────────────────────────────────────────────
  setSelectedFlight: (id: string | null) => void;
  setHoveredFlight: (id: string | null) => void;
  setTelemetryDrawerOpen: (isOpen: boolean) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<FlightFilterParams>) => void;
  resetFilters: () => void;
  setMapViewport: (viewport: Partial<MapViewport>) => void;
  setSimulationSpeed: (speed: number) => void;
  toggleSimulationPause: () => void;
  resetSimulation: () => void;
}

export const useTrackerStore = create<TrackerStoreState>((set) => ({
  selectedFlightId: null,
  hoveredFlightId: null,
  isTelemetryDrawerOpen: false,

  searchQuery: "",
  filterParams: INITIAL_FILTER_PARAMS,

  mapViewport: DEFAULT_VIEWPORT,

  simulationSpeed: 1,
  isSimulationPaused: false,

  setSelectedFlight: (id) =>
    set({
      selectedFlightId: id,
      isTelemetryDrawerOpen: Boolean(id),
    }),

  setHoveredFlight: (id) => set({ hoveredFlightId: id }),

  setTelemetryDrawerOpen: (isOpen) =>
    set((state) => ({
      isTelemetryDrawerOpen: isOpen,
      // If closing drawer, optionally keep selection or leave as is
      selectedFlightId: isOpen ? state.selectedFlightId : state.selectedFlightId,
    })),

  setSearchQuery: (query) =>
    set((state) => ({
      searchQuery: query,
      filterParams: {
        ...state.filterParams,
        query: query.trim() || undefined,
      },
    })),

  setFilters: (filters) =>
    set((state) => ({
      filterParams: {
        ...state.filterParams,
        ...filters,
      },
    })),

  resetFilters: () =>
    set({
      searchQuery: "",
      filterParams: INITIAL_FILTER_PARAMS,
    }),

  setMapViewport: (viewport) =>
    set((state) => ({
      mapViewport: {
        ...state.mapViewport,
        ...viewport,
      },
    })),

  setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),

  toggleSimulationPause: () =>
    set((state) => ({ isSimulationPaused: !state.isSimulationPaused })),

  resetSimulation: () =>
    set({
      simulationSpeed: 1,
      isSimulationPaused: false,
    }),
}));

