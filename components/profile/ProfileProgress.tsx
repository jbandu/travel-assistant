/**
 * Profile Completion Progress Indicator
 * Visual progress bar with percentage and motivational messaging
 */

'use client';

interface ProfileProgressProps {
  completion: number;
  streak?: number;
  className?: string;
}

export default function ProfileProgress({ completion, streak = 0, className = '' }: ProfileProgressProps) {
  // Determine progress color
  const getProgressColor = () => {
    if (completion >= 80) return 'bg-green-500';
    if (completion >= 50) return 'bg-blue-500';
    if (completion >= 25) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  // Motivational message
  const getMessage = () => {
    if (completion === 100) return '🎉 Profile Complete!';
    if (completion >= 80) return '🌟 Almost there!';
    if (completion >= 50) return '💪 Great progress!';
    if (completion >= 25) return '👍 Good start!';
    return '🚀 Let\'s get started!';
  };

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Profile Completion
          </h3>
          {streak > 0 && (
            <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full font-medium">
              🔥 {streak} day{streak > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <span className="text-sm font-bold text-gray-900 dark:text-white">
          {completion}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`absolute top-0 left-0 h-full ${getProgressColor()} transition-all duration-500 ease-out`}
          style={{ width: `${completion}%` }}
        >
          {/* Animated shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
        </div>
      </div>

      {/* Message */}
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
        {getMessage()}
      </p>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
