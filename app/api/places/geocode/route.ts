/**
 * Geocoding API Endpoint
 * Convert addresses to coordinates and vice versa
 */

import { NextRequest, NextResponse } from 'next/server';
import { GooglePlacesService } from '@/lib/places';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!address && (!lat || !lng)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Either address or lat/lng parameters required'
        },
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

    let result;

    if (address) {
      // Forward geocoding
      result = await placesService.geocode(address);
    } else {
      // Reverse geocoding
      result = await placesService.reverseGeocode({
        lat: parseFloat(lat!),
        lng: parseFloat(lng!),
      });
    }

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Location not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Geocoding API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Geocoding failed',
      },
      { status: 500 }
    );
  }
}
