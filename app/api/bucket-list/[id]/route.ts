/**
 * Individual Bucket List Item API Endpoints
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

    const bucketListItem = await prisma.bucketListItem.findUnique({
      where: { id },
      include: { profile: { include: { user: true } } }
    });

    if (!bucketListItem) {
      return NextResponse.json({ error: 'Bucket list item not found' }, { status: 404 });
    }

    if (bucketListItem.profile.user.id !== currentUser.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = await prisma.bucketListItem.update({
      where: { id },
      data: {
        destination: body.destination,
        country: body.country,
        region: body.region || null,
        priority: body.priority,
        timeframe: body.timeframe || null,
        estimatedBudget: body.estimatedBudget ? parseFloat(body.estimatedBudget) : null,
        currency: body.currency || 'USD',
        companions: body.companions || [],
        experiences: body.experiences || [],
        notes: body.notes || null,
        inspiration: body.inspiration || [],
        status: body.status || 'wishlist',
        position: body.position !== undefined ? body.position : bucketListItem.position
      }
    });

    return NextResponse.json({ success: true, bucketListItem: updated });
  } catch (error) {
    console.error('Bucket list update error:', error);
    return NextResponse.json({ error: 'Failed to update bucket list item' }, { status: 500 });
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

    const bucketListItem = await prisma.bucketListItem.findUnique({
      where: { id },
      include: { profile: { include: { user: true } } }
    });

    if (!bucketListItem) {
      return NextResponse.json({ error: 'Bucket list item not found' }, { status: 404 });
    }

    if (bucketListItem.profile.user.id !== currentUser.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.bucketListItem.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Bucket list item deleted' });
  } catch (error) {
    console.error('Bucket list deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete bucket list item' }, { status: 500 });
  }
}
