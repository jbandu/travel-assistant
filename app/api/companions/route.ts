/**
 * Travel Companions API Endpoints
 * Manage family members and frequent travel partners
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/companions
 * Fetches all companions for the current user
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

    // Get user's profile
    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId },
      include: {
        profile: {
          include: {
            companions: {
              orderBy: { createdAt: 'asc' }
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
      companions: user.profile.companions
    });

  } catch (error) {
    console.error('Companions fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/companions
 * Creates a new travel companion
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
      firstName,
      lastName,
      relationship,
      dateOfBirth,
      travelFrequency,
      decisionInfluence,
      preferences,
      dietary,
      accessibility
    } = body;

    // Validation
    if (!firstName || !lastName || !relationship) {
      return NextResponse.json(
        { error: 'First name, last name, and relationship are required' },
        { status: 400 }
      );
    }

    // Get user's profile
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

    // Create profile if doesn't exist
    let profile = user.profile;
    if (!profile) {
      profile = await prisma.userProfile.create({
        data: {
          userId: user.id,
          profileCompletion: 0
        }
      });
    }

    // Create companion
    const companion = await prisma.travelCompanion.create({
      data: {
        profileId: profile.id,
        firstName,
        lastName,
        relationship,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        travelFrequency: travelFrequency || null,
        decisionInfluence: decisionInfluence || 5,
        preferences: preferences || {},
        dietary: dietary || {},
        accessibility: accessibility || {}
      }
    });

    return NextResponse.json({
      success: true,
      companion
    }, { status: 201 });

  } catch (error) {
    console.error('Companion creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create companion' },
      { status: 500 }
    );
  }
}
