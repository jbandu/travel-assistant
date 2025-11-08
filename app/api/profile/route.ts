/**
 * Profile API Endpoints
 * GET: Fetch user profile with all knowledge graph data
 * PUT: Update user profile sections
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/profile
 * Fetches complete user profile including all knowledge graph data
 */
export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch user with complete profile
    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId },
      include: {
        profile: {
          include: {
            personalInfo: true,
            travelStyle: true,
            dietary: true,
            accessibility: true,
            travelDocs: true,
            companions: true,
            tripMemories: {
              orderBy: { startDate: 'desc' },
              take: 10
            },
            bucketList: {
              orderBy: { position: 'asc' }
            },
            experiences: {
              orderBy: { date: 'desc' },
              take: 20
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate profile completion
    const completion = calculateProfileCompletion(user.profile);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      profile: user.profile,
      completion
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profile
 * Updates user profile sections
 */
export async function PUT(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { section, data } = body;

    // Fetch user and profile
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

    // Update specific section
    let updatedData;

    switch (section) {
      case 'personalInfo':
        updatedData = await prisma.personalInfo.upsert({
          where: { profileId: profile.id },
          update: data,
          create: {
            profileId: profile.id,
            ...data
          }
        });
        break;

      case 'travelStyle':
        updatedData = await prisma.travelStyle.upsert({
          where: { profileId: profile.id },
          update: data,
          create: {
            profileId: profile.id,
            ...data
          }
        });
        break;

      case 'dietary':
        updatedData = await prisma.dietaryProfile.upsert({
          where: { profileId: profile.id },
          update: data,
          create: {
            profileId: profile.id,
            ...data
          }
        });
        break;

      case 'accessibility':
        updatedData = await prisma.accessibilityInfo.upsert({
          where: { profileId: profile.id },
          update: data,
          create: {
            profileId: profile.id,
            ...data
          }
        });
        break;

      case 'travelDocs':
        updatedData = await prisma.travelDocuments.upsert({
          where: { profileId: profile.id },
          update: data,
          create: {
            profileId: profile.id,
            ...data
          }
        });
        break;

      case 'user':
        // Update user basic info
        updatedData = await prisma.user.update({
          where: { id: user.id },
          data: {
            firstName: data.firstName,
            lastName: data.lastName
          }
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid section' },
          { status: 400 }
        );
    }

    // Recalculate profile completion
    const updatedProfile = await prisma.userProfile.findUnique({
      where: { id: profile.id },
      include: {
        personalInfo: true,
        travelStyle: true,
        dietary: true,
        accessibility: true,
        travelDocs: true
      }
    });

    const completion = calculateProfileCompletion(updatedProfile);

    // Update completion percentage and streak
    await prisma.userProfile.update({
      where: { id: profile.id },
      data: {
        profileCompletion: completion,
        updateStreak: calculateStreak(updatedProfile),
        lastStreakDate: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedData,
      completion
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

/**
 * Calculate profile completion percentage
 */
function calculateProfileCompletion(profile: any): number {
  if (!profile) return 0;

  const totalSections = 8;
  let completedSections = 0;

  // Personal Info (20%)
  if (profile.personalInfo) {
    const pi = profile.personalInfo;
    const fields = [pi.dateOfBirth, pi.gender, pi.occupation, pi.city, pi.country];
    const filledFields = fields.filter(f => f !== null && f !== undefined).length;
    if (filledFields >= 3) completedSections += 1;
  }

  // Travel Style (20%)
  if (profile.travelStyle) {
    const ts = profile.travelStyle;
    const fields = [ts.budgetLevel, ts.pacePreference, ts.activityLevel];
    const filledFields = fields.filter(f => f !== null && f !== undefined).length;
    const hasInterests = ts.interests && Array.isArray(ts.interests) && ts.interests.length > 0;
    if (filledFields >= 2 && hasInterests) completedSections += 1;
  }

  // Dietary (10%)
  if (profile.dietary) {
    const d = profile.dietary;
    const hasData = (d.restrictions && d.restrictions.length > 0) ||
                    (d.favoriteCuisines && d.favoriteCuisines.length > 0) ||
                    d.adventurousScore;
    if (hasData) completedSections += 0.5;
  }

  // Accessibility (10%)
  if (profile.accessibility) {
    const a = profile.accessibility;
    const hasData = a.fitnessLevel ||
                    (a.accessibilityNeeds && a.accessibilityNeeds.length > 0);
    if (hasData) completedSections += 0.5;
  }

  // Travel Docs (10%)
  if (profile.travelDocs) {
    const td = profile.travelDocs;
    const hasData = td.passportNumber || td.passportCountry ||
                    (td.loyaltyPrograms && td.loyaltyPrograms.length > 0);
    if (hasData) completedSections += 0.5;
  }

  // Trip Memories (10%)
  if (profile.tripMemories && profile.tripMemories.length > 0) {
    completedSections += 0.5;
  }

  // Bucket List (10%)
  if (profile.bucketList && profile.bucketList.length > 0) {
    completedSections += 0.5;
  }

  // Travel Companions (10%)
  if (profile.companions && profile.companions.length > 0) {
    completedSections += 0.5;
  }

  return Math.round((completedSections / totalSections) * 100);
}

/**
 * Calculate update streak
 */
function calculateStreak(profile: any): number {
  if (!profile?.lastStreakDate) return 1;

  const lastUpdate = new Date(profile.lastStreakDate);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));

  // If updated today or yesterday, increment streak
  if (daysDiff <= 1) {
    return (profile.updateStreak || 0) + 1;
  }

  // Streak broken, reset to 1
  return 1;
}
