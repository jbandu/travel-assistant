/**
 * Weather Insights API Endpoint
 * GET /api/weather/insights?city={city}&startDate={date}&endDate={date}
 * Returns comprehensive weather insights with packing and activity recommendations
 */

import { NextRequest, NextResponse } from 'next/server';
import { WeatherService } from '@/lib/weather';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city');
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');

    if (!city) {
      return NextResponse.json(
        { error: 'City parameter is required' },
        { status: 400 }
      );
    }

    if (!startDateStr || !endDateStr) {
      return NextResponse.json(
        { error: 'Start and end dates are required' },
        { status: 400 }
      );
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use ISO 8601 format (YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    const weatherService = new WeatherService();
    const insights = await weatherService.getWeatherInsights(
      city,
      startDate,
      endDate
    );

    return NextResponse.json({
      success: true,
      data: insights,
    });
  } catch (error) {
    console.error('Weather insights error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch weather insights',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
