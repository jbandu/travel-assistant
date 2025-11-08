/**
 * Weather Forecast API Endpoint
 * GET /api/weather/forecast?city={city}&days={days}
 */

import { NextRequest, NextResponse } from 'next/server';
import { WeatherService } from '@/lib/weather';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city');
    const days = parseInt(searchParams.get('days') || '7');

    if (!city) {
      return NextResponse.json(
        { error: 'City parameter is required' },
        { status: 400 }
      );
    }

    if (days < 1 || days > 7) {
      return NextResponse.json(
        { error: 'Days must be between 1 and 7' },
        { status: 400 }
      );
    }

    const weatherService = new WeatherService();
    const forecast = await weatherService.getForecast(city, days);

    return NextResponse.json({
      success: true,
      data: {
        city,
        forecast,
      },
    });
  } catch (error) {
    console.error('Weather forecast error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch weather forecast',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
