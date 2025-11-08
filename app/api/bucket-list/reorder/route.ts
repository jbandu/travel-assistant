/**
 * Bucket List Reorder API Endpoint
 * Updates the position/order of bucket list items
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId, direction } = await req.json();

    if (!itemId || !direction || !['up', 'down'].includes(direction)) {
      return NextResponse.json(
        { error: 'Item ID and direction (up/down) are required' },
        { status: 400 }
      );
    }

    // Get the item and verify ownership
    const item = await prisma.bucketListItem.findUnique({
      where: { id: itemId },
      include: { profile: { include: { user: true } } }
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    if (item.profile.user.id !== currentUser.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all items for this profile
    const allItems = await prisma.bucketListItem.findMany({
      where: { profileId: item.profileId },
      orderBy: { position: 'asc' }
    });

    const currentIndex = allItems.findIndex(i => i.id === itemId);
    if (currentIndex === -1) {
      return NextResponse.json({ error: 'Item not found in list' }, { status: 404 });
    }

    // Determine swap target
    let targetIndex: number;
    if (direction === 'up') {
      if (currentIndex === 0) {
        return NextResponse.json({ message: 'Already at the top' }, { status: 200 });
      }
      targetIndex = currentIndex - 1;
    } else {
      if (currentIndex === allItems.length - 1) {
        return NextResponse.json({ message: 'Already at the bottom' }, { status: 200 });
      }
      targetIndex = currentIndex + 1;
    }

    // Swap positions
    const currentItem = allItems[currentIndex];
    const targetItem = allItems[targetIndex];

    await prisma.$transaction([
      prisma.bucketListItem.update({
        where: { id: currentItem.id },
        data: { position: targetItem.position }
      }),
      prisma.bucketListItem.update({
        where: { id: targetItem.id },
        data: { position: currentItem.position }
      })
    ]);

    return NextResponse.json({ success: true, message: 'Order updated' });
  } catch (error) {
    console.error('Bucket list reorder error:', error);
    return NextResponse.json({ error: 'Failed to reorder items' }, { status: 500 });
  }
}
