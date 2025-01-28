const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User'); // Add this import
const Blog = require('../models/Blog'); // Add this import
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Admin Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Debug log
    console.log('Login attempt for email:', email);

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
      console.log('No admin found with email:', email);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    const isMatch = await admin.comparePassword(password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    const token = jwt.sign(
      { _id: admin._id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '6h' } // Changed from 24h to 6h
    );

    return res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error, please try again later' 
    });
  }
});

// Admin Signup (Protected with master password)
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, masterPassword } = req.body;

    // Debug log (remove in production)
    console.log('Master password check:', {
      provided: masterPassword,
      expected: process.env.ADMIN_MASTER_PASSWORD,
      matches: masterPassword === process.env.ADMIN_MASTER_PASSWORD
    });

    // Verify master password
    if (!masterPassword || masterPassword !== process.env.ADMIN_MASTER_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: 'Invalid master password'
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ $or: [{ email }, { username }] });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin already exists'
      });
    }

    const admin = new Admin({ username, email, password });
    await admin.save();

    const token = jwt.sign(
      { _id: admin._id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '6h' } // Changed from 24h to 6h
    );

    return res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin signup error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during signup'
    });
  }
});

// Get Admin Profile
router.get('/profile', adminAuth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select('-password');
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new admin (Protected with both admin auth and master password)
router.post('/create', adminAuth, async (req, res) => {
  try {
    const { username, email, password, masterPassword } = req.body;
    
    // Verify master password
    if (masterPassword !== process.env.ADMIN_MASTER_PASSWORD) {
      return res.status(401).json({ message: 'Invalid master password' });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ $or: [{ email }, { username }] });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const admin = new Admin({ username, email, password });
    await admin.save();

    res.status(201).json({ message: 'Admin created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Admin Stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPosts = await Blog.countDocuments();
    const totalViews = await Blog.aggregate([
      { $group: { _id: null, total: { $sum: "$views" } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalPosts,
        totalViews: totalViews[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching admin stats' 
    });
  }
});

// Update Admin Profile
router.put('/profile', adminAuth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['username', 'email'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates' });
    }

    updates.forEach(update => req.admin[update] = req.body[update]);
    await req.admin.save();
    res.json({ success: true, admin: req.admin });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Get all users - Update the endpoint to remove role
router.get('/users', adminAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    
    const users = await User.find()
      .select('name username email createdAt profileImage isBanned') // Add both name and username
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({
      success: true,
      users,
      totalUsers: await User.countDocuments()
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Ban/Unban user
router.patch('/users/:id/ban', adminAuth, async (req, res) => {
  try {
    const { isBanned, banReason } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 
        isBanned,
        banReason: isBanned ? (banReason || 'No reason provided') : null,
        banDate: isBanned ? new Date() : null
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user status'
    });
  }
});

// New settings endpoints
router.get('/settings/profile', adminAuth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select('username email');
    res.json({
      success: true,
      admin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin profile'
    });
  }
});

router.put('/settings/profile', adminAuth, async (req, res) => {
  try {
    const { username, email } = req.body;
    
    // Check if email is already taken
    const existingAdmin = await Admin.findOne({
      email,
      _id: { $ne: req.admin._id }
    });
    
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      });
    }

    req.admin.username = username;
    req.admin.email = email;
    await req.admin.save();

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
});

router.put('/settings/password', adminAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Verify current password
    const isMatch = await req.admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    req.admin.password = newPassword;
    await req.admin.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating password'
    });
  }
});

// Get all comments
router.get('/comments', adminAuth, async (req, res) => {
  try {
    // First, check if there are any blogs
    const blogsExist = await Blog.exists({});
    if (!blogsExist) {
      return res.json({
        success: true,
        comments: []
      });
    }

    const blogs = await Blog.find({
      'comments.0': { $exists: true } // Only get blogs with comments
    })
    .populate({
      path: 'comments.user',
      select: 'name profileImage',
      model: 'User'
    })
    .select('title comments createdAt')
    .lean();

    if (!blogs.length) {
      return res.json({
        success: true,
        comments: []
      });
    }

    // Flatten and format comments from all blogs
    const allComments = blogs.reduce((acc, blog) => {
      if (!blog.comments) return acc;
      
      const commentsWithBlog = blog.comments.map(comment => ({
        _id: comment._id,
        content: comment.content,
        createdAt: comment.createdAt,
        user: comment.user ? {
          _id: comment.user._id,
          name: comment.user.name || 'Deleted User',
          profileImage: comment.user.profileImage?.url
        } : {
          name: 'Deleted User',
          profileImage: null
        },
        blog: {
          _id: blog._id,
          title: blog.title || 'Untitled'
        },
        likeCount: comment.likes?.length || 0
      }));
      return [...acc, ...commentsWithBlog];
    }, []);

    // Sort by date
    allComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      comments: allComments
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching comments',
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
});

// Delete comment
router.delete('/comments/:commentId', adminAuth, async (req, res) => {
  try {
    const { blogId } = req.body;
    const blog = await Blog.findById(blogId);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Remove comment from blog
    blog.comments = blog.comments.filter(
      comment => comment._id.toString() !== req.params.commentId
    );
    blog.stats.commentCount = blog.comments.length;
    await blog.save();

    // Remove comment from user's comments
    await User.updateMany(
      { 'comments._id': req.params.commentId },
      { $pull: { comments: { _id: req.params.commentId } } }
    );

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting comment'
    });
  }
});

// Get admin by ID
router.get('/:id', async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).select('username email');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
