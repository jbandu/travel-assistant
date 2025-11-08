import { NextRequest, NextResponse } from 'next/server';
import { bookingService, ActivityBookingInput } from '@/lib/services/booking-service';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tripId, activity } = body;

    if (!tripId || !activity) {
      return NextResponse.json(
        { error: 'Missing required fields: tripId, activity' },
        { status: 400 }
      );
    }

    const input: ActivityBookingInput = {
      tripId,
      userId: user.userId,
      activity,
    };

    const result = await bookingService.createActivityBooking(input);

    return NextResponse.json({
      success: true,
      booking: result.booking,
      conflicts: result.conflicts,
      hasErrors: result.conflicts.some(c => c.severity === 'ERROR'),
      hasWarnings: result.conflicts.some(c => c.severity === 'WARNING'),
    });
  } catch (error) {
    console.error('Error creating activity booking:', error);
    return NextResponse.json(
      { error: 'Failed to create activity booking' },
      { status: 500 }
    );
  }
}
