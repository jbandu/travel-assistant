/**
 * Nearby Places API Endpoint
 * Find places near a specific location
 */

import { NextRequest, NextResponse } from 'next/server';
import { GooglePlacesService } from '@/lib/places';
import type { PlaceType } from '@/lib/places/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const type = searchParams.get('type');
    const radius = searchParams.get('radius');

    if (!lat || !lng) {
      return NextResponse.json(
        { success: false, error: 'lat and lng parameters required' },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { success: false, error: 'type parameter required (e.g., restaurant, hotel, cafe)' },
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

    const places = await placesService.searchNearby(
      {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      },
      type as PlaceType,
      radius ? parseInt(radius) : 5000
    );

    return NextResponse.json({
      success: true,
      data: {
        location: { lat: parseFloat(lat), lng: parseFloat(lng) },
        type,
        radius: radius ? parseInt(radius) : 5000,
        places,
        count: places.length,
      },
    });
  } catch (error) {
    console.error('Nearby places API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Nearby search failed',
      },
      { status: 500 }
    );
  }
}
