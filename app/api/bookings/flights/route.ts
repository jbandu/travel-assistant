import { NextRequest, NextResponse } from 'next/server';
import { bookingService, FlightBookingInput } from '@/lib/services/booking-service';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tripId, flightOffer } = body;

    if (!tripId || !flightOffer) {
      return NextResponse.json(
        { error: 'Missing required fields: tripId, flightOffer' },
        { status: 400 }
      );
    }

    const input: FlightBookingInput = {
      tripId,
      userId: user.userId,
      flightOffer,
    };

    const result = await bookingService.createFlightBooking(input);

    return NextResponse.json({
      success: true,
      booking: result.booking,
      conflicts: result.conflicts,
      hasErrors: result.conflicts.some(c => c.severity === 'ERROR'),
      hasWarnings: result.conflicts.some(c => c.severity === 'WARNING'),
    });
  } catch (error) {
    console.error('Error creating flight booking:', error);
    return NextResponse.json(
      { error: 'Failed to create flight booking' },
      { status: 500 }
    );
  }
}
