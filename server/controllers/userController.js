const User = require('../models/User');
const { cloudinary, uploadToCloudinary } = require('../config/cloudinary');

// @desc    Get all users except current user
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { username: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } }
          ]
        }
      : {};

    const users = await User.find({ ...keyword, _id: { $ne: req.user._id } })
      .select('-password')
      .limit(20);

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
const updateUser = async (req, res) => {
  try {
    // Check if user is updating their own profile
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    const { username, bio, avatar } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if new username is taken
    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      user.username = username;
    }

    if (bio !== undefined) user.bio = bio;
    if (avatar) user.avatar = avatar;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      bio: updatedUser.bio,
      isOnline: updatedUser.isOnline
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Upload profile picture
// @route   POST /api/users/upload-profile
// @access  Private
const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old avatar from Cloudinary if exists
    if (user.avatar && user.avatar.includes('cloudinary')) {
      try {
        const urlParts = user.avatar.split('/');
        const publicIdWithExt = urlParts.slice(-2).join('/');
        const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error('Error deleting old avatar:', error);
      }
    }

    // Upload new image to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, 'chatvibe/profiles');

    // Update user avatar with new Cloudinary URL
    user.avatar = result.secure_url;
    await user.save();

    res.json({
      message: 'Profile picture uploaded successfully',
      avatar: user.avatar
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  uploadProfilePicture
};
