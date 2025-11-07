import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { AmadeusClient, HotelSearchParams } from '@/lib/integrations/amadeus-client';
import { rankHotels, getHotelRecommendations } from '@/lib/utils/hotel-ranking';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      cityCode,
      checkInDate,
      checkOutDate,
      adults = 1,
      roomQuantity = 1,
      priceRange,
      ratings,
      amenities,
    } = body;

    // Validation
    if (!cityCode || !checkInDate || !checkOutDate) {
      return NextResponse.json(
        { error: 'City code, check-in date, and check-out date are required' },
        { status: 400 }
      );
    }

    // Validate city code (3 letters)
    if (cityCode.length !== 3) {
      return NextResponse.json(
        { error: 'Invalid city code format. Use 3-letter IATA codes (e.g., NYC, LAX, LON)' },
        { status: 400 }
      );
    }

    // Validate dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      return NextResponse.json(
        { error: 'Check-in date must be in the future' },
        { status: 400 }
      );
    }

    if (checkOut <= checkIn) {
      return NextResponse.json(
        { error: 'Check-out date must be after check-in date' },
        { status: 400 }
      );
    }

    // Initialize Amadeus client
    const amadeus = new AmadeusClient();

    // Search parameters
    const searchParams: HotelSearchParams = {
      cityCode: cityCode.toUpperCase(),
      checkInDate,
      checkOutDate,
      adults: parseInt(adults.toString()),
      roomQuantity: roomQuantity ? parseInt(roomQuantity.toString()) : 1,
      priceRange,
      currency: 'USD',
      ratings,
      amenities,
    };

    // Search hotels
    const hotels = await amadeus.searchHotels(searchParams);

    // Rank hotels based on intelligent algorithm
    const rankedHotels = rankHotels(hotels, {
      priceWeight: 0.35,
      ratingWeight: 0.25,
      distanceWeight: 0.15,
      amenitiesWeight: 0.15,
      cancellationWeight: 0.10,
      preferredAmenities: amenities || ['WIFI', 'PARKING', 'POOL'],
    });

    // Get recommendations (cheapest, top rated, best, luxury)
    const recommendations = getHotelRecommendations(hotels);

    return NextResponse.json({
      success: true,
      searchParams,
      results: rankedHotels, // Return ranked results
      count: rankedHotels.length,
      recommendations, // Include recommendations for UI
    });
  } catch (error) {
    console.error('Hotel search error:', error);
    return NextResponse.json(
      { error: 'Failed to search hotels. Please try again.' },
      { status: 500 }
    );
  }
}
