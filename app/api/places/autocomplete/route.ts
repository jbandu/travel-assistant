/**
 * Places Autocomplete API Endpoint
 * Provide place suggestions as user types
 */

import { NextRequest, NextResponse } from 'next/server';
import { GooglePlacesService } from '@/lib/places';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const input = searchParams.get('input');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!input) {
      return NextResponse.json(
        { success: false, error: 'input parameter required' },
        { status: 400 }
      );
    }

    if (input.length < 2) {
      return NextResponse.json({
        success: true,
        data: {
          input,
          predictions: [],
          count: 0,
        },
      });
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

    const predictions = await placesService.autocomplete(
      input,
      lat && lng
        ? {
            lat: parseFloat(lat),
            lng: parseFloat(lng),
          }
        : undefined
    );

    return NextResponse.json({
      success: true,
      data: {
        input,
        predictions,
        count: predictions.length,
      },
    });
  } catch (error) {
    console.error('Autocomplete API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Autocomplete failed',
      },
      { status: 500 }
    );
  }
}
