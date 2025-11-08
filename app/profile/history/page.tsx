/**
 * Trip History Page
 * Timeline of past travel experiences with add/edit capabilities
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import TripMemoryCard from '@/components/profile/TripMemoryCard';
import Link from 'next/link';

interface TripMemory {
  id: string;
  title: string;
  destinations: string[];
  startDate: string;
  endDate: string;
  tripType: string;
  companions: string[];
  rating: number;
  highlights: string[];
  wouldReturn: string;
  lessonsLearned: string[];
  budgetPlanned: number | null;
  budgetActual: number | null;
  currency: string;
  photos: string[];
  notes: string | null;
}

export default function TripHistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const [tripMemories, setTripMemories] = useState<TripMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState<TripMemory | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    destinations: [] as string[],
    destinationInput: '',
    startDate: '',
    endDate: '',
    tripType: 'leisure',
    companions: [] as string[],
    companionInput: '',
    rating: 5,
    highlights: [] as string[],
    highlightInput: '',
    wouldReturn: 'yes',
    lessonsLearned: [] as string[],
    lessonInput: '',
    budgetPlanned: '',
    budgetActual: '',
    currency: 'USD',
    notes: ''
  });

  useEffect(() => {
    if (!authLoading && user) {
      fetchTripMemories();
    }
  }, [authLoading, user]);

  const fetchTripMemories = async () => {
    try {
      const response = await fetch('/api/trip-memories');
      if (response.ok) {
        const data = await response.json();
        setTripMemories(data.tripMemories);
      }
    } catch (error) {
      console.error('Error fetching trip memories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (trip: TripMemory) => {
    setEditingTrip(trip);
    setFormData({
      title: trip.title,
      destinations: trip.destinations || [],
      destinationInput: '',
      startDate: trip.startDate.split('T')[0],
      endDate: trip.endDate.split('T')[0],
      tripType: trip.tripType,
      companions: trip.companions || [],
      companionInput: '',
      rating: trip.rating,
      highlights: trip.highlights || [],
      highlightInput: '',
      wouldReturn: trip.wouldReturn,
      lessonsLearned: trip.lessonsLearned || [],
      lessonInput: '',
      budgetPlanned: trip.budgetPlanned?.toString() || '',
      budgetActual: trip.budgetActual?.toString() || '',
      currency: trip.currency,
      notes: trip.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/trip-memories/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setTripMemories(tripMemories.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error('Error deleting trip memory:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingTrip
        ? `/api/trip-memories/${editingTrip.id}`
        : '/api/trip-memories';

      const response = await fetch(url, {
        method: editingTrip ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          destinations: formData.destinations,
          startDate: formData.startDate,
          endDate: formData.endDate,
          tripType: formData.tripType,
          companions: formData.companions,
          rating: formData.rating,
          highlights: formData.highlights,
          wouldReturn: formData.wouldReturn,
          lessonsLearned: formData.lessonsLearned,
          budgetPlanned: formData.budgetPlanned,
          budgetActual: formData.budgetActual,
          currency: formData.currency,
          photos: [],
          notes: formData.notes
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (editingTrip) {
          setTripMemories(tripMemories.map(t =>
            t.id === editingTrip.id ? data.tripMemory : t
          ));
        } else {
          setTripMemories([data.tripMemory, ...tripMemories]);
        }
        closeModal();
      }
    } catch (error) {
      console.error('Error saving trip memory:', error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTrip(null);
    setFormData({
      title: '',
      destinations: [],
      destinationInput: '',
      startDate: '',
      endDate: '',
      tripType: 'leisure',
      companions: [],
      companionInput: '',
      rating: 5,
      highlights: [],
      highlightInput: '',
      wouldReturn: 'yes',
      lessonsLearned: [],
      lessonInput: '',
      budgetPlanned: '',
      budgetActual: '',
      currency: 'USD',
      notes: ''
    });
  };

  const addArrayItem = (field: 'destinations' | 'companions' | 'highlights' | 'lessonsLearned', inputField: string) => {
    const value = formData[inputField as keyof typeof formData] as string;
    if (value.trim()) {
      setFormData({
        ...formData,
        [field]: [...formData[field], value.trim()],
        [inputField]: ''
      });
    }
  };

  const removeArrayItem = (field: 'destinations' | 'companions' | 'highlights' | 'lessonsLearned', index: number) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index)
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading trip memories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Trip History
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Your travel memories and experiences
              </p>
            </div>
            <Link
              href="/profile"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              ← Back to Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Trip Memory
          </button>
        </div>

        {/* Trip Memories Grid */}
        {tripMemories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✈️</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No trip memories yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start documenting your travel experiences to build your personal travel history
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Trip
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tripMemories.map(trip => (
              <TripMemoryCard
                key={trip.id}
                tripMemory={trip}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full my-8">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingTrip ? 'Edit Trip Memory' : 'Add Trip Memory'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Trip Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Summer in Paris"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Dates & Type */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Trip Type *
                  </label>
                  <select
                    required
                    value={formData.tripType}
                    onChange={(e) => setFormData({ ...formData, tripType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="leisure">Leisure</option>
                    <option value="business">Business</option>
                    <option value="adventure">Adventure</option>
                    <option value="cultural">Cultural</option>
                    <option value="romantic">Romantic</option>
                    <option value="family">Family</option>
                    <option value="solo">Solo</option>
                    <option value="group">Group</option>
                  </select>
                </div>
              </div>

              {/* Destinations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Destinations
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={formData.destinationInput}
                    onChange={(e) => setFormData({ ...formData, destinationInput: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('destinations', 'destinationInput'))}
                    placeholder="Add a destination..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => addArrayItem('destinations', 'destinationInput')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.destinations.map((dest, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                      {dest}
                      <button type="button" onClick={() => removeArrayItem('destinations', idx)} className="hover:text-blue-600">×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Rating & Would Return */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rating: {formData.rating}/5
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-6 h-6 ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Would Return?
                  </label>
                  <select
                    value={formData.wouldReturn}
                    onChange={(e) => setFormData({ ...formData, wouldReturn: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="yes">Yes</option>
                    <option value="maybe">Maybe</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>

              {/* Budget */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Planned Budget
                  </label>
                  <input
                    type="number"
                    value={formData.budgetPlanned}
                    onChange={(e) => setFormData({ ...formData, budgetPlanned: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Actual Budget
                  </label>
                  <input
                    type="number"
                    value={formData.budgetActual}
                    onChange={(e) => setFormData({ ...formData, budgetActual: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="JPY">JPY</option>
                    <option value="AUD">AUD</option>
                    <option value="CAD">CAD</option>
                  </select>
                </div>
              </div>

              {/* Highlights */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Highlights
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={formData.highlightInput}
                    onChange={(e) => setFormData({ ...formData, highlightInput: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('highlights', 'highlightInput'))}
                    placeholder="Add a highlight..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => addArrayItem('highlights', 'highlightInput')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-1">
                  {formData.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <span className="flex-1 text-gray-700 dark:text-gray-300">• {highlight}</span>
                      <button type="button" onClick={() => removeArrayItem('highlights', idx)} className="text-red-600 hover:text-red-700">Remove</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lessons Learned */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Lessons Learned
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={formData.lessonInput}
                    onChange={(e) => setFormData({ ...formData, lessonInput: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('lessonsLearned', 'lessonInput'))}
                    placeholder="Add a lesson..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => addArrayItem('lessonsLearned', 'lessonInput')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-1">
                  {formData.lessonsLearned.map((lesson, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <span className="flex-1 text-gray-700 dark:text-gray-300">• {lesson}</span>
                      <button type="button" onClick={() => removeArrayItem('lessonsLearned', idx)} className="text-red-600 hover:text-red-700">Remove</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  placeholder="Additional notes about this trip..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingTrip ? 'Update' : 'Add'} Trip Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
