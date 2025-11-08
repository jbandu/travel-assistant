/**
 * Media Types - Photo and image data structures
 */

export interface Photo {
  id: string;
  url: string;
  thumbnail: string;
  width: number;
  height: number;
  alt?: string;
  photographer: string;
  photographerUrl: string;
  source: 'unsplash' | 'pexels';
  downloadLocation?: string; // For Unsplash download tracking
  color?: string;
  blurHash?: string;
}

export interface PhotoSearchOptions {
  query: string;
  count?: number;
  orientation?: 'landscape' | 'portrait' | 'squarish';
  color?: string;
}

export interface PhotoCollection {
  photos: Photo[];
  total: number;
  source: 'unsplash' | 'pexels' | 'mixed';
}

export interface DestinationGallery {
  destination: string;
  hero: Photo;
  gallery: Photo[];
  total: number;
}
