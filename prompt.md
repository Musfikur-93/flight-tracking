# Master Prompt Guide: Flight Tracker Web Application ✈️🌐

Ei document-e `architecture.md`-er technical blueprint onujayi full flight tracker project-ta step-by-step build korar jonno ready-to-use prompts shajano hoyeche. Protiti prompt ekta nirdishto phase ba module cover kore, jate model hallucinate na kore ebong ekebare clean, production-ready code produce kore.

---

## 📋 Table of Prompts Overview

| Phase / Step | Name | Objective |
| :--- | :--- | :--- |
| **Prompt 1** | **Project Setup & Radar Theme Design Tokens** | Next.js, TypeScript, Tailwind, Lucide, Glassmorphic radar styling tokens |
| **Prompt 2** | **Domain Types & Geodesic Math Simulation Engine** | TypeScript contracts, Great Circle calculation, climb/cruise/descent physics |
| **Prompt 3** | **Mock Data Seeds & Adapter Service Architecture** | Airports, Airlines, Seed flights, `IFlightService`, `MockFlightAdapter`, API routes |
| **Prompt 4** | **Zustand Store & Real-time Tracking Hooks** | State management, active flight selection, simulation tick loop, TanStack Query |
| **Prompt 5** | **Interactive Dark Radar Map & Dynamic Aircraft Sprites** | Leaflet/MapLibre map, smooth 360° heading rotation plane markers, geodesic trails |
| **Prompt 6** | **Search, Filter Bar & Radar KPI Stats Ribbon** | Flight number / city autocomplete, multi-criteria filters, real-time metrics |
| **Prompt 7** | **Cockpit Telemetry Drawer & Flight Detail Route** | Slide-out glassmorphic panel, live altitude/speed meters, dedicated flight page |
| **Prompt 8** | **Simulation Speed Controls & Real API Migration Template** | 1x/5x/10x simulation controller, `RealFlightAdapter` (OpenSky template), test & build |

---

## 🚀 Prompt 1: Project Setup & Radar Theme Design Tokens

```markdown
Role: Senior Full-Stack Next.js & Frontend Architect
Task: Initialize the Flight Tracker project and establish the modern dark radar cockpit design system.

Context & Requirements:
1. Scaffold a Next.js (App Router) project with TypeScript, Tailwind CSS, and Lucide React icons.
2. Configure package.json with the required dependencies:
   - Zustand (global state)
   - @tanstack/react-query (telemetry fetching & polling)
   - leaflet & @types/leaflet & react-leaflet (or maplibre-gl)
   - clsx, tailwind-merge (styling utility)
3. Design System & Theme:
   - Configure tailwind.config.ts with an Aviation Radar Dark Theme:
     - Backgrounds: Dark Cockpit (#070B14, #0B0F19, #111827)
     - Neon Accents: Radar Cyan (#00F0FF, #06B6D4), Tactical Amber (#F59E0B), Emerald Green (#10B981), Warning Red (#EF4444)
     - Glassmorphism: Custom utility classes for frosted glass cards (`backdrop-blur-md bg-slate-900/60 border border-slate-700/50 shadow-2xl`).
     - Typography: Inter for UI labels, and JetBrains Mono (or monospace) for numeric telemetry readouts (altitude, speed, coordinates).
4. Create reusable UI components:
   - `src/components/common/GlassCard.tsx`: Reusable frosted container with subtle glowing borders.
   - `src/components/common/Badge.tsx`: Status badges for flight states (Active, Scheduled, Landed, Delayed).
5. Setup the Root Layout (`src/app/layout.tsx`) with dark mode default, high-contrast cockpit styling, and radar scanning visual background pattern.

Deliverables:
- package.json with exact scripts & dependencies
- tailwind.config.ts with customized colors, fonts, and shadows
- src/app/globals.css with radar grid utilities and animations
- src/components/common/GlassCard.tsx & Badge.tsx
- src/app/layout.tsx
```

---

## 🧭 Prompt 2: Domain Types & Geodesic Math Simulation Engine

```markdown
Role: Senior TypeScript Engineer & Computational Geometry Specialist
Task: Implement the core domain contracts and the spherical math simulation engine for realistic flight interpolation.

Context & Requirements:
Refer to the domain model in architecture.md:
1. `src/core/types/flight.types.ts`:
   - `Coordinates` ({ latitude: number, longitude: number })
   - `Telemetry` ({ altitudeFeet: number, groundSpeedKnots: number, verticalRateFpm: number, headingDegrees: number, squawkCode?: string })
   - `Airport` ({ iata, icao, name, city, country, coordinates })
   - `Airline` ({ name, iata, logoUrl? })
   - `FlightStatus` ('scheduled' | 'active' | 'landed' | 'delayed' | 'diverted')
   - `Flight` entity with all scheduled/actual timestamps, origin, destination, aircraft info, currentPosition, telemetry, routeProgressPercentage, and flightPath waypoints.
2. `src/core/types/filter.types.ts`:
   - `FlightFilterParams` (query?: string, status?: FlightStatus[], airline?: string, minAltitude?: number, maxAltitude?: number, isDomestic?: boolean).
3. `src/core/simulation/greatCircle.ts`:
   - Implement spherical geodesic functions:
     - `haversineDistance(coord1, coord2)`: distance in kilometers/nautical miles.
     - `calculateBearing(from, to)`: returns true initial heading in degrees (0° - 359°).
     - `interpolateGreatCircle(from, to, fraction)`: calculates intermediate coordinate at ratio `fraction` (0.0 to 1.0) along the spherical arc.
     - `generateGreatCircleWaypoints(from, to, numPoints)`: generates smooth curve path array for map polyline rendering.
4. `src/core/simulation/flightSimulator.ts`:
   - Aviation flight profile calculation based on route progress (0% - 100%):
     - Climb phase (0% - 15%): Altitude climbs from 0 to cruise (e.g. 36,000 ft), speed accelerates, vertical rate +1800 to +2500 fpm.
     - Cruise phase (15% - 85%): Altitude steady at cruise altitude with minor micro-turbulence (+/- 100 ft), speed stable around 460-510 knots, vertical rate ~0 fpm.
     - Descent phase (85% - 100%): Altitude descends to 0, speed decelerates, vertical rate -1500 to -2200 fpm.
   - Method `calculateNextTelemetry(flight, elapsedSeconds, speedMultiplier)` to advance flight position along its great circle route smoothly.

Deliverables:
- src/core/types/flight.types.ts
- src/core/types/filter.types.ts
- src/core/simulation/greatCircle.ts (well-commented mathematical implementation)
- src/core/simulation/flightSimulator.ts
```

---

## 🗄️ Prompt 3: Mock Data Seeds & Adapter Service Architecture

```markdown
Role: Full-Stack Software Architect
Task: Build the decoupled Data Access Layer using the Adapter / Factory pattern along with rich mock flight datasets.

Context & Requirements:
1. `src/data/mockAirports.json`:
   - Include major hubs:
     - Bangladesh: DAC (Hazrat Shahjalal Intl), CXB (Cox's Bazar), CGP (Shah Amanat Intl), ZYL (Osmani Intl).
     - Global: JFK (New York), LHR (London Heathrow), DXB (Dubai Intl), SIN (Singapore Changi), HND (Tokyo Haneda), DOH (Hamad Intl).
     - Full data: IATA, ICAO, airport name, city, country, lat/lng coordinates.
2. `src/data/mockAirlines.json`:
   - Biman Bangladesh Airlines (BG), Emirates (EK), Qatar Airways (QR), Singapore Airlines (SQ), British Airways (BA), Delta Air Lines (DL), US-Bangla Airlines (BS).
3. `src/data/mockFlightsSeed.ts`:
   - Generate at least 12–16 realistic active and scheduled flights across domestic and international routes (e.g., BG001 DAC->LHR, EK582 DXB->DAC, BS141 DAC->CXB, SQ446 SIN->DAC, BA117 LHR->JFK).
   - Each flight must have realistic start times, realistic Great Circle breadcrumb paths pre-computed via `greatCircle.ts`, and initial telemetry.
4. `src/core/interfaces/IFlightService.ts`:
   - Define service interface:
     - `getAllLiveFlights(filters?: FlightFilterParams): Promise<Flight[]>`
     - `getFlightById(id: string): Promise<Flight | null>`
     - `searchFlights(query: string): Promise<Flight[]>`
     - `getAirports(): Promise<Airport[]>`
5. `src/core/adapters/MockFlightAdapter.ts`:
   - Implements `IFlightService`. Maintains in-memory flight states.
   - Includes an auto-tick simulation loop so every call to `getAllLiveFlights()` returns slightly advanced coordinates and updated telemetry based on time elapsed.
   - Supports search by flight code, callsign, airline name, origin/destination city.
6. `src/core/services/FlightServiceFactory.ts`:
   - Returns `MockFlightAdapter` if `process.env.DATA_SOURCE !== 'live'`, otherwise returns `RealFlightAdapter`.
7. Next.js API Routes:
   - `src/app/api/flights/route.ts`: GET endpoint returning all live flights with query param filtering.
   - `src/app/api/flights/[id]/route.ts`: GET endpoint returning single flight details.
   - `src/app/api/airports/route.ts`: GET endpoint returning airport list.

Deliverables:
- src/data/mockAirports.json
- src/data/mockAirlines.json
- src/data/mockFlightsSeed.ts
- src/core/interfaces/IFlightService.ts
- src/core/adapters/MockFlightAdapter.ts
- src/core/services/FlightServiceFactory.ts
- src/app/api/flights/route.ts
- src/app/api/flights/[id]/route.ts
- src/app/api/airports/route.ts
```

---

## ⚡ Prompt 4: Zustand Store & Real-time Tracking Hooks

```markdown
Role: Frontend State & React Performance Specialist
Task: Build the reactive state management store with Zustand and TanStack Query polling hooks for live radar synchronization.

Context & Requirements:
1. `src/store/useTrackerStore.ts`:
   - State:
     - `selectedFlightId: string | null`
     - `hoveredFlightId: string | null`
     - `searchQuery: string`
     - `filterParams: FlightFilterParams`
     - `mapViewport: { center: [number, number], zoom: number, pitch?: number }`
     - `simulationSpeed: number` (1x, 2x, 5x, 10x)
     - `isSimulationPaused: boolean`
     - `isTelemetryDrawerOpen: boolean`
   - Actions:
     - `setSelectedFlight(id: string | null)`
     - `setHoveredFlight(id: string | null)`
     - `setSearchQuery(query: string)`
     - `setFilters(filters: Partial<FlightFilterParams>)`
     - `resetFilters()`
     - `setMapViewport(viewport)`
     - `setSimulationSpeed(speed: number)`
     - `toggleSimulationPause()`
     - `setTelemetryDrawerOpen(isOpen: boolean)`
2. `src/hooks/useFlightTracker.ts`:
   - Wrap TanStack Query:
     - Query key `['flights', filterParams]`.
     - Fetcher calls `/api/flights` with active filters.
     - `refetchInterval`: 3000ms (3 seconds) auto-polling.
     - Optimistic or local dead-reckoning interpolation between network ticks for silky 60fps movement.
3. `src/hooks/useFlightDetail.ts`:
   - Hook to fetch individual flight by ID with 2000ms polling when drawer/modal is open.

Deliverables:
- src/store/useTrackerStore.ts
- src/hooks/useFlightTracker.ts
- src/hooks/useFlightDetail.ts
- Providers wrapper component `src/app/providers.tsx` for TanStack Query Client Provider.
```

---

## 🗺️ Prompt 5: Interactive Dark Radar Map & Dynamic Aircraft Sprites

```markdown
Role: Senior GIS & Frontend Visualization Specialist
Task: Build the full-screen interactive vector radar map with rotatable airplane markers, geodesic flight paths, and radar HUD overlay.

Context & Requirements:
1. Map Engine Setup:
   - Use Leaflet (`react-leaflet`) with a high-contrast dark tile layer (e.g. CartoDB Dark Matter: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`) or MapLibre GL.
   - Ensure SSR safety (dynamic import with `ssr: false` in Next.js).
2. Dynamic Airplane Marker (`src/components/map/PlaneMarker.tsx`):
   - Custom SVG airplane icon with neon stroke and cockpit heading rotation.
   - SVG rotation dynamically bound to `flight.telemetry.headingDegrees` ($0^\circ$ to $360^\circ$) using CSS transform.
   - Visual cues:
     - Selected flight: Glowing cyan aura, pulsating radar beacon ring.
     - Emergency squawk (e.g., 7700): Pulsing red strobe.
     - Status color: Cyan for In-Air, Amber for Delayed, Emerald for Landed.
   - Click event: Sets `selectedFlightId` in Zustand and pans map center smoothly.
3. Geodesic Flight Path (`src/components/map/FlightPathLine.tsx`):
   - When a flight is selected:
     - Render historical breadcrumb path (solid neon cyan line).
     - Render remaining planned path to destination (dashed cyan/slate line).
     - Place glowing airport markers at Origin and Destination coordinates with IATA codes.
4. Interactive Controls (`src/components/map/MapControls.tsx`):
   - Zoom in/out buttons, reset view to home (e.g. Bangladesh / Global perspective), layer toggles (weather clouds placeholder, airports visibility).
   - Radar HUD overlay: Compass rose or heading indicator, scale indicator, and scanning radar sweep animation effect toggle.

Deliverables:
- src/components/map/FlightMap.tsx (Main map canvas with responsive container)
- src/components/map/PlaneMarker.tsx (Rotatable SVG marker)
- src/components/map/FlightPathLine.tsx (Curved Great Circle polyline)
- src/components/map/AirportMarker.tsx (Origin/Destination beacon)
- src/components/map/MapControls.tsx (Radar HUD buttons)
```

---

## 🔍 Prompt 6: Search, Filter Bar & Radar KPI Stats Ribbon

```markdown
Role: Senior UI/UX Frontend Engineer
Task: Create the tactical flight search bar, multi-criteria filter panel, and high-level radar dashboard stats ribbon.

Context & Requirements:
1. Search Bar (`src/components/panels/FlightSearch.tsx`):
   - Glassmorphic search input floating over the top of the map.
   - Instant search dropdown matching flight code (e.g., "BG 001"), airline name ("Emirates"), origin or destination city ("London", "Dhaka").
   - Keyboard navigation support (Arrow keys, Enter to select, Escape to clear).
   - Selecting a search result auto-focuses camera on that aircraft and opens the telemetry drawer.
2. Filter Bar (`src/components/panels/FlightFilterBar.tsx`):
   - Quick filter chips:
     - All Flights
     - In-Flight / Airborne
     - Domestic (e.g. Bangladesh routes)
     - International Long-Haul
     - Delayed
   - Altitude Slider dropdown: Filter by cruising altitude (e.g., > 30,000 ft).
   - Active filters count badge and "Clear All" button.
3. Stats Ribbon / Overview (`src/components/panels/FlightStatsOverview.tsx`):
   - Top-right or bottom-dock tactical cards displaying:
     - Active Airborne Flights (count)
     - Total Monitored Airlines (count)
     - Average Fleet Ground Speed (knots)
     - Monitored Airspaces / Hubs (count)
   - Real-time animated number ticker or monospace stats.

Deliverables:
- src/components/panels/FlightSearch.tsx
- src/components/panels/FlightFilterBar.tsx
- src/components/panels/FlightStatsOverview.tsx
```

---

## 🎛️ Prompt 7: Cockpit Telemetry Drawer & Flight Detail Route

```markdown
Role: Cockpit UI & Data Visualization Specialist
Task: Build the slide-over Telemetry Cockpit Drawer and the dedicated full-page flight details route.

Context & Requirements:
1. Telemetry Cockpit Drawer (`src/components/panels/FlightDetailDrawer.tsx`):
   - Slide-over glassmorphic drawer on the right side of the screen when a flight is selected.
   - Header: Airline logo/badge, Flight number, Callsign, Aircraft Model (e.g. "Boeing 787-9 Dreamliner"), Registration ID.
   - Route Progress Bar:
     - Origin IATA (scheduled & actual departure time) -> Visual aircraft icon moving along bar -> Destination IATA (ETA).
     - Progress percentage badge, Elapsed time vs Remaining flight time.
   - Live Telemetry Gauges (Monospace styling):
     - Altitude Gauge (visual vertical bar showing current ft vs max 43,000 ft).
     - Ground Speed Gauge (e.g., 492 KTS / 911 KM/H).
     - Vertical Speed Indicator (e.g., +1,200 FPM with climb arrow or -1,800 FPM with descent arrow).
     - Heading / Compass Dial (e.g., 315° NW).
     - Squawk Code (e.g., 1200 / 7700).
   - Close button & "Focus on Map" button.
2. Dedicated Flight Detail Page (`src/app/flights/[id]/page.tsx`):
   - Full-page dedicated cockpit view for sharing or deep analysis.
   - Left side: Full route breakdown, waypoint table, aircraft specifications.
   - Right side: Focused route map and real-time telemetry meters.
   - Back to Radar button.

Deliverables:
- src/components/panels/FlightDetailDrawer.tsx
- src/components/telemetry/AltitudeMeter.tsx
- src/components/telemetry/Speedometer.tsx
- src/components/telemetry/CompassHeading.tsx
- src/app/flights/[id]/page.tsx
```

---

## 🚀 Prompt 8: Simulation Speed Controls & Real API Migration Template

```markdown
Role: Principal Systems Architect & Performance Lead
Task: Implement simulation speed controllers, prepare the Real-World API Adapter (OpenSky Network) template, and perform end-to-end integration verification.

Context & Requirements:
1. Simulation Controller (`src/components/panels/SimulationControls.tsx`):
   - Floating dock at the bottom of the radar dashboard:
     - Play / Pause button (freezes or resumes flight simulation).
     - Speed multipliers: [1x, 2x, 5x, 10x] to fast-forward flight trajectories.
     - Current simulated UTC clock display.
     - Reset Simulation button.
2. Real-World API Adapter Template (`src/core/adapters/RealFlightAdapter.ts`):
   - Provide a clean, robust implementation ready for OpenSky Network (`https://opensky-network.org/api/states/all`) or AviationStack.
   - Implements `IFlightService`.
   - Data normalizer method converting raw OpenSky vector arrays `[icao24, callsign, origin_country, time_position, last_contact, longitude, latitude, baro_altitude, on_ground, velocity, true_track, vertical_rate]` into our domain `Flight` entity.
   - In-memory rate-limit cache (TTL 10 seconds) to avoid getting blocked by free API quotas.
   - Clear comments and README guide on setting up `.env.local` (`DATA_SOURCE=live`, `OPENSKY_USERNAME`, etc.).
3. Main Radar Page Assembly (`src/app/page.tsx`):
   - Wire together: `FlightMap`, `FlightSearch`, `FlightFilterBar`, `FlightStatsOverview`, `FlightDetailDrawer`, `SimulationControls`.
   - Seamless responsive layout for desktop, tablet, and mobile displays.
4. Testing & Verification:
   - Run type checks (`tsc --noEmit`).
   - Run production build (`next build`) and ensure zero SSR hydration issues with the map components.

Deliverables:
- src/components/panels/SimulationControls.tsx
- src/core/adapters/RealFlightAdapter.ts
- src/app/page.tsx (Integrated main dashboard)
- .env.example (Configuration documentation)
- Verification checklist confirming smooth 60fps animations and seamless mock-to-live toggle.
```

---

## 💡 How to Use These Prompts

1. **Sequential Execution:** Run **Prompt 1** through **Prompt 8** in exact sequence. Protiti prompt er deliverable complete hole erpor porer prompt execute korun.
2. **Zero Breaking Changes:** Shobgulo prompt ekta arektar upor strictly depend kore (Types -> Math/Adapters -> Store/Hooks -> UI/Map -> Panels -> Integration).
3. **Switch to Live API:** Project ready hoye gele shudhu `.env.local`-e `DATA_SOURCE=live` dile `RealFlightAdapter.ts` active hoye jabe, UI-te single line code-o change korte hobe na.

