/**
 * Visual Interest Picker Component
 * Interactive tag cloud interface for selecting travel interests
 */

'use client';

import { useState } from 'react';

interface Interest {
  interest: string;
  intensity: number; // 1-5
  level?: string; // casual/enthusiast/expert
}

interface InterestPickerProps {
  selectedInterests: Interest[];
  onChange: (interests: Interest[]) => void;
  className?: string;
}

// Predefined interest categories with emojis
const INTEREST_OPTIONS = [
  // Nature & Outdoors
  { name: 'beach', emoji: '🏖️', category: 'nature' },
  { name: 'mountains', emoji: '⛰️', category: 'nature' },
  { name: 'hiking', emoji: '🥾', category: 'nature' },
  { name: 'wildlife', emoji: '🦁', category: 'nature' },
  { name: 'camping', emoji: '⛺', category: 'nature' },
  { name: 'skiing', emoji: '⛷️', category: 'nature' },

  // Culture & Arts
  { name: 'culture', emoji: '🏛️', category: 'culture' },
  { name: 'art', emoji: '🎨', category: 'culture' },
  { name: 'museums', emoji: '🖼️', category: 'culture' },
  { name: 'history', emoji: '📜', category: 'culture' },
  { name: 'architecture', emoji: '🏰', category: 'culture' },
  { name: 'photography', emoji: '📸', category: 'culture' },

  // Food & Drink
  { name: 'food', emoji: '🍽️', category: 'food' },
  { name: 'wine', emoji: '🍷', category: 'food' },
  { name: 'coffee', emoji: '☕', category: 'food' },
  { name: 'street-food', emoji: '🌮', category: 'food' },
  { name: 'cooking-classes', emoji: '👨‍🍳', category: 'food' },

  // Activities & Sports
  { name: 'adventure', emoji: '🧗', category: 'adventure' },
  { name: 'scuba-diving', emoji: '🤿', category: 'adventure' },
  { name: 'surfing', emoji: '🏄', category: 'adventure' },
  { name: 'cycling', emoji: '🚴', category: 'adventure' },
  { name: 'backpacking', emoji: '🎒', category: 'adventure' },
  { name: 'water-sports', emoji: '🚣', category: 'adventure' },

  // Entertainment
  { name: 'nightlife', emoji: '🎉', category: 'entertainment' },
  { name: 'shopping', emoji: '🛍️', category: 'entertainment' },
  { name: 'music', emoji: '🎵', category: 'entertainment' },
  { name: 'festivals', emoji: '🎪', category: 'entertainment' },
  { name: 'theater', emoji: '🎭', category: 'entertainment' },

  // Wellness & Relaxation
  { name: 'wellness', emoji: '🧘', category: 'wellness' },
  { name: 'spa', emoji: '💆', category: 'wellness' },
  { name: 'yoga', emoji: '🧘‍♀️', category: 'wellness' },
  { name: 'meditation', emoji: '🕉️', category: 'wellness' },

  // Other
  { name: 'local-experiences', emoji: '🗺️', category: 'other' },
  { name: 'road-trips', emoji: '🚗', category: 'other' },
  { name: 'cruises', emoji: '🚢', category: 'other' },
  { name: 'luxury', emoji: '💎', category: 'other' },
  { name: 'budget-travel', emoji: '💰', category: 'other' },
  { name: 'solo-travel', emoji: '🚶', category: 'other' },
  { name: 'family-friendly', emoji: '👨‍👩‍👧‍👦', category: 'other' },
];

const EXPERTISE_LEVELS = [
  { value: 'casual', label: 'Casual', description: 'Enjoy occasionally' },
  { value: 'enthusiast', label: 'Enthusiast', description: 'Regular activity' },
  { value: 'expert', label: 'Expert', description: 'Deep knowledge' }
];

export default function InterestPicker({ selectedInterests, onChange, className = '' }: InterestPickerProps) {
  const [selectedForEdit, setSelectedForEdit] = useState<string | null>(null);

  // Check if interest is selected
  const isSelected = (interestName: string) => {
    return selectedInterests.some(i => i.interest === interestName);
  };

  // Get interest data
  const getInterest = (interestName: string) => {
    return selectedInterests.find(i => i.interest === interestName);
  };

  // Toggle interest selection
  const toggleInterest = (interestName: string) => {
    if (isSelected(interestName)) {
      // Remove interest
      onChange(selectedInterests.filter(i => i.interest !== interestName));
      setSelectedForEdit(null);
    } else {
      // Add interest with default values
      onChange([...selectedInterests, {
        interest: interestName,
        intensity: 3,
        level: 'casual'
      }]);
    }
  };

  // Update interest intensity
  const updateIntensity = (interestName: string, intensity: number) => {
    onChange(selectedInterests.map(i =>
      i.interest === interestName ? { ...i, intensity } : i
    ));
  };

  // Update interest level
  const updateLevel = (interestName: string, level: string) => {
    onChange(selectedInterests.map(i =>
      i.interest === interestName ? { ...i, level } : i
    ));
  };

  return (
    <div className={className}>
      {/* Category Sections */}
      {['nature', 'culture', 'food', 'adventure', 'entertainment', 'wellness', 'other'].map(category => {
        const categoryInterests = INTEREST_OPTIONS.filter(i => i.category === category);

        return (
          <div key={category} className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 capitalize">
              {category === 'nature' && '🌿 Nature & Outdoors'}
              {category === 'culture' && '🎭 Culture & Arts'}
              {category === 'food' && '🍽️ Food & Drink'}
              {category === 'adventure' && '🏔️ Adventure & Sports'}
              {category === 'entertainment' && '🎪 Entertainment'}
              {category === 'wellness' && '🧘 Wellness'}
              {category === 'other' && '✨ Other'}
            </h3>

            {/* Tag Cloud */}
            <div className="flex flex-wrap gap-2">
              {categoryInterests.map(option => {
                const interest = getInterest(option.name);
                const selected = isSelected(option.name);
                const editing = selectedForEdit === option.name;

                return (
                  <div key={option.name} className="relative">
                    {/* Interest Tag */}
                    <button
                      onClick={() => {
                        if (selected) {
                          setSelectedForEdit(editing ? null : option.name);
                        } else {
                          toggleInterest(option.name);
                        }
                      }}
                      className={`
                        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                        transition-all duration-200 transform hover:scale-105
                        ${selected
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }
                      `}
                    >
                      <span>{option.emoji}</span>
                      <span className="capitalize">{option.name.replace(/-/g, ' ')}</span>
                      {selected && interest && (
                        <span className="ml-1 text-xs opacity-80">
                          {'★'.repeat(interest.intensity)}
                        </span>
                      )}
                      {selected && (
                        <span className="ml-1 text-xs">×</span>
                      )}
                    </button>

                    {/* Edit Popover */}
                    {editing && interest && (
                      <div className="absolute z-10 mt-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 min-w-[280px]">
                        {/* Intensity Slider */}
                        <div className="mb-3">
                          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Intensity
                          </label>
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map(level => (
                              <button
                                key={level}
                                onClick={() => updateIntensity(option.name, level)}
                                className={`
                                  text-xl transition-all
                                  ${interest.intensity >= level
                                    ? 'text-yellow-400 scale-110'
                                    : 'text-gray-300 dark:text-gray-600'
                                  }
                                `}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Expertise Level */}
                        <div className="mb-3">
                          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Expertise Level
                          </label>
                          <div className="space-y-1">
                            {EXPERTISE_LEVELS.map(level => (
                              <button
                                key={level.value}
                                onClick={() => updateLevel(option.name, level.value)}
                                className={`
                                  w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                                  ${interest.level === level.value
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                                  }
                                `}
                              >
                                <div className="font-medium">{level.label}</div>
                                <div className="text-xs opacity-80">{level.description}</div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => {
                            toggleInterest(option.name);
                            setSelectedForEdit(null);
                          }}
                          className="w-full px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        >
                          Remove Interest
                        </button>

                        {/* Close overlay on outside click */}
                        <div
                          className="fixed inset-0 -z-10"
                          onClick={() => setSelectedForEdit(null)}
                        ></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Selected Summary */}
      {selectedInterests.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
            ✓ {selectedInterests.length} interest{selectedInterests.length > 1 ? 's' : ''} selected
          </h4>
          <p className="text-xs text-blue-700 dark:text-blue-400">
            Click on selected interests to adjust intensity and expertise level
          </p>
        </div>
      )}
    </div>
  );
}
