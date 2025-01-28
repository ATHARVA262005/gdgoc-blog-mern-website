const express = require('express');
const router = express.Router();
const userOrAdminAuth = require('../middleware/userOrAdminAuth');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const Blog = require('../models/Blog');

// Get user profile
router.get('/profile/:userId', userOrAdminAuth, async (req, res) => {
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

    // Convert IDs to strings for comparison
    const requestedUserId = userId.toString();
    const authenticatedUserId = req.user.userId.toString();

    // Verify user owns this profile
    if (requestedUserId !== authenticatedUserId) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this profile' 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.profileImage = profileImage;
    await user.save();

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      profileImage: user.profileImage
    });
  } catch (error) {
    console.error('Profile picture update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile picture'
    });
  }
});

// Update user profile
router.patch('/:userId/profile', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, bio, socialLinks } = req.body;

    // Convert string IDs to match for comparison
    const requestedUserId = userId.toString();
    const authenticatedUserId = req.user.userId.toString();

    // Verify user owns this profile
    if (requestedUserId !== authenticatedUserId) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this profile' 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (bio !== undefined) user.bio = bio;
    if (socialLinks) user.socialLinks = socialLinks;

    await user.save();

    res.json({
      success: true,
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
    res.status(500).json({ 
      success: false,
      message: 'Failed to update profile' 
    });
  }
});

// Get user comments
router.get('/:userId/comments', userOrAdminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const blogs = await Blog.find({
      'comments.user': req.params.userId
    }).select('comments title');

    const formattedComments = user.comments.map(userComment => {
      const blog = blogs.find(b => b._id.toString() === userComment.blog.toString());
      const blogComment = blog?.comments.find(c => c._id.toString() === userComment._id.toString());

      return {
        _id: userComment._id,
        content: userComment.content,
        blogId: userComment.blog,
        blogTitle: blog?.title || 'Deleted Blog',
        createdAt: userComment.createdAt,
        likes: blogComment?.likes || [],
        likeCount: blogComment?.likes?.length || 0,
        isLiked: req.user.userId ? blogComment?.likes?.includes(req.user.userId) : false
      };
    });

    res.json(formattedComments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user preferences
router.get('/preferences', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const userLikes = await Like.find({ user: userId })
      .populate({
        path: 'blog',
        select: 'category',
        match: { status: 'published' }
      })
      .lean();

    const validLikes = userLikes.filter(like => like.blog);

    const categoryCount = {};
    validLikes.forEach(like => {
      if (like.blog?.category) {
        categoryCount[like.blog.category] = (categoryCount[like.blog.category] || 0) + 1;
      }
    });

    const preferredCategories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .map(([category]) => category);

    const user = await User.findById(userId)
      .populate({
        path: 'bookmarks',
        select: 'category',
        match: { status: 'published' }
      })
      .lean();

    const bookmarkedCategories = user.bookmarks
      .filter(blog => blog)
      .map(blog => blog.category)
      .filter((category, index, self) => self.indexOf(category) === index);

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

// Get all users (admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password -otp')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      users,
      totalUsers: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

// Get recent users (admin only)
router.get('/recent', adminAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
    const users = await User.find()
      .select('username email profileImage createdAt')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({
      success: true,
      users: users.map(user => ({
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching recent users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent users'
    });
  }
});

module.exports = router;
