'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    // Give webhook time to process
    setTimeout(() => {
      fetchSubscription();
    }, 2000);
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscriptions/manage');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Success Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to {subscription?.plan === 'traveler' ? 'Traveler' : 'Explorer'}!
          </h1>

          <p className="text-xl text-gray-600 mb-8">
            Your subscription is now active. Let's make your travel dreams come true!
          </p>

          {subscription?.trialEndsAt && (
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
              <Sparkles className="w-5 h-5" />
              <span>
                Your 14-day free trial ends on{' '}
                {new Date(subscription.trialEndsAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* What's Next */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            What's Next?
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Complete Your Profile
                </h3>
                <p className="text-gray-600 text-sm">
                  Add your travel preferences, dietary restrictions, and bucket list destinations for personalized recommendations.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Plan Your First Trip
                </h3>
                <p className="text-gray-600 text-sm">
                  Use our AI-powered trip planner to create amazing itineraries with unlimited trips and AI chat.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Set Up Price Alerts
                </h3>
                <p className="text-gray-600 text-sm">
                  Track your favorite routes and get notified when prices drop so you never miss a deal.
                </p>
              </div>
            </div>

            {subscription?.plan === 'explorer' && (
              <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Try Concierge Service
                  </h3>
                  <p className="text-gray-600 text-sm">
                    As an Explorer member, you get $50 credit for personalized concierge service. Contact us to get started!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Unlocked Features */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-8 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-6">
            🎉 Features Unlocked
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>Unlimited Trips</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>Unlimited AI Chat</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>Price Alerts</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>Advanced Analytics</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>Calendar Integration</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>PDF Exports</span>
            </div>
            {subscription?.plan === 'explorer' && (
              <>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <span>24/7 Support</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <span>Concierge Service</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/trips/plan"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Start Planning
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            href="/profile/edit"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-gray-200 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
          >
            Complete Profile
          </Link>
        </div>

        {/* Support */}
        <div className="mt-12 text-center text-gray-600">
          <p className="mb-2">Need help getting started?</p>
          <a
            href="mailto:support@travel-assistant.com"
            className="text-blue-600 hover:underline font-medium"
          >
            Contact our support team
          </a>
        </div>
      </div>
    </div>
  );
}
