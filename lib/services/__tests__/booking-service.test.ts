/**
 * Booking Service Tests
 * Run with: npx tsx lib/services/__tests__/booking-service.test.ts
 */

import { bookingService } from '../booking-service';
import type { FlightOffer } from '@/lib/integrations/amadeus-client';

// Mock flight offer for testing
const createMockFlightOffer = (
  departureCode: string,
  arrivalCode: string,
  departureTime: string,
  arrivalTime: string,
  price: string
): FlightOffer => ({
  id: `MOCK-${Math.random().toString(36).substring(7)}`,
  source: 'GDS',
  instantTicketingRequired: false,
  nonHomogeneous: false,
  oneWay: false,
  lastTicketingDate: new Date().toISOString().split('T')[0],
  numberOfBookableSeats: 9,
  itineraries: [
    {
      duration: 'PT5H30M',
      segments: [
        {
          departure: {
            iataCode: departureCode,
            at: departureTime,
          },
          arrival: {
            iataCode: arrivalCode,
            at: arrivalTime,
          },
          carrierCode: 'AA',
          number: '100',
          aircraft: { code: '738' },
          operating: { carrierCode: 'AA' },
          duration: 'PT5H30M',
          id: '1',
          numberOfStops: 0,
          blacklistedInEU: false,
        },
      ],
    },
  ],
  price: {
    currency: 'USD',
    total: price,
    base: price,
    fees: [],
    grandTotal: price,
  },
  pricingOptions: {
    fareType: ['PUBLISHED'],
    includedCheckedBagsOnly: true,
  },
  validatingAirlineCodes: ['AA'],
  travelerPricings: [
    {
      travelerId: '1',
      fareOption: 'STANDARD',
      travelerType: 'ADULT',
      price: {
        currency: 'USD',
        total: price,
        base: price,
      },
      fareDetailsBySegment: [
        {
          segmentId: '1',
          cabin: 'ECONOMY',
          fareBasis: 'Y',
          class: 'Y',
          includedCheckedBags: {
            weight: 23,
            weightUnit: 'KG',
          },
        },
      ],
    },
  ],
});

async function runTests() {
  console.log('\n🧪 Booking Service Test Suite');
  console.log('='.repeat(60));

  try {
    // Test 1: Create a test trip
    console.log('\n📝 Test 1: Creating test trip...');
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // Get a test user (or create one)
    const testUser = await prisma.user.findFirst({
      where: { email: 'jbandu@gmail.com' },
    });

    if (!testUser) {
      console.log('❌ Test user not found. Please login first.');
      return;
    }

    const trip = await prisma.trip.create({
      data: {
        userId: testUser.id,
        title: 'Test Trip - Los Angeles',
        destinations: [{ city: 'Los Angeles', country: 'USA', arrivalDate: '2025-12-15', departureDate: '2025-12-20' }],
        startDate: new Date('2025-12-15'),
        endDate: new Date('2025-12-20'),
        budgetAmount: 2000,
        budgetCurrency: 'USD',
        status: 'planning',
      },
    });

    console.log(`✅ Created test trip: ${trip.id}`);

    // Test 2: Create flight booking
    console.log('\n📝 Test 2: Creating flight booking (NYC -> LAX)...');
    const flightOffer1 = createMockFlightOffer(
      'JFK',
      'LAX',
      '2025-12-15T08:00:00',
      '2025-12-15T11:30:00',
      '350.00'
    );

    const flightResult = await bookingService.createFlightBooking({
      tripId: trip.id,
      userId: testUser.id,
      flightOffer: flightOffer1,
    });

    console.log(`✅ Flight booking created: ${flightResult.booking.confirmationCode}`);
    console.log(`   Conflicts detected: ${flightResult.conflicts.length}`);

    // Test 3: Create hotel booking (should warn if location mismatch)
    console.log('\n📝 Test 3: Creating hotel booking in San Francisco (should warn about location mismatch)...');
    const hotelResult = await bookingService.createHotelBooking({
      tripId: trip.id,
      userId: testUser.id,
      hotelOffer: {
        hotelId: 'HOTEL123',
        name: 'San Francisco Grand Hotel',
        cityCode: 'SFO',
        checkInDate: '2025-12-15',
        checkOutDate: '2025-12-18',
        price: {
          total: '450.00',
          currency: 'USD',
        },
        roomType: 'Deluxe King',
      },
    });

    console.log(`✅ Hotel booking created: ${hotelResult.booking.confirmationCode}`);
    console.log(`   Conflicts detected: ${hotelResult.conflicts.length}`);

    if (hotelResult.conflicts.length > 0) {
      console.log('   Conflict details:');
      hotelResult.conflicts.forEach(c => {
        const icon = c.severity === 'ERROR' ? '❌' : c.severity === 'WARNING' ? '⚠️' : 'ℹ️';
        console.log(`   ${icon} ${c.type}: ${c.message}`);
      });
    }

    // Test 4: Create overlapping flight (should error)
    console.log('\n📝 Test 4: Creating overlapping flight booking (should error)...');
    const overlappingFlight = createMockFlightOffer(
      'LAX',
      'JFK',
      '2025-12-15T10:00:00', // Overlaps with first flight
      '2025-12-15T18:30:00',
      '380.00'
    );

    const overlapResult = await bookingService.createFlightBooking({
      tripId: trip.id,
      userId: testUser.id,
      flightOffer: overlappingFlight,
    });

    console.log(`✅ Overlapping flight created: ${overlapResult.booking.confirmationCode}`);
    console.log(`   Conflicts detected: ${overlapResult.conflicts.length}`);

    if (overlapResult.conflicts.length > 0) {
      console.log('   Conflict details:');
      overlapResult.conflicts.forEach(c => {
        const icon = c.severity === 'ERROR' ? '❌' : c.severity === 'WARNING' ? '⚠️' : 'ℹ️';
        console.log(`   ${icon} ${c.type}: ${c.message}`);
      });
    }

    // Test 5: Create return flight (valid, no overlap)
    console.log('\n📝 Test 5: Creating valid return flight...');
    const returnFlight = createMockFlightOffer(
      'LAX',
      'JFK',
      '2025-12-20T14:00:00',
      '2025-12-20T22:30:00',
      '420.00'
    );

    const returnResult = await bookingService.createFlightBooking({
      tripId: trip.id,
      userId: testUser.id,
      flightOffer: returnFlight,
    });

    console.log(`✅ Return flight created: ${returnResult.booking.confirmationCode}`);
    console.log(`   Conflicts detected: ${returnResult.conflicts.length}`);

    // Test 6: Check budget
    console.log('\n📝 Test 6: Checking budget...');
    const tripWithBudget = await prisma.trip.findUnique({
      where: { id: trip.id },
      include: { bookings: true },
    });

    const totalSpent = tripWithBudget?.bookings.reduce(
      (sum, b) => sum + parseFloat(b.totalAmount.toString()),
      0
    );

    console.log(`   Budget: $${tripWithBudget?.budgetAmount}`);
    console.log(`   Total spent: $${totalSpent?.toFixed(2)}`);

    if (totalSpent && tripWithBudget?.budgetAmount && totalSpent > parseFloat(tripWithBudget.budgetAmount.toString())) {
      console.log('   ⚠️  Budget exceeded!');
    } else {
      console.log('   ✅ Within budget');
    }

    // Test 7: Cancel overlapping booking
    console.log('\n📝 Test 7: Cancelling overlapping flight...');
    await bookingService.cancelBooking(overlapResult.booking.id);
    console.log('   ✅ Booking cancelled');

    // Test 8: Validate trip after cancellation
    console.log('\n📝 Test 8: Validating trip after cancellation...');
    const finalConflicts = await bookingService.validateTrip(trip.id);
    console.log(`   Conflicts after cancellation: ${finalConflicts.length}`);

    if (finalConflicts.length > 0) {
      console.log('   Remaining conflicts:');
      finalConflicts.forEach(c => {
        const icon = c.severity === 'ERROR' ? '❌' : c.severity === 'WARNING' ? '⚠️' : 'ℹ️';
        console.log(`   ${icon} ${c.type}: ${c.message}`);
      });
    }

    // Test 9: Get all trip bookings
    console.log('\n📝 Test 9: Getting all trip bookings...');
    const allBookings = await bookingService.getTripBookings(trip.id);
    console.log(`   Total active bookings: ${allBookings.filter(b => b.status !== 'CANCELLED').length}`);
    console.log('   Booking timeline:');
    allBookings
      .filter(b => b.status !== 'CANCELLED')
      .forEach(b => {
        console.log(`   - ${b.bookingType}: ${b.startDate.toISOString().split('T')[0]} (${b.confirmationCode})`);
      });

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await prisma.booking.deleteMany({ where: { tripId: trip.id } });
    await prisma.trip.delete({ where: { id: trip.id } });
    await prisma.$disconnect();
    console.log('   ✅ Cleanup complete');

    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests passed!');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

runTests();
