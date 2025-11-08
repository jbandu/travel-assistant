import { NextRequest, NextResponse } from 'next/server';
import { bookingService, CarRentalBookingInput } from '@/lib/services/booking-service';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tripId, rental } = body;

    if (!tripId || !rental) {
      return NextResponse.json(
        { error: 'Missing required fields: tripId, rental' },
        { status: 400 }
      );
    }

    const input: CarRentalBookingInput = {
      tripId,
      userId: user.userId,
      rental,
    };

    const result = await bookingService.createCarRentalBooking(input);

    return NextResponse.json({
      success: true,
      booking: result.booking,
      conflicts: result.conflicts,
      hasErrors: result.conflicts.some(c => c.severity === 'ERROR'),
      hasWarnings: result.conflicts.some(c => c.severity === 'WARNING'),
    });
  } catch (error) {
    console.error('Error creating car rental booking:', error);
    return NextResponse.json(
      { error: 'Failed to create car rental booking' },
      { status: 500 }
    );
  }
}
