import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  // Fetch user details and stats
  const [user, tripCount, bookingCount, conversationCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: currentUser.userId },
      include: { profile: true },
    }),
    prisma.trip.count({
      where: { userId: currentUser.userId },
    }),
    prisma.booking.count({
      where: { userId: currentUser.userId },
    }),
    prisma.conversation.count({
      where: { userId: currentUser.userId },
    }),
  ]);

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Travel Assistant
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Multi-Agent Platform
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <a
              href="/profile"
              className="text-right hover:opacity-80 transition-opacity cursor-pointer"
              title="Go to Profile"
            >
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user.email}
              </p>
            </a>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {user.firstName}! 👋
          </h2>
          <p className="text-blue-100 text-lg">
            Your AI-powered travel platform is ready to help you plan amazing trips.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon="📊"
            title="Total Trips"
            value={tripCount.toString()}
            description="Planned trips"
            color="bg-blue-50 dark:bg-blue-900/20"
          />
          <StatCard
            icon="✈️"
            title="Bookings"
            value={bookingCount.toString()}
            description="Active bookings"
            color="bg-green-50 dark:bg-green-900/20"
          />
          <StatCard
            icon="💬"
            title="Conversations"
            value={conversationCount.toString()}
            description="AI chat sessions"
            color="bg-purple-50 dark:bg-purple-900/20"
          />
          <StatCard
            icon="⭐"
            title="Favorites"
            value="0"
            description="Saved destinations"
            color="bg-amber-50 dark:bg-amber-900/20"
          />
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            title="🗺️ Plan Trip"
            description="Start planning your next adventure with AI-powered recommendations"
            action="Start Planning"
            href="/trips/plan"
          />
          <FeatureCard
            title="📋 My Trips"
            description="View and manage all your planned trips and itineraries"
            action="View Trips"
            href="/trips"
          />
          <FeatureCard
            title="🔍 Search Flights"
            description="Find the best flight deals with intelligent search and ranking"
            action="Search Flights"
            href="/flights/search"
          />
          <FeatureCard
            title="🏨 Find Hotels"
            description="Discover perfect accommodations matched to your preferences"
            action="Browse Hotels"
            href="/hotels/search"
          />
          <FeatureCard
            title="🎭 Local Experiences"
            description="Discover restaurants, attractions, and activities near you"
            action="Explore Activities"
            href="/experiences"
          />
          <FeatureCard
            title="👤 Profile Settings"
            description="Manage your preferences and personalization settings"
            action="Edit Profile"
            href="/profile"
          />
        </div>

        {/* Quick Actions Banner */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-green-600 dark:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-400">
                ✨ New Features Now Live!
              </h3>
              <div className="mt-2 text-sm text-green-700 dark:text-green-500">
                <p className="mb-3">
                  Plan your perfect trip with AI-powered recommendations, search for flights, find the best hotel deals, and discover local experiences - all in one place!
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="/trips/plan"
                    className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Plan Trip
                  </a>
                  <a
                    href="/flights/search"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search Flights
                  </a>
                  <a
                    href="/hotels/search"
                    className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Find Hotels
                  </a>
                  <a
                    href="/experiences"
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Local Experiences
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon,
  title,
  value,
  description,
  color,
}: {
  icon: string;
  title: string;
  value: string;
  description: string;
  color: string;
}) {
  return (
    <div className={`${color} rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-3xl">{icon}</span>
      </div>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
        {title}
      </p>
      <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
        {value}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </div>
  );
}

// Feature Card Component
function FeatureCard({
  title,
  description,
  action,
  disabled = false,
  href,
}: {
  title: string;
  description: string;
  action: string;
  disabled?: boolean;
  href?: string;
}) {
  const cardClass = `bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition ${
    disabled
      ? 'opacity-75'
      : 'hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600'
  }`;

  const buttonClass = `w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
    disabled
      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed border border-gray-300 dark:border-gray-600'
      : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm hover:shadow-md'
  }`;

  return (
    <div className={cardClass}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 min-h-[40px]">
        {description}
      </p>
      {disabled || !href ? (
        <button disabled={disabled} className={buttonClass}>
          {disabled ? '🔒 Coming Soon' : action}
        </button>
      ) : (
        <a href={href} className={`block text-center ${buttonClass}`}>
          {action}
        </a>
      )}
    </div>
  );
}
