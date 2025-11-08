/**
 * Geocoding API Endpoint
 * Converts addresses/places to coordinates
 */

import { NextRequest, NextResponse } from 'next/server';
import { MapService } from '@/lib/maps';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query parameter required' },
        { status: 400 }
      );
    }

    const mapService = new MapService();

    if (!mapService.isAvailable()) {
      return NextResponse.json(
        { success: false, error: 'Mapbox service not configured' },
        { status: 500 }
      );
    }

    const results = await mapService.geocode(query);

    return NextResponse.json({
      success: true,
      data: {
        query,
        results,
        count: results.length,
      },
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
