/**
 * Map Types - Location and route data structures
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Location extends Coordinates {
  name: string;
  address?: string;
  description?: string;
  type?: 'destination' | 'activity' | 'hotel' | 'restaurant' | 'poi';
}

export interface RouteSegment {
  from: Location;
  to: Location;
  distance: number; // in meters
  duration: number; // in seconds
  mode: 'driving' | 'walking' | 'transit' | 'cycling';
}

export interface Route {
  segments: RouteSegment[];
  totalDistance: number;
  totalDuration: number;
  coordinates: Coordinates[];
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface GeocodingResult {
  name: string;
  coordinates: Coordinates;
  address: string;
  placeType: string[];
  relevance: number;
}

export interface MapStyle {
  style: 'streets' | 'outdoors' | 'light' | 'dark' | 'satellite' | 'satellite-streets';
  url: string;
}
