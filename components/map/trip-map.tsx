/**
 * TripMap Component - Interactive Mapbox map for trip visualization
 * Displays destinations, routes, and points of interest
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Location } from '@/lib/maps/types';

export interface TripMapProps {
  destinations: Location[];
  showRoute?: boolean;
  routeMode?: 'driving' | 'walking' | 'cycling';
  style?: 'streets' | 'outdoors' | 'light' | 'dark' | 'satellite';
  height?: string;
  zoom?: number;
  className?: string;
}

export default function TripMap({
  destinations,
  showRoute = true,
  routeMode = 'driving',
  style = 'streets',
  height = '500px',
  zoom = 10,
  className = '',
}: TripMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Map style URLs
  const styleUrls: Record<string, string> = {
    streets: 'mapbox://styles/mapbox/streets-v12',
    outdoors: 'mapbox://styles/mapbox/outdoors-v12',
    light: 'mapbox://styles/mapbox/light-v11',
    dark: 'mapbox://styles/mapbox/dark-v11',
    satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;
    if (map.current) return; // Already initialized

    // Check for access token
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      setError('Mapbox token not configured');
      return;
    }

    mapboxgl.accessToken = token;

    // Calculate center point
    const center =
      destinations.length > 0
        ? {
            lng: destinations.reduce((sum, d) => sum + d.lng, 0) / destinations.length,
            lat: destinations.reduce((sum, d) => sum + d.lat, 0) / destinations.length,
          }
        : { lng: 0, lat: 0 };

    // Initialize map
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: styleUrls[style] || styleUrls.streets,
        center: [center.lng, center.lat],
        zoom: destinations.length === 1 ? zoom : 4,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add fullscreen control
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

      map.current.on('load', () => {
        setMapLoaded(true);
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setError('Failed to load map');
      });
    } catch (err) {
      console.error('Map initialization error:', err);
      setError('Failed to initialize map');
    }

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Add markers when map loads
  useEffect(() => {
    if (!map.current || !mapLoaded || destinations.length === 0) return;

    // Clear existing markers
    const markers: mapboxgl.Marker[] = [];

    // Add markers for each destination
    destinations.forEach((destination, index) => {
      // Create custom marker color based on type
      const markerColor = getMarkerColor(destination.type);

      // Create popup content
      const popupContent = `
        <div class="p-2">
          <h3 class="font-bold text-lg mb-1">${destination.name}</h3>
          ${destination.description ? `<p class="text-sm text-gray-600 mb-1">${destination.description}</p>` : ''}
          ${destination.address ? `<p class="text-xs text-gray-500">${destination.address}</p>` : ''}
          ${destination.type ? `<span class="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">${destination.type}</span>` : ''}
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent);

      const marker = new mapboxgl.Marker({ color: markerColor })
        .setLngLat([destination.lng, destination.lat])
        .setPopup(popup)
        .addTo(map.current!);

      markers.push(marker);
    });

    // Fit map to show all markers
    if (destinations.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      destinations.forEach((dest) => {
        bounds.extend([dest.lng, dest.lat]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }

    // Cleanup markers on unmount
    return () => {
      markers.forEach((marker) => marker.remove());
    };
  }, [mapLoaded, destinations]);

  // Add route when map loads and showRoute is true
  useEffect(() => {
    if (!map.current || !mapLoaded || !showRoute || destinations.length < 2) return;

    const addRoute = async () => {
      try {
        // Prepare coordinates for Mapbox Directions API
        const coordinates = destinations.map((d) => `${d.lng},${d.lat}`).join(';');
        const url = `https://api.mapbox.com/directions/v5/mapbox/${routeMode}/${coordinates}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];

          // Add route layer if it doesn't exist
          if (!map.current!.getSource('route')) {
            map.current!.addSource('route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: route.geometry,
              },
            });

            map.current!.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              layout: {
                'line-join': 'round',
                'line-cap': 'round',
              },
              paint: {
                'line-color': '#3b82f6',
                'line-width': 4,
                'line-opacity': 0.8,
              },
            });
          } else {
            // Update existing route
            const source = map.current!.getSource('route') as mapboxgl.GeoJSONSource;
            source.setData({
              type: 'Feature',
              properties: {},
              geometry: route.geometry,
            });
          }
        }
      } catch (err) {
        console.error('Error adding route:', err);
      }
    };

    addRoute();

    // Cleanup route layer on unmount
    return () => {
      if (map.current && map.current.getLayer('route')) {
        map.current.removeLayer('route');
      }
      if (map.current && map.current.getSource('route')) {
        map.current.removeSource('route');
      }
    };
  }, [mapLoaded, showRoute, destinations, routeMode]);

  // Helper: Get marker color based on location type
  function getMarkerColor(type?: string): string {
    switch (type) {
      case 'destination':
        return '#3b82f6'; // blue
      case 'hotel':
        return '#8b5cf6'; // purple
      case 'restaurant':
        return '#ef4444'; // red
      case 'activity':
        return '#10b981'; // green
      case 'poi':
        return '#f59e0b'; // orange
      default:
        return '#3b82f6'; // default blue
    }
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center p-4">
          <p className="text-red-600 font-semibold mb-2">Map Error</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} style={{ width: '100%', height }} className="rounded-lg" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
}
