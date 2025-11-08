/**
 * Seed Sample Travel Notes
 * Creates realistic sample notes for testing
 *
 * Run with: npx ts-node scripts/seed-travel-notes.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SAMPLE_NOTES = [
  {
    noteText: 'The Marriott Downtown room 402 was too noisy. Avoid rooms facing the street next time.',
    category: 'hotel',
    subject: 'Marriott Downtown',
    sentiment: 'negative',
    locationName: 'Marriott Downtown',
    city: 'San Francisco',
    country: 'USA',
    tags: ['noisy', 'avoid', 'room-location'],
    isActionable: true,
    priority: 'normal',
    parsedData: {
      hotelName: 'Marriott Downtown',
      roomNumber: '402',
      issue: 'too noisy',
      recommendation: 'Avoid rooms facing the street',
    },
  },
  {
    noteText: 'The pad thai at Som Tam Nua in Bangkok is incredible. Must order!',
    category: 'restaurant',
    subject: 'Som Tam Nua',
    sentiment: 'positive',
    locationName: 'Som Tam Nua',
    city: 'Bangkok',
    country: 'Thailand',
    tags: ['must-try', 'thai-food', 'pad-thai'],
    isActionable: false,
    priority: 'normal',
    parsedData: {
      restaurantName: 'Som Tam Nua',
      dishName: 'Pad Thai',
      cuisineType: 'Thai',
      mustTry: true,
    },
  },
  {
    noteText: 'UA 1234 seat 12A has great legroom and window view. Best seat in economy!',
    category: 'seat',
    subject: 'UA 1234 Seat 12A',
    sentiment: 'positive',
    locationName: null,
    city: null,
    country: null,
    tags: ['good-seat', 'legroom', 'window', 'economy'],
    isActionable: true,
    priority: 'normal',
    parsedData: {
      airline: 'United Airlines',
      flightNumber: 'UA 1234',
      seatNumber: '12A',
      seatType: 'economy window',
      recommendation: 'Best seat in economy - great legroom and window view',
    },
  },
  {
    noteText: 'Skip the breakfast buffet at Hilton Tokyo. Overpriced at $45. Better options nearby.',
    category: 'hotel',
    subject: 'Hilton Tokyo',
    sentiment: 'negative',
    locationName: 'Hilton Tokyo',
    city: 'Tokyo',
    country: 'Japan',
    tags: ['skip', 'expensive', 'breakfast'],
    isActionable: true,
    priority: 'normal',
    parsedData: {
      hotelName: 'Hilton Tokyo',
      amenity: 'breakfast buffet',
      issue: 'overpriced at $45',
      recommendation: 'Better options nearby',
    },
  },
  {
    noteText: 'The sunset boat tour in Santorini was magical. Book the 7pm slot for best views!',
    category: 'activity',
    subject: 'Sunset Boat Tour',
    sentiment: 'positive',
    locationName: 'Santorini',
    city: 'Santorini',
    country: 'Greece',
    tags: ['must-do', 'sunset', 'boat-tour', 'romantic'],
    isActionable: false,
    priority: 'high',
    parsedData: {
      activityName: 'Sunset Boat Tour',
      bestTimeToVisit: '7pm slot',
      notes: 'Magical experience with best sunset views',
    },
  },
  {
    noteText: 'Delta flight DL 2345 gate always changes last minute. Check app 2 hours before boarding.',
    category: 'flight',
    subject: 'Delta DL 2345',
    sentiment: 'neutral',
    locationName: null,
    city: null,
    country: null,
    tags: ['gate-change', 'check-app', 'delta'],
    isActionable: true,
    priority: 'high',
    parsedData: {
      airline: 'Delta',
      flightNumber: 'DL 2345',
      warning: 'Gate changes last minute',
      tip: 'Check app 2 hours before boarding',
    },
  },
  {
    noteText: 'La Pergola in Rome requires jacket. Also book 2 months in advance for window seats.',
    category: 'restaurant',
    subject: 'La Pergola',
    sentiment: 'neutral',
    locationName: 'La Pergola',
    city: 'Rome',
    country: 'Italy',
    tags: ['dress-code', 'advance-booking', 'fine-dining'],
    isActionable: true,
    priority: 'high',
    parsedData: {
      restaurantName: 'La Pergola',
      priceLevel: 'luxury',
      notes: 'Requires jacket',
      tip: 'Book 2 months in advance for window seats',
    },
  },
  {
    noteText: 'Four Seasons Bali spa is worth the splurge. Ask for therapist Maya - she is amazing!',
    category: 'hotel',
    subject: 'Four Seasons Bali',
    sentiment: 'positive',
    locationName: 'Four Seasons Bali',
    city: 'Bali',
    country: 'Indonesia',
    tags: ['spa', 'worth-it', 'luxury', 'recommendation'],
    isActionable: true,
    priority: 'normal',
    parsedData: {
      hotelName: 'Four Seasons Bali',
      amenity: 'spa',
      recommendation: 'Ask for therapist Maya',
      notes: 'Worth the splurge',
    },
  },
  {
    noteText: 'Avoid exit row seats on AA 787. Seats don\'t recline and it\'s freezing cold.',
    category: 'seat',
    subject: 'AA 787 Exit Row',
    sentiment: 'negative',
    locationName: null,
    city: null,
    country: null,
    tags: ['avoid', 'exit-row', 'no-recline', 'cold'],
    isActionable: true,
    priority: 'high',
    parsedData: {
      airline: 'American Airlines',
      flightNumber: 'AA 787',
      seatType: 'exit row',
      issue: 'Seats don\'t recline and freezing cold',
      recommendation: 'Avoid exit row seats',
    },
  },
  {
    noteText: 'The coffee at Blue Bottle in SF is perfect. Try the New Orleans iced coffee!',
    category: 'restaurant',
    subject: 'Blue Bottle Coffee',
    sentiment: 'positive',
    locationName: 'Blue Bottle Coffee',
    city: 'San Francisco',
    country: 'USA',
    tags: ['coffee', 'must-try', 'iced-coffee'],
    isActionable: false,
    priority: 'low',
    parsedData: {
      restaurantName: 'Blue Bottle Coffee',
      dishName: 'New Orleans Iced Coffee',
      cuisineType: 'Coffee Shop',
      mustTry: true,
    },
  },
];

async function seed() {
  console.log('🌱 Seeding sample travel notes...\n');

  // Find a user to assign notes to (preferably an admin)
  const user = await prisma.user.findFirst({
    where: {
      email: {
        in: ['jbandu@gmail.com', 'arindam2808@gmail.com'],
      },
    },
  });

  if (!user) {
    console.log('⚠️  No admin user found. Please create a user first.');
    console.log('   Run the app and sign up with jbandu@gmail.com or arindam2808@gmail.com\n');
    return;
  }

  console.log(`✅ Found user: ${user.email} (${user.id})\n`);

  let createdCount = 0;
  let skippedCount = 0;

  for (const noteData of SAMPLE_NOTES) {
    try {
      // Check if similar note already exists
      const existing = await prisma.travelNote.findFirst({
        where: {
          userId: user.id,
          noteText: noteData.noteText,
        },
      });

      if (existing) {
        console.log(`⏭️  Skipped: "${noteData.noteText.substring(0, 50)}..."`);
        skippedCount++;
        continue;
      }

      // Create note
      const note = await prisma.travelNote.create({
        data: {
          userId: user.id,
          inputMethod: 'text',
          ...noteData,
        },
      });

      console.log(`✅ Created: ${note.category} - "${note.subject || 'General'}"`);
      createdCount++;

      // Create reminder for actionable notes
      if (noteData.isActionable && noteData.locationName) {
        await prisma.travelNoteReminder.create({
          data: {
            noteId: note.id,
            userId: user.id,
            triggerType: 'location',
            triggerLocationName: noteData.locationName,
            proximityRadius: 500,
            notificationChannel: 'app',
          },
        });
        console.log(`   📍 Created location-based reminder`);
      }
    } catch (error) {
      console.error(`❌ Error creating note:`, error);
    }
  }

  console.log(`\n✨ Seeding complete!`);
  console.log(`   Created: ${createdCount} notes`);
  console.log(`   Skipped: ${skippedCount} notes (already exist)\n`);
}

seed()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
