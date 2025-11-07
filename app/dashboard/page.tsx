import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  // Fetch user details
  const user = await prisma.user.findUnique({
    where: { id: currentUser.userId },
    include: { profile: true },
  });

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
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user.email}
              </p>
            </div>
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
            value="0"
            description="Planned trips"
            color="bg-blue-50 dark:bg-blue-900/20"
          />
          <StatCard
            icon="✈️"
            title="Bookings"
            value="0"
            description="Active bookings"
            color="bg-green-50 dark:bg-green-900/20"
          />
          <StatCard
            icon="💬"
            title="Conversations"
            value="0"
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
            disabled
          />
          <FeatureCard
            title="🔍 Search Flights"
            description="Find the best flight deals with intelligent search and ranking"
            action="Search Flights"
            disabled
          />
          <FeatureCard
            title="🏨 Find Hotels"
            description="Discover perfect accommodations matched to your preferences"
            action="Browse Hotels"
            disabled
          />
          <FeatureCard
            title="🎭 Local Experiences"
            description="Get personalized activity and restaurant recommendations"
            action="Explore Activities"
            disabled
          />
          <FeatureCard
            title="💼 My Bookings"
            description="View and manage all your travel bookings in one place"
            action="View Bookings"
            disabled
          />
          <FeatureCard
            title="👤 Profile Settings"
            description="Manage your preferences and personalization settings"
            action="Edit Profile"
            disabled
          />
        </div>

        {/* Coming Soon Banner */}
        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                🚀 Features Coming Soon
              </h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-500">
                <p>
                  We're actively building the AI agents and features. Check back soon for:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Trip Planning Agent with destination recommendations</li>
                  <li>Flight Search with preference-based ranking</li>
                  <li>Hotel matching and booking</li>
                  <li>Experience concierge for activities</li>
                  <li>Real-time support and notifications</li>
                </ul>
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
    <div className={`${color} rounded-xl p-6 border border-gray-200 dark:border-gray-700`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-3xl">{icon}</span>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
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
}: {
  title: string;
  description: string;
  action: string;
  disabled?: boolean;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {description}
      </p>
      <button
        disabled={disabled}
        className={`w-full px-4 py-2 text-sm font-medium rounded-lg transition ${
          disabled
            ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {disabled ? 'Coming Soon' : action}
      </button>
    </div>
  );
}
