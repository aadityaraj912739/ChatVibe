import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useSocket } from '../context/SocketContext';
import { messageAPI } from '../services/api';

const MessageInput = ({ chatId, onMessageSent }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { socketService } = useSocket();
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Focus input when chat changes
    inputRef.current?.focus();
    // Reset height when chat changes
    if (inputRef.current) {
      inputRef.current.style.height = '44px';
    }
    // Clear image preview when chat changes
    setSelectedImage(null);
    setImagePreview(null);
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
    
    if (message.trim() === '' && !selectedImage) return;

    // If image is selected, upload it
    if (selectedImage) {
      handleImageUpload();
      return;
    }

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

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('chatId', chatId);
      formData.append('caption', message.trim());

      const response = await messageAPI.sendImageMessage(formData);
      
      // Clear inputs
      setMessage('');
      setSelectedImage(null);
      setImagePreview(null);
      
      if (inputRef.current) {
        inputRef.current.style.height = '44px';
      }

      // Play notification sound
      playNotificationSound();
      
      // Note: Don't call onMessageSent here - image message will come through socket
      // This prevents adding undefined to messages array and causing blank screen
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
    <div className="p-2 sm:p-3 md:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {imagePreview && (
        <div className="mb-2 sm:mb-3 relative inline-block">
          <img 
            src={imagePreview} 
            alt="Preview" 
            className="max-h-24 sm:max-h-32 rounded-lg border border-gray-300 dark:border-gray-600"
          />
          <button
            type="button"
            onClick={handleClearImage}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex items-end space-x-1.5 sm:space-x-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 sm:p-2.5 md:p-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-150 flex-shrink-0"
          title="Attach image"
        >
          <PhotoIcon className="h-5 w-5 md:h-6 md:w-6" />
        </button>
        <textarea
          ref={inputRef}
          value={message}
          onChange={handleTyping}
          onKeyDown={handleKeyDown}
          placeholder={selectedImage ? "Add a caption (optional)..." : "Type a message..."}
          rows={1}
          className="flex-1 px-2.5 sm:px-3 md:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none overflow-y-auto transition-all duration-150"
          style={{ minHeight: '40px', maxHeight: '120px', whiteSpace: 'pre-wrap', lineHeight: '1.5rem', wordBreak: 'keep-all', overflowWrap: 'break-word' }}
        />
        <button
          type="submit"
          disabled={(message.trim() === '' && !selectedImage) || uploading}
          className="p-2 sm:p-2.5 md:p-3 bg-primary-600 dark:bg-primary-700 text-white rounded-full hover:bg-primary-700 dark:hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 flex-shrink-0 shadow-sm hover:shadow-md disabled:hover:shadow-sm"
          title={uploading ? 'Uploading...' : selectedImage ? 'Send image' : message.trim() === '' ? 'Type a message to send' : 'Send message (Enter)'}
        >
          {uploading ? (
            <div className="h-5 w-5 md:h-6 md:w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <PaperAirplaneIcon className="h-5 w-5 md:h-6 md:w-6" />
          )}
        </button>
      </form>
      <p className="hidden sm:block text-xs text-gray-400 dark:text-gray-500 mt-1.5 ml-1">
        Press <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Enter</kbd> to send, 
        <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs ml-1">Shift + Enter</kbd> for new line
      </p>
    </div>
  );
};

export default MessageInput;
