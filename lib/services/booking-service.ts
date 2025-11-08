/**
 * Booking Service
 * Manages mock reservations and cross-validation for unified travel planning
 */

import { PrismaClient, Prisma } from '@prisma/client';
import type { FlightOffer } from '@/lib/integrations/amadeus-client';

const prisma = new PrismaClient();

export type BookingType = 'FLIGHT' | 'HOTEL' | 'CAR_RENTAL' | 'ACTIVITY';
export type BookingStatus = 'MOCK_RESERVED' | 'CONFIRMED' | 'CANCELLED';

export interface ConflictCheck {
  type: 'DATE_OVERLAP' | 'LOCATION_MISMATCH' | 'INSUFFICIENT_TIME' | 'MISSING_COMPONENT' | 'BUDGET_EXCEEDED';
  severity: 'ERROR' | 'WARNING' | 'INFO';
  message: string;
  affectedBookings: string[]; // Booking IDs
  suggestions?: string[];
}

export interface FlightBookingInput {
  tripId: string;
  userId: string;
  flightOffer: FlightOffer;
}

export interface HotelBookingInput {
  tripId: string;
  userId: string;
  hotelOffer: {
    hotelId: string;
    name: string;
    cityCode: string;
    checkInDate: string;
    checkOutDate: string;
    price: {
      total: string;
      currency: string;
    };
    roomType?: string;
    address?: string;
  };
}

export interface CarRentalBookingInput {
  tripId: string;
  userId: string;
  rental: {
    pickupLocation: string;
    dropoffLocation: string;
    pickupDate: string;
    dropoffDate: string;
    vehicleType: string;
    company: string;
    price: {
      total: string;
      currency: string;
    };
  };
}

export interface ActivityBookingInput {
  tripId: string;
  userId: string;
  activity: {
    name: string;
    location: string;
    date: string;
    duration?: number; // in hours
    price: {
      total: string;
      currency: string;
    };
    description?: string;
  };
}

export class BookingService {
  /**
   * Generate a mock confirmation code
   */
  private generateConfirmationCode(type: BookingType): string {
    const prefix = {
      FLIGHT: 'FL',
      HOTEL: 'HT',
      CAR_RENTAL: 'CR',
      ACTIVITY: 'AC',
    }[type];

    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${random}`;
  }

  /**
   * Create a mock flight booking from Amadeus flight offer
   */
  async createFlightBooking(input: FlightBookingInput) {
    const { tripId, userId, flightOffer } = input;

    // Extract flight details
    const firstSegment = flightOffer.itineraries[0].segments[0];
    const lastSegment = flightOffer.itineraries[0].segments[flightOffer.itineraries[0].segments.length - 1];

    const booking = await prisma.booking.create({
      data: {
        tripId,
        userId,
        bookingType: 'FLIGHT',
        status: 'MOCK_RESERVED',
        startDate: new Date(firstSegment.departure.at),
        endDate: new Date(lastSegment.arrival.at),
        startLocation: firstSegment.departure.iataCode,
        endLocation: lastSegment.arrival.iataCode,
        confirmationCode: this.generateConfirmationCode('FLIGHT'),
        supplierName: firstSegment.carrierCode,
        bookingDetails: flightOffer as unknown as Prisma.JsonObject, // Full Amadeus response
        flightDetails: {
          offerId: flightOffer.id,
          itineraries: flightOffer.itineraries,
          price: flightOffer.price,
          validatingAirlineCodes: flightOffer.validatingAirlineCodes,
          travelerPricings: flightOffer.travelerPricings,
        } as unknown as Prisma.JsonObject,
        totalAmount: parseFloat(flightOffer.price.total),
        currency: flightOffer.price.currency,
      },
    });

    // Validate trip for conflicts
    const conflicts = await this.validateTrip(tripId);

    // Update trip validation status
    await prisma.trip.update({
      where: { id: tripId },
      data: {
        hasConflicts: conflicts.some(c => c.severity === 'ERROR'),
        lastValidatedAt: new Date(),
        conflictDetails: conflicts as unknown as Prisma.JsonArray,
      },
    });

    return { booking, conflicts };
  }

  /**
   * Create a mock hotel booking
   */
  async createHotelBooking(input: HotelBookingInput) {
    const { tripId, userId, hotelOffer } = input;

    const booking = await prisma.booking.create({
      data: {
        tripId,
        userId,
        bookingType: 'HOTEL',
        status: 'MOCK_RESERVED',
        startDate: new Date(hotelOffer.checkInDate),
        endDate: new Date(hotelOffer.checkOutDate),
        startLocation: hotelOffer.cityCode,
        endLocation: null,
        confirmationCode: this.generateConfirmationCode('HOTEL'),
        supplierName: hotelOffer.name,
        bookingDetails: hotelOffer as unknown as Prisma.JsonObject, // Full hotel offer
        hotelDetails: {
          hotelId: hotelOffer.hotelId,
          name: hotelOffer.name,
          checkInDate: hotelOffer.checkInDate,
          checkOutDate: hotelOffer.checkOutDate,
          roomType: hotelOffer.roomType,
          address: hotelOffer.address,
        } as unknown as Prisma.JsonObject,
        totalAmount: parseFloat(hotelOffer.price.total),
        currency: hotelOffer.price.currency,
      },
    });

    // Validate trip for conflicts
    const conflicts = await this.validateTrip(tripId);

    // Update trip validation status
    await prisma.trip.update({
      where: { id: tripId },
      data: {
        hasConflicts: conflicts.some(c => c.severity === 'ERROR'),
        lastValidatedAt: new Date(),
        conflictDetails: conflicts as unknown as Prisma.JsonArray,
      },
    });

    return { booking, conflicts };
  }

  /**
   * Create a mock car rental booking
   */
  async createCarRentalBooking(input: CarRentalBookingInput) {
    const { tripId, userId, rental } = input;

    const booking = await prisma.booking.create({
      data: {
        tripId,
        userId,
        bookingType: 'CAR_RENTAL',
        status: 'MOCK_RESERVED',
        startDate: new Date(rental.pickupDate),
        endDate: new Date(rental.dropoffDate),
        startLocation: rental.pickupLocation,
        endLocation: rental.dropoffLocation,
        confirmationCode: this.generateConfirmationCode('CAR_RENTAL'),
        supplierName: rental.company,
        bookingDetails: rental as unknown as Prisma.JsonObject, // Full rental details
        carDetails: {
          vehicleType: rental.vehicleType,
          pickupLocation: rental.pickupLocation,
          dropoffLocation: rental.dropoffLocation,
        } as unknown as Prisma.JsonObject,
        totalAmount: parseFloat(rental.price.total),
        currency: rental.price.currency,
      },
    });

    const conflicts = await this.validateTrip(tripId);

    await prisma.trip.update({
      where: { id: tripId },
      data: {
        hasConflicts: conflicts.some(c => c.severity === 'ERROR'),
        lastValidatedAt: new Date(),
        conflictDetails: conflicts as unknown as Prisma.JsonArray,
      },
    });

    return { booking, conflicts };
  }

  /**
   * Create a mock activity booking
   */
  async createActivityBooking(input: ActivityBookingInput) {
    const { tripId, userId, activity } = input;

    const startDate = new Date(activity.date);
    const endDate = activity.duration
      ? new Date(startDate.getTime() + activity.duration * 60 * 60 * 1000)
      : null;

    const booking = await prisma.booking.create({
      data: {
        tripId,
        userId,
        bookingType: 'ACTIVITY',
        status: 'MOCK_RESERVED',
        startDate,
        endDate,
        startLocation: activity.location,
        endLocation: null,
        confirmationCode: this.generateConfirmationCode('ACTIVITY'),
        supplierName: activity.name,
        bookingDetails: activity as unknown as Prisma.JsonObject, // Full activity details
        activityDetails: {
          name: activity.name,
          description: activity.description,
          duration: activity.duration,
        } as unknown as Prisma.JsonObject,
        totalAmount: parseFloat(activity.price.total),
        currency: activity.price.currency,
      },
    });

    const conflicts = await this.validateTrip(tripId);

    await prisma.trip.update({
      where: { id: tripId },
      data: {
        hasConflicts: conflicts.some(c => c.severity === 'ERROR'),
        lastValidatedAt: new Date(),
        conflictDetails: conflicts as unknown as Prisma.JsonArray,
      },
    });

    return { booking, conflicts };
  }

  /**
   * Validate trip bookings for conflicts
   */
  async validateTrip(tripId: string): Promise<ConflictCheck[]> {
    const conflicts: ConflictCheck[] = [];

    // Get all bookings for the trip, sorted by start date
    const bookings = await prisma.booking.findMany({
      where: {
        tripId,
        status: { not: 'CANCELLED' }
      },
      orderBy: { startDate: 'asc' },
    });

    if (bookings.length === 0) {
      return conflicts;
    }

    // 1. Check for date overlaps
    for (let i = 0; i < bookings.length - 1; i++) {
      const current = bookings[i];
      const next = bookings[i + 1];

      // Skip if current booking has no end date
      if (!current.endDate) continue;

      // Check if bookings overlap
      if (current.endDate > next.startDate) {
        conflicts.push({
          type: 'DATE_OVERLAP',
          severity: 'ERROR',
          message: `${current.bookingType} overlaps with ${next.bookingType}`,
          affectedBookings: [current.id, next.id],
          suggestions: [
            'Adjust the dates to avoid overlap',
            'Cancel one of the conflicting bookings',
          ],
        });
      }
    }

    // 2. Check for location continuity (flights -> hotels)
    const flights = bookings.filter(b => b.bookingType === 'FLIGHT');
    const hotels = bookings.filter(b => b.bookingType === 'HOTEL');

    for (const hotel of hotels) {
      const hotelDate = hotel.startDate;

      // Find the most recent flight before this hotel
      const relevantFlight = flights
        .filter(f => f.endDate && f.endDate <= hotelDate)
        .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())[0];

      if (relevantFlight && relevantFlight.endLocation !== hotel.startLocation) {
        conflicts.push({
          type: 'LOCATION_MISMATCH',
          severity: 'WARNING',
          message: `Hotel in ${hotel.startLocation} doesn't match flight destination ${relevantFlight.endLocation}`,
          affectedBookings: [relevantFlight.id, hotel.id],
          suggestions: [
            `Book hotel in ${relevantFlight.endLocation} instead`,
            'Add connecting flight or transportation',
          ],
        });
      }
    }

    // 3. Check for insufficient transfer time
    for (let i = 0; i < bookings.length - 1; i++) {
      const current = bookings[i];
      const next = bookings[i + 1];

      if (!current.endDate) continue;

      const timeDiff = next.startDate.getTime() - current.endDate.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      // If different locations and less than 2 hours between bookings
      if (current.endLocation !== next.startLocation && hoursDiff < 2 && hoursDiff >= 0) {
        conflicts.push({
          type: 'INSUFFICIENT_TIME',
          severity: 'WARNING',
          message: `Only ${hoursDiff.toFixed(1)} hours between ${current.bookingType} and ${next.bookingType}`,
          affectedBookings: [current.id, next.id],
          suggestions: [
            'Add buffer time for travel and check-in',
            'Consider booking later time',
          ],
        });
      }
    }

    // 4. Check for missing hotel if trip spans multiple days
    if (flights.length > 0) {
      const firstFlight = flights[0];
      const lastFlight = flights[flights.length - 1];

      if (lastFlight.endDate) {
        const tripDuration = (lastFlight.endDate.getTime() - firstFlight.startDate.getTime()) / (1000 * 60 * 60 * 24);

        if (tripDuration > 1 && hotels.length === 0) {
          conflicts.push({
            type: 'MISSING_COMPONENT',
            severity: 'INFO',
            message: `Trip spans ${Math.ceil(tripDuration)} days but no hotel is booked`,
            affectedBookings: flights.map(f => f.id),
            suggestions: [
              'Book accommodation for your trip',
              'Add hotel reservations',
            ],
          });
        }
      }
    }

    // 5. Check budget (if trip has budget set)
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: { budgetAmount: true },
    });

    if (trip?.budgetAmount) {
      const totalSpent = bookings.reduce((sum, b) => sum + parseFloat(b.totalAmount.toString()), 0);

      if (totalSpent > parseFloat(trip.budgetAmount.toString())) {
        conflicts.push({
          type: 'BUDGET_EXCEEDED',
          severity: 'WARNING',
          message: `Total bookings ($${totalSpent.toFixed(2)}) exceed budget ($${parseFloat(trip.budgetAmount.toString()).toFixed(2)})`,
          affectedBookings: bookings.map(b => b.id),
          suggestions: [
            'Review and cancel some bookings',
            'Increase trip budget',
            'Look for cheaper alternatives',
          ],
        });
      }
    }

    return conflicts;
  }

  /**
   * Get all bookings for a trip
   */
  async getTripBookings(tripId: string) {
    return await prisma.booking.findMany({
      where: { tripId },
      orderBy: { startDate: 'asc' },
    });
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingId: string) {
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
    });

    // Re-validate trip
    if (booking.tripId) {
      const conflicts = await this.validateTrip(booking.tripId);

      await prisma.trip.update({
        where: { id: booking.tripId },
        data: {
          hasConflicts: conflicts.some(c => c.severity === 'ERROR'),
          lastValidatedAt: new Date(),
          conflictDetails: conflicts as unknown as Prisma.JsonArray,
        },
      });
    }

    return booking;
  }

  /**
   * Get booking by ID
   */
  async getBooking(bookingId: string) {
    return await prisma.booking.findUnique({
      where: { id: bookingId },
    });
  }

  /**
   * Get all bookings for a user
   */
  async getUserBookings(userId: string) {
    return await prisma.booking.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' },
      include: {
        trip: {
          select: {
            id: true,
            title: true,
            destinations: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });
  }
}

export const bookingService = new BookingService();
