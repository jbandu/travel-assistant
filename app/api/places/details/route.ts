/**
 * Place Details API Endpoint
 * Get detailed information about a specific place
 */

import { NextRequest, NextResponse } from 'next/server';
import { GooglePlacesService } from '@/lib/places';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get('placeId');

    if (!placeId) {
      return NextResponse.json(
        { success: false, error: 'placeId parameter required' },
        { status: 400 }
      );
    }

    const placesService = new GooglePlacesService();

    if (!placesService.isAvailable()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Google Places API key not configured',
          note: 'Please add GOOGLE_MAPS_API_KEY to your .env file'
        },
        { status: 500 }
      );
    }

    const place = await placesService.getPlaceDetails(placeId);

    if (!place) {
      return NextResponse.json(
        { success: false, error: 'Place not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: place,
    });
  } catch (error) {
    console.error('Place details API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch place details',
      },
      { status: 500 }
    );
  }
}
