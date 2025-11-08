'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Star, DollarSign, Clock, Search, Plus, Heart, ExternalLink } from 'lucide-react';

interface Experience {
  placeId: string;
  name: string;
  address: string;
  location: { lat: number; lng: number };
  rating?: number;
  userRatingsTotal?: number;
  priceLevel?: number;
  types: string[];
  photos?: Array<{ url?: string }>;
  openingHours?: { openNow: boolean };
  website?: string;
  phoneNumber?: string;
}

const experienceTypes = [
  { value: 'restaurant', label: 'Restaurants', icon: '🍽️' },
  { value: 'cafe', label: 'Cafes', icon: '☕' },
  { value: 'bar', label: 'Bars', icon: '🍺' },
  { value: 'tourist_attraction', label: 'Attractions', icon: '🎭' },
  { value: 'museum', label: 'Museums', icon: '🏛️' },
  { value: 'park', label: 'Parks', icon: '🌳' },
  { value: 'shopping_mall', label: 'Shopping', icon: '🛍️' },
  { value: 'spa', label: 'Spas', icon: '💆' },
  { value: 'gym', label: 'Gyms', icon: '💪' },
];

export default function ExperiencesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('restaurant');
  const [location, setLocation] = useState({ lat: '', lng: '' });
  const [city, setCity] = useState('');
  const [results, setResults] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedExperiences, setSavedExperiences] = useState<string[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    // Try to get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude.toString(),
            lng: position.coords.longitude.toString(),
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setResults([]);

    try {
      const response = await fetch('/api/experiences/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: { lat: location.lat, lng: location.lng },
          type: selectedType,
          query: searchQuery || undefined,
          radius: 5000,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to search experiences');
        setLoading(false);
        return;
      }

      setResults(data.results || []);
    } catch (err) {
      setError('An error occurred while searching');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveExperience = async (place: Experience) => {
    setSavingId(place.placeId);

    try {
      const response = await fetch('/api/experiences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experienceType: selectedType,
          name: place.name,
          destination: city || place.address,
          city: city || null,
          country: null,
          date: new Date().toISOString(),
          rating: place.rating ? Math.round(place.rating) : 3,
          review: null,
          photos: place.photos?.slice(0, 3).map(p => ({ url: p.url })) || [],
          companions: [],
          priceLevel: place.priceLevel ? getPriceLevelText(place.priceLevel) : null,
          tags: place.types.slice(0, 5),
        }),
      });

      if (response.ok) {
        setSavedExperiences([...savedExperiences, place.placeId]);
        alert('Experience saved successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to save experience');
      }
    } catch (err) {
      alert('Failed to save experience');
    } finally {
      setSavingId(null);
    }
  };

  const getPriceLevelText = (level: number) => {
    const levels = ['budget', 'moderate', 'expensive', 'luxury'];
    return levels[level - 1] || 'moderate';
  };

  const renderPriceLevel = (level?: number) => {
    if (!level) return null;
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <DollarSign
            key={i}
            className={`w-4 h-4 ${i < level ? 'text-green-600' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Local Experiences</h1>
              <p className="mt-2 text-gray-600">
                Discover restaurants, attractions, and activities near you
              </p>
            </div>
            <Link
              href="/experiences/saved"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Heart className="w-5 h-5" />
              My Saved
            </Link>
          </div>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Location Input */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City (optional)
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g., San Francisco"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="text"
                  value={location.lat}
                  onChange={(e) => setLocation({ ...location, lat: e.target.value })}
                  placeholder="37.7749"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <input
                  type="text"
                  value={location.lng}
                  onChange={(e) => setLocation({ ...location, lng: e.target.value })}
                  placeholder="-122.4194"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Experience Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What are you looking for?
              </label>
              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
                {experienceTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setSelectedType(type.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedType === type.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-xl mb-1">{type.icon}</div>
                      <div className="text-xs">{type.label}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Search Query */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search (optional)
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g., Italian restaurant, rooftop bar"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              {loading ? 'Searching...' : 'Search Experiences'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Found {results.length} experiences
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((place) => (
                <div
                  key={place.placeId}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Image */}
                  {place.photos && place.photos[0]?.url ? (
                    <img
                      src={place.photos[0].url}
                      alt={place.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <MapPin className="w-16 h-16 text-white opacity-50" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 flex-1">
                        {place.name}
                      </h3>
                      {place.openingHours?.openNow && (
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Open
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-3 flex items-start gap-1">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{place.address}</span>
                    </p>

                    <div className="flex items-center gap-4 mb-4">
                      {place.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {place.rating.toFixed(1)}
                          </span>
                          {place.userRatingsTotal && (
                            <span className="text-sm text-gray-500">
                              ({place.userRatingsTotal})
                            </span>
                          )}
                        </div>
                      )}
                      {renderPriceLevel(place.priceLevel)}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSaveExperience(place)}
                        disabled={
                          savingId === place.placeId ||
                          savedExperiences.includes(place.placeId)
                        }
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {savedExperiences.includes(place.placeId) ? (
                          <>
                            <Heart className="w-4 h-4 fill-current" />
                            Saved
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Save
                          </>
                        )}
                      </button>
                      {place.website && (
                        <a
                          href={place.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && results.length === 0 && !error && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No experiences found
            </h3>
            <p className="text-gray-600">
              Enter your location and search to discover local experiences
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
