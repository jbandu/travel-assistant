/**
 * Destination Image Component
 * Lazy-loaded image with photo attribution
 */

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { Photo } from '@/lib/media/types';
import { PhotoAttribution } from './photo-attribution';

export interface DestinationImageProps {
  photo: Photo;
  priority?: boolean;
  className?: string;
  fill?: boolean;
  sizes?: string;
  onLoad?: () => void;
}

export default function DestinationImage({
  photo,
  priority = false,
  className = '',
  fill = false,
  sizes,
  onLoad,
}: DestinationImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [trackingDone, setTrackingDone] = useState(false);

  // Track download when image is displayed (Unsplash requirement)
  useEffect(() => {
    if (loaded && !trackingDone && photo.downloadLocation && photo.source === 'unsplash') {
      fetch('/api/images/track-download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          downloadLocation: photo.downloadLocation,
        }),
      }).catch((error) => {
        console.error('Failed to track download:', error);
      });

      setTrackingDone(true);
    }
  }, [loaded, trackingDone, photo.downloadLocation, photo.source]);

  const handleLoad = () => {
    setLoaded(true);
    onLoad?.();
  };

  if (fill) {
    return (
      <div className={`relative ${className}`}>
        <Image
          src={photo.url}
          alt={photo.alt || 'Destination photo'}
          fill
          sizes={sizes}
          priority={priority}
          className={`object-cover transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          style={{
            backgroundColor: photo.color || '#f3f4f6',
          }}
        />
        {loaded && <PhotoAttribution photo={photo} />}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Image
        src={photo.url}
        alt={photo.alt || 'Destination photo'}
        width={photo.width}
        height={photo.height}
        priority={priority}
        sizes={sizes}
        className={`w-full h-auto transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleLoad}
        style={{
          backgroundColor: photo.color || '#f3f4f6',
        }}
      />
      {loaded && <PhotoAttribution photo={photo} />}
    </div>
  );
}
