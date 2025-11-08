/**
 * Places Search API Endpoint
 * Search for places by query and location
 */

import { NextRequest, NextResponse } from 'next/server';
import { GooglePlacesService } from '@/lib/places';
import type { PlaceType } from '@/lib/places/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius');
    const type = searchParams.get('type');
    const minRating = searchParams.get('minRating');

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query parameter required' },
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

    const places = await placesService.searchPlaces({
      query,
      location:
        lat && lng
          ? {
              lat: parseFloat(lat),
              lng: parseFloat(lng),
            }
          : undefined,
      radius: radius ? parseInt(radius) : 5000,
      type: type as PlaceType | undefined,
      minRating: minRating ? parseFloat(minRating) : undefined,
    });

    return NextResponse.json({
      success: true,
      data: {
        query,
        places,
        count: places.length,
      },
    });
  } catch (error) {
    console.error('Places search API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Place search failed',
      },
      { status: 500 }
    );
  }
}
