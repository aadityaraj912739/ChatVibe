import React, { memo } from 'react';

const CircularLoader = memo(({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        {/* Simplified spinner for faster rendering */}
        <div className="inline-block">
          <svg
            className="animate-spin"
            style={{ animationDuration: '0.8s' }}
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="6"
            />
            <path
              d="M32 4C16.536 4 4 16.536 4 32"
              stroke="white"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </svg>
        </div>
        
        {/* Message */}
        <p className="mt-6 text-white text-lg font-medium tracking-wide">
          {message}
        </p>
      </div>
    </div>
  );
});

CircularLoader.displayName = 'CircularLoader';

export default CircularLoader;
