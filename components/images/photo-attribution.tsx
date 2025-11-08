/**
 * Photo Attribution Component
 * Required by Unsplash and Pexels to credit photographers
 */

'use client';

import type { Photo } from '@/lib/media/types';

export interface PhotoAttributionProps {
  photo: Photo;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  className?: string;
}

export function PhotoAttribution({
  photo,
  position = 'bottom-right',
  className = '',
}: PhotoAttributionProps) {
  const positionClasses = {
    'bottom-left': 'bottom-2 left-2',
    'bottom-right': 'bottom-2 right-2',
    'top-left': 'top-2 left-2',
    'top-right': 'top-2 right-2',
  };

  const sourceLink =
    photo.source === 'unsplash'
      ? 'https://unsplash.com/?utm_source=travel_assistant&utm_medium=referral'
      : 'https://www.pexels.com';

  const sourceName = photo.source === 'unsplash' ? 'Unsplash' : 'Pexels';

  return (
    <div
      className={`absolute ${positionClasses[position]} ${className}`}
      style={{
        zIndex: 10,
      }}
    >
      <div className="bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded text-xs">
        Photo by{' '}
        <a
          href={photo.photographerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-200 transition-colors"
        >
          {photo.photographer}
        </a>
        {' on '}
        <a
          href={sourceLink}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-200 transition-colors"
        >
          {sourceName}
        </a>
      </div>
    </div>
  );
}
