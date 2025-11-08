/**
 * Trip Memory Card Component
 * Displays a past trip with details, rating, and actions
 */

'use client';

import { useState } from 'react';
import { format } from 'date-fns';

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

interface TripMemoryCardProps {
  tripMemory: TripMemory;
  onEdit: (tripMemory: TripMemory) => void;
  onDelete: (id: string) => void;
}

const TRIP_TYPE_ICONS: Record<string, string> = {
  leisure: '🏖️',
  business: '💼',
  adventure: '🏔️',
  cultural: '🏛️',
  romantic: '💑',
  family: '👨‍👩‍👧‍👦',
  solo: '🧳',
  group: '👥'
};

const RETURN_COLORS: Record<string, string> = {
  yes: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  maybe: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  no: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};

export default function TripMemoryCard({ tripMemory, onEdit, onDelete }: TripMemoryCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const getDuration = () => {
    const start = new Date(tripMemory.startDate);
    const end = new Date(tripMemory.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getBudgetVariance = () => {
    if (!tripMemory.budgetPlanned || !tripMemory.budgetActual) return null;
    const variance = tripMemory.budgetActual - tripMemory.budgetPlanned;
    const percentage = (variance / tripMemory.budgetPlanned) * 100;
    return { amount: variance, percentage };
  };

  const handleDelete = () => {
    onDelete(tripMemory.id);
    setShowDeleteModal(false);
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
        {/* Header with Photo or Gradient */}
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
          {tripMemory.photos && tripMemory.photos.length > 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center text-white text-sm">
              📷 {tripMemory.photos.length} {tripMemory.photos.length === 1 ? 'photo' : 'photos'}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title & Type */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{TRIP_TYPE_ICONS[tripMemory.tripType] || '✈️'}</span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {tripMemory.title}
                </h3>
              </div>
              {tripMemory.destinations && tripMemory.destinations.length > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  📍 {tripMemory.destinations.join(', ')}
                </p>
              )}
            </div>
          </div>

          {/* Date & Duration */}
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
            <span>
              {format(new Date(tripMemory.startDate), 'MMM d, yyyy')} - {format(new Date(tripMemory.endDate), 'MMM d, yyyy')}
            </span>
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
              {getDuration()} {getDuration() === 1 ? 'day' : 'days'}
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`w-5 h-5 ${star <= tripMemory.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {tripMemory.rating}/5
            </span>
          </div>

          {/* Companions & Would Return */}
          <div className="flex flex-wrap gap-2 mb-4">
            {tripMemory.companions && tripMemory.companions.length > 0 && (
              <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                👥 {tripMemory.companions.length} {tripMemory.companions.length === 1 ? 'companion' : 'companions'}
              </span>
            )}
            <span className={`px-3 py-1 text-xs rounded-full ${RETURN_COLORS[tripMemory.wouldReturn] || RETURN_COLORS.maybe}`}>
              {tripMemory.wouldReturn === 'yes' ? '✓ Would return' : tripMemory.wouldReturn === 'no' ? '✗ Would not return' : '? Maybe return'}
            </span>
          </div>

          {/* Budget Info */}
          {(tripMemory.budgetPlanned || tripMemory.budgetActual) && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                {tripMemory.budgetPlanned && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Planned: </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {tripMemory.currency} {tripMemory.budgetPlanned.toLocaleString()}
                    </span>
                  </div>
                )}
                {tripMemory.budgetActual && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Actual: </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {tripMemory.currency} {tripMemory.budgetActual.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
              {getBudgetVariance() && (
                <div className={`mt-1 text-xs ${getBudgetVariance()!.amount > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {getBudgetVariance()!.amount > 0 ? '↑' : '↓'} {Math.abs(getBudgetVariance()!.amount).toLocaleString()} ({Math.abs(getBudgetVariance()!.percentage).toFixed(1)}%)
                </div>
              )}
            </div>
          )}

          {/* Highlights Preview */}
          {tripMemory.highlights && tripMemory.highlights.length > 0 && !showDetails && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <strong>Highlights:</strong>
              </p>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                {tripMemory.highlights.slice(0, 2).map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span className="line-clamp-1">{highlight}</span>
                  </li>
                ))}
                {tripMemory.highlights.length > 2 && (
                  <li className="text-blue-600 dark:text-blue-400 cursor-pointer" onClick={() => setShowDetails(true)}>
                    + {tripMemory.highlights.length - 2} more...
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Expanded Details */}
          {showDetails && (
            <div className="mb-4 space-y-4">
              {tripMemory.highlights && tripMemory.highlights.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    ✨ Highlights
                  </p>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    {tripMemory.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-500">•</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {tripMemory.lessonsLearned && tripMemory.lessonsLearned.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    💡 Lessons Learned
                  </p>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    {tripMemory.lessonsLearned.map((lesson, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-yellow-500">•</span>
                        <span>{lesson}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {tripMemory.notes && (
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    📝 Notes
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {tripMemory.notes}
                  </p>
                </div>
              )}

              <button
                onClick={() => setShowDetails(false)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Show less
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            {!showDetails && (
              <button
                onClick={() => setShowDetails(true)}
                className="flex-1 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                View Details
              </button>
            )}
            <button
              onClick={() => onEdit(tripMemory)}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Delete Trip Memory
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete "{tripMemory.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
