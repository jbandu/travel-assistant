/**
 * Map Service - Mapbox API integration
 * Handles geocoding, route calculation, and map utilities
 */

import {
  Coordinates,
  Location,
  Route,
  RouteSegment,
  GeocodingResult,
  MapBounds,
} from './types';

export class MapService {
  private accessToken: string;
  private baseURL = 'https://api.mapbox.com';

  constructor(accessToken?: string) {
    this.accessToken = accessToken || process.env.MAPBOX_ACCESS_TOKEN || '';

    if (!this.accessToken) {
      console.warn('⚠️  Mapbox access token not configured');
    }
  }

  /**
   * Geocode a location (address or city name to coordinates)
   */
  async geocode(query: string): Promise<GeocodingResult[]> {
    if (!this.accessToken) {
      throw new Error('Mapbox access token not configured');
    }

    try {
      const encodedQuery = encodeURIComponent(query);
      const url = `${this.baseURL}/geocoding/v5/mapbox.places/${encodedQuery}.json?access_token=${this.accessToken}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.statusText}`);
      }

      const data = await response.json();

      return data.features.map((feature: any) => ({
        name: feature.text,
        coordinates: {
          lng: feature.center[0],
          lat: feature.center[1],
        },
        address: feature.place_name,
        placeType: feature.place_type,
        relevance: feature.relevance,
      }));
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  }

  /**
   * Get route between two or more points
   */
  async getRoute(
    locations: Coordinates[],
    mode: 'driving' | 'walking' | 'cycling' = 'driving'
  ): Promise<Route> {
    if (!this.accessToken) {
      throw new Error('Mapbox access token not configured');
    }

    if (locations.length < 2) {
      throw new Error('At least 2 locations required for routing');
    }

    try {
      // Format coordinates as "lng,lat;lng,lat;..."
      const coordinatesStr = locations
        .map((loc) => `${loc.lng},${loc.lat}`)
        .join(';');

      const url = `${this.baseURL}/directions/v5/mapbox/${mode}/${coordinatesStr}?access_token=${this.accessToken}&geometries=geojson&overview=full`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Routing failed: ${response.statusText}`);
      }

      const data = await response.json();
      const route = data.routes[0];

      // Parse route segments
      const segments: RouteSegment[] = [];
      for (let i = 0; i < locations.length - 1; i++) {
        segments.push({
          from: {
            lat: locations[i].lat,
            lng: locations[i].lng,
            name: `Stop ${i + 1}`,
          },
          to: {
            lat: locations[i + 1].lat,
            lng: locations[i + 1].lng,
            name: `Stop ${i + 2}`,
          },
          distance: route.legs[i]?.distance || 0,
          duration: route.legs[i]?.duration || 0,
          mode,
        });
      }

      return {
        segments,
        totalDistance: route.distance,
        totalDuration: route.duration,
        coordinates: route.geometry.coordinates.map((coord: number[]) => ({
          lng: coord[0],
          lat: coord[1],
        })),
      };
    } catch (error) {
      console.error('Routing error:', error);
      throw error;
    }
  }

  /**
   * Calculate bounds for a set of locations
   */
  calculateBounds(locations: Coordinates[]): MapBounds {
    if (locations.length === 0) {
      return { north: 0, south: 0, east: 0, west: 0 };
    }

    const lats = locations.map((loc) => loc.lat);
    const lngs = locations.map((loc) => loc.lng);

    return {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs),
    };
  }

  /**
   * Calculate distance between two points using Haversine formula
   * Returns distance in meters
   */
  calculateDistance(from: Coordinates, to: Coordinates): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (from.lat * Math.PI) / 180;
    const φ2 = (to.lat * Math.PI) / 180;
    const Δφ = ((to.lat - from.lat) * Math.PI) / 180;
    const Δλ = ((to.lng - from.lng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Format distance for display
   */
  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  }

  /**
   * Format duration for display
   */
  formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${Math.round(seconds)} sec`;
    }
    if (seconds < 3600) {
      return `${Math.round(seconds / 60)} min`;
    }
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  /**
   * Get center point of multiple locations
   */
  getCenterPoint(locations: Coordinates[]): Coordinates {
    if (locations.length === 0) {
      return { lat: 0, lng: 0 };
    }

    const sum = locations.reduce(
      (acc, loc) => ({
        lat: acc.lat + loc.lat,
        lng: acc.lng + loc.lng,
      }),
      { lat: 0, lng: 0 }
    );

    return {
      lat: sum.lat / locations.length,
      lng: sum.lng / locations.length,
    };
  }

  /**
   * Optimize route order (simple nearest neighbor algorithm)
   */
  optimizeRoute(locations: Location[]): Location[] {
    if (locations.length <= 2) {
      return locations;
    }

    const optimized: Location[] = [locations[0]];
    const remaining = locations.slice(1);

    while (remaining.length > 0) {
      const current = optimized[optimized.length - 1];
      let nearestIndex = 0;
      let shortestDistance = Infinity;

      remaining.forEach((loc, index) => {
        const distance = this.calculateDistance(current, loc);
        if (distance < shortestDistance) {
          shortestDistance = distance;
          nearestIndex = index;
        }
      });

      optimized.push(remaining[nearestIndex]);
      remaining.splice(nearestIndex, 1);
    }

    return optimized;
  }

  /**
   * Check if API key is configured
   */
  isAvailable(): boolean {
    return !!this.accessToken;
  }
}
