import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { messageAPI } from '../services/api';
import { format } from 'date-fns';
import Avatar from './Avatar';

const MessageList = ({ chatId, messages, setMessages }) => {
  const { user } = useAuth();
  const { socket, socketService, getTypingUsers } = useSocket();
  const messagesEndRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (chatId) {
      loadMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  useEffect(() => {
    if (socket && chatId) {
      // Listen for new messages
      const handleNewMessage = (message) => {
        if (message.chat === chatId && message.sender) {
          setMessages(prev => {
            // Avoid duplicates
            if (prev.find(m => m._id === message._id)) {
              return prev;
            }
            return [...prev, message];
          });
          
          // Mark as read if not sent by current user
          if (message.sender._id !== user._id) {
            socketService.markAsRead(message._id, chatId);
          }
        }
      };

      socket.on('message', handleNewMessage);

      // Listen for delivery receipts
      socket.on('messageDelivered', ({ messageId, userId }) => {
        setMessages(prev => prev.map(msg => {
          if (msg._id === messageId) {
            return {
              ...msg,
              deliveredTo: [...(msg.deliveredTo || []), { user: userId, deliveredAt: new Date() }]
            };
          }
          return msg;
        }));
      });

      // Listen for read receipts
      socket.on('messageRead', ({ messageId, userId }) => {
        setMessages(prev => prev.map(msg => {
          if (msg._id === messageId) {
            return {
              ...msg,
              readBy: [...(msg.readBy || []), { user: userId, readAt: new Date() }]
            };
          }
          return msg;
        }));
      });

      // Listen for chat read (when all messages are marked as read)
      socket.on('chatRead', ({ chatId: readChatId, userId }) => {
        if (readChatId === chatId && userId !== user._id) {
          setMessages(prev => prev.map(msg => {
            // Only update messages sent by current user that are not already read by this user
            if (msg.sender._id === user._id) {
              const alreadyRead = msg.readBy?.some(r => r.user === userId);
              if (!alreadyRead) {
                return {
                  ...msg,
                  readBy: [...(msg.readBy || []), { user: userId, readAt: new Date() }]
                };
              }
            }
            return msg;
          }));
        }
      });

      return () => {
        socket.off('message', handleNewMessage);
        socket.off('messageDelivered');
        socket.off('messageRead');
        socket.off('chatRead');
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, chatId, user._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const response = await messageAPI.getMessages(chatId);
      setMessages(response.data.messages);
      
      // Mark all messages as read
      socketService.markChatAsRead(chatId);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getMessageStatus = (message) => {
    if (message.sender._id !== user._id) return null;
    
    const isRead = message.readBy && message.readBy.length > 0;
    const isDelivered = message.deliveredTo && message.deliveredTo.length > 0;
    
    return {
      isRead,
      isDelivered,
      status: isRead ? 'read' : isDelivered ? 'delivered' : 'sent'
    };
  };

  const typingUsers = getTypingUsers(chatId);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 bg-gray-50 dark:bg-gray-900">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 px-4 text-center">No messages yet. Start the conversation!</p>
        </div>
      ) : (
        <>
          {messages.filter(message => message && message.sender).map((message) => {
            const isOwnMessage = message.sender._id === user._id;
            const messageStatus = getMessageStatus(message);

            return (
              <div
                key={message._id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-end space-x-2 max-w-[80%] md:max-w-[75%] ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {!isOwnMessage && (
                    <Avatar user={message.sender} size="sm" className="flex-shrink-0" />
                  )}
                  <div className="flex flex-col">
                    {!isOwnMessage && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 px-3">
                        {message.sender.username}
                      </p>
                    )}
                    <div
                      className={`message-bubble inline-block px-3 md:px-4 py-2 rounded-2xl ${
                        isOwnMessage
                          ? 'bg-primary-600 dark:bg-primary-700 text-white rounded-br-none'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none shadow-sm'
                      }`}
                      style={{ maxWidth: 'fit-content' }}
                    >
                      {message.messageType === 'image' && message.imageUrl && (
                        <div className="mb-2">
                          <img 
                            src={message.imageUrl} 
                            alt="Shared content" 
                            className="rounded-lg max-w-xs max-h-64 object-cover cursor-pointer"
                            onClick={() => window.open(message.imageUrl, '_blank')}
                          />
                        </div>
                      )}
                      {message.content && (
                        <p className="whitespace-pre-wrap text-sm md:text-base" style={{ lineHeight: '1.5rem', wordBreak: 'keep-all', overflowWrap: 'break-word', maxWidth: '500px' }}>{message.content}</p>
                      )}
                      <div className="flex items-center justify-end space-x-1 mt-1">
                        <span className={`text-xs ${isOwnMessage ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'}`}>
                          {format(new Date(message.createdAt), 'HH:mm')}
                        </span>
                        {isOwnMessage && messageStatus && (
                          <span className={`text-xs ${messageStatus.status === 'read' ? 'text-blue-400' : 'text-primary-100'}`}>
                            {messageStatus.status === 'sent' ? '✓' : '✓✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="flex justify-start">
              <div className="bg-gray-200 dark:bg-gray-700 px-3 md:px-4 py-2 rounded-2xl">
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                  {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </p>
              </div>
            </div>
          )}
        </>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
