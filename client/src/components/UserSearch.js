import React, { useState, useEffect } from 'react';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { userAPI, chatAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import Avatar from './Avatar';

const UserSearch = ({ onClose, onSelectUser }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isUserOnline } = useSocket();

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers();
      } else {
        setUsers([]);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const searchUsers = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getUsers(searchQuery);
      setUsers(response.data);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (user) => {
    try {
      const response = await chatAPI.createChat(user._id);
      onSelectUser(response.data);
      onClose();
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Search Users</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by username or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              Searching...
            </div>
          ) : users.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              {searchQuery ? 'No users found' : 'Start typing to search'}
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleSelectUser(user)}
                  className="flex items-center space-x-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
                >
                  <Avatar 
                    user={user} 
                    size="md" 
                    showOnlineBadge={true}
                    isOnline={isUserOnline(user._id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {user.username}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSearch;
