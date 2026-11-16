import { NextRequest, NextResponse } from "next/server";
import { FlightServiceFactory } from "@/core/services/FlightServiceFactory";
import type { FlightFilterParams } from "@/core/types/filter.types";
import type { FlightStatus } from "@/core/types/flight.types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filter parameters from query string
    const filters: FlightFilterParams = {};

    const query = searchParams.get("query");
    if (query) filters.query = query;

    const statusParam = searchParams.get("status");
    if (statusParam) {
      filters.status = statusParam.split(",").map((s) => s.trim()) as FlightStatus[];
    }

    const airlineIata = searchParams.get("airlineIata");
    if (airlineIata) filters.airlineIata = airlineIata;

    const minAlt = searchParams.get("minAltitudeFt");
    if (minAlt && !isNaN(Number(minAlt))) {
      filters.minAltitudeFt = Number(minAlt);
    }

    const maxAlt = searchParams.get("maxAltitudeFt");
    if (maxAlt && !isNaN(Number(maxAlt))) {
      filters.maxAltitudeFt = Number(maxAlt);
    }

    const isDomestic = searchParams.get("isDomestic");
    if (isDomestic !== null && isDomestic !== undefined) {
      filters.isDomestic = isDomestic === "true";
    }

    const originIata = searchParams.get("originIata");
    if (originIata) filters.originIata = originIata;

    const destinationIata = searchParams.get("destinationIata");
    if (destinationIata) filters.destinationIata = destinationIata;

    const limit = searchParams.get("limit");
    if (limit && !isNaN(Number(limit))) {
      filters.limit = Number(limit);
    }

    const flightService = FlightServiceFactory.getFlightService();
    const flights = await flightService.getAllLiveFlights(filters);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      count: flights.length,
      data: flights,
    });
  } catch (error) {
    console.error("[API /api/flights] Error fetching flights:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

