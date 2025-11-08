/**
 * Places Types - Location and place data structures
 */

export interface PlaceLocation {
  lat: number;
  lng: number;
}

export interface PlacePhoto {
  photoReference: string;
  width: number;
  height: number;
  url?: string;
}

export interface PlaceOpeningHours {
  openNow: boolean;
  weekdayText?: string[];
  periods?: Array<{
    open: { day: number; time: string };
    close?: { day: number; time: string };
  }>;
}

export interface PlaceReview {
  author: string;
  rating: number;
  text: string;
  time: number;
  profilePhoto?: string;
}

export interface Place {
  placeId: string;
  name: string;
  address: string;
  location: PlaceLocation;
  rating?: number;
  userRatingsTotal?: number;
  priceLevel?: number;
  types: string[];
  photos?: PlacePhoto[];
  openingHours?: PlaceOpeningHours;
  website?: string;
  phoneNumber?: string;
  reviews?: PlaceReview[];
  businessStatus?: string;
}

export interface PlaceSearchOptions {
  query?: string;
  location?: PlaceLocation;
  radius?: number; // in meters
  type?: PlaceType;
  minRating?: number;
  maxPrice?: number;
  openNow?: boolean;
}

export type PlaceType =
  | 'restaurant'
  | 'cafe'
  | 'bar'
  | 'hotel'
  | 'lodging'
  | 'tourist_attraction'
  | 'museum'
  | 'park'
  | 'shopping_mall'
  | 'airport'
  | 'train_station'
  | 'hospital'
  | 'pharmacy'
  | 'bank'
  | 'atm'
  | 'gas_station'
  | 'parking'
  | 'gym'
  | 'spa';

export interface AutocompleteResult {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
  types: string[];
}

export interface GeocodeResult {
  address: string;
  location: PlaceLocation;
  placeId: string;
  formattedAddress: string;
  addressComponents: Array<{
    longName: string;
    shortName: string;
    types: string[];
  }>;
}

export interface DistanceMatrixResult {
  origin: string;
  destination: string;
  distance: {
    text: string;
    value: number; // in meters
  };
  duration: {
    text: string;
    value: number; // in seconds
  };
  status: string;
}
