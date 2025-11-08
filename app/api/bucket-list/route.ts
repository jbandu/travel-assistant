/**
 * Bucket List API Endpoints
 * Manage dream destinations and travel goals
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId },
      include: {
        profile: {
          include: {
            bucketList: {
              orderBy: { position: 'asc' }
            }
          }
        }
      }
    });

    if (!user || !user.profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ bucketList: user.profile.bucketList });
  } catch (error) {
    console.error('Bucket list fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch bucket list' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      destination,
      country,
      region,
      priority,
      timeframe,
      estimatedBudget,
      currency,
      companions,
      experiences,
      notes,
      inspiration
    } = body;

    if (!destination || !country || !priority) {
      return NextResponse.json(
        { error: 'Destination, country, and priority are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId },
      include: { profile: { include: { bucketList: true } } }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let profile = user.profile;
    if (!profile) {
      profile = await prisma.userProfile.create({
        data: { userId: user.id, profileCompletion: 0 },
        include: { bucketList: true }
      });
    }

    // Get the next position
    const maxPosition = profile.bucketList?.length || 0;

    const bucketListItem = await prisma.bucketListItem.create({
      data: {
        profileId: profile.id,
        destination,
        country,
        region: region || null,
        priority,
        timeframe: timeframe || null,
        estimatedBudget: estimatedBudget ? parseFloat(estimatedBudget) : null,
        currency: currency || 'USD',
        companions: companions || [],
        experiences: experiences || [],
        notes: notes || null,
        inspiration: inspiration || [],
        position: maxPosition
      }
    });

    return NextResponse.json({ success: true, bucketListItem }, { status: 201 });
  } catch (error) {
    console.error('Bucket list creation error:', error);
    return NextResponse.json({ error: 'Failed to create bucket list item' }, { status: 500 });
  }
}
