const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateUser, uploadProfilePicture } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.get('/', protect, getUsers);
router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUser);
router.post('/upload-profile', protect, upload.single('profilePicture'), uploadProfilePicture);

module.exports = router;
