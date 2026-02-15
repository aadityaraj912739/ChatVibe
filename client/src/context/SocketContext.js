import React, { createContext, useContext, useEffect, useState } from 'react';
import socketService from '../services/socket';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});

  useEffect(() => {
    if (isAuthenticated && token) {
      const newSocket = socketService.connect(token);
      setSocket(newSocket);

      // Listen for user online/offline events
      newSocket.on('userOnline', (data) => {
        setOnlineUsers((prev) => {
          if (!prev.includes(data.userId)) {
            return [...prev, data.userId];
          }
          return prev;
        });
      });

      newSocket.on('userOffline', (data) => {
        setOnlineUsers((prev) => prev.filter((id) => id !== data.userId));
      });

      // Listen for typing events
      newSocket.on('typing', (data) => {
        setTypingUsers((prev) => ({
          ...prev,
          [data.chatId]: {
            ...(prev[data.chatId] || {}),
            [data.userId]: data.username
          }
        }));
      });

      newSocket.on('stopTyping', (data) => {
        setTypingUsers((prev) => {
          const chatTyping = { ...prev[data.chatId] };
          delete chatTyping[data.userId];
          return {
            ...prev,
            [data.chatId]: chatTyping
          };
        });
      });

      return () => {
        socketService.disconnect();
        setSocket(null);
      };
    }
  }, [isAuthenticated, token]);

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  const getTypingUsers = (chatId) => {
    const chatTyping = typingUsers[chatId] || {};
    return Object.values(chatTyping);
  };

  const value = {
    socket,
    socketService,
    onlineUsers,
    isUserOnline,
    typingUsers,
    getTypingUsers
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
