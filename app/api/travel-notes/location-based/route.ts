/**
 * Location-Based Travel Notes API
 * Get notes relevant to current location
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get notes for current location
export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const latitude = parseFloat(searchParams.get('latitude') || '0');
    const longitude = parseFloat(searchParams.get('longitude') || '0');
    const radius = parseInt(searchParams.get('radius') || '5000'); // 5km default
    const locationName = searchParams.get('locationName');

    if (!latitude && !longitude && !locationName) {
      return NextResponse.json(
        { error: 'Either coordinates or locationName required' },
        { status: 400 }
      );
    }

    let notes;

    if (locationName) {
      // Search by location name
      notes = await prisma.travelNote.findMany({
        where: {
          userId: currentUser.userId,
          OR: [
            { locationName: { contains: locationName, mode: 'insensitive' } },
            { city: { contains: locationName, mode: 'insensitive' } },
            { subject: { contains: locationName, mode: 'insensitive' } },
          ],
        },
        include: {
          reminders: {
            where: { isActive: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Search by coordinates (simplified - in production use PostGIS)
      // For now, get all notes with coordinates and filter in memory
      const allNotes = await prisma.travelNote.findMany({
        where: {
          userId: currentUser.userId,
          latitude: { not: null },
          longitude: { not: null },
        },
        include: {
          reminders: {
            where: { isActive: true },
          },
        },
      });

      // Filter by distance (Haversine formula)
      notes = allNotes.filter((note) => {
        if (!note.latitude || !note.longitude) return false;
        const distance = calculateDistance(
          latitude,
          longitude,
          note.latitude,
          note.longitude
        );
        return distance <= radius;
      });

      // Sort by distance
      notes.sort((a, b) => {
        const distA = calculateDistance(
          latitude,
          longitude,
          a.latitude!,
          a.longitude!
        );
        const distB = calculateDistance(
          latitude,
          longitude,
          b.latitude!,
          b.longitude!
        );
        return distA - distB;
      });
    }

    // Group by category
    const groupedNotes = notes.reduce((acc: any, note) => {
      if (!acc[note.category]) {
        acc[note.category] = [];
      }
      acc[note.category].push(note);
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      notes,
      groupedNotes,
      count: notes.length,
    });
  } catch (error) {
    console.error('Location-based notes error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch location-based notes' },
      { status: 500 }
    );
  }
}

/**
 * Calculate distance between two coordinates in meters (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}
