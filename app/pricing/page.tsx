'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, X, ArrowRight, Sparkles } from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '@/lib/subscriptions/plans';

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') {
      window.location.href = '/dashboard';
      return;
    }

    setLoading(planId);

    try {
      const response = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billingPeriod }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to create checkout session');
        setLoading(null);
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      alert('An error occurred. Please try again.');
      setLoading(null);
    }
  };

  const getYearlySavings = (plan: typeof SUBSCRIPTION_PLANS[0]) => {
    const monthlyTotal = plan.price.monthly * 12;
    const yearlyTotal = plan.price.yearly;
    const savings = monthlyTotal - yearlyTotal;
    const percentage = Math.round((savings / monthlyTotal) * 100);
    return { amount: savings, percentage };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Choose Your Travel Adventure
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start free and upgrade when you need more power. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm font-medium ${billingPeriod === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
            className="relative inline-flex h-8 w-14 items-center rounded-full bg-blue-600"
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                billingPeriod === 'yearly' ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${billingPeriod === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
            Yearly
            <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
              Save 17%
            </span>
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const price = plan.price[billingPeriod];
            const savings = billingPeriod === 'yearly' ? getYearlySavings(plan) : null;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 p-8 ${
                  plan.popular
                    ? 'border-blue-600 shadow-2xl scale-105'
                    : 'border-gray-200 shadow-md'
                } bg-white`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="inline-flex items-center gap-2 px-4 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full">
                      <Sparkles className="w-4 h-4" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>

                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-gray-900">
                      ${price}
                    </span>
                    <span className="text-gray-500">
                      {plan.id === 'free' ? '' : `/${billingPeriod === 'monthly' ? 'mo' : 'yr'}`}
                    </span>
                  </div>

                  {savings && savings.amount > 0 && (
                    <p className="text-sm text-green-600 mt-2">
                      Save ${savings.amount.toFixed(2)} per year ({savings.percentage}%)
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading === plan.id}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading === plan.id ? (
                    'Loading...'
                  ) : (
                    <>
                      {plan.id === 'free' ? 'Get Started' : 'Subscribe Now'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="mt-8 space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className={`text-sm ${feature.included ? 'text-gray-900' : 'text-gray-400'}`}>
                          {feature.name}
                          {feature.limit && (
                            <span className="ml-2 text-xs text-gray-500">
                              ({feature.limit})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I change plans later?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. If you upgrade, you'll be charged a prorated amount. If you downgrade, the change will take effect at the end of your current billing period.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600">
                Yes! The Traveler plan includes a 14-day free trial. No credit card required to start. You can cancel anytime during the trial with no charges.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and digital wallets like Apple Pay and Google Pay through our secure payment partner, Stripe.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I cancel my subscription?
              </h3>
              <p className="text-gray-600">
                Yes, you can cancel anytime from your account settings. You'll continue to have access until the end of your current billing period. We don't offer refunds for partial months.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you offer discounts for students or non-profits?
              </h3>
              <p className="text-gray-600">
                Yes! We offer 50% off for students with a valid .edu email address and 30% off for registered non-profit organizations. Contact us at support@travel-assistant.com to apply.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Still have questions?
          </h2>
          <p className="text-gray-600 mb-8">
            Our team is here to help you choose the right plan
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back to Dashboard
            </Link>
            <a
              href="mailto:support@travel-assistant.com"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
