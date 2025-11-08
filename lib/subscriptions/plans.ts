/**
 * Subscription Plans Configuration
 * Defines available subscription tiers and their features
 */

export interface SubscriptionFeature {
  name: string;
  description: string;
  included: boolean;
  limit?: number | string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  stripePriceId: {
    monthly: string;
    yearly: string;
  };
  features: SubscriptionFeature[];
  popular?: boolean;
  color: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for trying out our AI travel assistant',
    price: {
      monthly: 0,
      yearly: 0,
    },
    stripePriceId: {
      monthly: '', // No Stripe price for free plan
      yearly: '',
    },
    color: 'gray',
    features: [
      {
        name: 'Basic Trip Planning',
        description: 'Create and manage up to 3 trips',
        included: true,
        limit: '3 trips',
      },
      {
        name: 'AI Chat',
        description: 'Limited AI assistance',
        included: true,
        limit: '10 messages/month',
      },
      {
        name: 'Flight & Hotel Search',
        description: 'Basic search functionality',
        included: true,
      },
      {
        name: 'Trip History',
        description: 'View past trips',
        included: true,
        limit: 'Last 6 months',
      },
      {
        name: 'Bucket List',
        description: 'Save dream destinations',
        included: true,
        limit: '5 items',
      },
      {
        name: 'Price Alerts',
        description: 'Get notified of price drops',
        included: false,
      },
      {
        name: 'Advanced Analytics',
        description: 'Travel insights and trends',
        included: false,
      },
      {
        name: 'Priority Support',
        description: '24/7 assistance',
        included: false,
      },
      {
        name: 'Calendar Integration',
        description: 'Sync with Google/Apple Calendar',
        included: false,
      },
      {
        name: 'Concierge Service',
        description: 'Personal travel assistance',
        included: false,
      },
    ],
  },
  {
    id: 'traveler',
    name: 'Traveler',
    description: 'For frequent travelers who want unlimited planning',
    price: {
      monthly: 9.99,
      yearly: 99.99, // Save ~17%
    },
    stripePriceId: {
      monthly: process.env.STRIPE_PRICE_TRAVELER_MONTHLY || 'price_traveler_monthly',
      yearly: process.env.STRIPE_PRICE_TRAVELER_YEARLY || 'price_traveler_yearly',
    },
    color: 'blue',
    popular: true,
    features: [
      {
        name: 'Unlimited Trips',
        description: 'Create as many trips as you want',
        included: true,
        limit: 'Unlimited',
      },
      {
        name: 'Unlimited AI Chat',
        description: 'No message limits',
        included: true,
        limit: 'Unlimited',
      },
      {
        name: 'Flight & Hotel Search',
        description: 'Priority search results',
        included: true,
      },
      {
        name: 'Trip History',
        description: 'Access all past trips',
        included: true,
        limit: 'Unlimited',
      },
      {
        name: 'Bucket List',
        description: 'Unlimited dream destinations',
        included: true,
        limit: 'Unlimited',
      },
      {
        name: 'Price Alerts',
        description: 'Track up to 10 routes',
        included: true,
        limit: '10 alerts',
      },
      {
        name: 'Advanced Analytics',
        description: 'Travel insights and spending trends',
        included: true,
      },
      {
        name: 'Calendar Integration',
        description: 'Sync with Google/Apple Calendar',
        included: true,
      },
      {
        name: 'Export Itineraries',
        description: 'PDF exports with branding',
        included: true,
      },
      {
        name: 'Priority Support',
        description: 'Email support within 24 hours',
        included: false,
      },
      {
        name: 'Concierge Service',
        description: 'Personal travel assistance',
        included: false,
      },
    ],
  },
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Premium experience with VIP support and concierge',
    price: {
      monthly: 24.99,
      yearly: 249.99, // Save ~17%
    },
    stripePriceId: {
      monthly: process.env.STRIPE_PRICE_EXPLORER_MONTHLY || 'price_explorer_monthly',
      yearly: process.env.STRIPE_PRICE_EXPLORER_YEARLY || 'price_explorer_yearly',
    },
    color: 'purple',
    features: [
      {
        name: 'All Traveler Features',
        description: 'Everything in Traveler plan',
        included: true,
      },
      {
        name: '24/7 Support Agent',
        description: 'AI support available anytime',
        included: true,
      },
      {
        name: 'Predictive Pricing',
        description: 'AI-powered price forecasts',
        included: true,
      },
      {
        name: 'Price Alerts',
        description: 'Track unlimited routes',
        included: true,
        limit: 'Unlimited',
      },
      {
        name: 'Concierge Service',
        description: 'Personal travel assistance',
        included: true,
        limit: '$50/trip credit',
      },
      {
        name: 'VIP Booking Support',
        description: 'Priority booking assistance',
        included: true,
      },
      {
        name: 'Travel Insurance',
        description: 'Basic coverage included',
        included: true,
        limit: 'Up to $1,000',
      },
      {
        name: 'Family Account',
        description: 'Share with family members',
        included: true,
        limit: 'Up to 5 members',
      },
      {
        name: 'White-label Itineraries',
        description: 'Remove branding from exports',
        included: true,
      },
      {
        name: 'Early Access',
        description: 'New features before everyone else',
        included: true,
      },
    ],
  },
];

export function getPlanById(planId: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === planId);
}

export function getPlanByStripePriceId(priceId: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find(
    (plan) =>
      plan.stripePriceId.monthly === priceId || plan.stripePriceId.yearly === priceId
  );
}

export function comparePlans(currentPlanId: string, newPlanId: string): 'upgrade' | 'downgrade' | 'same' {
  const planOrder = ['free', 'traveler', 'explorer'];
  const currentIndex = planOrder.indexOf(currentPlanId);
  const newIndex = planOrder.indexOf(newPlanId);

  if (currentIndex < newIndex) return 'upgrade';
  if (currentIndex > newIndex) return 'downgrade';
  return 'same';
}

export interface FeatureLimit {
  maxTrips: number | null; // null = unlimited
  maxAIMessages: number | null; // null = unlimited
  maxBucketListItems: number | null;
  maxPriceAlerts: number | null;
  tripHistoryMonths: number | null; // null = unlimited
  hasAdvancedAnalytics: boolean;
  hasPrioritySupport: boolean;
  hasCalendarIntegration: boolean;
  hasConciergeService: boolean;
  hasPredictivePricing: boolean;
  hasWhiteLabel: boolean;
  familyAccountLimit: number;
}

export function getFeatureLimits(planId: string): FeatureLimit {
  switch (planId) {
    case 'free':
      return {
        maxTrips: 3,
        maxAIMessages: 10,
        maxBucketListItems: 5,
        maxPriceAlerts: 0,
        tripHistoryMonths: 6,
        hasAdvancedAnalytics: false,
        hasPrioritySupport: false,
        hasCalendarIntegration: false,
        hasConciergeService: false,
        hasPredictivePricing: false,
        hasWhiteLabel: false,
        familyAccountLimit: 1,
      };
    case 'traveler':
      return {
        maxTrips: null, // unlimited
        maxAIMessages: null,
        maxBucketListItems: null,
        maxPriceAlerts: 10,
        tripHistoryMonths: null,
        hasAdvancedAnalytics: true,
        hasPrioritySupport: false,
        hasCalendarIntegration: true,
        hasConciergeService: false,
        hasPredictivePricing: false,
        hasWhiteLabel: false,
        familyAccountLimit: 1,
      };
    case 'explorer':
      return {
        maxTrips: null,
        maxAIMessages: null,
        maxBucketListItems: null,
        maxPriceAlerts: null,
        tripHistoryMonths: null,
        hasAdvancedAnalytics: true,
        hasPrioritySupport: true,
        hasCalendarIntegration: true,
        hasConciergeService: true,
        hasPredictivePricing: true,
        hasWhiteLabel: true,
        familyAccountLimit: 5,
      };
    default:
      return getFeatureLimits('free');
  }
}
