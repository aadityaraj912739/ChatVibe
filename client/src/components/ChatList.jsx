import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { formatDistanceToNow } from 'date-fns';
import Avatar from './Avatar';

const ChatList = ({ chats, selectedChat, onSelectChat }) => {
  const { user } = useAuth();
  const { isUserOnline } = useSocket();

  const getOtherUser = (chat) => {
    if (chat.isGroupChat) return null;
    return chat.participants.find(p => p._id !== user._id);
  };

  const getChatName = (chat) => {
    if (chat.isGroupChat) {
      return chat.name || 'Group Chat';
    }
    const otherUser = getOtherUser(chat);
    return otherUser?.username || 'Unknown User';
  };

  const getChatUser = (chat) => {
    if (chat.isGroupChat) {
      return { username: chat.name || 'Group', avatar: null };
    }
    return getOtherUser(chat);
  };

  const getLastMessagePreview = (chat) => {
    if (!chat.lastMessage) return 'No messages yet';
    const content = chat.lastMessage.content;
    return content.length > 50 ? content.substring(0, 50) + '...' : content;
  };

  const getUnreadCount = (chat) => {
    // unreadCount is now a plain object, not a Map
    if (!chat.unreadCount || typeof chat.unreadCount !== 'object') return 0;
    return chat.unreadCount[user._id] || 0;
  };

  if (chats.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p className="text-base md:text-lg font-medium">No chats yet</p>
          <p className="text-xs md:text-sm mt-1">Start a new conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
      {chats.map((chat) => {
        const otherUser = getOtherUser(chat);
        const isOnline = otherUser && isUserOnline(otherUser._id);
        const isSelected = selectedChat?._id === chat._id;
        const unreadCount = getUnreadCount(chat);

        return (
          <div
            key={chat._id}
            onClick={() => onSelectChat(chat)}
            className={`p-3 md:p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
              isSelected ? 'bg-primary-50 dark:bg-gray-800 border-l-4 border-l-primary-600' : ''
            }`}
          >
            <div className="flex items-center space-x-2 md:space-x-3">
              <Avatar 
                user={getChatUser(chat)} 
                size="lg" 
                showOnlineBadge={!chat.isGroupChat}
                isOnline={isOnline}
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100 truncate ${unreadCount > 0 ? 'font-bold' : ''}`}>
                    {getChatName(chat)}
                  </p>
                  {chat.lastMessage && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                      {formatDistanceToNow(new Date(chat.lastMessage.createdAt), { addSuffix: true })}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <p className={`text-xs md:text-sm truncate ${unreadCount > 0 ? 'text-gray-900 dark:text-gray-200 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                    {getLastMessagePreview(chat)}
                  </p>
                  {unreadCount > 0 && (
                    <span className="ml-2 bg-primary-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center flex-shrink-0">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;
