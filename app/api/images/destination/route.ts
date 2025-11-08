/**
 * Destination Gallery API Endpoint
 * Get hero image and gallery for a destination
 */

import { NextRequest, NextResponse } from 'next/server';
import { ImageService } from '@/lib/media';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const destination = searchParams.get('destination');
    const count = searchParams.get('count');

    if (!destination) {
      return NextResponse.json(
        { success: false, error: 'destination parameter required' },
        { status: 400 }
      );
    }

    const imageService = new ImageService();

    if (!imageService.isAvailable()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Image service not configured',
          note: 'Please add UNSPLASH_ACCESS_KEY or PEXELS_API_KEY to your .env file'
        },
        { status: 500 }
      );
    }

    const gallery = await imageService.getDestinationGallery(
      destination,
      count ? parseInt(count) : 10
    );

    return NextResponse.json({
      success: true,
      data: gallery,
    });
  } catch (error) {
    console.error('Destination gallery API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch destination gallery',
      },
      { status: 500 }
    );
  }
}
