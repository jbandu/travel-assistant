/**
 * Create Payment Intent API
 * Creates a Stripe payment intent for booking checkout
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe, formatAmountForStripe } from '@/lib/stripe/stripe-client';

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        trip: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify user owns this booking
    if (booking.userId !== currentUser.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if booking is already paid
    if (booking.paymentStatus === 'paid') {
      return NextResponse.json(
        { error: 'Booking is already paid' },
        { status: 400 }
      );
    }

    // Check if booking is cancelled
    if (booking.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Cannot pay for cancelled booking' },
        { status: 400 }
      );
    }

    // Calculate amount
    const amount = formatAmountForStripe(
      Number(booking.totalAmount),
      booking.currency
    );

    // Create or retrieve payment intent
    let paymentIntent;

    // Check if booking already has a payment intent
    const existingIntentId = (booking.bookingDetails as any)?.paymentIntentId;

    if (existingIntentId) {
      // Retrieve existing payment intent
      try {
        paymentIntent = await stripe.paymentIntents.retrieve(existingIntentId);

        // If payment intent is in a terminal state, create a new one
        if (['succeeded', 'canceled'].includes(paymentIntent.status)) {
          paymentIntent = await createNewPaymentIntent();
        }
      } catch (error) {
        // If retrieval fails, create new payment intent
        paymentIntent = await createNewPaymentIntent();
      }
    } else {
      // Create new payment intent
      paymentIntent = await createNewPaymentIntent();
    }

    async function createNewPaymentIntent() {
      if (!booking) throw new Error('Booking not found');
      return await stripe.paymentIntents.create({
        amount,
        currency: booking.currency.toLowerCase(),
        metadata: {
          bookingId: booking.id,
          userId: currentUser.userId,
          bookingType: booking.bookingType,
          tripId: booking.tripId || 'none',
        },
        description: `${booking.bookingType} booking - ${booking.id}`,
        receipt_email: booking.user.email,
        automatic_payment_methods: {
          enabled: true,
        },
      });
    }

    // Update booking with payment intent ID
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        bookingDetails: {
          ...(booking.bookingDetails as object),
          paymentIntentId: paymentIntent.id,
        },
        paymentStatus: 'pending',
      },
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create payment intent',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
