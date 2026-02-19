import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { InformationCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import Avatar from './Avatar';

const ChatWindow = ({ chat, onChatUpdate, onShowGroupInfo, onBack }) => {
  const { user } = useAuth();
  const { isUserOnline } = useSocket();
  const [messages, setMessages] = useState([]);

  const getOtherUser = () => {
    if (!chat || chat.isGroupChat) return null;
    return chat.participants.find(p => p._id !== user._id);
  };

  const getChatName = () => {
    if (!chat) return '';
    if (chat.isGroupChat) {
      return chat.name || 'Group Chat';
    }
    const otherUser = getOtherUser();
    return otherUser?.username || 'Unknown User';
  };

  const getChatUser = () => {
    if (!chat) return null;
    if (chat.isGroupChat) {
      return { username: chat.name || 'Group', avatar: null };
    }
    return getOtherUser();
  };

  const getStatusText = () => {
    if (chat.isGroupChat) {
      return `${chat.participants?.length || 0} members`;
    }
    
    if (!otherUser) return 'Offline';
    
    const isOnline = isUserOnline(otherUser._id);
    if (isOnline) {
      return 'Online';
    }
    
    // Show last seen if user is offline
    if (otherUser.lastSeen) {
      try {
        const lastSeenText = formatDistanceToNow(new Date(otherUser.lastSeen), { addSuffix: true });
        return `Offline • Last seen ${lastSeenText}`;
      } catch (error) {
        return 'Offline';
      }
    }
    
    return 'Offline';
  };

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center max-w-md">
          <div className="text-4xl sm:text-5xl md:text-6xl mb-4">💬</div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-700 dark:text-gray-300 mb-2">
            Welcome to ChatVibe
          </h2>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
            Select a chat to start messaging
          </p>
        </div>
      </div>
    );
  }

  const otherUser = getOtherUser();
  const isOnline = otherUser && isUserOnline(otherUser._id);

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
      {/* Chat Header */}
      <div className="p-2 sm:p-3 md:p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-1 min-w-0">
            {/* Back button for mobile and small tablets */}
            {onBack && (
              <button
                onClick={onBack}
                className="sm:hidden p-1.5 sm:p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                title="Back to chats"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
            )}
            <Avatar 
              user={getChatUser()} 
              size="md" 
              showOnlineBadge={!chat.isGroupChat}
              isOnline={isOnline}
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm sm:text-base md:text-lg text-gray-900 dark:text-gray-100 truncate">
                {getChatName()}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {getStatusText()}
              </p>
            </div>
          </div>
          {chat.isGroupChat && (
            <button
              onClick={onShowGroupInfo}
              className="p-1.5 sm:p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
              title="Group Info"
            >
              <InformationCircleIcon className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <MessageList
        chatId={chat._id}
        messages={messages}
        setMessages={setMessages}
      />

      {/* Message Input */}
      <MessageInput
        chatId={chat._id}
        onMessageSent={(message) => {
          // Only add message if it's valid (prevents undefined from causing issues)
          if (message && message._id) {
            setMessages(prev => [...prev, message]);
          }
        }}
      />
    </div>
  );
};

export default ChatWindow;
