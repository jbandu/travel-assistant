/**
 * Individual Experience API
 * Update and delete user experiences
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get single experience
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const experience = await prisma.experience.findUnique({
      where: { id },
      include: {
        profile: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!experience) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 });
    }

    // Check ownership
    if (experience.profile.user.id !== currentUser.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: true, experience });
  } catch (error) {
    console.error('Get experience error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch experience' },
      { status: 500 }
    );
  }
}

// PUT - Update experience
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const experience = await prisma.experience.findUnique({
      where: { id },
      include: {
        profile: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!experience) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 });
    }

    // Check ownership
    if (experience.profile.user.id !== currentUser.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate rating if provided
    if (body.rating !== undefined && (body.rating < 1 || body.rating > 5)) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Update experience
    const updated = await prisma.experience.update({
      where: { id },
      data: {
        experienceType: body.experienceType || experience.experienceType,
        name: body.name || experience.name,
        destination: body.destination || experience.destination,
        city: body.city !== undefined ? body.city : experience.city,
        country: body.country !== undefined ? body.country : experience.country,
        date: body.date ? new Date(body.date) : experience.date,
        rating: body.rating !== undefined ? body.rating : experience.rating,
        review: body.review !== undefined ? body.review : experience.review,
        photos: body.photos !== undefined ? body.photos : experience.photos,
        tripMemoryId: body.tripMemoryId !== undefined ? body.tripMemoryId : experience.tripMemoryId,
        companions: body.companions !== undefined ? body.companions : experience.companions,
        priceLevel: body.priceLevel !== undefined ? body.priceLevel : experience.priceLevel,
        tags: body.tags !== undefined ? body.tags : experience.tags,
      },
    });

    return NextResponse.json({ success: true, experience: updated });
  } catch (error) {
    console.error('Update experience error:', error);
    return NextResponse.json(
      { error: 'Failed to update experience' },
      { status: 500 }
    );
  }
}

// DELETE - Delete experience
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const experience = await prisma.experience.findUnique({
      where: { id },
      include: {
        profile: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!experience) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 });
    }

    // Check ownership
    if (experience.profile.user.id !== currentUser.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.experience.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Experience deleted successfully',
    });
  } catch (error) {
    console.error('Delete experience error:', error);
    return NextResponse.json(
      { error: 'Failed to delete experience' },
      { status: 500 }
    );
  }
}
