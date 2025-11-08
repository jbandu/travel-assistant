/**
 * Image Search API Endpoint
 * Search for destination photos
 */

import { NextRequest, NextResponse } from 'next/server';
import { ImageService } from '@/lib/media';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const count = searchParams.get('count');
    const orientation = searchParams.get('orientation');
    const color = searchParams.get('color');

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'query parameter required' },
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

    const result = await imageService.searchPhotos({
      query,
      count: count ? parseInt(count) : 10,
      orientation: orientation as any,
      color: color || undefined,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Image search API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Image search failed',
      },
      { status: 500 }
    );
  }
}
