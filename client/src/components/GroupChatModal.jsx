import React, { useState, useEffect } from 'react';
import { userAPI, chatAPI } from '../services/api';
import { XMarkIcon, MagnifyingGlassIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import Avatar from './Avatar';

const GroupChatModal = ({ isOpen, onClose, onGroupCreated }) => {
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && searchQuery) {
      searchUsers();
    } else {
      setUsers([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, isOpen]);

  const searchUsers = async () => {
    try {
      const response = await userAPI.getUsers(searchQuery);
      setUsers(response.data);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleSelectUser = (user) => {
    if (selectedUsers.find(u => u._id === user._id)) {
      setSelectedUsers(selectedUsers.filter(u => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    
    if (!groupName.trim()) {
      setError('Group name is required');
      return;
    }

    if (selectedUsers.length < 2) {
      setError('Please select at least 2 users');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userIds = selectedUsers.map(u => u._id);
      const response = await chatAPI.createGroupChat({
        name: groupName,
        users: userIds
      });

      onGroupCreated(response.data);
      handleClose();
    } catch (error) {
      console.error('Error creating group:', error);
      setError(error.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setGroupName('');
    setSearchQuery('');
    setSelectedUsers([]);
    setUsers([]);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Create Group Chat
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleCreateGroup} className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded">
              {error}
            </div>
          )}

          {/* Group Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Group Name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Selected Members ({selectedUsers.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(user => (
                  <span
                    key={user._id}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 
                             text-blue-800 dark:text-blue-200 rounded-full text-sm"
                  >
                    {user.username}
                    <button
                      type="button"
                      onClick={() => handleSelectUser(user)}
                      className="hover:text-blue-900 dark:hover:text-blue-100"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Search Users */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Add Members
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* User List */}
          {searchQuery && (
            <div className="mb-4 max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg">
              {users.length > 0 ? (
                users.map(user => (
                  <div
                    key={user._id}
                    onClick={() => handleSelectUser(user)}
                    className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700
                              ${selectedUsers.find(u => u._id === user._id) ? 'bg-blue-50 dark:bg-blue-900' : ''}`}
                  >
                    <Avatar user={user} size="md" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.username}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                    {selectedUsers.find(u => u._id === user._id) && (
                      <div className="text-blue-600 dark:text-blue-400">
                        <UserPlusIcon className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No users found
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !groupName || selectedUsers.length < 2}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupChatModal;
