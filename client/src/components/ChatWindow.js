import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import Avatar from './Avatar';

const ChatWindow = ({ chat, onChatUpdate, onShowGroupInfo }) => {
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

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
            Welcome to ChatVibe
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
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
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <Avatar 
              user={getChatUser()} 
              size="md" 
              showOnlineBadge={!chat.isGroupChat}
              isOnline={isOnline}
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {getChatName()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {chat.isGroupChat ? `${chat.participants?.length || 0} members` : (isOnline ? 'Online' : 'Offline')}
              </p>
            </div>
          </div>
          {chat.isGroupChat && (
            <button
              onClick={onShowGroupInfo}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Group Info"
            >
              <InformationCircleIcon className="h-6 w-6" />
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
          setMessages(prev => [...prev, message]);
        }}
      />
    </div>
  );
};

export default ChatWindow;
