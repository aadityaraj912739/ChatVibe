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
    // Reset height when chat changes
    if (inputRef.current) {
      inputRef.current.style.height = '44px';
    }
  }, [chatId]);

  useEffect(() => {
    // Auto-resize textarea based on content
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      const scrollHeight = inputRef.current.scrollHeight;
      // Set exact height to match content, max 128px
      inputRef.current.style.height = Math.min(scrollHeight, 128) + 'px';
    }
  }, [message]);

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
    
    // Reset textarea height to minimum
    if (inputRef.current) {
      inputRef.current.style.height = '44px';
    }
    
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

  const handleKeyDown = (e) => {
    // Send message on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
    // Allow Shift+Enter for new line (default textarea behavior)
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
    <div className="p-3 md:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        <textarea
          ref={inputRef}
          value={message}
          onChange={handleTyping}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none overflow-y-auto transition-all duration-150"
          style={{ minHeight: '44px', maxHeight: '128px', whiteSpace: 'pre-wrap', lineHeight: '1.5rem', wordBreak: 'keep-all', overflowWrap: 'break-word' }}
        />
        <button
          type="submit"
          disabled={message.trim() === ''}
          className="p-2.5 md:p-3 bg-primary-600 dark:bg-primary-700 text-white rounded-full hover:bg-primary-700 dark:hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 flex-shrink-0 shadow-sm hover:shadow-md disabled:hover:shadow-sm"
          title={message.trim() === '' ? 'Type a message to send' : 'Send message (Enter)'}
        >
          <PaperAirplaneIcon className="h-5 w-5 md:h-6 md:w-6" />
        </button>
      </form>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 ml-1">
        Press <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Enter</kbd> to send, 
        <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs ml-1">Shift + Enter</kbd> for new line
      </p>
    </div>
  );
};

export default MessageInput;
