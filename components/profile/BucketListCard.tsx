/**
 * Bucket List Card Component
 * Pinterest-style card for dream destinations
 */

'use client';

import { useState } from 'react';

interface BucketListItem {
  id: string;
  destination: string;
  country: string;
  region: string | null;
  priority: string;
  timeframe: string | null;
  estimatedBudget: number | null;
  currency: string;
  companions: string[];
  experiences: string[];
  notes: string | null;
  inspiration: string[];
  status: string;
  position: number;
}

interface BucketListCardProps {
  item: BucketListItem;
  onEdit: (item: BucketListItem) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: string) => void;
  onReorder: (id: string, direction: 'up' | 'down') => void;
  isFirst: boolean;
  isLast: boolean;
}

const PRIORITY_COLORS: Record<string, string> = {
  'must-do': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  'someday': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'dream': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
};

const STATUS_COLORS: Record<string, string> = {
  'wishlist': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  'researching': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  'planning': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'booked': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'completed': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300'
};

const TIMEFRAME_ICONS: Record<string, string> = {
  'this-year': '📅',
  '5-years': '🗓️',
  '10-years': '📆',
  'retirement': '🏖️'
};

export default function BucketListCard({ item, onEdit, onDelete, onStatusChange, onReorder, isFirst, isLast }: BucketListCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleDelete = () => {
    onDelete(item.id);
    setShowDeleteModal(false);
  };

  const handleStatusChange = (newStatus: string) => {
    onStatusChange(item.id, newStatus);
  };

  const handleReorder = (direction: 'up' | 'down') => {
    onReorder(item.id, direction);
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-200 group">
        {/* Header with gradient and country flag */}
        <div className="h-40 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>

          {/* Reorder buttons */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleReorder('up')}
              disabled={isFirst}
              className={`p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-md ${isFirst ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              title="Move up"
            >
              <svg className="w-4 h-4 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              onClick={() => handleReorder('down')}
              disabled={isLast}
              className={`p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-md ${isLast ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              title="Move down"
            >
              <svg className="w-4 h-4 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <div className="absolute top-3 right-3 flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${PRIORITY_COLORS[item.priority]}`}>
              {item.priority === 'must-do' ? '🔥 Must Do' : item.priority === 'someday' ? '💭 Someday' : '✨ Dream'}
            </span>
          </div>
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-white text-2xl font-bold drop-shadow-lg">
              {item.destination}
            </h3>
            <p className="text-white text-sm drop-shadow-md">
              📍 {item.country}{item.region ? `, ${item.region}` : ''}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Status & Timeframe */}
          <div className="flex items-center gap-2 mb-4">
            <select
              value={item.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`px-3 py-1 text-xs font-medium rounded-full border-0 cursor-pointer ${STATUS_COLORS[item.status]}`}
            >
              <option value="wishlist">Wishlist</option>
              <option value="researching">Researching</option>
              <option value="planning">Planning</option>
              <option value="booked">Booked</option>
              <option value="completed">Completed</option>
            </select>
            {item.timeframe && (
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                {TIMEFRAME_ICONS[item.timeframe]} {item.timeframe.replace('-', ' ')}
              </span>
            )}
          </div>

          {/* Budget */}
          {item.estimatedBudget && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Estimated Budget</span>
                <span className="text-lg font-bold text-green-700 dark:text-green-400">
                  {item.currency} {item.estimatedBudget.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Experiences Preview */}
          {item.experiences && item.experiences.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                Want to Experience
              </p>
              <div className="flex flex-wrap gap-2">
                {item.experiences.slice(0, showDetails ? undefined : 3).map((exp, idx) => (
                  <span key={idx} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs rounded">
                    {exp}
                  </span>
                ))}
                {!showDetails && item.experiences.length > 3 && (
                  <button
                    onClick={() => setShowDetails(true)}
                    className="px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    +{item.experiences.length - 3} more
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Companions */}
          {item.companions && item.companions.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                👥 Planning to go with: {item.companions.join(', ')}
              </p>
            </div>
          )}

          {/* Expanded Details */}
          {showDetails && (
            <div className="mb-4 space-y-3">
              {item.notes && (
                <div>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wide">
                    Notes
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.notes}
                  </p>
                </div>
              )}

              {item.inspiration && item.inspiration.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wide">
                    Inspiration
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {item.inspiration.map((source, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-purple-500">•</span>
                        <span>{source}</span>
                      </li>
                    ))}
                  </ul>
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
            {!showDetails && item.notes && (
              <button
                onClick={() => setShowDetails(true)}
                className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                View Details
              </button>
            )}
            <button
              onClick={() => onEdit(item)}
              className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Hover overlay for reordering */}
        <div className="absolute inset-0 bg-blue-500 bg-opacity-0 group-hover:bg-opacity-5 transition-all pointer-events-none"></div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Remove from Bucket List
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to remove "{item.destination}" from your bucket list?
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
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
