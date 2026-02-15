const express = require('express');
const router = express.Router();
const { 
  getMessages, 
  sendMessage, 
  markAsRead, 
  markChatAsRead 
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.get('/:chatId', protect, getMessages);
router.post('/', protect, sendMessage);
router.put('/:id/read', protect, markAsRead);
router.put('/chat/:chatId/read', protect, markChatAsRead);

module.exports = router;
