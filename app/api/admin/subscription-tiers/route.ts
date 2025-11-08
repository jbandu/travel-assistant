/**
 * Admin API - Subscription Tier Management
 * CRUD operations for subscription tiers (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe/stripe-client';

// GET - List all subscription tiers
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const tiers = await prisma.subscriptionTier.findMany({
      orderBy: { displayOrder: 'asc' },
    });

    return NextResponse.json({
      success: true,
      tiers,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    console.error('Get tiers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tiers' },
      { status: 500 }
    );
  }
}

// POST - Create new subscription tier
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const data = await req.json();
    const {
      tierCode,
      name,
      description,
      monthlyPrice,
      yearlyPrice,
      currency = 'usd',
      trialDays,
      maxTrips,
      maxAIMessages,
      maxPriceAlerts,
      maxFlightBookings,
      maxHotelBookings,
      maxBucketList,
      hasAdvancedAnalytics = false,
      hasPrioritySupport = false,
      hasCalendarSync = false,
      hasPDFExport = false,
      hasConcierge = false,
      hasFamilyAccount = false,
      has24x7Support = false,
      isActive = true,
      isPopular = false,
      displayOrder = 0,
      features = [],
      createStripeProduct = true,
    } = data;

    // Validate required fields
    if (!tierCode || !name) {
      return NextResponse.json(
        { error: 'tierCode and name are required' },
        { status: 400 }
      );
    }

    // Check if tier code already exists
    const existing = await prisma.subscriptionTier.findUnique({
      where: { tierCode },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Tier code already exists' },
        { status: 400 }
      );
    }

    let stripeProductId = null;
    let stripeMonthlyPriceId = null;
    let stripeYearlyPriceId = null;

    // Create Stripe product and prices if requested
    if (createStripeProduct && (monthlyPrice > 0 || yearlyPrice > 0)) {
      try {
        // Create Stripe product
        const product = await stripe.products.create({
          name,
          description: description || undefined,
          metadata: {
            tierCode,
          },
        });
        stripeProductId = product.id;

        // Create monthly price
        if (monthlyPrice > 0) {
          const monthlyStripePrice = await stripe.prices.create({
            product: stripeProductId,
            unit_amount: Math.round(monthlyPrice * 100),
            currency,
            recurring: {
              interval: 'month',
            },
            metadata: {
              tierCode,
              billingPeriod: 'monthly',
            },
          });
          stripeMonthlyPriceId = monthlyStripePrice.id;
        }

        // Create yearly price
        if (yearlyPrice > 0) {
          const yearlyStripePrice = await stripe.prices.create({
            product: stripeProductId,
            unit_amount: Math.round(yearlyPrice * 100),
            currency,
            recurring: {
              interval: 'year',
            },
            metadata: {
              tierCode,
              billingPeriod: 'yearly',
            },
          });
          stripeYearlyPriceId = yearlyStripePrice.id;
        }
      } catch (stripeError) {
        console.error('Stripe product creation error:', stripeError);
        return NextResponse.json(
          { error: 'Failed to create Stripe product' },
          { status: 500 }
        );
      }
    }

    // Create tier in database
    const tier = await prisma.subscriptionTier.create({
      data: {
        tierCode,
        name,
        description,
        monthlyPrice,
        yearlyPrice,
        currency,
        trialDays,
        maxTrips,
        maxAIMessages,
        maxPriceAlerts,
        maxFlightBookings,
        maxHotelBookings,
        maxBucketList,
        hasAdvancedAnalytics,
        hasPrioritySupport,
        hasCalendarSync,
        hasPDFExport,
        hasConcierge,
        hasFamilyAccount,
        has24x7Support,
        isActive,
        isPopular,
        displayOrder,
        features,
        stripeProductId,
        stripeMonthlyPriceId,
        stripeYearlyPriceId,
      },
    });

    return NextResponse.json({
      success: true,
      tier,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    console.error('Create tier error:', error);
    return NextResponse.json(
      { error: 'Failed to create tier' },
      { status: 500 }
    );
  }
}
