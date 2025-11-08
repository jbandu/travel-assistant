/**
 * Stripe Client Configuration
 * Server-side Stripe instance for payment processing
 */

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
  typescript: true,
});

/**
 * Helper to format amount for Stripe (convert to smallest currency unit)
 */
export function formatAmountForStripe(amount: number, currency: string): number {
  // Zero-decimal currencies (JPY, KRW, etc.) don't need multiplication
  const zeroDecimalCurrencies = ['jpy', 'krw', 'vnd', 'clp', 'pyg', 'ugx', 'xaf'];

  if (zeroDecimalCurrencies.includes(currency.toLowerCase())) {
    return Math.round(amount);
  }

  return Math.round(amount * 100);
}

/**
 * Helper to format amount from Stripe (convert from smallest currency unit)
 */
export function formatAmountFromStripe(amount: number, currency: string): number {
  const zeroDecimalCurrencies = ['jpy', 'krw', 'vnd', 'clp', 'pyg', 'ugx', 'xaf'];

  if (zeroDecimalCurrencies.includes(currency.toLowerCase())) {
    return amount;
  }

  return amount / 100;
}
