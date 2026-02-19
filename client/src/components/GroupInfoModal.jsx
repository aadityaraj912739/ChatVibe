import React, { useState } from 'react';
import { chatAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Avatar from './Avatar';
import {
  XMarkIcon,
  UserMinusIcon,
  UserPlusIcon,
  PencilIcon,
  CheckIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const GroupInfoModal = ({ isOpen, onClose, chat, onChatUpdated }) => {
  const { user } = useAuth();
  const { socketService } = useSocket();
  const [isEditing, setIsEditing] = useState(false);
  const [newGroupName, setNewGroupName] = useState(chat?.name || '');
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchUsers = React.useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await userAPI.getUsers(searchQuery);
      // Filter out users already in the group
      const filtered = response.data.filter(
        u => !chat?.participants?.some(p => p._id === u._id)
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  }, [searchQuery, chat?.participants]);

  React.useEffect(() => {
    if (showAddMembers && searchQuery) {
      const timer = setTimeout(searchUsers, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, showAddMembers, searchUsers]);

  if (!isOpen || !chat) return null;

  const isAdmin = chat.admin?._id === user._id;
  const isGroupChat = chat.isGroupChat;

  const handleRenameGroup = async () => {
    if (!newGroupName.trim() || newGroupName === chat.name) {
      setIsEditing(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await chatAPI.renameGroup(chat._id, newGroupName);
      socketService.emit('groupRenamed', { chatId: chat._id, newName: newGroupName });
      
      const updatedChat = { ...chat, name: newGroupName };
      onChatUpdated(updatedChat);
      setIsEditing(false);
    } catch (error) {
      console.error('Error renaming group:', error);
      setError(error.response?.data?.message || 'Failed to rename group');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (userId) => {
    setLoading(true);
    setError('');

    try {
      const response = await chatAPI.addUserToGroup(chat._id, userId);
      socketService.emit('userAddedToGroup', { 
        chatId: chat._id, 
        userId, 
        addedBy: user._id 
      });
      
      onChatUpdated(response.data);
      setShowAddMembers(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error adding member:', error);
      setError(error.response?.data?.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await chatAPI.removeUserFromGroup(chat._id, userId);
      socketService.emit('userRemovedFromGroup', { 
        chatId: chat._id, 
        userId, 
        removedBy: user._id 
      });
      
      onChatUpdated(response.data);
    } catch (error) {
      console.error('Error removing member:', error);
      setError(error.response?.data?.message || 'Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  const handleMakeAdmin = async (userId) => {
    if (!window.confirm('Are you sure you want to make this user admin?')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await chatAPI.changeGroupAdmin(chat._id, userId);
      socketService.emit('adminChanged', { 
        chatId: chat._id, 
        newAdminId: userId 
      });
      
      onChatUpdated(response.data);
    } catch (error) {
      console.error('Error changing admin:', error);
      setError(error.response?.data?.message || 'Failed to change admin');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm('Are you sure you want to leave this group?')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await chatAPI.leaveGroup(chat._id);
      socketService.emit('userLeftGroup', { chatId: chat._id });
      
      onClose();
      window.location.reload(); // Refresh to update chat list
    } catch (error) {
      console.error('Error leaving group:', error);
      setError(error.response?.data?.message || 'Failed to leave group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-3 sm:px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            {isGroupChat ? 'Group Info' : 'Chat Info'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          {error && (
            <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded text-sm">
              {error}
            </div>
          )}

          {/* Group Name */}
          {isGroupChat && (
            <div className="mb-4 sm:mb-6">
              {isEditing ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={handleRenameGroup}
                    disabled={loading}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <CheckIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setNewGroupName(chat.name);
                    }}
                    className="p-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 
                             rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {chat.name}
                  </h3>
                  {isAdmin && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 
                               dark:hover:text-gray-200"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Members Section */}
          <div>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h4 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                Members ({chat.participants?.length || 0})
              </h4>
              {isAdmin && isGroupChat && (
                <button
                  onClick={() => setShowAddMembers(!showAddMembers)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {showAddMembers ? 'Cancel' : 'Add Members'}
                </button>
              )}
            </div>

            {/* Add Members Section */}
            {showAddMembers && isAdmin && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="relative mb-3">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {searchResults.length > 0 && (
                  <div className="max-h-40 overflow-y-auto">
                    {searchResults.map(searchUser => (
                      <div
                        key={searchUser._id}
                        className="flex items-center justify-between p-2 hover:bg-gray-100 
                                 dark:hover:bg-gray-600 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar user={searchUser} size="sm" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {searchUser.username}
                          </span>
                        </div>
                        <button
                          onClick={() => handleAddMember(searchUser._id)}
                          disabled={loading}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700"
                        >
                          <UserPlusIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Member List */}
            <div className="space-y-2">
              {chat.participants?.map(member => (
                <div
                  key={member._id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar user={member} size="md" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {member.username}
                        {member._id === user._id && ' (You)'}
                      </p>
                      {member._id === chat.admin?._id && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                          <ShieldCheckIcon className="h-3 w-3" />
                          Admin
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Admin Actions */}
                  {isAdmin && isGroupChat && member._id !== user._id && (
                    <div className="flex gap-2">
                      {member._id !== chat.admin?._id && (
                        <>
                          <button
                            onClick={() => handleMakeAdmin(member._id)}
                            disabled={loading}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 
                                     dark:hover:bg-blue-900 rounded"
                            title="Make Admin"
                          >
                            <ShieldCheckIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleRemoveMember(member._id)}
                            disabled={loading}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 
                                     dark:hover:bg-red-900 rounded"
                            title="Remove Member"
                          >
                            <UserMinusIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        {isGroupChat && (
          <div className="border-t dark:border-gray-700 p-4">
            <button
              onClick={handleLeaveGroup}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 
                       bg-red-600 text-white rounded-lg hover:bg-red-700
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              Leave Group
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupInfoModal;
