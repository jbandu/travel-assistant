/**
 * Local Experiences Search API
 * Search for restaurants, activities, attractions using Google Places
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { GooglePlacesService } from '@/lib/places/google-places-service';

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { location, type, query, radius, minRating, maxPrice, openNow } = body;

    // Validation
    if (!location || !location.lat || !location.lng) {
      return NextResponse.json(
        { error: 'Location (lat, lng) is required' },
        { status: 400 }
      );
    }

    const placesService = new GooglePlacesService();

    let results;

    if (query) {
      // Text search with query
      results = await placesService.searchPlaces({
        query,
        location: { lat: parseFloat(location.lat), lng: parseFloat(location.lng) },
        radius: radius || 5000,
        type,
        minRating,
        maxPrice,
        openNow,
      });
    } else if (type) {
      // Nearby search by type
      results = await placesService.searchNearby(
        { lat: parseFloat(location.lat), lng: parseFloat(location.lng) },
        type,
        radius || 5000
      );

      // Apply filters
      if (minRating) {
        results = results.filter((p) => (p.rating || 0) >= minRating);
      }
      if (maxPrice) {
        results = results.filter((p) => (p.priceLevel || 0) <= maxPrice);
      }
      if (openNow) {
        results = results.filter((p) => p.openingHours?.openNow);
      }
    } else {
      return NextResponse.json(
        { error: 'Either query or type is required' },
        { status: 400 }
      );
    }

    // Enhance results with photo URLs
    const enhancedResults = results.map((place) => ({
      ...place,
      photos: place.photos?.map((photo) => ({
        ...photo,
        url: photo.photoReference
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photo.photoReference}&key=${process.env.GOOGLE_MAPS_API_KEY}`
          : undefined,
      })),
    }));

    return NextResponse.json({
      success: true,
      results: enhancedResults,
      count: enhancedResults.length,
    });
  } catch (error) {
    console.error('Experience search error:', error);
    return NextResponse.json(
      {
        error: 'Failed to search experiences',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
