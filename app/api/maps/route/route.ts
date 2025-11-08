/**
 * Route Calculation API Endpoint
 * Calculates routes between multiple destinations
 */

import { NextRequest, NextResponse } from 'next/server';
import { MapService } from '@/lib/maps';
import type { Coordinates } from '@/lib/maps/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { locations, mode = 'driving' } = body;

    if (!locations || !Array.isArray(locations) || locations.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least 2 locations required (array of {lat, lng} objects)',
        },
        { status: 400 }
      );
    }

    // Validate mode
    if (!['driving', 'walking', 'cycling'].includes(mode)) {
      return NextResponse.json(
        { success: false, error: 'Invalid mode. Must be: driving, walking, or cycling' },
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

    const route = await mapService.getRoute(locations as Coordinates[], mode);

    return NextResponse.json({
      success: true,
      data: {
        route,
        summary: {
          totalDistance: mapService.formatDistance(route.totalDistance),
          totalDuration: mapService.formatDuration(route.totalDuration),
          mode,
          waypoints: locations.length,
        },
      },
    });
  } catch (error) {
    console.error('Route API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Route calculation failed',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'Use POST method with locations array',
    example: {
      locations: [
        { lat: 48.8566, lng: 2.3522 }, // Paris
        { lat: 45.764, lng: 4.8357 }, // Lyon
      ],
      mode: 'driving', // optional: driving, walking, cycling
    },
  });
}
