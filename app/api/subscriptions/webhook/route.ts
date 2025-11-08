/**
 * Subscription Webhook Handler
 * Processes Stripe subscription events
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe/stripe-client';
import { getPlanByStripePriceId } from '@/lib/subscriptions/plans';
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
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled subscription event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Subscription webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;

  if (!userId) {
    console.error('No userId in checkout session metadata');
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );

  await handleSubscriptionUpdate(subscription);

  console.log(`✅ Checkout completed for user ${userId}`);
}

async function handleSubscriptionUpdate(subscription: any) {
  const userId = subscription.metadata.userId;

  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  // Get plan from price ID
  const priceId = subscription.items.data[0].price.id;
  const plan = getPlanByStripePriceId(priceId);

  if (!plan) {
    console.error('Unknown price ID:', priceId);
    return;
  }

  // Determine subscription status
  let status = 'active';
  if (subscription.status === 'trialing') status = 'trialing';
  if (subscription.status === 'past_due') status = 'past_due';
  if (subscription.status === 'canceled') status = 'canceled';
  if (subscription.status === 'unpaid') status = 'past_due';

  // Update user subscription
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionPlan: plan.id,
      subscriptionStatus: status,
      stripeSubscriptionId: subscription.id,
      subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
      trialEndsAt: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
    },
  });

  console.log(`✅ Subscription updated for user ${userId} to ${plan.name} (${status})`);
}

async function handleSubscriptionDeleted(subscription: any) {
  const userId = subscription.metadata.userId;

  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  // Downgrade to free plan
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionPlan: 'free',
      subscriptionStatus: 'canceled',
      subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
    },
  });

  console.log(`❌ Subscription canceled for user ${userId}`);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    return; // Not a subscription invoice
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await handleSubscriptionUpdate(subscription);

  console.log(`💰 Invoice paid for subscription ${subscriptionId}`);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  if (!customerId) {
    return;
  }

  // Find user by Stripe customer ID
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error('No user found for customer:', customerId);
    return;
  }

  // Mark subscription as past_due
  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: 'past_due',
    },
  });

  console.log(`⚠️ Payment failed for user ${user.id}`);

  // TODO: Send email notification about failed payment
}
