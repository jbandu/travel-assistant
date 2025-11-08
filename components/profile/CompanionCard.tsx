/**
 * Companion Card Component
 * Displays travel companion information with relationship indicators
 */

'use client';

import { useState } from 'react';

interface Companion {
  id: string;
  firstName: string;
  lastName: string;
  relationship: string;
  dateOfBirth: string | null;
  travelFrequency: string | null;
  decisionInfluence: number;
  preferences: any;
  dietary: any;
  accessibility: any;
}

interface CompanionCardProps {
  companion: Companion;
  onEdit: (companion: Companion) => void;
  onDelete: (id: string) => void;
}

// Relationship emoji mappings
const RELATIONSHIP_ICONS: Record<string, string> = {
  'spouse': '💑',
  'partner': '💑',
  'child': '👶',
  'parent': '👨',
  'sibling': '👫',
  'friend': '👥',
  'colleague': '💼'
};

// Travel frequency badges
const FREQUENCY_COLORS: Record<string, string> = {
  'regular': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'occasional': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'rare': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
};

export default function CompanionCard({ companion, onEdit, onDelete }: CompanionCardProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const getAge = () => {
    if (!companion.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(companion.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = getAge();
  const icon = RELATIONSHIP_ICONS[companion.relationship.toLowerCase()] || '👤';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow relative">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{icon}</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {companion.firstName} {companion.lastName}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
              {companion.relationship}
              {age && <span className="ml-2">• {age} years old</span>}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(companion)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Edit companion"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => setShowConfirmDelete(true)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Delete companion"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Travel Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Travel Frequency */}
        {companion.travelFrequency && (
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Travel Frequency</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${FREQUENCY_COLORS[companion.travelFrequency] || FREQUENCY_COLORS['occasional']}`}>
              {companion.travelFrequency}
            </span>
          </div>
        )}

        {/* Decision Influence */}
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Decision Influence</p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
              <div
                key={level}
                className={`h-2 w-2 rounded-full ${
                  level <= companion.decisionInfluence
                    ? 'bg-blue-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              ></div>
            ))}
            <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
              {companion.decisionInfluence}/10
            </span>
          </div>
        </div>
      </div>

      {/* Preferences Summary */}
      {(companion.dietary?.restrictions?.length > 0 || companion.dietary?.allergies?.length > 0) && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Dietary Needs</p>
          <div className="flex flex-wrap gap-2">
            {companion.dietary?.restrictions?.map((restriction: string) => (
              <span
                key={restriction}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
              >
                {restriction}
              </span>
            ))}
            {companion.dietary?.allergies?.map((allergy: string) => (
              <span
                key={allergy}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
              >
                ⚠️ {allergy}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-xl border-2 border-red-500 flex items-center justify-center p-6 z-10">
          <div className="text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Delete {companion.firstName}?
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(companion.id);
                  setShowConfirmDelete(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
