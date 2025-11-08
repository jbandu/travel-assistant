/**
 * Admin API - Individual Subscription Tier Management
 * Update and delete subscription tiers (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe/stripe-client';

// GET - Get single tier
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const tier = await prisma.subscriptionTier.findUnique({
      where: { id },
    });

    if (!tier) {
      return NextResponse.json({ error: 'Tier not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      tier,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    console.error('Get tier error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tier' },
      { status: 500 }
    );
  }
}

// PATCH - Update tier
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const data = await req.json();

    // Find existing tier
    const existingTier = await prisma.subscriptionTier.findUnique({
      where: { id },
    });

    if (!existingTier) {
      return NextResponse.json({ error: 'Tier not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};
    const allowedFields = [
      'name',
      'description',
      'monthlyPrice',
      'yearlyPrice',
      'currency',
      'trialDays',
      'maxTrips',
      'maxAIMessages',
      'maxPriceAlerts',
      'maxFlightBookings',
      'maxHotelBookings',
      'maxBucketList',
      'hasAdvancedAnalytics',
      'hasPrioritySupport',
      'hasCalendarSync',
      'hasPDFExport',
      'hasConcierge',
      'hasFamilyAccount',
      'has24x7Support',
      'isActive',
      'isPopular',
      'displayOrder',
      'features',
    ];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    // Update Stripe prices if pricing changed
    if (
      (data.monthlyPrice !== undefined && data.monthlyPrice !== existingTier.monthlyPrice) ||
      (data.yearlyPrice !== undefined && data.yearlyPrice !== existingTier.yearlyPrice)
    ) {
      try {
        const productId = existingTier.stripeProductId;
        const currency = data.currency || existingTier.currency;

        // Create new prices (Stripe doesn't allow price updates)
        if (data.monthlyPrice !== undefined && productId) {
          // Archive old price
          if (existingTier.stripeMonthlyPriceId) {
            await stripe.prices.update(existingTier.stripeMonthlyPriceId, {
              active: false,
            });
          }

          // Create new price
          if (data.monthlyPrice > 0) {
            const newPrice = await stripe.prices.create({
              product: productId,
              unit_amount: Math.round(data.monthlyPrice * 100),
              currency,
              recurring: {
                interval: 'month',
              },
              metadata: {
                tierCode: existingTier.tierCode,
                billingPeriod: 'monthly',
              },
            });
            updateData.stripeMonthlyPriceId = newPrice.id;
          } else {
            updateData.stripeMonthlyPriceId = null;
          }
        }

        if (data.yearlyPrice !== undefined && productId) {
          // Archive old price
          if (existingTier.stripeYearlyPriceId) {
            await stripe.prices.update(existingTier.stripeYearlyPriceId, {
              active: false,
            });
          }

          // Create new price
          if (data.yearlyPrice > 0) {
            const newPrice = await stripe.prices.create({
              product: productId,
              unit_amount: Math.round(data.yearlyPrice * 100),
              currency,
              recurring: {
                interval: 'year',
              },
              metadata: {
                tierCode: existingTier.tierCode,
                billingPeriod: 'yearly',
              },
            });
            updateData.stripeYearlyPriceId = newPrice.id;
          } else {
            updateData.stripeYearlyPriceId = null;
          }
        }

        // Update Stripe product name/description
        if (productId && (data.name || data.description)) {
          await stripe.products.update(productId, {
            name: data.name || existingTier.name,
            description: data.description || existingTier.description || undefined,
          });
        }
      } catch (stripeError) {
        console.error('Stripe update error:', stripeError);
        return NextResponse.json(
          { error: 'Failed to update Stripe prices' },
          { status: 500 }
        );
      }
    }

    // Update tier in database
    const tier = await prisma.subscriptionTier.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      tier,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    console.error('Update tier error:', error);
    return NextResponse.json(
      { error: 'Failed to update tier' },
      { status: 500 }
    );
  }
}

// DELETE - Delete tier
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    // Find tier
    const tier = await prisma.subscriptionTier.findUnique({
      where: { id },
    });

    if (!tier) {
      return NextResponse.json({ error: 'Tier not found' }, { status: 404 });
    }

    // Check if any users are using this tier
    const userCount = await prisma.user.count({
      where: { subscriptionPlan: tier.tierCode },
    });

    if (userCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete tier: ${userCount} users are currently subscribed to this tier`,
          userCount,
        },
        { status: 400 }
      );
    }

    // Archive Stripe prices (don't delete, for historical data)
    if (tier.stripeMonthlyPriceId) {
      try {
        await stripe.prices.update(tier.stripeMonthlyPriceId, {
          active: false,
        });
      } catch (e) {
        console.error('Error archiving Stripe monthly price:', e);
      }
    }

    if (tier.stripeYearlyPriceId) {
      try {
        await stripe.prices.update(tier.stripeYearlyPriceId, {
          active: false,
        });
      } catch (e) {
        console.error('Error archiving Stripe yearly price:', e);
      }
    }

    // Archive Stripe product
    if (tier.stripeProductId) {
      try {
        await stripe.products.update(tier.stripeProductId, {
          active: false,
        });
      } catch (e) {
        console.error('Error archiving Stripe product:', e);
      }
    }

    // Delete tier from database
    await prisma.subscriptionTier.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Tier deleted successfully',
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    console.error('Delete tier error:', error);
    return NextResponse.json(
      { error: 'Failed to delete tier' },
      { status: 500 }
    );
  }
}
