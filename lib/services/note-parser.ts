/**
 * LLM-Powered Travel Note Parser
 * Extracts structured data from travel notes using AI
 */

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface ParsedNoteData {
  category: 'hotel' | 'restaurant' | 'flight' | 'seat' | 'activity' | 'transportation' | 'general';
  subject: string | null;
  sentiment: 'positive' | 'negative' | 'neutral';
  locationName: string | null;
  city: string | null;
  country: string | null;
  tags: string[];
  isActionable: boolean;
  priority: 'low' | 'normal' | 'high';
  parsedData: {
    // Hotel-specific
    hotelName?: string;
    roomNumber?: string;
    roomType?: string;
    floor?: string;
    amenity?: string;
    issue?: string;
    recommendation?: string;

    // Restaurant-specific
    restaurantName?: string;
    dishName?: string;
    cuisineType?: string;
    priceLevel?: string;
    mustTry?: boolean;
    avoid?: boolean;

    // Flight-specific
    airline?: string;
    flightNumber?: string;
    seatNumber?: string;
    seatType?: string;
    gate?: string;
    terminal?: string;

    // Activity-specific
    activityName?: string;
    duration?: string;
    bestTimeToVisit?: string;

    // General
    notes?: string;
    tip?: string;
    warning?: string;
  };
}

export async function parseNoteWithLLM(noteText: string): Promise<ParsedNoteData> {
  const prompt = `You are a travel note parser. Extract structured information from the user's travel note.

User Note: "${noteText}"

Extract the following information and respond ONLY with a valid JSON object:

{
  "category": "hotel|restaurant|flight|seat|activity|transportation|general",
  "subject": "Main subject (hotel name, restaurant, flight number, etc.)",
  "sentiment": "positive|negative|neutral",
  "locationName": "Specific location name if mentioned",
  "city": "City name if mentioned",
  "country": "Country name if mentioned",
  "tags": ["tag1", "tag2"],
  "isActionable": true/false (requires future action or reminder),
  "priority": "low|normal|high",
  "parsedData": {
    // Include relevant fields based on category:
    // For hotels: hotelName, roomNumber, roomType, floor, amenity, issue, recommendation
    // For restaurants: restaurantName, dishName, cuisineType, priceLevel, mustTry, avoid
    // For flights: airline, flightNumber, seatNumber, seatType, gate, terminal
    // For activities: activityName, duration, bestTimeToVisit
    // General: notes, tip, warning
  }
}

Examples:

Input: "The Marriott downtown room 402 was too noisy. Avoid rooms facing the street next time."
Output: {
  "category": "hotel",
  "subject": "Marriott Downtown",
  "sentiment": "negative",
  "locationName": "Marriott Downtown",
  "city": null,
  "country": null,
  "tags": ["noisy", "avoid", "room-location"],
  "isActionable": true,
  "priority": "normal",
  "parsedData": {
    "hotelName": "Marriott Downtown",
    "roomNumber": "402",
    "issue": "too noisy",
    "recommendation": "Avoid rooms facing the street"
  }
}

Input: "The pad thai at Som Tam Nua in Bangkok is incredible. Must order!"
Output: {
  "category": "restaurant",
  "subject": "Som Tam Nua",
  "sentiment": "positive",
  "locationName": "Som Tam Nua",
  "city": "Bangkok",
  "country": "Thailand",
  "tags": ["must-try", "thai-food", "pad-thai"],
  "isActionable": false,
  "priority": "normal",
  "parsedData": {
    "restaurantName": "Som Tam Nua",
    "dishName": "Pad Thai",
    "cuisineType": "Thai",
    "mustTry": true
  }
}

Input: "UA 1234 seat 12A has great legroom and window view. Best seat in economy!"
Output: {
  "category": "seat",
  "subject": "UA 1234 Seat 12A",
  "sentiment": "positive",
  "locationName": null,
  "city": null,
  "country": null,
  "tags": ["good-seat", "legroom", "window", "economy"],
  "isActionable": true,
  "priority": "normal",
  "parsedData": {
    "airline": "United Airlines",
    "flightNumber": "UA 1234",
    "seatNumber": "12A",
    "seatType": "economy window",
    "recommendation": "Best seat in economy - great legroom and window view"
  }
}

Now parse the user's note and respond with ONLY the JSON object, no other text.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    // Extract JSON from response (handle cases where LLM adds extra text)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in LLM response');
    }

    const parsed: ParsedNoteData = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (!parsed.category || !parsed.sentiment) {
      throw new Error('Missing required fields in parsed data');
    }

    return parsed;
  } catch (error) {
    console.error('LLM parsing error:', error);

    // Fallback to basic parsing
    return {
      category: 'general',
      subject: noteText.substring(0, 50),
      sentiment: 'neutral',
      locationName: null,
      city: null,
      country: null,
      tags: [],
      isActionable: false,
      priority: 'normal',
      parsedData: {
        notes: noteText,
      },
    };
  }
}

/**
 * Check for contradictory notes
 */
export interface ContradictionResult {
  hasContradiction: boolean;
  contradictingNotes: {
    id: string;
    noteText: string;
    sentiment: string;
    createdAt: Date;
  }[];
  message: string;
}

export async function checkContradictions(
  newNote: ParsedNoteData,
  noteText: string,
  existingNotes: Array<{
    id: string;
    noteText: string;
    category: string;
    subject: string | null;
    sentiment: string;
    createdAt: Date;
  }>
): Promise<ContradictionResult> {
  // Filter notes from same category and subject
  const relatedNotes = existingNotes.filter(
    (note) =>
      note.category === newNote.category &&
      note.subject &&
      newNote.subject &&
      note.subject.toLowerCase().includes(newNote.subject.toLowerCase()) ||
      newNote.subject.toLowerCase().includes(note.subject.toLowerCase())
  );

  if (relatedNotes.length === 0) {
    return {
      hasContradiction: false,
      contradictingNotes: [],
      message: '',
    };
  }

  // Check for sentiment contradictions
  const contradictingNotes = relatedNotes.filter(
    (note) =>
      (note.sentiment === 'positive' && newNote.sentiment === 'negative') ||
      (note.sentiment === 'negative' && newNote.sentiment === 'positive')
  );

  if (contradictingNotes.length > 0) {
    const oldNote = contradictingNotes[0];
    return {
      hasContradiction: true,
      contradictingNotes,
      message: `You have a previous ${oldNote.sentiment} note about "${oldNote.subject}" from ${oldNote.createdAt.toLocaleDateString()}. Your new note seems to contradict it. Would you like to override the previous note?`,
    };
  }

  return {
    hasContradiction: false,
    contradictingNotes: [],
    message: '',
  };
}
