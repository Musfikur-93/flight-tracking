# Flight Tracker Architecture & Technical Blueprint ✈️🌐

## 1. Executive Summary & Vision
This project is a modern, high-performance **Flight Tracker Web Application** built with **Next.js (App Router)** and **TypeScript**. 
The architecture is strictly decoupled using the **Adapter / Repository Pattern** with a **Mock Data Engine**. This ensures that the entire frontend, radar animations, telemetry visualizations, and filtering logic work seamlessly out-of-the-box today with mock data, while allowing a zero-friction switch to real-world flight APIs (e.g., OpenSky Network, AviationStack, FlightAware, ADS-B Exchange) in the future simply by switching an environment variable.

---

## 2. Core Architecture Principles

```
  ┌─────────────────────────────────────────────────────────────┐
  │                         UI LAYER                            │
  │  [Flight Radar Map]  [Search & Filter]  [Telemetry Drawer]   │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
  ┌──────────────────────────────▼──────────────────────────────┐
  │                   STATE & HOOKS LAYER                       │
  │   - useFlightTracker (TanStack Query / SWR)                  │
  │   - useFlightSimulation (Worker / Timer Interpolation)       │
  │   - useTrackerStore (Zustand: Selected Flight, Viewport)    │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
  ┌──────────────────────────────▼──────────────────────────────┐
  │               DATA ACCESS ABSTRACTION (SERVICE)             │
  │            IFlightService & FlightDataRepository            │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
         ┌───────────────────────┴───────────────────────┐
         ▼                                               ▼
┌───────────────────────────────┐     ┌───────────────────────────────┐
│       MockFlightAdapter       │     │       RealFlightAdapter       │
│  - Great Circle Generator     │     │  - OpenSky Network API        │
│  - Realistic Telemetry Sim    │     │  - AviationStack / FlightAware│
│  - Configurable Latency/Jitter│     │  - Rate-limit Caching Layer   │
└───────────────────────────────┘     └───────────────────────────────┘
```

1. **Decoupled Data Source (Adapter Pattern):**
   - UI components interact only with `IFlightService`.
   - UI does not care whether data comes from local memory or a remote live ADS-B feeder.
2. **Simulation & Smooth Path Interpolation:**
   - Real-world flight APIs update every 5–15 seconds (due to rate limits).
   - Our architecture includes a **client-side dead-reckoning / interpolation engine** so airplanes glide smoothly across the map without jarring jumps.
3. **Premium Dark Radar Aesthetic:**
   - Aviation cockpit / radar aesthetics: Deep dark theme (`#0B0F19`), neon cyan/amber accents, glassmorphic cards, typography (Inter + JetBrains Mono for telemetry).

---

## 3. Technology Stack

| Category | Recommended Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | **Next.js 14/15 (App Router)** | Server Components for initial load, fast client hydration, API routes. |
| **Language** | **TypeScript** | Strict type safety for coordinates, geo-telemetry, and flight contracts. |
| **Map Rendering** | **MapLibre GL / Leaflet** | Vector tile support, rotation-based aircraft markers, smooth 60fps pan/zoom. Zero mandatory API key blockers. |
| **Styling** | **Tailwind CSS + Custom Glassmorphism** | Rapid responsive layout, custom aviation radar styling tokens. |
| **Client State** | **Zustand** | Lightweight global state for active flight, camera fly-to, filter criteria. |
| **Data Fetching** | **TanStack Query (React Query)** | Auto-polling, caching, background refetching, simulated WebSocket channels. |
| **Icons & Visuals**| **Lucide Icons + Canvas Airplane Sprites**| Smooth heading rotations ($0^\circ - 360^\circ$) on the radar. |

---

## 4. Directory & Module Structure

```
flight-tracking/
├── .env.local                          # DATA_SOURCE=mock | live
├── architecture.md                     # System architecture document (this file)
├── package.json
├── tsconfig.json
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Root layout (Dark theme, fonts, headers)
│   │   ├── page.tsx                    # Main Radar / Flight Dashboard
│   │   ├── flights/[id]/page.tsx       # Dedicated Flight Detail & Historical Route
│   │   └── api/
│   │       ├── flights/route.ts        # Next.js API route proxying IFlightService
│   │       └── airports/route.ts       # Airport data proxy
│   ├── components/
│   │   ├── map/
│   │   │   ├── FlightMap.tsx           # Primary interactive vector radar map
│   │   │   ├── PlaneMarker.tsx         # Rotatable plane sprite with status color
│   │   │   ├── FlightPathLine.tsx      # Curved Great-Circle flight trail
│   │   │   └── MapControls.tsx         # Zoom, layer toggles, 2D/3D tilt
│   │   ├── panels/
│   │   │   ├── FlightSearch.tsx        # Search by flight number, origin, destination
│   │   │   ├── FlightFilterBar.tsx     # Filter by altitude, airline, status (In-Air, Landed)
│   │   │   ├── FlightDetailDrawer.tsx  # Slide-over telemetry panel (Speed, Altitude, ETA)
│   │   │   └── FlightStatsOverview.tsx # Active flights count, delay metrics
│   │   └── common/
│   │       ├── Badge.tsx
│   │       └── GlassCard.tsx
│   ├── core/                           # ABSTRACTION LAYER (CRITICAL)
│   │   ├── types/
│   │   │   ├── flight.types.ts         # Flight, Telemetry, Waypoint, Airport interfaces
│   │   │   └── filter.types.ts
│   │   ├── interfaces/
│   │   │   └── IFlightService.ts       # Contract for data retrieval
│   │   ├── adapters/
│   │   │   ├── MockFlightAdapter.ts    # In-memory realistic flight path generator
│   │   │   └── RealFlightAdapter.ts    # Placeholder ready for OpenSky / AviationStack
│   │   ├── services/
│   │   │   └── FlightServiceFactory.ts # Returns adapter based on process.env.DATA_SOURCE
│   │   └── simulation/
│   │       ├── greatCircle.ts          # Math for spherical flight arcs & heading
│   │       └── flightSimulator.ts      # Interpolates coordinate updates over time
│   ├── data/                           # MOCK SEED DATA
│   │   ├── mockAirports.json           # Major global hubs (DAC, JFK, LHR, DXB, SIN, etc.)
│   │   ├── mockAirlines.json           # Biman, Emirates, Singapore Airlines, Qatar, Delta
│   │   └── mockFlightsSeed.ts          # Pre-configured active flights with routes
│   └── store/
│       └── useTrackerStore.ts          # Zustand store for selected flight & UI states
```

---

## 5. Domain Models (TypeScript Contracts)

### 5.1 Flight Entity
```typescript
export type FlightStatus = 'scheduled' | 'active' | 'landed' | 'delayed' | 'diverted';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Telemetry {
  altitudeFeet: number;        // e.g. 36000
  groundSpeedKnots: number;    // e.g. 485
  verticalRateFpm: number;     // Feet per minute (+ climbing, - descending)
  headingDegrees: number;      // 0 to 359 (direction aircraft is facing)
  squawkCode?: string;         // e.g. "7700" (Emergency), "1200"
}

export interface Airport {
  iata: string;                // e.g. "DAC", "JFK"
  icao: string;                // e.g. "VGHS", "KJFK"
  name: string;                // e.g. "Hazrat Shahjalal International Airport"
  city: string;
  country: string;
  coordinates: Coordinates;
}

export interface Flight {
  id: string;                  // Unique tracking ID (e.g. "BG-001-20261028")
  flightNumber: string;        // e.g. "BG 001" or "EK 582"
  callsign: string;            // e.g. "BBC001"
  airline: {
    name: string;
    iata: string;
    logoUrl?: string;
  };
  aircraft: {
    model: string;             // e.g. "Boeing 787-9 Dreamliner"
    registration: string;      // e.g. "S2-AJX"
  };
  origin: Airport;
  destination: Airport;
  status: FlightStatus;
  currentPosition: Coordinates;
  telemetry: Telemetry;
  routeProgressPercentage: number; // 0 to 100
  scheduledDeparture: string;  // ISO timestamp
  actualDeparture?: string;
  estimatedArrival: string;
  actualArrival?: string;
  flightPath: Coordinates[];   // Breadcrumb trail / planned waypoints
}
```

---

## 6. Mock Data & Simulation Engine Strategy

### 6.1 Why simple random coordinates aren't enough
A realistic flight tracker cannot just jump airplanes randomly. It must simulate:
1. **Great Circle Arcs:** Planes travel on curved geodesic routes over the globe.
2. **Heading Calculation:** Heading angle must auto-calculate based on previous position $\rightarrow$ next position.
3. **Climb, Cruise & Descent Profiles:**
   - First 15% of flight: Climbing from ground to cruising altitude (e.g. 35,000 ft).
   - Middle 70%: Cruising at high speed (450–520 knots).
   - Final 15%: Descending towards the destination runway.

### 6.2 The `IFlightService` Interface
```typescript
export interface IFlightService {
  getAllLiveFlights(filters?: FlightFilterParams): Promise<Flight[]>;
  getFlightById(id: string): Promise<Flight | null>;
  searchFlights(query: string): Promise<Flight[]>;
  getAirports(): Promise<Airport[]>;
}
```

### 6.3 Future Real API Migration Steps
When you are ready to switch from Mock to Real API:
1. Create `src/core/adapters/RealFlightAdapter.ts` implementing `IFlightService`.
2. Add API credentials to `.env.local` (`REAL_FLIGHT_API_KEY=...`).
3. Set `DATA_SOURCE=live`.
4. **Zero lines of UI code need to change.**

---

## 7. Key Features & User Interface Plan

1. **Full-Screen Interactive Radar Map:**
   - Dark mode radar tiles with glowing airway vectors.
   - Smooth airplane rotation matching telemetry heading.
   - Clickable aircraft markers that trigger flight paths and camera focus.
2. **Flight Search & Real-time Filter Bar:**
   - Quick filters: "In Flight", "Landed", "International", "Domestic".
   - Search by flight code (e.g. "BG201", "EK582") or destination city.
3. **Telemetry Cockpit Drawer (Slide-in):**
   - Live altitude & speed gauges.
   - Flight progress bar showing elapsed time vs time remaining.
   - Origin & Destination weather preview / terminal & gate info.
4. **Playback & Simulation Controls (Mock Mode Feature):**
   - Play / Pause flight movement.
   - Simulation speed multiplier (1x, 5x, 10x).

---

## 8. Step-by-Step Implementation Roadmap

- [ ] **Phase 1: Project Scaffolding & Design Foundation**
  - Next.js + TypeScript + Tailwind CSS setup.
  - Setup core design tokens (Dark radar theme, glassmorphic UI).
- [ ] **Phase 2: Core Abstraction & Mock Simulation Engine**
  - Implement `IFlightService`, models, and `MockFlightAdapter`.
  - Implement Great Circle waypoint interpolation engine.
  - Populate high-quality seed flights (Global routes + local flights e.g., Dhaka, Dubai, London, New York).
- [ ] **Phase 3: Interactive Radar Map Component**
  - Setup vector map canvas with dark radar theme.
  - Render aircraft markers with smooth heading rotation.
  - Great circle flight path polyline rendering.
- [ ] **Phase 4: Telemetry Drawer, Search & Filter Panels**
  - Slide-in flight detail drawer with real-time speed & altitude meters.
  - Search box with autocomplete suggestions.
  - Active flights counters and status chips.
- [ ] **Phase 5: Real-World API Adapter Template & Documentation**
  - Ready-to-use template adapter for OpenSky Network / AviationStack.
  - Unit tests for data transformation.

---

## 9. Clarification Questions for Next Steps
*(We can align on these or proceed with the recommended defaults)*:
1. **Map Engine Preference:** Would you prefer **MapLibre GL** (high-performance 3D vector map, free, no API key needed) or **Leaflet** (simpler, 2D lightweight)? *(Recommended: MapLibre GL for modern aesthetic)*
2. **Initial Flight Coverage:** Should we include a mix of Bangladesh domestic flights (e.g., DAC $\rightarrow$ CXB, DAC $\rightarrow$ CGP) along with major international routes (DAC $\rightarrow$ LHR, DXB $\rightarrow$ JFK, SIN $\rightarrow$ NRT)?
