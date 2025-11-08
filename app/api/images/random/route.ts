/**
 * Random Photo API Endpoint
 * Get a random photo for inspiration
 */

import { NextRequest, NextResponse } from 'next/server';
import { ImageService } from '@/lib/media';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || 'travel';

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

    const photo = await imageService.getRandomPhoto(query);

    if (!photo) {
      return NextResponse.json(
        { success: false, error: 'No photo found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: photo,
    });
  } catch (error) {
    console.error('Random photo API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch random photo',
      },
      { status: 500 }
    );
  }
}
