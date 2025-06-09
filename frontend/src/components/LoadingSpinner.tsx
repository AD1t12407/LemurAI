import React from 'react';
import { cn } from '../utils/cn';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      <div
        className="absolute inset-0 rounded-full border-2"
        style={{
          borderColor: 'var(--border-primary)',
          boxShadow: `-10px -10px 10px #0a3a70, 0px -10px 10px 0px #126FD6, 10px -10px 10px #3b82f6, 10px 0 10px #60a5fa, 10px 10px 10px 0px #93c5fd, 0 10px 10px 0px #bfdbfe, -10px 10px 10px 0px #dbeafe`,
          animation: 'spin 0.7s linear infinite'
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-gray-300 dark:border-gray-600"
        style={{
          width: '60%',
          height: '60%'
        }}
      />
    </div>
  );
};

// Professional button loading spinner
interface ButtonSpinnerProps {
  className?: string;
}

export const ButtonSpinner: React.FC<ButtonSpinnerProps> = ({ className }) => {
  return (
    <div className={cn('relative w-4 h-4', className)}>
      <div
        className="absolute inset-0 rounded-full border border-white/30"
        style={{
          boxShadow: `-4px -4px 4px rgba(30, 58, 138, 0.3), 0px -4px 4px 0px rgba(37, 99, 235, 0.3), 4px -4px 4px rgba(59, 130, 246, 0.3), 4px 0 4px rgba(96, 165, 250, 0.3), 4px 4px 4px 0px rgba(147, 197, 253, 0.3), 0 4px 4px 0px rgba(191, 219, 254, 0.3), -4px 4px 4px 0px rgba(219, 234, 254, 0.3)`,
          animation: 'spin 0.7s linear infinite'
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30"
        style={{
          width: '50%',
          height: '50%'
        }}
      />
    </div>
  );
};

// Page loading component
interface PageLoadingProps {
  message?: string;
}

export const PageLoading: React.FC<PageLoadingProps> = ({
  message = 'Loading...'
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <LoadingSpinner size="xl" />
      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
        {message}
      </p>
    </div>
  );
};

// Inline loading for cards and components
interface InlineLoadingProps {
  lines?: number;
  className?: string;
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({
  lines = 3,
  className
}) => {
  return (
    <div className={cn('animate-pulse space-y-3', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'h-4 rounded-lg',
            'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700',
            index === lines - 1 ? 'w-2/3' : 'w-full'
          )}
          style={{
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite'
          }}
        />
      ))}
    </div>
  );
};

// Card loading skeleton
export const CardLoading: React.FC = () => {
  return (
    <div className="card animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg w-3/4" />
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg w-1/2" />
        </div>
        <div className="w-16 h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full" />
      </div>

      <div className="space-y-3 mb-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-4 h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded" />
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg flex-1" />
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg flex-1" />
          <div className="h-8 w-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

// Add shimmer animation to CSS
const shimmerStyles = `
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = shimmerStyles;
  document.head.appendChild(styleSheet);
}
