import { NextRequest, NextResponse } from "next/server";
import { FlightServiceFactory } from "@/core/services/FlightServiceFactory";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await context.params;
    const flightId = resolvedParams.id;

    if (!flightId) {
      return NextResponse.json(
        { success: false, error: "Flight ID is required" },
        { status: 400 }
      );
    }

    const flightService = FlightServiceFactory.getFlightService();
    const flight = await flightService.getFlightById(flightId);

    if (!flight) {
      return NextResponse.json(
        { success: false, error: `Flight with ID '${flightId}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: flight,
    });
  } catch (error) {
    console.error("[API /api/flights/[id]] Error fetching flight:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

