import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { AmadeusClient, FlightSearchParams } from '@/lib/integrations/amadeus-client';
import { rankFlights, getFlightRecommendations } from '@/lib/utils/flight-ranking';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      origin,
      destination,
      departureDate,
      returnDate,
      adults = 1,
      children = 0,
      infants = 0,
      travelClass = 'ECONOMY',
      nonStop = false,
    } = body;

    // Validation
    if (!origin || !destination || !departureDate) {
      return NextResponse.json(
        { error: 'Origin, destination, and departure date are required' },
        { status: 400 }
      );
    }

    // Validate IATA codes (3 letters)
    if (origin.length !== 3 || destination.length !== 3) {
      return NextResponse.json(
        { error: 'Invalid airport code format. Use 3-letter IATA codes (e.g., LAX, JFK)' },
        { status: 400 }
      );
    }

    // Validate dates
    const departure = new Date(departureDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (departure < today) {
      return NextResponse.json(
        { error: 'Departure date must be in the future' },
        { status: 400 }
      );
    }

    if (returnDate) {
      const returnD = new Date(returnDate);
      if (returnD < departure) {
        return NextResponse.json(
          { error: 'Return date must be after departure date' },
          { status: 400 }
        );
      }
    }

    // Initialize Amadeus client
    const amadeus = new AmadeusClient();

    // Search parameters
    const searchParams: FlightSearchParams = {
      originLocationCode: origin.toUpperCase(),
      destinationLocationCode: destination.toUpperCase(),
      departureDate,
      returnDate,
      adults: parseInt(adults.toString()),
      children: children ? parseInt(children.toString()) : undefined,
      infants: infants ? parseInt(infants.toString()) : undefined,
      travelClass: travelClass.toUpperCase() as any,
      nonStop,
      currencyCode: 'USD',
      max: 50,
    };

    // Search flights
    const flights = await amadeus.searchFlights(searchParams);

    // Rank flights based on intelligent algorithm
    const rankedFlights = rankFlights(flights, {
      priceWeight: 0.35,
      durationWeight: 0.25,
      stopsWeight: 0.20,
      departureTimeWeight: 0.10,
      availabilityWeight: 0.10,
      maxStops: nonStop ? 0 : 2,
    });

    // Get recommendations (cheapest, fastest, best, non-stop)
    const recommendations = getFlightRecommendations(flights);

    return NextResponse.json({
      success: true,
      searchParams,
      results: rankedFlights, // Return ranked results
      count: rankedFlights.length,
      recommendations, // Include recommendations for UI
    });
  } catch (error) {
    console.error('Flight search error:', error);
    return NextResponse.json(
      { error: 'Failed to search flights. Please try again.' },
      { status: 500 }
    );
  }
}
