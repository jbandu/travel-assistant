/**
 * Trip Memories API Endpoints
 * Manage past travel experiences and memories
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/trip-memories
 * Fetches all trip memories for the current user
 */
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId },
      include: {
        profile: {
          include: {
            tripMemories: {
              orderBy: { startDate: 'desc' }
            }
          }
        }
      }
    });

    if (!user || !user.profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      tripMemories: user.profile.tripMemories
    });

  } catch (error) {
    console.error('Trip memories fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trip memories' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/trip-memories
 * Creates a new trip memory
 */
export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      title,
      destinations,
      startDate,
      endDate,
      tripType,
      companions,
      rating,
      highlights,
      wouldReturn,
      lessonsLearned,
      budgetPlanned,
      budgetActual,
      currency,
      photos,
      notes
    } = body;

    if (!title || !startDate || !endDate || !rating) {
      return NextResponse.json(
        { error: 'Title, dates, and rating are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId },
      include: { profile: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let profile = user.profile;
    if (!profile) {
      profile = await prisma.userProfile.create({
        data: {
          userId: user.id,
          profileCompletion: 0
        }
      });
    }

    const tripMemory = await prisma.tripMemory.create({
      data: {
        profileId: profile.id,
        title,
        destinations: destinations || [],
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        tripType: tripType || 'leisure',
        companions: companions || [],
        rating: parseInt(rating),
        highlights: highlights || [],
        wouldReturn: wouldReturn || 'yes',
        lessonsLearned: lessonsLearned || [],
        budgetPlanned: budgetPlanned ? parseFloat(budgetPlanned) : null,
        budgetActual: budgetActual ? parseFloat(budgetActual) : null,
        currency: currency || 'USD',
        photos: photos || [],
        notes: notes || null
      }
    });

    return NextResponse.json({
      success: true,
      tripMemory
    }, { status: 201 });

  } catch (error) {
    console.error('Trip memory creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create trip memory' },
      { status: 500 }
    );
  }
}
