/**
 * Hotel Ranking Utility
 * Intelligent ranking algorithm that scores and sorts hotel offers based on user preferences
 */

import { HotelOffer } from '@/lib/integrations/amadeus-client';

export interface RankingPreferences {
  // Weight factors (0-1, sum should be 1.0)
  priceWeight?: number;
  ratingWeight?: number;
  distanceWeight?: number;
  amenitiesWeight?: number;
  cancellationWeight?: number;

  // Preferred amenities (higher priority)
  preferredAmenities?: string[];

  // Maximum acceptable distance (km)
  maxDistance?: number;
}

export interface RankedHotel extends HotelOffer {
  score: number;
  scoreBreakdown: {
    priceScore: number;
    ratingScore: number;
    distanceScore: number;
    amenitiesScore: number;
    cancellationScore: number;
    amenityBonus: number;
  };
}

// Default preferences (balanced)
const DEFAULT_PREFERENCES: Required<RankingPreferences> = {
  priceWeight: 0.35, // 35% - Most important
  ratingWeight: 0.25, // 25%
  distanceWeight: 0.15, // 15%
  amenitiesWeight: 0.15, // 15%
  cancellationWeight: 0.10, // 10%
  preferredAmenities: ['WIFI', 'PARKING', 'POOL', 'GYM'],
  maxDistance: 10, // 10 km
};

/**
 * Ranks hotels based on preferences and returns sorted array with scores
 */
export function rankHotels(
  hotels: HotelOffer[],
  preferences: RankingPreferences = {}
): RankedHotel[] {
  if (hotels.length === 0) return [];

  const prefs = { ...DEFAULT_PREFERENCES, ...preferences };

  // Calculate min/max values for normalization
  const prices = hotels.map(h => parseFloat(h.offers[0].price.total));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const distances = hotels
    .map(h => h.hotel.hotelDistance?.distance || 0)
    .filter(d => d > 0);
  const minDistance = distances.length > 0 ? Math.min(...distances) : 0;
  const maxDistance = distances.length > 0 ? Math.max(...distances) : 10;

  // Score each hotel
  const rankedHotels: RankedHotel[] = hotels.map(hotel => {
    const price = parseFloat(hotel.offers[0].price.total);
    const rating = hotel.hotel.rating ? parseFloat(hotel.hotel.rating) : 3.0;
    const distance = hotel.hotel.hotelDistance?.distance || 5;
    const amenitiesCount = hotel.hotel.amenities?.length || 0;
    const hasCancellation = hotel.offers[0].policies.cancellation?.type === 'FULL_REFUND';

    // Calculate individual scores (0-1, higher is better)
    const priceScore = normalizeInverse(price, minPrice, maxPrice);
    const ratingScore = normalizeRating(rating);
    const distanceScore = normalizeInverse(distance, minDistance, maxDistance);
    const amenitiesScore = Math.min(amenitiesCount / 12, 1); // Normalize to 0-1 (12 is max amenities)
    const cancellationScore = hasCancellation ? 1 : 0.5;

    // Calculate amenity bonus for preferred amenities
    const amenityBonus = calculateAmenityBonus(
      hotel.hotel.amenities || [],
      prefs.preferredAmenities
    );

    // Calculate weighted total score
    const score =
      priceScore * prefs.priceWeight +
      ratingScore * prefs.ratingWeight +
      distanceScore * prefs.distanceWeight +
      amenitiesScore * prefs.amenitiesWeight +
      cancellationScore * prefs.cancellationWeight +
      amenityBonus;

    return {
      ...hotel,
      score,
      scoreBreakdown: {
        priceScore,
        ratingScore,
        distanceScore,
        amenitiesScore,
        cancellationScore,
        amenityBonus,
      },
    };
  });

  // Sort by score (descending - higher score is better)
  return rankedHotels.sort((a, b) => b.score - a.score);
}

/**
 * Get quick recommendations based on common preferences
 */
export function getHotelRecommendations(hotels: HotelOffer[]): {
  cheapest: HotelOffer[];
  topRated: HotelOffer[];
  best: RankedHotel[];
  luxury: HotelOffer[];
} {
  return {
    // Cheapest hotels (top 3)
    cheapest: [...hotels]
      .sort((a, b) => parseFloat(a.offers[0].price.total) - parseFloat(b.offers[0].price.total))
      .slice(0, 3),

    // Highest rated hotels (top 3)
    topRated: [...hotels]
      .filter(h => h.hotel.rating)
      .sort((a, b) => parseFloat(b.hotel.rating!) - parseFloat(a.hotel.rating!))
      .slice(0, 3),

    // Best overall (balanced ranking)
    best: rankHotels(hotels, {
      priceWeight: 0.35,
      ratingWeight: 0.25,
      distanceWeight: 0.15,
      amenitiesWeight: 0.15,
      cancellationWeight: 0.10,
    }).slice(0, 3),

    // Luxury hotels (4+ stars with most amenities)
    luxury: [...hotels]
      .filter(h => h.hotel.rating && parseFloat(h.hotel.rating) >= 4.0)
      .sort((a, b) => (b.hotel.amenities?.length || 0) - (a.hotel.amenities?.length || 0))
      .slice(0, 3),
  };
}

// Helper functions

/**
 * Normalize value inversely (lower is better)
 * Returns 0-1 where 1 is best (minimum value)
 */
function normalizeInverse(value: number, min: number, max: number): number {
  if (max === min) return 1;
  return 1 - (value - min) / (max - min);
}

/**
 * Normalize rating (0-5 stars to 0-1)
 */
function normalizeRating(rating: number): number {
  return rating / 5;
}

/**
 * Calculate bonus score for preferred amenities
 */
function calculateAmenityBonus(
  hotelAmenities: string[],
  preferredAmenities: string[]
): number {
  if (preferredAmenities.length === 0) return 0;

  const matchCount = preferredAmenities.filter(pref =>
    hotelAmenities.includes(pref)
  ).length;

  // Return 0-0.1 bonus (up to 10% bonus)
  return (matchCount / preferredAmenities.length) * 0.1;
}

/**
 * Format score breakdown for display
 */
export function formatScoreBreakdown(hotel: RankedHotel): string {
  const b = hotel.scoreBreakdown;
  return `
Overall Score: ${(hotel.score * 100).toFixed(1)}%

Price: ${(b.priceScore * 100).toFixed(0)}%
Rating: ${(b.ratingScore * 100).toFixed(0)}%
Location: ${(b.distanceScore * 100).toFixed(0)}%
Amenities: ${(b.amenitiesScore * 100).toFixed(0)}%
Cancellation: ${(b.cancellationScore * 100).toFixed(0)}%
${b.amenityBonus > 0 ? `Preferred Amenities Bonus: +${(b.amenityBonus * 100).toFixed(0)}%` : ''}
  `.trim();
}
