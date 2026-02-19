import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { MagnifyingGlassIcon, UserPlusIcon, ArrowRightOnRectangleIcon, SunIcon, MoonIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import ChatList from './ChatList';
import UserSearch from './UserSearch';
import Avatar from './Avatar';
import ProfileModal from './ProfileModal';

const Sidebar = ({ chats, selectedChat, onSelectChat, onNewChat, onCreateGroup }) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [showSearch, setShowSearch] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const getTotalUnreadCount = () => {
    return chats.reduce((total, chat) => {
      const unreadCount = chat.unreadCount?.[user._id] || 0;
      return total + unreadCount;
    }, 0);
  };

  const totalUnread = getTotalUnreadCount();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <div className="w-full sm:w-72 md:w-80 lg:w-96 xl:w-[420px] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-2 sm:p-3 md:p-4 border-b border-gray-200 dark:border-gray-700 bg-primary-600 dark:bg-primary-700 text-white flex-shrink-0">
        <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold">ChatVibe</h1>
            {totalUnread > 0 && (
              <span className="bg-red-500 text-white text-xs sm:text-sm font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full animate-pulse">
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-0.5 sm:space-x-1">
            <button
              onClick={toggleTheme}
              className="p-1 sm:p-1.5 md:p-2 hover:bg-primary-700 dark:hover:bg-primary-800 rounded-lg transition-colors"
              title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {isDarkMode ? (
                <SunIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
              ) : (
                <MoonIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
              )}
            </button>
            <button
              onClick={handleLogout}
              className="p-1 sm:p-1.5 md:p-2 hover:bg-primary-700 dark:hover:bg-primary-800 rounded-lg transition-colors"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button 
            onClick={() => setShowProfile(true)}
            className="border-2 border-white rounded-full hover:border-primary-200 transition-colors cursor-pointer flex-shrink-0"
            title="Edit profile"
          >
            <Avatar user={user} size="md" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate text-sm md:text-base">{user?.username}</p>
            <p className="text-xs md:text-sm text-primary-100 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-2 sm:p-3 md:p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
        <div className="flex space-x-1.5 sm:space-x-2 mb-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="flex-1 flex items-center space-x-1.5 sm:space-x-2 px-2 sm:px-3 md:px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
          >
            <MagnifyingGlassIcon className="h-4 w-4 md:h-5 md:w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            <span className="text-sm md:text-base text-gray-600 dark:text-gray-300 truncate">Search users...</span>
          </button>
          <button
            onClick={() => setShowSearch(true)}
            className="p-1.5 sm:p-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors flex-shrink-0"
            title="New Chat"
          >
            <UserPlusIcon className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </div>
        <button
          onClick={onCreateGroup}
          className="w-full flex items-center justify-center space-x-1.5 sm:space-x-2 px-2 sm:px-3 md:px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800 transition-colors text-xs sm:text-sm md:text-base"
        >
          <UserGroupIcon className="h-4 w-4 md:h-5 md:w-5" />
          <span>Create Group</span>
        </button>
      </div>

      {/* User Search Modal */}
      {showSearch && (
        <UserSearch
          onClose={() => setShowSearch(false)}
          onSelectUser={onNewChat}
        />
      )}

      {/* Profile Modal */}
      {showProfile && (
        <ProfileModal
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
        />
      )}

      {/* Chat List */}
      <ChatList
        chats={chats}
        selectedChat={selectedChat}
        onSelectChat={onSelectChat}
      />
    </div>
  );
};

export default Sidebar;
