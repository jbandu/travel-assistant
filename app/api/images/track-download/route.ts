/**
 * Track Download API Endpoint
 * Required by Unsplash API when displaying photos
 */

import { NextRequest, NextResponse } from 'next/server';
import { ImageService } from '@/lib/media';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { downloadLocation } = body;

    if (!downloadLocation) {
      return NextResponse.json(
        { success: false, error: 'downloadLocation parameter required' },
        { status: 400 }
      );
    }

    const imageService = new ImageService();

    if (!imageService.isUnsplashAvailable()) {
      // No need to track for Pexels or if Unsplash is not available
      return NextResponse.json({
        success: true,
        message: 'Download tracking not required',
      });
    }

    await imageService.trackDownload(downloadLocation);

    return NextResponse.json({
      success: true,
      message: 'Download tracked successfully',
    });
  } catch (error) {
    console.error('Track download API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to track download',
      },
      { status: 500 }
    );
  }
}
