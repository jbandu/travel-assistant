/**
 * Stripe Webhook Handler
 * Processes Stripe events (payment succeeded, failed, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe/stripe-client';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.refunded':
        await handleRefund(event.data.object as Stripe.Charge);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const bookingId = paymentIntent.metadata.bookingId;

  if (!bookingId) {
    console.error('No bookingId in payment intent metadata');
    return;
  }

  // Update booking status to CONFIRMED and payment status to paid
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'CONFIRMED',
      paymentStatus: 'paid',
      bookingDetails: {
        ...(await prisma.booking.findUnique({ where: { id: bookingId } }))
          ?.bookingDetails as object,
        paymentIntentId: paymentIntent.id,
        paidAt: new Date().toISOString(),
        chargeId: paymentIntent.latest_charge as string,
      },
    },
  });

  console.log(`✅ Payment succeeded for booking ${bookingId}`);

  // TODO: Send confirmation email
  // TODO: Create calendar events
  // TODO: Send push notification
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const bookingId = paymentIntent.metadata.bookingId;

  if (!bookingId) {
    console.error('No bookingId in payment intent metadata');
    return;
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      paymentStatus: 'failed',
      bookingDetails: {
        ...(await prisma.booking.findUnique({ where: { id: bookingId } }))
          ?.bookingDetails as object,
        paymentError: paymentIntent.last_payment_error?.message,
        failedAt: new Date().toISOString(),
      },
    },
  });

  console.log(`❌ Payment failed for booking ${bookingId}`);

  // TODO: Send payment failed email with retry link
}

async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  const bookingId = paymentIntent.metadata.bookingId;

  if (!bookingId) {
    console.error('No bookingId in payment intent metadata');
    return;
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      paymentStatus: 'pending',
      bookingDetails: {
        ...(await prisma.booking.findUnique({ where: { id: bookingId } }))
          ?.bookingDetails as object,
        paymentCanceledAt: new Date().toISOString(),
      },
    },
  });

  console.log(`🚫 Payment canceled for booking ${bookingId}`);
}

async function handleRefund(charge: Stripe.Charge) {
  const paymentIntentId = charge.payment_intent as string;

  // Find booking by payment intent ID
  const booking = await prisma.booking.findFirst({
    where: {
      bookingDetails: {
        path: ['paymentIntentId'],
        equals: paymentIntentId,
      },
    },
  });

  if (!booking) {
    console.error('No booking found for refunded charge');
    return;
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      paymentStatus: 'refunded',
      status: 'CANCELLED',
      bookingDetails: {
        ...(booking.bookingDetails as object),
        refundedAt: new Date().toISOString(),
        refundAmount: charge.amount_refunded,
      },
    },
  });

  console.log(`💰 Refund processed for booking ${booking.id}`);

  // TODO: Send refund confirmation email
}
