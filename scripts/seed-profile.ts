/**
 * Seed Script - Add Demo Profile Data
 * Run: npx ts-node scripts/seed-profile.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding demo profile data...');

  // Find the first user (admin)
  const user = await prisma.user.findFirst({
    include: { profile: true },
  });

  if (!user) {
    console.error('❌ No user found. Please create a user first.');
    process.exit(1);
  }

  console.log(`📋 Found user: ${user.email}`);

  // Demo profile preferences
  const demoPreferences = {
    // Trip Planning Preferences
    interests: ['beach', 'culture', 'food', 'adventure', 'nightlife'],
    travelStyle: 'mid-range',
    preferredBudgetRange: { min: 2000, max: 5000, currency: 'USD' },
    accommodationType: ['hotel', 'airbnb'],
    activityLevel: 'moderate',
    groupPreference: 'couple',

    // Travel History & Context
    visitedCountries: ['USA', 'Canada', 'Mexico', 'France', 'Italy', 'Spain', 'UK', 'Japan'],
    favoriteDestinations: ['Tokyo', 'Paris', 'Barcelona', 'New York'],
    bucketList: ['Iceland', 'New Zealand', 'Machu Picchu', 'Santorini', 'Bali', 'Norway'],
    pastTrips: [
      {
        destination: 'Tokyo, Japan',
        rating: 5,
        year: 2023,
        highlights: 'Amazing food, temples, cherry blossoms',
      },
      {
        destination: 'Paris, France',
        rating: 5,
        year: 2022,
        highlights: 'Louvre, Eiffel Tower, croissants',
      },
      {
        destination: 'Barcelona, Spain',
        rating: 4,
        year: 2021,
        highlights: 'Gaudi architecture, beaches, tapas',
      },
    ],

    // Flight Preferences
    preferredCabinClass: 'economy',
    preferredAirlines: ['United', 'Delta', 'American'],
    seatPreference: 'window',
    mealPreference: 'standard',
    dietaryRestrictions: [],

    // Personal Context
    age: 32,
    occupation: 'Software Engineer',
    languages: ['English', 'Spanish'],
    timezone: 'America/New_York',

    // Notification Preferences
    notificationPreferences: {
      email: true,
      sms: false,
      push: true,
    },
  };

  // Create or update profile
  if (user.profile) {
    console.log('📝 Updating existing profile...');
    await prisma.userProfile.update({
      where: { id: user.profile.id },
      data: {
        preferences: demoPreferences,
      },
    });
  } else {
    console.log('✨ Creating new profile...');
    await prisma.userProfile.create({
      data: {
        userId: user.id,
        preferences: demoPreferences,
      },
    });
  }

  console.log('✅ Profile seeded successfully!');
  console.log('\n📊 Profile Summary:');
  console.log(`   • Interests: ${demoPreferences.interests.join(', ')}`);
  console.log(`   • Travel Style: ${demoPreferences.travelStyle}`);
  console.log(`   • Budget: $${demoPreferences.preferredBudgetRange.min}-$${demoPreferences.preferredBudgetRange.max}`);
  console.log(`   • Visited: ${demoPreferences.visitedCountries.length} countries`);
  console.log(`   • Bucket List: ${demoPreferences.bucketList.slice(0, 3).join(', ')}...`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
