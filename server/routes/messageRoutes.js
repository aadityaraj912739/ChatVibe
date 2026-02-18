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
const { upload } = require('../config/cloudinary');

router.get('/:chatId', protect, getMessages);
router.post('/', protect, sendMessage);
router.post('/upload-image', protect, upload.single('image'), sendImageMessage);
router.put('/:id/read', protect, markAsRead);
router.put('/chat/:chatId/read', protect, markChatAsRead);

module.exports = router;
