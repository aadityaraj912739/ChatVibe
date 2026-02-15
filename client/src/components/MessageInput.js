import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { useSocket } from '../context/SocketContext';

const MessageInput = ({ chatId, onMessageSent }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { socketService } = useSocket();
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Focus input when chat changes
    inputRef.current?.focus();
  }, [chatId]);

  const handleTyping = (e) => {
    setMessage(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      socketService.typing(chatId, true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketService.stopTyping(chatId);
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (message.trim() === '') return;

    // Send message via socket
    socketService.sendMessage({
      chatId,
      content: message.trim()
    });

    // Clear input
    setMessage('');
    
    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      socketService.stopTyping(chatId);
    }

    // Clear timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Play notification sound (optional)
    playNotificationSound();
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(err => console.log('Audio play failed:', err));
    } catch (error) {
      // Silently fail if audio not available
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={handleTyping}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={message.trim() === ''}
          className="p-3 bg-primary-600 dark:bg-primary-700 text-white rounded-full hover:bg-primary-700 dark:hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <PaperAirplaneIcon className="h-6 w-6" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
