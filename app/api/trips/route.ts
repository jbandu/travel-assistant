import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/trips - Get all trips for current user
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const trips = await prisma.trip.findMany({
      where: { userId: currentUser.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        bookings: true,
      },
    });

    return NextResponse.json({ trips });
  } catch (error) {
    console.error('Get trips error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trips' },
      { status: 500 }
    );
  }
}

// POST /api/trips - Create new trip
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      startDate,
      endDate,
      destinations,
      budgetAmount,
      budgetCurrency,
      tripType,
      travelerCount,
      travelerDetails,
    } = body;

    // Validation
    if (!title || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Title, start date, and end date are required' },
        { status: 400 }
      );
    }

    // Create trip
    const trip = await prisma.trip.create({
      data: {
        userId: currentUser.userId,
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        destinations: destinations || [],
        budgetAmount: budgetAmount ? parseFloat(budgetAmount) : null,
        budgetCurrency: budgetCurrency || 'USD',
        tripType: tripType || 'leisure',
        travelerCount: travelerCount || 1,
        travelerDetails: travelerDetails || [],
        status: 'planning',
      },
    });

    return NextResponse.json({ success: true, trip });
  } catch (error) {
    console.error('Create trip error:', error);
    return NextResponse.json(
      { error: 'Failed to create trip' },
      { status: 500 }
    );
  }
}
