/**
 * Flight Ranking Utility
 * Intelligent ranking algorithm that scores and sorts flight offers based on user preferences
 */

import { FlightOffer } from '@/lib/integrations/amadeus-client';

export interface RankingPreferences {
  // Weight factors (0-1, sum should be 1.0)
  priceWeight?: number;
  durationWeight?: number;
  stopsWeight?: number;
  departureTimeWeight?: number;
  availabilityWeight?: number;

  // Preferred departure time range (24-hour format)
  preferredDepartureStart?: number; // e.g., 6 for 6 AM
  preferredDepartureEnd?: number; // e.g., 12 for 12 PM

  // Preferred airlines (higher priority)
  preferredAirlines?: string[];

  // Maximum acceptable stops
  maxStops?: number;
}

export interface RankedFlight extends FlightOffer {
  score: number;
  scoreBreakdown: {
    priceScore: number;
    durationScore: number;
    stopsScore: number;
    departureTimeScore: number;
    availabilityScore: number;
    airlineBonus: number;
  };
}

// Default preferences (balanced)
const DEFAULT_PREFERENCES: Required<RankingPreferences> = {
  priceWeight: 0.35, // 35% - Most important
  durationWeight: 0.25, // 25%
  stopsWeight: 0.20, // 20%
  departureTimeWeight: 0.10, // 10%
  availabilityWeight: 0.10, // 10%
  preferredDepartureStart: 6, // 6 AM
  preferredDepartureEnd: 18, // 6 PM
  preferredAirlines: [],
  maxStops: 99,
};

/**
 * Ranks flights based on preferences and returns sorted array with scores
 */
export function rankFlights(
  flights: FlightOffer[],
  preferences: RankingPreferences = {}
): RankedFlight[] {
  if (flights.length === 0) return [];

  const prefs = { ...DEFAULT_PREFERENCES, ...preferences };

  // Calculate min/max values for normalization
  const prices = flights.map(f => parseFloat(f.price.grandTotal));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const durations = flights.map(f => parseDuration(f.itineraries[0].duration));
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);

  // Score each flight
  const rankedFlights: RankedFlight[] = flights.map(flight => {
    const price = parseFloat(flight.price.grandTotal);
    const duration = parseDuration(flight.itineraries[0].duration);
    const stops = flight.itineraries[0].segments.length - 1;
    const departureHour = getDepartureHour(flight);
    const availability = flight.numberOfBookableSeats;
    const airline = flight.itineraries[0].segments[0].carrierCode;

    // Calculate individual scores (0-1, higher is better)
    const priceScore = normalizeInverse(price, minPrice, maxPrice);
    const durationScore = normalizeInverse(duration, minDuration, maxDuration);
    const stopsScore = calculateStopsScore(stops, prefs.maxStops);
    const departureTimeScore = calculateDepartureTimeScore(
      departureHour,
      prefs.preferredDepartureStart,
      prefs.preferredDepartureEnd
    );
    const availabilityScore = Math.min(availability / 9, 1); // Normalize to 0-1
    const airlineBonus = prefs.preferredAirlines.includes(airline) ? 0.1 : 0;

    // Calculate weighted total score
    const score =
      priceScore * prefs.priceWeight +
      durationScore * prefs.durationWeight +
      stopsScore * prefs.stopsWeight +
      departureTimeScore * prefs.departureTimeWeight +
      availabilityScore * prefs.availabilityWeight +
      airlineBonus;

    return {
      ...flight,
      score,
      scoreBreakdown: {
        priceScore,
        durationScore,
        stopsScore,
        departureTimeScore,
        availabilityScore,
        airlineBonus,
      },
    };
  });

  // Sort by score (descending - higher score is better)
  return rankedFlights.sort((a, b) => b.score - a.score);
}

/**
 * Get quick recommendations based on common preferences
 */
export function getFlightRecommendations(flights: FlightOffer[]): {
  cheapest: FlightOffer[];
  fastest: FlightOffer[];
  best: RankedFlight[];
  nonStop: FlightOffer[];
} {
  return {
    // Cheapest flights (top 3)
    cheapest: [...flights]
      .sort((a, b) => parseFloat(a.price.grandTotal) - parseFloat(b.price.grandTotal))
      .slice(0, 3),

    // Fastest flights (top 3)
    fastest: [...flights]
      .sort((a, b) => parseDuration(a.itineraries[0].duration) - parseDuration(b.itineraries[0].duration))
      .slice(0, 3),

    // Best overall (balanced ranking)
    best: rankFlights(flights, {
      priceWeight: 0.35,
      durationWeight: 0.25,
      stopsWeight: 0.20,
      departureTimeWeight: 0.10,
      availabilityWeight: 0.10,
    }).slice(0, 3),

    // Non-stop flights only
    nonStop: flights.filter(f => f.itineraries[0].segments.length === 1).slice(0, 3),
  };
}

// Helper functions

/**
 * Parse ISO 8601 duration string to minutes
 * Example: "PT5H30M" -> 330
 */
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return 0;

  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;

  return hours * 60 + minutes;
}

/**
 * Get departure hour from flight (0-23)
 */
function getDepartureHour(flight: FlightOffer): number {
  const departureTime = flight.itineraries[0].segments[0].departure.at;
  return new Date(departureTime).getHours();
}

/**
 * Normalize value inversely (lower is better)
 * Returns 0-1 where 1 is best (minimum value)
 */
function normalizeInverse(value: number, min: number, max: number): number {
  if (max === min) return 1;
  return 1 - (value - min) / (max - min);
}

/**
 * Calculate score based on number of stops
 */
function calculateStopsScore(stops: number, maxStops: number): number {
  if (stops > maxStops) return 0; // Exceeds max acceptable stops
  if (stops === 0) return 1; // Non-stop is best
  if (stops === 1) return 0.6; // One stop is okay
  return 0.3; // Multiple stops
}

/**
 * Calculate score based on departure time preference
 */
function calculateDepartureTimeScore(
  hour: number,
  preferredStart: number,
  preferredEnd: number
): number {
  // Perfect if within preferred window
  if (hour >= preferredStart && hour <= preferredEnd) {
    return 1;
  }

  // Calculate distance from preferred window
  let distance: number;
  if (hour < preferredStart) {
    distance = preferredStart - hour;
  } else {
    distance = hour - preferredEnd;
  }

  // Gradually decrease score based on distance (max penalty at 12 hours away)
  return Math.max(0, 1 - distance / 12);
}

/**
 * Format score breakdown for display
 */
export function formatScoreBreakdown(flight: RankedFlight): string {
  const b = flight.scoreBreakdown;
  return `
Overall Score: ${(flight.score * 100).toFixed(1)}%

Price: ${(b.priceScore * 100).toFixed(0)}%
Duration: ${(b.durationScore * 100).toFixed(0)}%
Stops: ${(b.stopsScore * 100).toFixed(0)}%
Departure Time: ${(b.departureTimeScore * 100).toFixed(0)}%
Availability: ${(b.availabilityScore * 100).toFixed(0)}%
${b.airlineBonus > 0 ? `Airline Bonus: +${(b.airlineBonus * 100).toFixed(0)}%` : ''}
  `.trim();
}
