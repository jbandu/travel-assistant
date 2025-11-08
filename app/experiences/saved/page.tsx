'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Star, Calendar, ArrowLeft, Trash2, Edit, Filter } from 'lucide-react';

interface SavedExperience {
  id: string;
  experienceType: string;
  name: string;
  destination: string;
  city: string | null;
  country: string | null;
  date: string;
  rating: number;
  review: string | null;
  photos: any[];
  companions: any[];
  priceLevel: string | null;
  tags: string[];
  createdAt: string;
}

const experienceTypeIcons: Record<string, string> = {
  restaurant: '🍽️',
  cafe: '☕',
  bar: '🍺',
  tourist_attraction: '🎭',
  museum: '🏛️',
  park: '🌳',
  shopping_mall: '🛍️',
  spa: '💆',
  gym: '💪',
  hotel: '🏨',
  event: '🎉',
  tour: '🚌',
  activity: '🎯',
};

export default function SavedExperiencesPage() {
  const [experiences, setExperiences] = useState<SavedExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchExperiences();
  }, [filterType]);

  const fetchExperiences = async () => {
    setLoading(true);
    setError('');

    try {
      const url = filterType
        ? `/api/experiences?type=${filterType}`
        : '/api/experiences';

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch experiences');
        setLoading(false);
        return;
      }

      setExperiences(data.experiences || []);
    } catch (err) {
      setError('An error occurred while fetching experiences');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experience?')) {
      return;
    }

    setDeletingId(id);

    try {
      const response = await fetch(`/api/experiences/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setExperiences(experiences.filter((exp) => exp.id !== id));
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete experience');
      }
    } catch (err) {
      alert('Failed to delete experience');
    } finally {
      setDeletingId(null);
    }
  };

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const experienceTypes = Array.from(
    new Set(experiences.map((exp) => exp.experienceType))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/experiences"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Search
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                My Saved Experiences
              </h1>
              <p className="mt-2 text-gray-600">
                {experiences.length} experience{experiences.length !== 1 ? 's' : ''} saved
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        {experienceTypes.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-8">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setFilterType('')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterType === ''
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {experienceTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      filterType === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{experienceTypeIcons[type] || '📍'}</span>
                    <span className="capitalize">{type.replace('_', ' ')}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-8">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading experiences...</p>
          </div>
        )}

        {/* Experiences Grid */}
        {!loading && experiences.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiences.map((experience) => (
              <div
                key={experience.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Image or Gradient */}
                {experience.photos && experience.photos.length > 0 ? (
                  <img
                    src={experience.photos[0].url}
                    alt={experience.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                    <span className="text-6xl">
                      {experienceTypeIcons[experience.experienceType] || '📍'}
                    </span>
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">
                      {experience.name}
                    </h3>
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full capitalize">
                      {experience.experienceType.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 flex items-start gap-1">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{experience.destination}</span>
                  </p>

                  <div className="flex items-center gap-2 mb-3">
                    {renderRating(experience.rating)}
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(experience.date).toLocaleDateString()}
                    </span>
                  </div>

                  {experience.review && (
                    <p className="text-sm text-gray-700 mb-3 line-clamp-3 italic">
                      &quot;{experience.review}&quot;
                    </p>
                  )}

                  {experience.tags && experience.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {experience.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {experience.priceLevel && (
                    <p className="text-sm text-gray-600 mb-3 capitalize">
                      💰 {experience.priceLevel}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleDelete(experience.id)}
                      disabled={deletingId === experience.id}
                      className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      {deletingId === experience.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && experiences.length === 0 && !error && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No saved experiences yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start exploring and save your favorite places
            </p>
            <Link
              href="/experiences"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Discover Experiences
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
