/**
 * Individual Companion API Endpoints
 * Update and delete specific companions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * PUT /api/companions/[id]
 * Updates a travel companion
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    // Verify companion belongs to user
    const companion = await prisma.travelCompanion.findUnique({
      where: { id },
      include: {
        profile: {
          include: {
            user: true
          }
        }
      }
    });

    if (!companion) {
      return NextResponse.json(
        { error: 'Companion not found' },
        { status: 404 }
      );
    }

    if (companion.profile.user.id !== currentUser.userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Update companion
    const updated = await prisma.travelCompanion.update({
      where: { id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        relationship: body.relationship,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        travelFrequency: body.travelFrequency,
        decisionInfluence: body.decisionInfluence,
        preferences: body.preferences,
        dietary: body.dietary,
        accessibility: body.accessibility
      }
    });

    return NextResponse.json({
      success: true,
      companion: updated
    });

  } catch (error) {
    console.error('Companion update error:', error);
    return NextResponse.json(
      { error: 'Failed to update companion' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/companions/[id]
 * Deletes a travel companion
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verify companion belongs to user
    const companion = await prisma.travelCompanion.findUnique({
      where: { id },
      include: {
        profile: {
          include: {
            user: true
          }
        }
      }
    });

    if (!companion) {
      return NextResponse.json(
        { error: 'Companion not found' },
        { status: 404 }
      );
    }

    if (companion.profile.user.id !== currentUser.userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Delete companion
    await prisma.travelCompanion.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Companion deleted successfully'
    });

  } catch (error) {
    console.error('Companion deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete companion' },
      { status: 500 }
    );
  }
}
