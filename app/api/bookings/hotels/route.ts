import { NextRequest, NextResponse } from 'next/server';
import { bookingService, HotelBookingInput } from '@/lib/services/booking-service';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tripId, hotelOffer } = body;

    if (!tripId || !hotelOffer) {
      return NextResponse.json(
        { error: 'Missing required fields: tripId, hotelOffer' },
        { status: 400 }
      );
    }

    const input: HotelBookingInput = {
      tripId,
      userId: user.userId,
      hotelOffer,
    };

    const result = await bookingService.createHotelBooking(input);

    return NextResponse.json({
      success: true,
      booking: result.booking,
      conflicts: result.conflicts,
      hasErrors: result.conflicts.some(c => c.severity === 'ERROR'),
      hasWarnings: result.conflicts.some(c => c.severity === 'WARNING'),
    });
  } catch (error) {
    console.error('Error creating hotel booking:', error);
    return NextResponse.json(
      { error: 'Failed to create hotel booking' },
      { status: 500 }
    );
  }
}
