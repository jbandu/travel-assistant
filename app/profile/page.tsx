/**
 * Profile Dashboard
 * Main profile page with completion tracking and quick access to all sections
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ProfileProgress from '@/components/profile/ProfileProgress';
import Link from 'next/link';

interface ProfileData {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  profile: any;
  completion: number;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      fetchProfile();
    }
  }, [authLoading, user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/profile');

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfileData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchProfile}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profileData) return null;

  const { user: profileUser, profile, completion } = profileData;

  // Profile sections with completion status
  const sections = [
    {
      id: 'personal',
      title: 'Personal Information',
      description: 'Basic details, location, and languages',
      icon: '👤',
      completed: !!profile?.personalInfo,
      href: '/profile/edit?section=personal',
      fields: profile?.personalInfo ? [
        profile.personalInfo.city,
        profile.personalInfo.country,
        profile.personalInfo.occupation
      ].filter(Boolean).length : 0,
      totalFields: 8
    },
    {
      id: 'travel-style',
      title: 'Travel Style',
      description: 'Preferences, budget, and interests',
      icon: '✈️',
      completed: !!profile?.travelStyle,
      href: '/profile/edit?section=travel-style',
      fields: profile?.travelStyle?.interests?.length || 0,
      totalFields: 6
    },
    {
      id: 'dietary',
      title: 'Dietary Preferences',
      description: 'Food restrictions and favorite cuisines',
      icon: '🍽️',
      completed: !!profile?.dietary,
      href: '/profile/edit?section=dietary',
      fields: (profile?.dietary?.favoriteCuisines?.length || 0) + (profile?.dietary?.restrictions?.length || 0),
      totalFields: 4
    },
    {
      id: 'accessibility',
      title: 'Accessibility & Health',
      description: 'Physical limitations and fitness level',
      icon: '♿',
      completed: !!profile?.accessibility,
      href: '/profile/edit?section=accessibility',
      fields: profile?.accessibility?.fitnessLevel ? 1 : 0,
      totalFields: 3
    },
    {
      id: 'travel-docs',
      title: 'Travel Documents',
      description: 'Passport, visas, and loyalty programs',
      icon: '📄',
      completed: !!profile?.travelDocs,
      href: '/profile/edit?section=travel-docs',
      fields: [
        profile?.travelDocs?.passportNumber,
        profile?.travelDocs?.passportCountry
      ].filter(Boolean).length,
      totalFields: 4
    },
    {
      id: 'companions',
      title: 'Travel Companions',
      description: 'Family members and frequent travel partners',
      icon: '👨‍👩‍👧‍👦',
      completed: (profile?.companions?.length || 0) > 0,
      href: '/profile/companions',
      fields: profile?.companions?.length || 0,
      totalFields: 2
    },
    {
      id: 'history',
      title: 'Travel History',
      description: 'Past trips, ratings, and memories',
      icon: '🗺️',
      completed: (profile?.tripMemories?.length || 0) > 0,
      href: '/profile/history',
      fields: profile?.tripMemories?.length || 0,
      totalFields: 3
    },
    {
      id: 'bucket-list',
      title: 'Bucket List',
      description: 'Dream destinations and must-visit places',
      icon: '🌟',
      completed: (profile?.bucketList?.length || 0) > 0,
      href: '/profile/bucket-list',
      fields: profile?.bucketList?.length || 0,
      totalFields: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                My Profile
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {profileUser.firstName || 'Welcome'}! Build your personalized travel profile
              </p>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              ← Back to Dashboard
            </Link>
          </div>

          {/* Profile Progress */}
          <div className="mt-6">
            <ProfileProgress
              completion={completion}
              streak={profile?.updateStreak || 0}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon="🌍"
            label="Countries Visited"
            value={getUniqueCountries(profile?.tripMemories).length}
          />
          <StatCard
            icon="✈️"
            label="Total Trips"
            value={profile?.tripMemories?.length || 0}
          />
          <StatCard
            icon="🌟"
            label="Bucket List Items"
            value={profile?.bucketList?.length || 0}
          />
          <StatCard
            icon="👥"
            label="Travel Companions"
            value={profile?.companions?.length || 0}
          />
        </div>

        {/* Profile Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map(section => (
            <SectionCard key={section.id} {...section} />
          ))}
        </div>

        {/* Motivation Banner */}
        {completion < 100 && (
          <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
            <h3 className="text-xl font-bold mb-2">
              🎯 Complete Your Profile
            </h3>
            <p className="text-blue-100 mb-4">
              The more we know about you, the better recommendations we can provide!
              {completion < 50 && ' You\'re just getting started.'}
              {completion >= 50 && completion < 80 && ' You\'re halfway there!'}
              {completion >= 80 && ' Almost perfect!'}
            </p>
            <div className="flex gap-3">
              <Link
                href="/profile/edit"
                className="px-6 py-2 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
              >
                Complete Now
              </Link>
              <Link
                href="/dashboard"
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors border border-white/30"
              >
                Maybe Later
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        </div>
      </div>
    </div>
  );
}

// Section Card Component
function SectionCard({
  title,
  description,
  icon,
  completed,
  href,
  fields,
  totalFields
}: {
  title: string;
  description: string;
  icon: string;
  completed: boolean;
  href: string;
  fields: number;
  totalFields: number;
}) {
  const progress = totalFields > 0 ? Math.round((fields / totalFields) * 100) : 0;

  return (
    <Link
      href={href}
      className="block bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{icon}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          </div>
        </div>
        {completed ? (
          <span className="text-green-500 text-2xl">✓</span>
        ) : (
          <span className="text-gray-300 dark:text-gray-600 text-2xl">○</span>
        )}
      </div>

      {/* Progress */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>{fields} of {totalFields} completed</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
          {completed ? 'View & Edit →' : 'Get Started →'}
        </span>
      </div>
    </Link>
  );
}

// Helper function to get unique countries
function getUniqueCountries(tripMemories: any[]): string[] {
  if (!tripMemories) return [];

  const countries = new Set<string>();
  tripMemories.forEach(trip => {
    if (trip.destinations && Array.isArray(trip.destinations)) {
      trip.destinations.forEach((dest: any) => {
        if (dest.country) countries.add(dest.country);
      });
    }
  });

  return Array.from(countries);
}
