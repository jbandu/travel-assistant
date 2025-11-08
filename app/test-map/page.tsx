/**
 * Map Test Page - Demo page for TripMap component
 */

'use client';

import { useState } from 'react';
import { TripMap } from '@/components/map';
import type { Location } from '@/lib/maps/types';

// Sample destinations for testing
const sampleDestinations: Record<string, Location[]> = {
  'Europe Trip': [
    {
      name: 'Paris',
      lat: 48.8566,
      lng: 2.3522,
      address: 'Paris, France',
      description: 'City of Light - Eiffel Tower, Louvre, Notre-Dame',
      type: 'destination',
    },
    {
      name: 'Lyon',
      lat: 45.764,
      lng: 4.8357,
      address: 'Lyon, France',
      description: 'Gastronomic capital of France',
      type: 'destination',
    },
    {
      name: 'Geneva',
      lat: 46.2044,
      lng: 6.1432,
      address: 'Geneva, Switzerland',
      description: 'International city with beautiful lake',
      type: 'destination',
    },
    {
      name: 'Milan',
      lat: 45.4642,
      lng: 9.19,
      address: 'Milan, Italy',
      description: 'Fashion capital and Gothic architecture',
      type: 'destination',
    },
  ],
  'Japan Adventure': [
    {
      name: 'Tokyo',
      lat: 35.6762,
      lng: 139.6503,
      address: 'Tokyo, Japan',
      description: 'Modern metropolis with traditional temples',
      type: 'destination',
    },
    {
      name: 'Mount Fuji',
      lat: 35.3606,
      lng: 138.7274,
      address: 'Mount Fuji, Japan',
      description: 'Iconic mountain and UNESCO site',
      type: 'activity',
    },
    {
      name: 'Kyoto',
      lat: 35.0116,
      lng: 135.7681,
      address: 'Kyoto, Japan',
      description: 'Ancient temples and geisha district',
      type: 'destination',
    },
    {
      name: 'Osaka',
      lat: 34.6937,
      lng: 135.5023,
      address: 'Osaka, Japan',
      description: 'Food paradise and vibrant nightlife',
      type: 'destination',
    },
  ],
  'USA Road Trip': [
    {
      name: 'San Francisco',
      lat: 37.7749,
      lng: -122.4194,
      address: 'San Francisco, CA',
      description: 'Golden Gate Bridge and cable cars',
      type: 'destination',
    },
    {
      name: 'Yosemite National Park',
      lat: 37.8651,
      lng: -119.5383,
      address: 'Yosemite, CA',
      description: 'Stunning waterfalls and granite cliffs',
      type: 'activity',
    },
    {
      name: 'Las Vegas',
      lat: 36.1699,
      lng: -115.1398,
      address: 'Las Vegas, NV',
      description: 'Entertainment capital of the world',
      type: 'destination',
    },
    {
      name: 'Grand Canyon',
      lat: 36.1069,
      lng: -112.1129,
      address: 'Grand Canyon, AZ',
      description: 'One of the Seven Natural Wonders',
      type: 'activity',
    },
  ],
};

export default function TestMapPage() {
  const [selectedTrip, setSelectedTrip] = useState<string>('Europe Trip');
  const [showRoute, setShowRoute] = useState(true);
  const [routeMode, setRouteMode] = useState<'driving' | 'walking' | 'cycling'>('driving');
  const [mapStyle, setMapStyle] = useState<'streets' | 'outdoors' | 'light' | 'dark' | 'satellite'>(
    'streets'
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🗺️ Interactive Trip Maps</h1>
          <p className="text-lg text-gray-600">
            Test page for Mapbox integration - visualize destinations and routes
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Map Controls</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Trip Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Trip
              </label>
              <select
                value={selectedTrip}
                onChange={(e) => setSelectedTrip(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.keys(sampleDestinations).map((trip) => (
                  <option key={trip} value={trip}>
                    {trip}
                  </option>
                ))}
              </select>
            </div>

            {/* Map Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Map Style</label>
              <select
                value={mapStyle}
                onChange={(e) => setMapStyle(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="streets">Streets</option>
                <option value="outdoors">Outdoors</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="satellite">Satellite</option>
              </select>
            </div>

            {/* Route Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Route Mode</label>
              <select
                value={routeMode}
                onChange={(e) => setRouteMode(e.target.value as any)}
                disabled={!showRoute}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              >
                <option value="driving">Driving</option>
                <option value="walking">Walking</option>
                <option value="cycling">Cycling</option>
              </select>
            </div>

            {/* Show Route Toggle */}
            <div className="flex items-end">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showRoute}
                  onChange={(e) => setShowRoute(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Show Route</span>
              </label>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {selectedTrip} ({sampleDestinations[selectedTrip].length} destinations)
          </h2>
          <TripMap
            destinations={sampleDestinations[selectedTrip]}
            showRoute={showRoute}
            routeMode={routeMode}
            style={mapStyle}
            height="600px"
            className="shadow-lg"
          />
        </div>

        {/* Destination List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Destinations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sampleDestinations[selectedTrip].map((dest, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{dest.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{dest.description}</p>
                    {dest.address && (
                      <p className="text-xs text-gray-500 mt-1">📍 {dest.address}</p>
                    )}
                  </div>
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded ${
                      dest.type === 'destination'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {dest.type}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Coordinates: {dest.lat.toFixed(4)}, {dest.lng.toFixed(4)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* API Documentation */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">🔌 API Endpoints</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900">GET /api/maps/geocode</h3>
              <p className="text-sm text-gray-600 mt-1">
                Convert addresses to coordinates
              </p>
              <pre className="bg-gray-100 p-2 rounded mt-2 text-xs overflow-x-auto">
                /api/maps/geocode?query=Paris,France
              </pre>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-gray-900">POST /api/maps/route</h3>
              <p className="text-sm text-gray-600 mt-1">
                Calculate routes between multiple points
              </p>
              <pre className="bg-gray-100 p-2 rounded mt-2 text-xs overflow-x-auto">
{`{
  "locations": [
    { "lat": 48.8566, "lng": 2.3522 },
    { "lat": 45.764, "lng": 4.8357 }
  ],
  "mode": "driving"
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Built with Mapbox GL JS • Interactive maps for travel planning</p>
        </div>
      </div>
    </div>
  );
}
