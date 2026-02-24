import React, { memo } from 'react';
import { getAvatarColor, getInitials, isValidImageUrl } from '../utils/avatarUtils';

const Avatar = memo(({ 
  user, 
  size = 'md', 
  className = '', 
  showOnlineBadge = false, 
  isOnline = false 
}) => {
  if (!user) {
    return null;
  }

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
    '3xl': 'w-24 h-24 text-3xl'
  };

  const badgeSizes = {
    xs: 'w-1.5 h-1.5 border',
    sm: 'w-2 h-2 border',
    md: 'w-3 h-3 border-2',
    lg: 'w-3.5 h-3.5 border-2',
    xl: 'w-4 h-4 border-2',
    '2xl': 'w-5 h-5 border-2',
    '3xl': 'w-6 h-6 border-2'
  };

  const hasValidAvatar = isValidImageUrl(user.avatar);
  const initials = getInitials(user.username || user.name);
  const backgroundColor = getAvatarColor(user.username || user.name);

  return (
    <div className={`relative inline-block ${className}`}>
      {hasValidAvatar ? (
        <img
          src={user.avatar}
          alt={user.username || user.name}
          className={`${sizeClasses[size]} rounded-full object-cover`}
          onError={(e) => {
            // If image fails to load, hide it and show initials instead
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold text-white ${hasValidAvatar ? 'hidden' : ''}`}
        style={{ backgroundColor }}
      >
        {initials}
      </div>

      {showOnlineBadge && (
        <span
          className={`absolute bottom-0 right-0 ${badgeSizes[size]} ${
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          } border-white dark:border-gray-800 rounded-full`}
        ></span>
      )}
    </div>
  );
});

Avatar.displayName = 'Avatar';

export default Avatar;
