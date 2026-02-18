const express = require('express');
const router = express.Router();
const { 
  getMessages, 
  sendMessage,
  sendImageMessage,
  markAsRead, 
  markChatAsRead 
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const { uploadMessage } = require('../config/cloudinary');

router.get('/:chatId', protect, getMessages);
router.post('/', protect, sendMessage);
router.post('/upload-image', protect, uploadMessage.single('image'), sendImageMessage);
router.put('/:id/read', protect, markAsRead);
router.put('/chat/:chatId/read', protect, markChatAsRead);

module.exports = router;
