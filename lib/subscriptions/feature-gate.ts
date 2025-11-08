/**
 * Feature Gating Utility
 * Check if user has access to features based on subscription tier
 */

import { getFeatureLimits } from './plans';
import type { User } from '@prisma/client';

export class FeatureGate {
  private userId: string;
  private subscriptionPlan: string;
  private limits: ReturnType<typeof getFeatureLimits>;

  constructor(user: User) {
    this.userId = user.id;
    this.subscriptionPlan = user.subscriptionPlan;
    this.limits = getFeatureLimits(user.subscriptionPlan);
  }

  /**
   * Check if user can create more trips
   */
  canCreateTrip(currentTripCount: number): boolean {
    if (this.limits.maxTrips === null) return true;
    return currentTripCount < this.limits.maxTrips;
  }

  /**
   * Check if user can send AI messages
   */
  canSendAIMessage(messagesThisMonth: number): boolean {
    if (this.limits.maxAIMessages === null) return true;
    return messagesThisMonth < this.limits.maxAIMessages;
  }

  /**
   * Check if user can add bucket list items
   */
  canAddBucketListItem(currentCount: number): boolean {
    if (this.limits.maxBucketListItems === null) return true;
    return currentCount < this.limits.maxBucketListItems;
  }

  /**
   * Check if user can create price alerts
   */
  canCreatePriceAlert(currentCount: number): boolean {
    if (this.limits.maxPriceAlerts === null) return true;
    return currentCount < this.limits.maxPriceAlerts;
  }

  /**
   * Check if user has access to advanced analytics
   */
  hasAdvancedAnalytics(): boolean {
    return this.limits.hasAdvancedAnalytics;
  }

  /**
   * Check if user has priority support
   */
  hasPrioritySupport(): boolean {
    return this.limits.hasPrioritySupport;
  }

  /**
   * Check if user has calendar integration
   */
  hasCalendarIntegration(): boolean {
    return this.limits.hasCalendarIntegration;
  }

  /**
   * Check if user has concierge service
   */
  hasConciergeService(): boolean {
    return this.limits.hasConciergeService;
  }

  /**
   * Check if user has predictive pricing
   */
  hasPredictivePricing(): boolean {
    return this.limits.hasPredictivePricing;
  }

  /**
   * Get upgrade message for a feature
   */
  getUpgradeMessage(feature: string): string {
    const messages: Record<string, string> = {
      trips: `You've reached the limit of ${this.limits.maxTrips} trips on the Free plan. Upgrade to Traveler for unlimited trips!`,
      ai_messages: `You've used all ${this.limits.maxAIMessages} AI messages this month. Upgrade to Traveler for unlimited AI assistance!`,
      bucket_list: `You've reached the limit of ${this.limits.maxBucketListItems} bucket list items. Upgrade to Traveler for unlimited dreams!`,
      price_alerts: `Price alerts are a premium feature. Upgrade to Traveler to track price drops on your favorite routes!`,
      analytics: `Advanced analytics are available on Traveler and Explorer plans. Upgrade to see your travel insights!`,
      concierge: `Concierge service is available on the Explorer plan. Upgrade for personalized travel assistance!`,
      predictive_pricing: `Predictive pricing is an Explorer plan feature. Upgrade to see AI-powered price forecasts!`,
    };

    return messages[feature] || 'This feature requires a paid plan. Upgrade to unlock!';
  }

  /**
   * Get all limits for display
   */
  getLimits() {
    return this.limits;
  }
}

/**
 * Middleware to check feature access
 */
export function requireFeature(feature: keyof ReturnType<typeof getFeatureLimits>) {
  return (user: User): boolean => {
    const gate = new FeatureGate(user);
    const limits = gate.getLimits();
    return limits[feature] as boolean;
  };
}
