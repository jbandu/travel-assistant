/**
 * Individual Trip Memory API Endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    const tripMemory = await prisma.tripMemory.findUnique({
      where: { id },
      include: { profile: { include: { user: true } } }
    });

    if (!tripMemory) {
      return NextResponse.json({ error: 'Trip memory not found' }, { status: 404 });
    }

    if (tripMemory.profile.user.id !== currentUser.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = await prisma.tripMemory.update({
      where: { id },
      data: {
        title: body.title,
        destinations: body.destinations,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        tripType: body.tripType,
        companions: body.companions,
        rating: parseInt(body.rating),
        highlights: body.highlights,
        wouldReturn: body.wouldReturn,
        lessonsLearned: body.lessonsLearned,
        budgetPlanned: body.budgetPlanned ? parseFloat(body.budgetPlanned) : null,
        budgetActual: body.budgetActual ? parseFloat(body.budgetActual) : null,
        currency: body.currency,
        photos: body.photos,
        notes: body.notes
      }
    });

    return NextResponse.json({ success: true, tripMemory: updated });
  } catch (error) {
    console.error('Trip memory update error:', error);
    return NextResponse.json({ error: 'Failed to update trip memory' }, { status: 500 });
  }
}

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

    const tripMemory = await prisma.tripMemory.findUnique({
      where: { id },
      include: { profile: { include: { user: true } } }
    });

    if (!tripMemory) {
      return NextResponse.json({ error: 'Trip memory not found' }, { status: 404 });
    }

    if (tripMemory.profile.user.id !== currentUser.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.tripMemory.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Trip memory deleted' });
  } catch (error) {
    console.error('Trip memory deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete trip memory' }, { status: 500 });
  }
}
