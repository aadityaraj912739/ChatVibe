import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import GroupChatModal from '../components/GroupChatModal';
import GroupInfoModal from '../components/GroupInfoModal';
import { chatAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const Chat = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const { socketService, socket } = useSocket();
  const { user } = useAuth();
  const windowFocusedRef = useRef(true);
  const selectedChatRef = useRef(selectedChat);

  // Keep ref in sync with state
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  // Track window focus
  useEffect(() => {
    const handleFocus = () => {
      windowFocusedRef.current = true;
    };
    const handleBlur = () => {
      windowFocusedRef.current = false;
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Notification permission granted');
        }
      });
    }
  }, []);

  useEffect(() => {
    loadChats();
  }, []);

  // Update page title with unread count
  useEffect(() => {
    const totalUnread = chats.reduce((total, chat) => {
      const unreadCount = chat.unreadCount?.[user._id] || 0;
      return total + unreadCount;
    }, 0);

    if (totalUnread > 0) {
      document.title = `(${totalUnread}) ChatVibe`;
    } else {
      document.title = 'ChatVibe';
    }
  }, [chats, user._id]);

  useEffect(() => {
    if (socket) {
      // Join all user's chats when component mounts
      if (chats.length > 0) {
        const chatIds = chats.map(chat => chat._id);
        socketService.joinChats(chatIds);
      }

      // Listen for new messages
      socket.on('message', handleNewMessage);
      
      // Listen for chat updates
      socket.on('chatUpdated', handleChatUpdate);

      // Listen for group updates
      socket.on('groupUpdated', handleGroupUpdate);
      
      // Listen for added to group
      socket.on('addedToGroup', handleAddedToGroup);
      
      // Listen for removed from group
      socket.on('removedFromGroup', handleRemovedFromGroup);

      return () => {
        socket.off('message', handleNewMessage);
        socket.off('chatUpdated', handleChatUpdate);
        socket.off('groupUpdated', handleGroupUpdate);
        socket.off('addedToGroup', handleAddedToGroup);
        socket.off('removedFromGroup', handleRemovedFromGroup);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, chats]);

  const loadChats = async () => {
    try {
      const response = await chatAPI.getChats();
      setChats(response.data);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, chatInfo) => {
    // Don't show notification if:
    // 1. User sent the message
    // 2. Window is focused and chat is selected
    // 3. Notification permission not granted
    if (message.sender._id === user._id) return;
    if (windowFocusedRef.current && selectedChatRef.current?._id === message.chat) return;
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const senderName = message.sender.username || 'Someone';
    const chatName = chatInfo?.isGroupChat 
      ? chatInfo.name 
      : senderName;
    const title = chatInfo?.isGroupChat 
      ? `${senderName} in ${chatName}` 
      : senderName;

    const notification = new Notification(title, {
      body: message.content,
      icon: message.sender.avatar || '/logo192.png',
      tag: message.chat, // Prevent duplicate notifications from same chat
      requireInteraction: false,
      silent: false
    });

    // Play notification sound
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (error) {
      // Ignore audio errors
    }

    // Handle notification click
    notification.onclick = () => {
      window.focus();
      const chat = chats.find(c => c._id === message.chat);
      if (chat) {
        setSelectedChat(chat);
      }
      notification.close();
    };

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);
  };

  const handleNewMessage = (message) => {
    // Find the chat for notification
    const chatInfo = chats.find(c => c._id === message.chat);
    
    // Show browser notification
    if (chatInfo) {
      showNotification(message, chatInfo);
    }

    // Update chats list with new message
    setChats(prevChats => {
      const updatedChats = prevChats.map(chat => {
        if (chat._id === message.chat) {
          // Increment unread count if not the selected chat or window not focused
          const shouldIncrementUnread = 
            message.sender._id !== user._id && 
            (selectedChatRef.current?._id !== message.chat || !windowFocusedRef.current);

          const newUnreadCount = { ...(chat.unreadCount || {}) };
          if (shouldIncrementUnread) {
            newUnreadCount[user._id] = (newUnreadCount[user._id] || 0) + 1;
          }

          return {
            ...chat,
            lastMessage: message,
            updatedAt: new Date(),
            unreadCount: newUnreadCount
          };
        }
        return chat;
      });
      // Sort by most recent
      return updatedChats.sort((a, b) => 
        new Date(b.updatedAt) - new Date(a.updatedAt)
      );
    });
  };

  const handleChatUpdate = ({ chatId, lastMessage, unreadCount }) => {
    setChats(prevChats => {
      const updatedChats = prevChats.map(chat => {
        if (chat._id === chatId) {
          return {
            ...chat,
            lastMessage,
            updatedAt: new Date(),
            unreadCount: unreadCount || chat.unreadCount
          };
        }
        return chat;
      });
      return updatedChats.sort((a, b) => 
        new Date(b.updatedAt) - new Date(a.updatedAt)
      );
    });
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    
    // Reset unread count for this chat
    if (chat && chat.unreadCount && chat.unreadCount[user._id] > 0) {
      setChats(prevChats => 
        prevChats.map(c => {
          if (c._id === chat._id) {
            const newUnreadCount = { ...(c.unreadCount || {}) };
            newUnreadCount[user._id] = 0;
            return { ...c, unreadCount: newUnreadCount };
          }
          return c;
        })
      );
    }
  };

  const handleNewChat = (newChat) => {
    setChats(prevChats => {
      const exists = prevChats.find(chat => chat._id === newChat._id);
      if (exists) {
        return prevChats;
      }
      return [newChat, ...prevChats];
    });
    setSelectedChat(newChat);
    
    // Join the new chat room
    if (socketService) {
      socketService.joinChat(newChat._id);
    }
  };

  const handleGroupUpdate = (data) => {
    const { type, chat, newName, addedUser, removedUser, leftUser, newAdmin } = data;
    
    setChats(prevChats => 
      prevChats.map(c => c._id === chat._id ? chat : c)
    );

    if (selectedChat?._id === chat._id) {
      setSelectedChat(chat);
    }

    // Show notification for group updates
    let notificationText = '';
    if (type === 'USER_ADDED' && addedUser) {
      notificationText = `${addedUser.username} was added to the group`;
    } else if (type === 'USER_REMOVED' && removedUser) {
      notificationText = `${removedUser.username} was removed from the group`;
    } else if (type === 'USER_LEFT' && leftUser) {
      notificationText = `${leftUser.username} left the group`;
    } else if (type === 'GROUP_RENAMED' && newName) {
      notificationText = `Group renamed to "${newName}"`;
    } else if (type === 'ADMIN_CHANGED' && newAdmin) {
      notificationText = `${newAdmin.username} is now an admin`;
    }

    if (notificationText) {
      console.log(notificationText);
    }
  };

  const handleAddedToGroup = (data) => {
    const { chat } = data;
    
    // Add new group to chats list
    setChats(prevChats => {
      const exists = prevChats.find(c => c._id === chat._id);
      if (exists) {
        return prevChats.map(c => c._id === chat._id ? chat : c);
      }
      return [chat, ...prevChats];
    });

    // Join the group room
    if (socketService) {
      socketService.joinChat(chat._id);
    }

    // Show notification
    console.log(`You were added to ${chat.name}`);
  };

  const handleRemovedFromGroup = (data) => {
    const { chatId } = data;
    
    // Remove group from chats list
    setChats(prevChats => prevChats.filter(c => c._id !== chatId));

    // If this was the selected chat, clear selection
    if (selectedChat?._id === chatId) {
      setSelectedChat(null);
    }

    // Leave the room
    if (socketService) {
      socketService.leaveChat(chatId);
    }

    console.log('You were removed from the group');
  };

  const handleGroupCreated = (newGroup) => {
    setChats(prevChats => [newGroup, ...prevChats]);
    setSelectedChat(newGroup);
    setShowGroupModal(false);
    
    // Join the new group room
    if (socketService) {
      socketService.joinChat(newGroup._id);
    }
  };

  const handleChatUpdated = (updatedChat) => {
    setChats(prevChats => 
      prevChats.map(chat => chat._id === updatedChat._id ? updatedChat : chat)
    );
    
    if (selectedChat?._id === updatedChat._id) {
      setSelectedChat(updatedChat);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100 dark:bg-gray-900">
      <Sidebar
        chats={chats}
        selectedChat={selectedChat}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onCreateGroup={() => setShowGroupModal(true)}
      />
      <ChatWindow
        chat={selectedChat}
        onChatUpdate={handleChatUpdate}
        onShowGroupInfo={() => setShowGroupInfo(true)}
      />
      
      {/* Group Chat Creation Modal */}
      <GroupChatModal
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        onGroupCreated={handleGroupCreated}
      />
      
      {/* Group Info Modal */}
      <GroupInfoModal
        isOpen={showGroupInfo}
        onClose={() => setShowGroupInfo(false)}
        chat={selectedChat}
        onChatUpdated={handleChatUpdated}
      />
    </div>
  );
};

export default Chat;
