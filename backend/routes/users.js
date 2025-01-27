const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Like = require('../models/Like'); // Add this import
const Blog = require('../models/Blog'); // Add this import

// Get user profile
router.get('/profile/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password -otp');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Include onboarding status in response
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      onboarded: user.onboarded,
      socialLinks: user.socialLinks,
      profileImage: user.profileImage,
      createdAt: user.createdAt
    };
    
    res.json(userData);
  } catch (error) {
    console.error('Profile fetch error:', error);
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

    // Handle twitter to x migration
    if (socialLinks) {
      // If twitter link is provided and no x link exists, move it to x
      if (socialLinks.twitter && !socialLinks.x) {
        socialLinks.x = socialLinks.twitter;
        delete socialLinks.twitter;
      }
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
    const user = await User.findById(req.params.userId)
      .populate({
        path: 'comments.blog',
        select: 'title slug'
      })
      .select('comments')
      .lean();

    const formattedComments = user.comments.map(comment => ({
      _id: comment._id,
      content: comment.content,
      blogId: comment.blog?._id,
      blogTitle: comment.blog?.title || 'Deleted Blog',
      blogSlug: comment.blog?.slug,
      createdAt: comment.createdAt,
      likes: comment.likes?.length || 0
    }));
    
    res.json(formattedComments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new endpoint to get user preferences
router.get('/preferences', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get user's liked blogs with error handling
    const userLikes = await Like.find({ user: userId })
      .populate({
        path: 'blog',
        select: 'category',
        match: { status: 'published' }
      })
      .lean();

    // Filter out null blog references
    const validLikes = userLikes.filter(like => like.blog);

    // Calculate preferred categories based on likes
    const categoryCount = {};
    validLikes.forEach(like => {
      if (like.blog?.category) {
        categoryCount[like.blog.category] = (categoryCount[like.blog.category] || 0) + 1;
      }
    });

    // Sort categories by frequency
    const preferredCategories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .map(([category]) => category);

    // Get user's bookmarks with error handling
    const user = await User.findById(userId)
      .populate({
        path: 'bookmarks',
        select: 'category',
        match: { status: 'published' }
      })
      .lean();

    const bookmarkedCategories = user.bookmarks
      .filter(blog => blog) // Filter out null references
      .map(blog => blog.category)
      .filter((category, index, self) => self.indexOf(category) === index);

    // Get recent interactions
    const recentInteractions = validLikes
      .slice(-5)
      .map(like => like.blog?.category)
      .filter(Boolean);

    res.json({
      success: true,
      preferences: {
        preferredCategories,
        bookmarkedCategories,
        recentInteractions
      }
    });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user preferences'
    });
  }
});

// Get total number of users (admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    res.json({
      success: true,
      totalUsers
    });
  } catch (error) {
    console.error('Error fetching total users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching total users'
    });
  }
});

module.exports = router;
