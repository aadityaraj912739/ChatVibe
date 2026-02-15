import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket.id);
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  // Chat room methods
  joinChats(chatIds) {
    if (this.socket) {
      this.socket.emit('joinChats', chatIds);
    }
  }

  joinChat(chatId) {
    if (this.socket) {
      this.socket.emit('joinChat', chatId);
    }
  }

  leaveChat(chatId) {
    if (this.socket) {
      this.socket.emit('leaveChat', chatId);
    }
  }

  // Message methods
  sendMessage(data) {
    if (this.socket) {
      this.socket.emit('sendMessage', data);
    }
  }

  // Typing indicators
  typing(chatId, isTyping) {
    if (this.socket) {
      this.socket.emit('typing', { chatId, isTyping });
    }
  }

  stopTyping(chatId) {
    if (this.socket) {
      this.socket.emit('stopTyping', { chatId });
    }
  }

  // Read receipts
  markAsRead(messageId, chatId) {
    if (this.socket) {
      this.socket.emit('messageRead', { messageId, chatId });
    }
  }

  markChatAsRead(chatId) {
    if (this.socket) {
      this.socket.emit('markChatAsRead', { chatId });
    }
  }

  // Group chat methods
  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  // Event listeners
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

const socketService = new SocketService();
export default socketService;
