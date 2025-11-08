/**
 * Travel Notes API
 * Create and list travel notes with LLM parsing
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseNoteWithLLM, checkContradictions } from '@/lib/services/note-parser';

// POST - Create new travel note
export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      noteText,
      inputMethod = 'text',
      voiceTranscript,
      relatedTripId,
      relatedBookingId,
      checkForContradictions = true,
    } = body;

    if (!noteText) {
      return NextResponse.json(
        { error: 'noteText is required' },
        { status: 400 }
      );
    }

    // Parse note with LLM
    const parsedData = await parseNoteWithLLM(noteText);

    // Check for contradictions if requested
    let contradictionResult = null;
    if (checkForContradictions) {
      const existingNotes = await prisma.travelNote.findMany({
        where: {
          userId: currentUser.userId,
          category: parsedData.category,
        },
        select: {
          id: true,
          noteText: true,
          category: true,
          subject: true,
          sentiment: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      contradictionResult = await checkContradictions(
        parsedData,
        noteText,
        existingNotes
      );

      if (contradictionResult.hasContradiction) {
        // Return contradiction warning without creating note
        return NextResponse.json({
          success: false,
          requiresConfirmation: true,
          contradictionResult,
          parsedData,
        });
      }
    }

    // Create note
    const note = await prisma.travelNote.create({
      data: {
        userId: currentUser.userId,
        noteText,
        inputMethod,
        voiceTranscript,
        category: parsedData.category,
        subject: parsedData.subject,
        sentiment: parsedData.sentiment,
        parsedData: parsedData.parsedData,
        locationName: parsedData.locationName,
        city: parsedData.city,
        country: parsedData.country,
        tags: parsedData.tags,
        isActionable: parsedData.isActionable,
        priority: parsedData.priority,
        relatedTripId,
        relatedBookingId,
      },
    });

    // Create automatic reminder if actionable
    if (parsedData.isActionable) {
      await createAutomaticReminder(note);
    }

    return NextResponse.json({
      success: true,
      note,
      parsedData,
    });
  } catch (error) {
    console.error('Create note error:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
}

// GET - List travel notes
export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const sentiment = searchParams.get('sentiment');
    const locationName = searchParams.get('location');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build filter
    const where: any = {
      userId: currentUser.userId,
    };

    if (category) where.category = category;
    if (sentiment) where.sentiment = sentiment;
    if (locationName) where.locationName = { contains: locationName, mode: 'insensitive' };
    if (search) {
      where.OR = [
        { noteText: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { locationName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [notes, total] = await Promise.all([
      prisma.travelNote.findMany({
        where,
        include: {
          reminders: {
            where: { isActive: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.travelNote.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      notes,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('List notes error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

/**
 * Create automatic reminder for actionable notes
 */
async function createAutomaticReminder(note: any) {
  try {
    // Logic to create smart reminders based on note category
    if (note.category === 'seat' || note.category === 'flight') {
      // Create time-based reminder for seat selection
      await prisma.travelNoteReminder.create({
        data: {
          noteId: note.id,
          userId: note.userId,
          triggerType: 'booking',
          triggerPhase: 'seat_selection',
          reminderOffset: '1 day before',
          notificationChannel: 'app',
        },
      });
    } else if (note.locationName) {
      // Create location-based reminder
      await prisma.travelNoteReminder.create({
        data: {
          noteId: note.id,
          userId: note.userId,
          triggerType: 'location',
          triggerLocationName: note.locationName,
          proximityRadius: 500, // 500 meters
          notificationChannel: 'app',
        },
      });
    }
  } catch (error) {
    console.error('Error creating automatic reminder:', error);
  }
}
