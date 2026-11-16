import { NextResponse } from "next/server";
import { FlightServiceFactory } from "@/core/services/FlightServiceFactory";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const flightService = FlightServiceFactory.getFlightService();
    const airports = await flightService.getAirports();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      count: airports.length,
      data: airports,
    });
  } catch (error) {
    console.error("[API /api/airports] Error fetching airports:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

