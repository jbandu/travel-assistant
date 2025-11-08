/**
 * Google Places Service
 * Comprehensive integration with Google Maps Places API
 * Includes geocoding, place search, details, autocomplete, and distance matrix
 */

import { Client, PlaceInputType } from '@googlemaps/google-maps-services-js';
import type {
  Place,
  PlaceSearchOptions,
  AutocompleteResult,
  GeocodeResult,
  DistanceMatrixResult,
  PlaceLocation,
  PlaceType,
} from './types';

export class GooglePlacesService {
  private client: Client;
  private apiKey: string;
  private cache: Map<string, { data: any; timestamp: number }>;
  private cacheTTL: number = 24 * 60 * 60 * 1000; // 24 hours

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GOOGLE_MAPS_API_KEY || '';
    this.client = new Client({});
    this.cache = new Map();

    if (!this.apiKey || this.apiKey === 'your_google_maps_api_key_here') {
      console.warn('⚠️  Google Maps API key not configured');
    }
  }

  /**
   * Geocode an address to coordinates
   */
  async geocode(address: string): Promise<GeocodeResult | null> {
    if (!this.isAvailable()) {
      throw new Error('Google Maps API key not configured');
    }

    const cacheKey = `geocode:${address}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.geocode({
        params: {
          address,
          key: this.apiKey,
        },
      });

      if (response.data.results.length === 0) {
        return null;
      }

      const result = response.data.results[0];
      const geocodeResult: GeocodeResult = {
        address: result.formatted_address,
        location: {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
        },
        placeId: result.place_id,
        formattedAddress: result.formatted_address,
        addressComponents: result.address_components.map((component) => ({
          longName: component.long_name,
          shortName: component.short_name,
          types: component.types,
        })),
      };

      this.setCache(cacheKey, geocodeResult);
      return geocodeResult;
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(location: PlaceLocation): Promise<GeocodeResult | null> {
    if (!this.isAvailable()) {
      throw new Error('Google Maps API key not configured');
    }

    const cacheKey = `reverse:${location.lat},${location.lng}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.reverseGeocode({
        params: {
          latlng: { lat: location.lat, lng: location.lng },
          key: this.apiKey,
        },
      });

      if (response.data.results.length === 0) {
        return null;
      }

      const result = response.data.results[0];
      const geocodeResult: GeocodeResult = {
        address: result.formatted_address,
        location: {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
        },
        placeId: result.place_id,
        formattedAddress: result.formatted_address,
        addressComponents: result.address_components.map((component) => ({
          longName: component.long_name,
          shortName: component.short_name,
          types: component.types,
        })),
      };

      this.setCache(cacheKey, geocodeResult);
      return geocodeResult;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw error;
    }
  }

  /**
   * Search for places by text query
   */
  async searchPlaces(options: PlaceSearchOptions): Promise<Place[]> {
    if (!this.isAvailable()) {
      throw new Error('Google Maps API key not configured');
    }

    const cacheKey = `search:${JSON.stringify(options)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.textSearch({
        params: {
          query: options.query || '',
          location: options.location,
          radius: options.radius || 5000,
          type: options.type as any,
          key: this.apiKey,
        },
      });

      let results = response.data.results.map((place) => this.mapToPlace(place));

      // Apply filters
      if (options.minRating) {
        results = results.filter((p) => (p.rating || 0) >= options.minRating!);
      }
      if (options.maxPrice) {
        results = results.filter((p) => (p.priceLevel || 0) <= options.maxPrice!);
      }
      if (options.openNow) {
        results = results.filter((p) => p.openingHours?.openNow);
      }

      this.setCache(cacheKey, results);
      return results;
    } catch (error) {
      console.error('Place search error:', error);
      throw error;
    }
  }

  /**
   * Search for nearby places
   */
  async searchNearby(
    location: PlaceLocation,
    type: PlaceType,
    radius: number = 5000
  ): Promise<Place[]> {
    if (!this.isAvailable()) {
      throw new Error('Google Maps API key not configured');
    }

    const cacheKey = `nearby:${location.lat},${location.lng}:${type}:${radius}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.placesNearby({
        params: {
          location: { lat: location.lat, lng: location.lng },
          radius,
          type: type as any,
          key: this.apiKey,
        },
      });

      const results = response.data.results.map((place) => this.mapToPlace(place));

      this.setCache(cacheKey, results);
      return results;
    } catch (error) {
      console.error('Nearby search error:', error);
      throw error;
    }
  }

  /**
   * Get detailed information about a specific place
   */
  async getPlaceDetails(placeId: string): Promise<Place | null> {
    if (!this.isAvailable()) {
      throw new Error('Google Maps API key not configured');
    }

    const cacheKey = `details:${placeId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.placeDetails({
        params: {
          place_id: placeId,
          fields: [
            'name',
            'formatted_address',
            'geometry',
            'rating',
            'user_ratings_total',
            'price_level',
            'types',
            'photos',
            'opening_hours',
            'website',
            'formatted_phone_number',
            'reviews',
            'business_status',
          ],
          key: this.apiKey,
        },
      });

      const place = this.mapToPlace(response.data.result as any);
      this.setCache(cacheKey, place);
      return place;
    } catch (error) {
      console.error('Place details error:', error);
      throw error;
    }
  }

  /**
   * Autocomplete place predictions
   */
  async autocomplete(input: string, location?: PlaceLocation): Promise<AutocompleteResult[]> {
    if (!this.isAvailable()) {
      throw new Error('Google Maps API key not configured');
    }

    if (!input || input.length < 2) {
      return [];
    }

    const cacheKey = `autocomplete:${input}:${location?.lat},${location?.lng}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.placeAutocomplete({
        params: {
          input,
          location: location as any,
          radius: 50000, // 50km
          key: this.apiKey,
        },
      });

      const results: AutocompleteResult[] = response.data.predictions.map((prediction) => ({
        placeId: prediction.place_id,
        description: prediction.description,
        mainText: prediction.structured_formatting.main_text,
        secondaryText: prediction.structured_formatting.secondary_text,
        types: prediction.types,
      }));

      this.setCache(cacheKey, results);
      return results;
    } catch (error) {
      console.error('Autocomplete error:', error);
      throw error;
    }
  }

  /**
   * Calculate distance and duration between locations
   */
  async getDistanceMatrix(
    origins: string[],
    destinations: string[],
    mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'
  ): Promise<DistanceMatrixResult[]> {
    if (!this.isAvailable()) {
      throw new Error('Google Maps API key not configured');
    }

    const cacheKey = `distance:${origins.join(',')}:${destinations.join(',')}:${mode}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.distancematrix({
        params: {
          origins,
          destinations,
          mode: mode as any,
          key: this.apiKey,
        },
      });

      const results: DistanceMatrixResult[] = [];

      response.data.rows.forEach((row, originIndex) => {
        row.elements.forEach((element, destIndex) => {
          if (element.status === 'OK') {
            results.push({
              origin: origins[originIndex],
              destination: destinations[destIndex],
              distance: {
                text: element.distance.text,
                value: element.distance.value,
              },
              duration: {
                text: element.duration.text,
                value: element.duration.value,
              },
              status: element.status,
            });
          }
        });
      });

      this.setCache(cacheKey, results);
      return results;
    } catch (error) {
      console.error('Distance matrix error:', error);
      throw error;
    }
  }

  /**
   * Get photo URL from photo reference
   */
  getPhotoUrl(photoReference: string, maxWidth: number = 400): string {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${this.apiKey}`;
  }

  /**
   * Map Google Places API response to our Place type
   */
  private mapToPlace(place: any): Place {
    return {
      placeId: place.place_id,
      name: place.name,
      address: place.formatted_address || place.vicinity || '',
      location: {
        lat: place.geometry?.location?.lat || 0,
        lng: place.geometry?.location?.lng || 0,
      },
      rating: place.rating,
      userRatingsTotal: place.user_ratings_total,
      priceLevel: place.price_level,
      types: place.types || [],
      photos: place.photos?.map((photo: any) => ({
        photoReference: photo.photo_reference,
        width: photo.width,
        height: photo.height,
        url: this.getPhotoUrl(photo.photo_reference),
      })),
      openingHours: place.opening_hours
        ? {
            openNow: place.opening_hours.open_now,
            weekdayText: place.opening_hours.weekday_text,
          }
        : undefined,
      website: place.website,
      phoneNumber: place.formatted_phone_number,
      reviews: place.reviews?.map((review: any) => ({
        author: review.author_name,
        rating: review.rating,
        text: review.text,
        time: review.time,
        profilePhoto: review.profile_photo_url,
      })),
      businessStatus: place.business_status,
    };
  }

  /**
   * Cache management
   */
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.cacheTTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear cache (for testing or forced refresh)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Check if API is available
   */
  isAvailable(): boolean {
    return !!this.apiKey && this.apiKey !== 'your_google_maps_api_key_here';
  }
}
