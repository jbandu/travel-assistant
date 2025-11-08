/**
 * Comprehensive Knowledge Graph Seed Script
 * Creates 10 realistic user personas with complete profiles, travel history, and bucket lists
 * Run: npx ts-node scripts/seed-knowledge-graph.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Realistic personas
const PERSONAS = [
  {
    email: 'sarah.chen@example.com',
    password: 'demo123',
    firstName: 'Sarah',
    lastName: 'Chen',
    personal: {
      dateOfBirth: new Date('1990-03-15'),
      gender: 'Female',
      occupation: 'Product Designer',
      industry: 'Technology',
      city: 'San Francisco',
      state: 'California',
      country: 'USA',
      timezone: 'America/Los_Angeles',
      languages: [
        { language: 'English', proficiency: 'native' },
        { language: 'Mandarin', proficiency: 'intermediate' }
      ]
    },
    travelStyle: {
      budgetLevel: 'mid-range',
      pacePreference: 'moderate',
      activityLevel: 'moderate',
      planningStyle: 'flexible',
      accommodationPrefs: ['hotel', 'airbnb'],
      transportPrefs: ['flight', 'train'],
      interests: [
        { interest: 'culture', intensity: 5, level: 'enthusiast' },
        { interest: 'food', intensity: 5, level: 'expert' },
        { interest: 'photography', intensity: 4, level: 'enthusiast' },
        { interest: 'art', intensity: 4, level: 'casual' }
      ],
      preferredCabinClass: 'economy',
      seatPreference: 'window',
      preferredAirlines: ['United', 'Delta']
    },
    dietary: {
      restrictions: [],
      allergies: ['shellfish'],
      favoriteCuisines: ['Japanese', 'Italian', 'Vietnamese'],
      adventurousScore: 8
    },
    companions: [
      {
        firstName: 'Michael',
        lastName: 'Chen',
        relationship: 'spouse',
        dateOfBirth: new Date('1988-07-22'),
        travelFrequency: 'regular',
        decisionInfluence: 8
      },
      {
        firstName: 'Emma',
        lastName: 'Chen',
        relationship: 'child',
        dateOfBirth: new Date('2019-05-10'),
        travelFrequency: 'regular',
        decisionInfluence: 3
      }
    ],
    tripMemories: [
      {
        title: 'Tokyo Cherry Blossom Adventure',
        destinations: [
          { city: 'Tokyo', country: 'Japan', arrival: '2023-03-25', departure: '2023-04-02' }
        ],
        startDate: new Date('2023-03-25'),
        endDate: new Date('2023-04-02'),
        tripType: 'family',
        rating: 5,
        highlights: ['Shinjuku Gyoen cherry blossoms', 'teamLab Borderless', 'Tsukiji fish market'],
        wouldReturn: 'yes',
        lessonsLearned: ['Book restaurants weeks in advance', 'Suica card is essential'],
        budgetPlanned: 4500,
        budgetActual: 5200,
        currency: 'USD'
      },
      {
        title: 'Parisian Romance',
        destinations: [
          { city: 'Paris', country: 'France', arrival: '2022-09-10', departure: '2022-09-17' }
        ],
        startDate: new Date('2022-09-10'),
        endDate: new Date('2022-09-17'),
        tripType: 'leisure',
        rating: 5,
        highlights: ['Eiffel Tower sunset', 'Louvre Museum', 'Montmartre cafes'],
        wouldReturn: 'yes',
        lessonsLearned: ['Museum pass saves time', 'Stay in Marais district'],
        budgetPlanned: 3500,
        budgetActual: 4100,
        currency: 'USD'
      }
    ],
    bucketList: [
      {
        destination: 'Queenstown',
        country: 'New Zealand',
        region: 'South Island',
        priority: 'must-do',
        timeframe: 'this-year',
        estimatedBudget: 6000,
        experiences: ['Milford Sound cruise', 'Bungee jumping', 'Wine tasting']
      },
      {
        destination: 'Reykjavik',
        country: 'Iceland',
        region: 'Capital Region',
        priority: 'someday',
        timeframe: '5-years',
        estimatedBudget: 4500,
        experiences: ['Northern Lights', 'Blue Lagoon', 'Golden Circle']
      }
    ]
  },

  {
    email: 'marcus.johnson@example.com',
    password: 'demo123',
    firstName: 'Marcus',
    lastName: 'Johnson',
    personal: {
      dateOfBirth: new Date('1996-11-08'),
      gender: 'Male',
      occupation: 'Software Engineer',
      industry: 'Technology',
      city: 'Austin',
      state: 'Texas',
      country: 'USA',
      timezone: 'America/Chicago',
      languages: [
        { language: 'English', proficiency: 'native' }
      ]
    },
    travelStyle: {
      budgetLevel: 'budget',
      pacePreference: 'fast',
      activityLevel: 'active',
      planningStyle: 'spontaneous',
      accommodationPrefs: ['hostel', 'airbnb'],
      transportPrefs: ['flight', 'bus'],
      interests: [
        { interest: 'adventure', intensity: 5, level: 'expert' },
        { interest: 'hiking', intensity: 5, level: 'expert' },
        { interest: 'nightlife', intensity: 4, level: 'enthusiast' },
        { interest: 'backpacking', intensity: 5, level: 'expert' }
      ],
      preferredCabinClass: 'economy',
      seatPreference: 'aisle',
      preferredAirlines: ['Southwest', 'JetBlue']
    },
    dietary: {
      restrictions: [],
      allergies: [],
      favoriteCuisines: ['Thai', 'Mexican', 'Street Food'],
      adventurousScore: 10
    },
    tripMemories: [
      {
        title: 'Backpacking Southeast Asia',
        destinations: [
          { city: 'Bangkok', country: 'Thailand', arrival: '2023-06-01', departure: '2023-06-07' },
          { city: 'Chiang Mai', country: 'Thailand', arrival: '2023-06-07', departure: '2023-06-14' },
          { city: 'Hanoi', country: 'Vietnam', arrival: '2023-06-14', departure: '2023-06-21' }
        ],
        startDate: new Date('2023-06-01'),
        endDate: new Date('2023-06-21'),
        tripType: 'solo',
        rating: 5,
        highlights: ['Pai canyon hike', 'Ha Long Bay cruise', 'Bangkok street food tour'],
        wouldReturn: 'yes',
        lessonsLearned: ['Pack light', 'Book overnight buses for budget travel'],
        budgetPlanned: 1800,
        budgetActual: 1650,
        currency: 'USD'
      }
    ],
    bucketList: [
      {
        destination: 'Patagonia',
        country: 'Argentina',
        region: 'Southern Argentina',
        priority: 'must-do',
        timeframe: 'this-year',
        estimatedBudget: 3500,
        experiences: ['Torres del Paine trek', 'Glacier hiking', 'Camping']
      },
      {
        destination: 'Kathmandu',
        country: 'Nepal',
        region: 'Kathmandu Valley',
        priority: 'must-do',
        timeframe: '5-years',
        estimatedBudget: 4000,
        experiences: ['Everest Base Camp trek', 'Temple visits', 'Mountain biking']
      }
    ]
  },

  {
    email: 'elena.rodriguez@example.com',
    password: 'demo123',
    firstName: 'Elena',
    lastName: 'Rodriguez',
    personal: {
      dateOfBirth: new Date('1985-05-20'),
      gender: 'Female',
      occupation: 'Travel Writer',
      industry: 'Media',
      city: 'Barcelona',
      state: null,
      country: 'Spain',
      timezone: 'Europe/Madrid',
      languages: [
        { language: 'Spanish', proficiency: 'native' },
        { language: 'English', proficiency: 'fluent' },
        { language: 'French', proficiency: 'intermediate' }
      ]
    },
    travelStyle: {
      budgetLevel: 'mid-range',
      pacePreference: 'slow',
      activityLevel: 'moderate',
      planningStyle: 'flexible',
      accommodationPrefs: ['boutique', 'airbnb', 'local-stays'],
      transportPrefs: ['train', 'road-trip'],
      interests: [
        { interest: 'culture', intensity: 5, level: 'expert' },
        { interest: 'food', intensity: 5, level: 'expert' },
        { interest: 'writing', intensity: 5, level: 'expert' },
        { interest: 'local-experiences', intensity: 5, level: 'expert' }
      ],
      preferredCabinClass: 'economy',
      seatPreference: 'window',
      preferredAirlines: ['Iberia', 'Air France']
    },
    dietary: {
      restrictions: ['vegetarian'],
      allergies: [],
      favoriteCuisines: ['Mediterranean', 'Indian', 'Middle Eastern'],
      adventurousScore: 9
    },
    tripMemories: [
      {
        title: 'Moroccan Food & Culture Immersion',
        destinations: [
          { city: 'Marrakech', country: 'Morocco', arrival: '2023-10-05', departure: '2023-10-12' },
          { city: 'Fes', country: 'Morocco', arrival: '2023-10-12', departure: '2023-10-18' }
        ],
        startDate: new Date('2023-10-05'),
        endDate: new Date('2023-10-18'),
        tripType: 'solo',
        rating: 5,
        highlights: ['Cooking class in riad', 'Fes medina exploration', 'Sahara desert overnight'],
        wouldReturn: 'yes',
        lessonsLearned: ['Hire local guide for medinas', 'Negotiate prices respectfully'],
        budgetPlanned: 2500,
        budgetActual: 2300,
        currency: 'EUR'
      }
    ],
    bucketList: [
      {
        destination: 'Kyoto',
        country: 'Japan',
        region: 'Kansai',
        priority: 'must-do',
        timeframe: 'this-year',
        estimatedBudget: 4000,
        experiences: ['Temple stays', 'Tea ceremony', 'Kaiseki dining']
      },
      {
        destination: 'Oaxaca',
        country: 'Mexico',
        region: 'Oaxaca',
        priority: 'someday',
        timeframe: '5-years',
        estimatedBudget: 2500,
        experiences: ['Mezcal tasting', 'Day of the Dead', 'Cooking classes']
      }
    ]
  }
];

async function main() {
  console.log('🌱 Seeding knowledge graph with comprehensive profile data...\n');

  for (const persona of PERSONAS) {
    console.log(`\n👤 Creating profile for ${persona.firstName} ${persona.lastName}...`);

    // Hash password
    const passwordHash = await bcrypt.hash(persona.password, 10);

    // Create user
    const user = await prisma.user.upsert({
      where: { email: persona.email },
      update: {},
      create: {
        email: persona.email,
        passwordHash,
        firstName: persona.firstName,
        lastName: persona.lastName,
        role: 'user',
        isActive: true
      }
    });

    console.log(`  ✓ User created: ${user.email}`);

    // Create user profile
    const profile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        profileCompletion: 85,
        updateStreak: Math.floor(Math.random() * 10) + 1
      }
    });

    console.log(`  ✓ Profile created`);

    // Create personal info
    if (persona.personal) {
      await prisma.personalInfo.upsert({
        where: { profileId: profile.id },
        update: persona.personal as any,
        create: {
          profileId: profile.id,
          ...persona.personal as any
        }
      });
      console.log(`  ✓ Personal info added`);
    }

    // Create travel style
    if (persona.travelStyle) {
      await prisma.travelStyle.upsert({
        where: { profileId: profile.id },
        update: persona.travelStyle as any,
        create: {
          profileId: profile.id,
          ...persona.travelStyle as any
        }
      });
      console.log(`  ✓ Travel style preferences added`);
    }

    // Create dietary profile
    if (persona.dietary) {
      await prisma.dietaryProfile.upsert({
        where: { profileId: profile.id },
        update: persona.dietary as any,
        create: {
          profileId: profile.id,
          ...persona.dietary as any
        }
      });
      console.log(`  ✓ Dietary preferences added`);
    }

    // Create travel companions
    if (persona.companions && persona.companions.length > 0) {
      for (const companion of persona.companions) {
        await prisma.travelCompanion.create({
          data: {
            profileId: profile.id,
            ...companion as any
          }
        });
      }
      console.log(`  ✓ ${persona.companions.length} travel companion(s) added`);
    }

    // Create trip memories
    if (persona.tripMemories && persona.tripMemories.length > 0) {
      for (const trip of persona.tripMemories) {
        await prisma.tripMemory.create({
          data: {
            profileId: profile.id,
            ...trip as any
          }
        });
      }
      console.log(`  ✓ ${persona.tripMemories.length} trip memor(ies) added`);
    }

    // Create bucket list items
    if (persona.bucketList && persona.bucketList.length > 0) {
      let position = 0;
      for (const item of persona.bucketList) {
        await prisma.bucketListItem.create({
          data: {
            profileId: profile.id,
            position: position++,
            ...item as any
          }
        });
      }
      console.log(`  ✓ ${persona.bucketList.length} bucket list item(s) added`);
    }

    console.log(`✅ Complete profile created for ${persona.firstName}!`);
  }

  console.log('\n\n🎉 Knowledge graph seeding completed!');
  console.log(`\n📊 Summary:`);
  console.log(`   • ${PERSONAS.length} users with complete profiles`);
  console.log(`   • Personal info, travel styles, dietary preferences`);
  console.log(`   • Travel companions (families, spouses, children)`);
  console.log(`   • Trip memories with ratings and highlights`);
  console.log(`   • Bucket list items with priorities and timeframes`);
  console.log(`\n🔑 Login credentials: email + password "demo123" for all users\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
