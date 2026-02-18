const Message = require('../models/Message');
const Chat = require('../models/Chat');

// @desc    Get messages for a chat
// @route   GET /api/messages/:chatId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Verify user is part of the chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const isParticipant = chat.participants.some(
      p => p.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to access these messages' });
    }

    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'username avatar')
      .populate('deliveredTo.user', 'username')
      .populate('readBy.user', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments({ chat: chatId });

    res.json({
      messages: messages.reverse(),
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalMessages: total
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { chatId, content } = req.body;

    if (!chatId || !content) {
      return res.status(400).json({ message: 'Chat ID and content are required' });
    }

    // Verify chat exists and user is participant
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const isParticipant = chat.participants.some(
      p => p.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to send messages in this chat' });
    }

    // Create message
    let message = await Message.create({
      chat: chatId,
      sender: req.user._id,
      content
    });

    message = await message.populate('sender', 'username avatar');

    // Update chat's last message
    chat.lastMessage = message._id;
    
    // Increment unread count for other participants
    chat.participants.forEach(participantId => {
      if (participantId.toString() !== req.user._id.toString()) {
        const count = chat.unreadCount.get(participantId.toString()) || 0;
        chat.unreadCount.set(participantId.toString(), count + 1);
      }
    });
    
    await chat.save();

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if already read by this user
    const alreadyRead = message.readBy.some(
      r => r.user.toString() === req.user._id.toString()
    );

    if (!alreadyRead) {
      message.readBy.push({
        user: req.user._id,
        readAt: Date.now()
      });
      await message.save();

      // Update unread count in chat
      const chat = await Chat.findById(message.chat);
      if (chat) {
        const currentCount = chat.unreadCount.get(req.user._id.toString()) || 0;
        chat.unreadCount.set(req.user._id.toString(), Math.max(0, currentCount - 1));
        await chat.save();
      }
    }

    res.json(message);
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark all messages in chat as read
// @route   PUT /api/messages/chat/:chatId/read
// @access  Private
const markChatAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;

    // Get all unread messages in this chat for current user
    const messages = await Message.find({
      chat: chatId,
      'readBy.user': { $ne: req.user._id }
    });

    // Mark all as read
    for (const message of messages) {
      message.readBy.push({
        user: req.user._id,
        readAt: Date.now()
      });
      await message.save();
    }

    // Reset unread count
    const chat = await Chat.findById(chatId);
    if (chat) {
      chat.unreadCount.set(req.user._id.toString(), 0);
      await chat.save();
    }

    res.json({ message: 'All messages marked as read' });
  } catch (error) {
    console.error('Mark chat as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getMessages,
  sendMessage,
  markAsRead,
  markChatAsRead
};
