/**
 * Override Contradictory Note API
 * Handle contradiction resolution
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseNoteWithLLM } from '@/lib/services/note-parser';

// POST - Create note and override contradictory notes
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
      supersededNoteIds = [],
    } = body;

    if (!noteText) {
      return NextResponse.json(
        { error: 'noteText is required' },
        { status: 400 }
      );
    }

    // Parse note with LLM
    const parsedData = await parseNoteWithLLM(noteText);

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
        supersedes: supersededNoteIds,
      },
    });

    // Mark superseded notes
    if (supersededNoteIds.length > 0) {
      await prisma.travelNote.updateMany({
        where: {
          id: { in: supersededNoteIds },
          userId: currentUser.userId,
        },
        data: {
          supersededById: note.id,
          hasContradiction: true,
        },
      });
    }

    // Create automatic reminder if actionable
    if (parsedData.isActionable && note.locationName) {
      await prisma.travelNoteReminder.create({
        data: {
          noteId: note.id,
          userId: note.userId,
          triggerType: 'location',
          triggerLocationName: note.locationName,
          proximityRadius: 500,
          notificationChannel: 'app',
        },
      });
    }

    return NextResponse.json({
      success: true,
      note,
      supersededCount: supersededNoteIds.length,
    });
  } catch (error) {
    console.error('Override contradiction error:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
}
