const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get or create one-on-one chat
// @route   POST /api/chats
// @access  Private
const createChat = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'UserId is required' });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      isGroupChat: false,
      participants: { $all: [req.user._id, userId], $size: 2 }
    })
      .populate('participants', '-password')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'username avatar' }
      });

    if (chat) {
      const chatObj = chat.toObject();
      chatObj.unreadCount = Object.fromEntries(chat.unreadCount || new Map());
      return res.json(chatObj);
    }

    // Create new chat
    const chatData = {
      participants: [req.user._id, userId],
      isGroupChat: false
    };

    chat = await Chat.create(chatData);
    chat = await Chat.findById(chat._id)
      .populate('participants', '-password')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'username avatar' }
      });

    const chatObj = chat.toObject();
    chatObj.unreadCount = Object.fromEntries(chat.unreadCount || new Map());
    res.status(201).json(chatObj);
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all chats for user
// @route   GET /api/chats
// @access  Private
const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id
    })
      .populate('participants', '-password')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'username avatar' }
      })
      .sort({ updatedAt: -1 });

    // Transform chats to include unreadCount as plain object
    const transformedChats = chats.map(chat => {
      const chatObj = chat.toObject();
      // Convert Map to plain object
      chatObj.unreadCount = Object.fromEntries(chat.unreadCount || new Map());
      return chatObj;
    });

    res.json(transformedChats);
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get chat by ID
// @route   GET /api/chats/:id
// @access  Private
const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('participants', '-password')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'username avatar' }
      });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is a participant
    const isParticipant = chat.participants.some(
      p => p._id.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to access this chat' });
    }

    const chatObj = chat.toObject();
    chatObj.unreadCount = Object.fromEntries(chat.unreadCount || new Map());
    res.json(chatObj);
  } catch (error) {
    console.error('Get chat by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create group chat
// @route   POST /api/chats/group
// @access  Private
const createGroupChat = async (req, res) => {
  try {
    const { name, users } = req.body;

    if (!name || !users || users.length < 2) {
      return res.status(400).json({ 
        message: 'Group name and at least 2 users are required' 
      });
    }

    // Add current user to participants
    const participants = [...users, req.user._id];

    const chatData = {
      name,
      participants,
      isGroupChat: true,
      admin: req.user._id
    };

    const chat = await Chat.create(chatData);
    const fullChat = await Chat.findById(chat._id)
      .populate('participants', '-password')
      .populate('admin', '-password');

    res.status(201).json(fullChat);
  } catch (error) {
    console.error('Create group chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add user to group chat
// @route   PUT /api/chats/group/add
// @access  Private
const addUserToGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    if (!chatId || !userId) {
      return res.status(400).json({ message: 'Chat ID and User ID are required' });
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.isGroupChat) {
      return res.status(400).json({ message: 'This is not a group chat' });
    }

    // Check if requester is admin
    if (chat.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only admin can add users' });
    }

    // Check if user is already in the group
    if (chat.participants.includes(userId)) {
      return res.status(400).json({ message: 'User is already in the group' });
    }

    // Add user to participants
    chat.participants.push(userId);
    await chat.save();

    const updatedChat = await Chat.findById(chatId)
      .populate('participants', '-password')
      .populate('admin', '-password')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'username avatar' }
      });

    res.json(updatedChat);
  } catch (error) {
    console.error('Add user to group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove user from group chat
// @route   PUT /api/chats/group/remove
// @access  Private
const removeUserFromGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    if (!chatId || !userId) {
      return res.status(400).json({ message: 'Chat ID and User ID are required' });
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.isGroupChat) {
      return res.status(400).json({ message: 'This is not a group chat' });
    }

    // Check if requester is admin
    if (chat.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only admin can remove users' });
    }

    // Cannot remove admin
    if (userId === chat.admin.toString()) {
      return res.status(400).json({ message: 'Cannot remove group admin' });
    }

    // Remove user from participants
    chat.participants = chat.participants.filter(
      participantId => participantId.toString() !== userId
    );

    // Clear unread count for removed user
    chat.unreadCount.delete(userId);

    await chat.save();

    const updatedChat = await Chat.findById(chatId)
      .populate('participants', '-password')
      .populate('admin', '-password')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'username avatar' }
      });

    res.json(updatedChat);
  } catch (error) {
    console.error('Remove user from group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Leave group chat
// @route   PUT /api/chats/group/leave
// @access  Private
const leaveGroup = async (req, res) => {
  try {
    const { chatId } = req.body;

    if (!chatId) {
      return res.status(400).json({ message: 'Chat ID is required' });
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.isGroupChat) {
      return res.status(400).json({ message: 'This is not a group chat' });
    }

    // Check if user is admin
    if (chat.admin.toString() === req.user._id.toString()) {
      // If admin is leaving and there are other participants, transfer admin
      if (chat.participants.length > 1) {
        const newAdmin = chat.participants.find(
          p => p.toString() !== req.user._id.toString()
        );
        chat.admin = newAdmin;
      } else {
        // If admin is the last participant, delete the group
        await Chat.findByIdAndDelete(chatId);
        return res.json({ message: 'Group deleted as you were the last member' });
      }
    }

    // Remove user from participants
    chat.participants = chat.participants.filter(
      participantId => participantId.toString() !== req.user._id.toString()
    );

    // Clear unread count for leaving user
    chat.unreadCount.delete(req.user._id.toString());

    await chat.save();

    res.json({ message: 'Left group successfully' });
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Rename group chat
// @route   PUT /api/chats/group/rename
// @access  Private
const renameGroup = async (req, res) => {
  try {
    const { chatId, name } = req.body;

    if (!chatId || !name) {
      return res.status(400).json({ message: 'Chat ID and name are required' });
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.isGroupChat) {
      return res.status(400).json({ message: 'This is not a group chat' });
    }

    // Check if requester is admin
    if (chat.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only admin can rename the group' });
    }

    chat.name = name;
    await chat.save();

    const updatedChat = await Chat.findById(chatId)
      .populate('participants', '-password')
      .populate('admin', '-password')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'username avatar' }
      });

    res.json(updatedChat);
  } catch (error) {
    console.error('Rename group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Change group admin
// @route   PUT /api/chats/group/admin
// @access  Private
const changeGroupAdmin = async (req, res) => {
  try {
    const { chatId, newAdminId } = req.body;

    if (!chatId || !newAdminId) {
      return res.status(400).json({ message: 'Chat ID and new admin ID are required' });
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.isGroupChat) {
      return res.status(400).json({ message: 'This is not a group chat' });
    }

    // Check if requester is current admin
    if (chat.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only current admin can change admin' });
    }

    // Check if new admin is a participant
    if (!chat.participants.some(p => p.toString() === newAdminId)) {
      return res.status(400).json({ message: 'New admin must be a group member' });
    }

    chat.admin = newAdminId;
    await chat.save();

    const updatedChat = await Chat.findById(chatId)
      .populate('participants', '-password')
      .populate('admin', '-password')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'username avatar' }
      });

    res.json(updatedChat);
  } catch (error) {
    console.error('Change group admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createChat,
  getChats,
  getChatById,
  createGroupChat,
  addUserToGroup,
  removeUserFromGroup,
  leaveGroup,
  renameGroup,
  changeGroupAdmin
};
