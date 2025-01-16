const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Comment = require('../models/Comment');

// Get user profile
router.get('/profile/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password -otp');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile picture
router.patch('/:userId/profile-picture', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { profileImage } = req.body;

    if (!profileImage || !profileImage.url) {
      return res.status(400).json({ message: 'Invalid profile image data' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.user.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    user.profileImage = profileImage;
    await user.save();

    res.json({
      message: 'Profile picture updated successfully',
      profileImage: user.profileImage
    });
  } catch (error) {
    console.error('Profile picture update error:', error);
    res.status(500).json({ message: 'Failed to update profile picture' });
  }
});

// Update user profile
router.patch('/:userId/profile', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, bio, socialLinks } = req.body;

    // Verify user owns this profile
    if (req.user.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (bio !== undefined) user.bio = bio;
    if (socialLinks) user.socialLinks = socialLinks;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        socialLinks: user.socialLinks,
        profileImage: user.profileImage,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Get user comments
router.get('/:userId/comments', auth, async (req, res) => {
  try {
    const comments = await Comment.find({ user: req.params.userId })
      .populate({
        path: 'blog',
        select: 'title'
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()
      .exec();
    
    const formattedComments = comments.map(comment => ({
      _id: comment._id,
      content: comment.content,
      blogTitle: comment.blog?.title || 'Deleted Blog',
      createdAt: comment.createdAt,
      likes: comment.likes
    }));
    
    res.json(formattedComments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
