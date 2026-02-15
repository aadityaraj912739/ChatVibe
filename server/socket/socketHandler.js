const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Chat = require('../models/Chat');

const socketHandler = (io) => {
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Update user online status
    try {
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: true,
        socketId: socket.id,
        lastSeen: Date.now()
      });

      // Broadcast user online status
      socket.broadcast.emit('userOnline', {
        userId: socket.userId,
        isOnline: true
      });
    } catch (error) {
      console.error('Error updating user status:', error);
    }

    // Join user's chat rooms
    socket.on('joinChats', async (chatIds) => {
      try {
        chatIds.forEach(chatId => {
          socket.join(chatId);
        });
        console.log(`User ${socket.userId} joined chats:`, chatIds);
      } catch (error) {
        console.error('Error joining chats:', error);
      }
    });

    // Join a specific chat room
    socket.on('joinChat', (chatId) => {
      socket.join(chatId);
      console.log(`User ${socket.userId} joined chat: ${chatId}`);
    });

    // Leave a chat room
    socket.on('leaveChat', (chatId) => {
      socket.leave(chatId);
      console.log(`User ${socket.userId} left chat: ${chatId}`);
    });

    // Handle new message
    socket.on('sendMessage', async (data) => {
      try {
        const { chatId, content } = data;

        // Create message
        let message = await Message.create({
          chat: chatId,
          sender: socket.userId,
          content
        });

        message = await message.populate('sender', 'username avatar');

        // Update chat's last message
        const chat = await Chat.findById(chatId);
        if (chat) {
          chat.lastMessage = message._id;
          
          // Increment unread count for other participants
          chat.participants.forEach(participantId => {
            if (participantId.toString() !== socket.userId) {
              const count = chat.unreadCount.get(participantId.toString()) || 0;
              chat.unreadCount.set(participantId.toString(), count + 1);
            }
          });
          
          await chat.save();
        }

        // Emit message to all users in the chat
        io.to(chatId).emit('message', message);

        // Emit chat update event with transformed unreadCount
        const chatForUpdate = await Chat.findById(chatId);
        const chatObj = chatForUpdate ? chatForUpdate.toObject() : null;
        if (chatObj) {
          chatObj.unreadCount = Object.fromEntries(chatForUpdate.unreadCount || new Map());
          io.to(chatId).emit('chatUpdated', {
            chatId,
            lastMessage: message,
            unreadCount: chatObj.unreadCount
          });
        } else {
          io.to(chatId).emit('chatUpdated', {
            chatId,
            lastMessage: message
          });
        }
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      const { chatId, isTyping } = data;
      socket.to(chatId).emit('typing', {
        chatId,
        userId: socket.userId,
        username: socket.user.username,
        isTyping
      });
    });

    // Handle stop typing
    socket.on('stopTyping', (data) => {
      const { chatId } = data;
      socket.to(chatId).emit('stopTyping', {
        chatId,
        userId: socket.userId
      });
    });

    // Handle message read
    socket.on('messageRead', async (data) => {
      try {
        const { messageId, chatId } = data;

        const message = await Message.findById(messageId);
        if (message) {
          const alreadyRead = message.readBy.some(
            r => r.user.toString() === socket.userId
          );

          if (!alreadyRead) {
            message.readBy.push({
              user: socket.userId,
              readAt: Date.now()
            });
            await message.save();

            // Notify sender about read receipt
            io.to(chatId).emit('messageRead', {
              messageId,
              userId: socket.userId,
              chatId
            });

            // Update unread count
            const chat = await Chat.findById(chatId);
            if (chat) {
              const currentCount = chat.unreadCount.get(socket.userId) || 0;
              chat.unreadCount.set(socket.userId, Math.max(0, currentCount - 1));
              await chat.save();
            }
          }
        }
      } catch (error) {
        console.error('Message read error:', error);
      }
    });

    // Handle mark all as read
    socket.on('markChatAsRead', async (data) => {
      try {
        const { chatId } = data;

        const messages = await Message.find({
          chat: chatId,
          'readBy.user': { $ne: socket.userId }
        });

        for (const message of messages) {
          message.readBy.push({
            user: socket.userId,
            readAt: Date.now()
          });
          await message.save();
        }

        const chat = await Chat.findById(chatId);
        if (chat) {
          chat.unreadCount.set(socket.userId, 0);
          await chat.save();
        }

        io.to(chatId).emit('chatRead', {
          chatId,
          userId: socket.userId
        });
      } catch (error) {
        console.error('Mark chat as read error:', error);
      }
    });

    // Handle user added to group
    socket.on('userAddedToGroup', async (data) => {
      try {
        const { chatId, userId, addedBy } = data;
        
        const chat = await Chat.findById(chatId)
          .populate('participants', '-password')
          .populate('admin', '-password');

        const addedUser = await User.findById(userId);

        if (chat && addedUser) {
          // Notify all group members
          io.to(chatId).emit('groupUpdated', {
            type: 'USER_ADDED',
            chat,
            addedUser,
            addedBy
          });

          // Notify the added user to join the room
          const userSocket = await getUserSocket(userId);
          if (userSocket) {
            userSocket.join(chatId);
            userSocket.emit('addedToGroup', {
              chat,
              addedBy
            });
          }
        }
      } catch (error) {
        console.error('User added to group error:', error);
      }
    });

    // Handle user removed from group
    socket.on('userRemovedFromGroup', async (data) => {
      try {
        const { chatId, userId, removedBy } = data;
        
        const chat = await Chat.findById(chatId)
          .populate('participants', '-password')
          .populate('admin', '-password');

        const removedUser = await User.findById(userId);

        if (chat && removedUser) {
          // Notify all group members
          io.to(chatId).emit('groupUpdated', {
            type: 'USER_REMOVED',
            chat,
            removedUser,
            removedBy
          });

          // Notify the removed user
          const userSocket = await getUserSocket(userId);
          if (userSocket) {
            userSocket.emit('removedFromGroup', {
              chatId,
              removedBy
            });
            userSocket.leave(chatId);
          }
        }
      } catch (error) {
        console.error('User removed from group error:', error);
      }
    });

    // Handle user left group
    socket.on('userLeftGroup', async (data) => {
      try {
        const { chatId } = data;
        
        const chat = await Chat.findById(chatId)
          .populate('participants', '-password')
          .populate('admin', '-password');

        if (chat) {
          socket.leave(chatId);
          
          // Notify remaining group members
          io.to(chatId).emit('groupUpdated', {
            type: 'USER_LEFT',
            chat,
            leftUser: socket.user
          });
        }
      } catch (error) {
        console.error('User left group error:', error);
      }
    });

    // Handle group renamed
    socket.on('groupRenamed', async (data) => {
      try {
        const { chatId, newName } = data;
        
        const chat = await Chat.findById(chatId)
          .populate('participants', '-password')
          .populate('admin', '-password');

        if (chat) {
          // Notify all group members
          io.to(chatId).emit('groupUpdated', {
            type: 'GROUP_RENAMED',
            chat,
            newName,
            renamedBy: socket.user
          });
        }
      } catch (error) {
        console.error('Group renamed error:', error);
      }
    });

    // Handle admin changed
    socket.on('adminChanged', async (data) => {
      try {
        const { chatId, newAdminId } = data;
        
        const chat = await Chat.findById(chatId)
          .populate('participants', '-password')
          .populate('admin', '-password');

        const newAdmin = await User.findById(newAdminId);

        if (chat && newAdmin) {
          // Notify all group members
          io.to(chatId).emit('groupUpdated', {
            type: 'ADMIN_CHANGED',
            chat,
            newAdmin,
            changedBy: socket.user
          });
        }
      } catch (error) {
        console.error('Admin changed error:', error);
      }
    });

    // Helper function to get user socket
    const getUserSocket = async (userId) => {
      const sockets = await io.fetchSockets();
      return sockets.find(s => s.userId === userId.toString());
    };

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.userId}`);

      try {
        await User.findByIdAndUpdate(socket.userId, {
          isOnline: false,
          lastSeen: Date.now(),
          socketId: null
        });

        // Broadcast user offline status
        socket.broadcast.emit('userOffline', {
          userId: socket.userId,
          isOnline: false,
          lastSeen: Date.now()
        });
      } catch (error) {
        console.error('Error updating user status on disconnect:', error);
      }
    });
  });
};

module.exports = socketHandler;
