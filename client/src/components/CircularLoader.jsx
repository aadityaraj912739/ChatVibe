import React, { useState, useEffect } from 'react';

const CircularLoader = ({ message = 'Loading...' }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 95) {
          return 95; // Stop at 95% until actual loading completes
        }
        // Increment progress
        const increment = Math.random() * 15 + 5;
        return Math.min(prevProgress + increment, 95);
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  // Calculate circle properties
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        {/* Circular Progress with high-speed spin */}
        <div className="relative inline-flex items-center justify-center">
          {/* Spinning background circle */}
          <svg
            className="animate-spin"
            style={{ animationDuration: '0.6s' }}
            width="150"
            height="150"
          >
            <circle
              cx="75"
              cy="75"
              r={radius}
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="8"
              fill="none"
              strokeDasharray="20 10"
            />
          </svg>
          
          {/* Progress circle */}
          <svg
            className="absolute top-0 left-0 transform -rotate-90"
            width="150"
            height="150"
          >
            <circle
              cx="75"
              cy="75"
              r={radius}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="75"
              cy="75"
              r={radius}
              stroke="#60A5FA"
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-200 ease-out"
            />
          </svg>
          
          {/* Percentage display in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-4xl font-bold text-white">
              {Math.round(progress)}%
            </div>
          </div>
        </div>

        {/* Loading message */}
        <p className="mt-6 text-lg font-medium text-white">
          {message}
        </p>
      </div>
    </div>
  );
};

export default CircularLoader;
