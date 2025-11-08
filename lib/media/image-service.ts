/**
 * Image Service
 * Fetch high-quality destination photos from Unsplash with Pexels fallback
 */

import { createApi } from 'unsplash-js';
import type { Photo, PhotoSearchOptions, PhotoCollection, DestinationGallery } from './types';

export class ImageService {
  private unsplash: ReturnType<typeof createApi> | null = null;
  private unsplashAccessKey: string;
  private pexelsApiKey: string;
  private cache: Map<string, { data: any; timestamp: number }>;
  private cacheTTL: number = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY || '';
    this.pexelsApiKey = process.env.PEXELS_API_KEY || '';
    this.cache = new Map();

    if (this.unsplashAccessKey) {
      this.unsplash = createApi({
        accessKey: this.unsplashAccessKey,
      });
    } else {
      console.warn('⚠️  Unsplash API key not configured');
    }

    if (!this.pexelsApiKey || this.pexelsApiKey === 'your_pexels_api_key_here') {
      console.warn('⚠️  Pexels API key not configured (fallback disabled)');
    }
  }

  /**
   * Search for destination photos
   * Tries Unsplash first, falls back to Pexels if needed
   */
  async searchPhotos(options: PhotoSearchOptions): Promise<PhotoCollection> {
    const cacheKey = `search:${JSON.stringify(options)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Try Unsplash first
      if (this.unsplash) {
        const result = await this.searchUnsplash(options);
        this.setCache(cacheKey, result);
        return result;
      }
    } catch (error) {
      console.error('Unsplash search failed, trying Pexels fallback:', error);
    }

    // Fallback to Pexels
    try {
      if (this.isPexelsAvailable()) {
        const result = await this.searchPexels(options);
        this.setCache(cacheKey, result);
        return result;
      }
    } catch (error) {
      console.error('Pexels search failed:', error);
    }

    // Return empty result if both fail
    return {
      photos: [],
      total: 0,
      source: 'unsplash',
    };
  }

  /**
   * Get destination photos with hero image
   */
  async getDestinationGallery(
    destination: string,
    count: number = 10
  ): Promise<DestinationGallery> {
    const result = await this.searchPhotos({
      query: `${destination} travel landmark`,
      count: count + 1, // +1 for hero image
      orientation: 'landscape',
    });

    if (result.photos.length === 0) {
      throw new Error(`No photos found for destination: ${destination}`);
    }

    return {
      destination,
      hero: result.photos[0],
      gallery: result.photos.slice(1),
      total: result.total,
    };
  }

  /**
   * Search Unsplash for photos
   */
  private async searchUnsplash(options: PhotoSearchOptions): Promise<PhotoCollection> {
    if (!this.unsplash) {
      throw new Error('Unsplash client not initialized');
    }

    const searchParams: any = {
      query: options.query,
      perPage: options.count || 10,
      orientation: options.orientation || 'landscape',
    };

    if (options.color) {
      searchParams.color = options.color;
    }

    const result = await this.unsplash.search.getPhotos(searchParams);

    if (result.errors) {
      throw new Error(`Unsplash API error: ${result.errors.join(', ')}`);
    }

    const photos: Photo[] =
      result.response?.results.map((photo) => ({
        id: photo.id,
        url: photo.urls.regular,
        thumbnail: photo.urls.small,
        width: photo.width,
        height: photo.height,
        alt: photo.alt_description || photo.description || options.query,
        photographer: photo.user.name,
        photographerUrl: photo.user.links.html,
        source: 'unsplash' as const,
        downloadLocation: photo.links.download_location,
        color: photo.color || undefined,
        blurHash: photo.blur_hash || undefined,
      })) || [];

    return {
      photos,
      total: result.response?.total || 0,
      source: 'unsplash',
    };
  }

  /**
   * Search Pexels for photos (fallback)
   */
  private async searchPexels(options: PhotoSearchOptions): Promise<PhotoCollection> {
    if (!this.isPexelsAvailable()) {
      throw new Error('Pexels API key not configured');
    }

    const url = new URL('https://api.pexels.com/v1/search');
    url.searchParams.set('query', options.query);
    url.searchParams.set('per_page', String(options.count || 10));
    if (options.orientation) {
      url.searchParams.set('orientation', options.orientation);
    }
    if (options.color) {
      url.searchParams.set('color', options.color);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: this.pexelsApiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.statusText}`);
    }

    const data = await response.json();

    const photos: Photo[] = data.photos.map((photo: any) => ({
      id: String(photo.id),
      url: photo.src.large,
      thumbnail: photo.src.medium,
      width: photo.width,
      height: photo.height,
      alt: photo.alt || options.query,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      source: 'pexels' as const,
      color: photo.avg_color,
    }));

    return {
      photos,
      total: data.total_results,
      source: 'pexels',
    };
  }

  /**
   * Track photo download (required by Unsplash API)
   */
  async trackDownload(downloadLocation: string): Promise<void> {
    if (!this.unsplash) {
      return;
    }

    try {
      await this.unsplash.photos.trackDownload({
        downloadLocation,
      });
    } catch (error) {
      console.error('Failed to track download:', error);
    }
  }

  /**
   * Get a random photo for a destination
   */
  async getRandomPhoto(query: string): Promise<Photo | null> {
    const cacheKey = `random:${query}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      if (this.unsplash) {
        const result = await this.unsplash.photos.getRandom({
          query,
          orientation: 'landscape',
        });

        if (result.errors) {
          throw new Error(`Unsplash API error: ${result.errors.join(', ')}`);
        }

        const photo = Array.isArray(result.response) ? result.response[0] : result.response;

        if (!photo) {
          return null;
        }

        const photoData: Photo = {
          id: photo.id,
          url: photo.urls.regular,
          thumbnail: photo.urls.small,
          width: photo.width,
          height: photo.height,
          alt: photo.alt_description || photo.description || query,
          photographer: photo.user.name,
          photographerUrl: photo.user.links.html,
          source: 'unsplash',
          downloadLocation: photo.links.download_location,
          color: photo.color || undefined,
          blurHash: photo.blur_hash || undefined,
        };

        this.setCache(cacheKey, photoData);
        return photoData;
      }
    } catch (error) {
      console.error('Failed to get random photo:', error);
    }

    return null;
  }

  /**
   * Get photo by ID
   */
  async getPhotoById(id: string, source: 'unsplash' | 'pexels' = 'unsplash'): Promise<Photo | null> {
    const cacheKey = `photo:${source}:${id}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      if (source === 'unsplash' && this.unsplash) {
        const result = await this.unsplash.photos.get({ photoId: id });

        if (result.errors) {
          throw new Error(`Unsplash API error: ${result.errors.join(', ')}`);
        }

        const photo = result.response;
        if (!photo) return null;

        const photoData: Photo = {
          id: photo.id,
          url: photo.urls.regular,
          thumbnail: photo.urls.small,
          width: photo.width,
          height: photo.height,
          alt: photo.alt_description || photo.description || '',
          photographer: photo.user.name,
          photographerUrl: photo.user.links.html,
          source: 'unsplash',
          downloadLocation: photo.links.download_location,
          color: photo.color || undefined,
          blurHash: photo.blur_hash || undefined,
        };

        this.setCache(cacheKey, photoData);
        return photoData;
      } else if (source === 'pexels' && this.isPexelsAvailable()) {
        const response = await fetch(`https://api.pexels.com/v1/photos/${id}`, {
          headers: {
            Authorization: this.pexelsApiKey,
          },
        });

        if (!response.ok) {
          throw new Error(`Pexels API error: ${response.statusText}`);
        }

        const photo = await response.json();

        const photoData: Photo = {
          id: String(photo.id),
          url: photo.src.large,
          thumbnail: photo.src.medium,
          width: photo.width,
          height: photo.height,
          alt: photo.alt || '',
          photographer: photo.photographer,
          photographerUrl: photo.photographer_url,
          source: 'pexels',
          color: photo.avg_color,
        };

        this.setCache(cacheKey, photoData);
        return photoData;
      }
    } catch (error) {
      console.error(`Failed to get photo ${id}:`, error);
    }

    return null;
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

  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Check if services are available
   */
  isUnsplashAvailable(): boolean {
    return !!this.unsplash;
  }

  isPexelsAvailable(): boolean {
    return !!this.pexelsApiKey && this.pexelsApiKey !== 'your_pexels_api_key_here';
  }

  isAvailable(): boolean {
    return this.isUnsplashAvailable() || this.isPexelsAvailable();
  }
}
