/**
 * User Experiences API
 * Manage saved user experiences (restaurants, activities, attractions)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch user's saved experiences
export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const destination = searchParams.get('destination');
    const minRating = searchParams.get('minRating');

    // Get user's profile
    const profile = await prisma.userProfile.findUnique({
      where: { userId: currentUser.userId },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Build query filters
    const where: any = {
      profileId: profile.id,
    };

    if (type) {
      where.experienceType = type;
    }
    if (destination) {
      where.destination = { contains: destination, mode: 'insensitive' };
    }
    if (minRating) {
      where.rating = { gte: parseInt(minRating) };
    }

    const experiences = await prisma.experience.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        profile: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      experiences,
      count: experiences.length,
    });
  } catch (error) {
    console.error('Get experiences error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch experiences' },
      { status: 500 }
    );
  }
}

// POST - Create new experience
export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      experienceType,
      name,
      destination,
      city,
      country,
      date,
      rating,
      review,
      photos,
      tripMemoryId,
      companions,
      priceLevel,
      tags,
    } = body;

    // Validation
    if (!experienceType || !name || !destination || !date || !rating) {
      return NextResponse.json(
        { error: 'Missing required fields: experienceType, name, destination, date, rating' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Get user's profile
    const profile = await prisma.userProfile.findUnique({
      where: { userId: currentUser.userId },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Create experience
    const experience = await prisma.experience.create({
      data: {
        profileId: profile.id,
        experienceType,
        name,
        destination,
        city: city || null,
        country: country || null,
        date: new Date(date),
        rating,
        review: review || null,
        photos: photos || [],
        tripMemoryId: tripMemoryId || null,
        companions: companions || [],
        priceLevel: priceLevel || null,
        tags: tags || [],
      },
    });

    return NextResponse.json({
      success: true,
      experience,
    });
  } catch (error) {
    console.error('Create experience error:', error);
    return NextResponse.json(
      { error: 'Failed to create experience' },
      { status: 500 }
    );
  }
}
