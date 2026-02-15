const express = require('express');
const router = express.Router();
const { 
  createChat, 
  getChats, 
  getChatById, 
  createGroupChat,
  addUserToGroup,
  removeUserFromGroup,
  leaveGroup,
  renameGroup,
  changeGroupAdmin
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createChat);
router.get('/', protect, getChats);
router.get('/:id', protect, getChatById);
router.post('/group', protect, createGroupChat);
router.put('/group/add', protect, addUserToGroup);
router.put('/group/remove', protect, removeUserFromGroup);
router.put('/group/leave', protect, leaveGroup);
router.put('/group/rename', protect, renameGroup);
router.put('/group/admin', protect, changeGroupAdmin);

module.exports = router;
