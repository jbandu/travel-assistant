/**
 * Seed Subscription Tiers
 * Populates database with default subscription tiers
 *
 * Run with: npx ts-node scripts/seed-subscription-tiers.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_TIERS = [
  {
    tierCode: 'free',
    name: 'Free',
    description: 'Perfect for occasional travelers who want to explore the platform',
    monthlyPrice: 0,
    yearlyPrice: 0,
    currency: 'usd',
    trialDays: null,
    maxTrips: 3,
    maxAIMessages: 10,
    maxPriceAlerts: 0,
    maxFlightBookings: 0,
    maxHotelBookings: 0,
    maxBucketList: 5,
    hasAdvancedAnalytics: false,
    hasPrioritySupport: false,
    hasCalendarSync: false,
    hasPDFExport: false,
    hasConcierge: false,
    hasFamilyAccount: false,
    has24x7Support: false,
    isActive: true,
    isPopular: false,
    displayOrder: 0,
    features: [
      'Basic Trip Planning (3 trips)',
      'AI Chat (10 messages/month)',
      'Flight & Hotel Search',
      'Bucket List (5 destinations)',
      'Community Access',
    ],
  },
  {
    tierCode: 'traveler',
    name: 'Traveler',
    description: 'Best for frequent travelers who want unlimited planning and smart alerts',
    monthlyPrice: 9.99,
    yearlyPrice: 99.99,
    currency: 'usd',
    trialDays: 14,
    maxTrips: null, // unlimited
    maxAIMessages: null, // unlimited
    maxPriceAlerts: 10,
    maxFlightBookings: null,
    maxHotelBookings: null,
    maxBucketList: null,
    hasAdvancedAnalytics: true,
    hasPrioritySupport: false,
    hasCalendarSync: true,
    hasPDFExport: true,
    hasConcierge: false,
    hasFamilyAccount: false,
    has24x7Support: false,
    isActive: true,
    isPopular: true,
    displayOrder: 1,
    features: [
      'Unlimited Trips',
      'Unlimited AI Chat',
      'Price Alerts (10 routes)',
      'Advanced Analytics',
      'Calendar Integration',
      'PDF Itinerary Export',
      'Priority Email Support',
      '14-Day Free Trial',
    ],
  },
  {
    tierCode: 'explorer',
    name: 'Explorer',
    description: 'Premium experience for luxury travelers with 24/7 support and concierge service',
    monthlyPrice: 24.99,
    yearlyPrice: 249.99,
    currency: 'usd',
    trialDays: null,
    maxTrips: null,
    maxAIMessages: null,
    maxPriceAlerts: null, // unlimited
    maxFlightBookings: null,
    maxHotelBookings: null,
    maxBucketList: null,
    hasAdvancedAnalytics: true,
    hasPrioritySupport: true,
    hasCalendarSync: true,
    hasPDFExport: true,
    hasConcierge: true,
    hasFamilyAccount: true,
    has24x7Support: true,
    isActive: true,
    isPopular: false,
    displayOrder: 2,
    features: [
      'Everything in Traveler',
      'Unlimited Price Alerts',
      '24/7 Support Agent',
      'Concierge Service ($50 credit/trip)',
      'Family Account (Up to 5 members)',
      'Priority Booking Access',
      'Dedicated Account Manager',
      'VIP Travel Perks',
    ],
  },
];

async function seed() {
  console.log('🌱 Seeding subscription tiers...\n');

  for (const tierData of DEFAULT_TIERS) {
    try {
      // Check if tier already exists
      const existing = await prisma.subscriptionTier.findUnique({
        where: { tierCode: tierData.tierCode },
      });

      if (existing) {
        console.log(`✅ Tier "${tierData.name}" (${tierData.tierCode}) already exists`);
        continue;
      }

      // Create tier
      const tier = await prisma.subscriptionTier.create({
        data: tierData,
      });

      console.log(`✅ Created tier: ${tier.name} (${tier.tierCode})`);
      console.log(`   Monthly: $${tier.monthlyPrice}, Yearly: $${tier.yearlyPrice}`);
      console.log(`   Stripe Product ID: ${tier.stripeProductId || 'Not set'}\n`);
    } catch (error) {
      console.error(`❌ Error creating tier ${tierData.tierCode}:`, error);
    }
  }

  console.log('\n✨ Seeding complete!\n');
  console.log('📝 Next steps:');
  console.log('1. Create Stripe products and prices in Stripe Dashboard');
  console.log('2. Update each tier with Stripe price IDs via Admin Panel');
  console.log('3. Test subscription checkout flow\n');
}

seed()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
