const express = require('express');
const Blog = require('../models/Blog');
const adminAuth = require('../middleware/adminAuth');
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const User = require('../models/User');
const Like = require('../models/Like');
const Admin = require('../models/Admin'); // Add this line
const router = express.Router();

// Get trending blogs - Move this route to the top
router.get('/trending', async (req, res) => {
  try {
    // Calculate timestamp for 7 days ago
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const trendingBlogs = await Blog.aggregate([
      { $match: { 
        status: 'published',
        createdAt: { $exists: true }
      }},
      {
        $addFields: {
          // Calculate time decay factor (1.0 to 0.7 over 7 days)
          timeDecay: {
            $let: {
              vars: {
                timeDiff: {
                  $divide: [
                    { $subtract: [new Date(), '$createdAt'] },
                    1000 * 60 * 60 * 24 // Convert to days
                  ]
                }
              },
              in: {
                $max: [
                  0.7,
                  { $subtract: [1, { $multiply: [{ $divide: ['$$timeDiff', 7] }, 0.3] }] }
                ]
              }
            }
          },
          // Calculate recent engagement (from the last 7 days)
          recentViews: {
            $size: {
              $filter: {
                input: '$views.history',
                as: 'history',
                cond: { $gte: ['$$history.date', weekAgo] }
              }
            }
          }
        }
      },
      {
        $addFields: {
          engagementScore: {
            $multiply: [
              '$timeDecay',
              {
                $add: [
                  { $multiply: [{ $ifNull: ['$stats.likeCount', 0] }, 10] }, // Likes weight
                  { $multiply: [{ $ifNull: ['$stats.commentCount', 0] }, 20] }, // Comments weight
                  { $multiply: [{ $ifNull: ['$views.total', 0] }, 1] }, // Views weight
                  { $multiply: ['$recentViews', 5] } // Recent views weight
                ]
              }
            ]
          }
        }
      },
      { $sort: { engagementScore: -1 } },
      { $limit: 6 }
    ]);

    const populatedBlogs = await Blog.populate(trendingBlogs, {
      path: 'author',
      model: 'Admin',
      select: 'username'  // Select username from Admin model
    });

    const formattedBlogs = populatedBlogs.map(blog => ({
      id: blog._id,
      title: blog.title,
      content: blog.content?.substring(0, 150) + '...' || '',
      author: {
        id: blog.author?._id,
        username: blog.author?.username || 'GDG Admin'
      },
      featuredImage: blog.featuredImage,  // Changed from image to featuredImage
      createdAt: blog.createdAt,  // Changed from date to createdAt
      stats: {  // Add stats object
        likeCount: blog.stats?.likeCount || 0,
        commentCount: blog.stats?.commentCount || 0
      },
      category: blog.category
    }));

    res.json({
      success: true,
      trendingBlogs: formattedBlogs
    });
  } catch (error) {
    console.error('Trending blogs error:', error); // Debug log
    res.status(500).json({
      success: false,
      message: 'Error fetching trending blogs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Public routes (no auth required)
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find({ status: 'published' })
      .populate('author', 'username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      blogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching blogs'
    });
  }
});

router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const blog = await Blog.findOne({ 
      _id: req.params.id,
      status: 'published' 
    })
    .populate('author', 'name avatar')  // Changed from 'username' to 'name'
    .populate({
      path: 'comments.user',
      select: 'name profileImage',  // Changed from 'username' to 'name'
      model: 'User'
    })
    .lean();  // Add lean() for better performance

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Check if user is authenticated and if they liked the blog
    let isLiked = false;
    if (req.user) {
      const like = await Like.findOne({
        user: req.user.userId,
        blog: blog._id
      });
      isLiked = !!like;
    }

    // Add current user info to comments if available
    const comments = blog.comments.map(comment => ({
      ...comment,
      user: {
        ...comment.user,
        profileImage: comment.user?.profileImage?.url || DEFAULT_PROFILE_IMAGE,
        _id: comment.user?._id || null
      }
    }));

    // Format comments with proper user data and check if user liked each comment
    const formattedComments = await Promise.all(blog.comments.map(async comment => {
      const isCommentLiked = req.user ? comment.likes.includes(req.user.userId) : false;
      
      return {
        ...comment,
        user: comment.user ? {
          _id: comment.user._id,
          username: comment.user.name,
          profileImage: comment.user.profileImage?.url
        } : null,
        isLiked: isCommentLiked
      };
    }));

    res.json({
      success: true,
      blog: {
        ...blog,
        comments: formattedComments,
        isLiked
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching blog'
    });
  }
});

// Protected routes (auth required)
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, category, tags, featuredImage, status, isFeatured } = req.body;

    const blog = new Blog({
      title,
      content,
      category,
      tags: tags.filter(tag => tag.trim()),
      featuredImage,
      status,
      isFeatured,
      author: req.admin._id
    });

    await blog.save();

    res.status(201).json({
      success: true,
      blog
    });
  } catch (error) {
    console.error('Blog creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating blog post'
    });
  }
});

router.patch('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findOneAndUpdate(
      { _id: req.params.id, author: req.admin._id },
      req.body,
      { new: true }
    );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found or unauthorized'
      });
    }

    res.json({
      success: true,
      blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating blog'
    });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findOneAndDelete({
      _id: req.params.id,
      author: req.admin._id
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found or unauthorized'
      });
    }

    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting blog'
    });
  }
});

// Protected route for likes, comments etc
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    // Get current user data with correct field name
    const currentUser = await User.findById(req.user.userId)
      .select('name profileImage');  // Changed from 'username' to 'name'

    const comment = {
      user: req.user.userId,
      content: req.body.content,
      likes: [],
      likeCount: 0
    };

    blog.comments.unshift(comment);
    blog.stats.commentCount = blog.comments.length;
    await blog.save();

    // Return newly created comment with user data using correct field name
    res.json({
      success: true,
      comment: {
        _id: blog.comments[0]._id,
        content: comment.content,
        createdAt: blog.comments[0].createdAt,
        likes: comment.likes,
        likeCount: comment.likeCount,
        user: {
          _id: currentUser._id,
          username: currentUser.name,  // Using the correct field 'name'
          profileImage: currentUser.profileImage?.url
        },
        isLiked: false
      }
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Like/Unlike comment route
router.post('/:blogId/comments/:commentId/like', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.blogId);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const comment = blog.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const userLikeIndex = comment.likes.indexOf(req.user.userId);
    if (userLikeIndex === -1) {
      // Add like
      comment.likes.push(req.user.userId);
      comment.likeCount++;
    } else {
      // Remove like
      comment.likes.splice(userLikeIndex, 1);
      comment.likeCount = Math.max(0, comment.likeCount - 1);
    }

    await blog.save();

    // Return more detailed response
    res.json({
      success: true,
      isLiked: userLikeIndex === -1,
      likeCount: comment.likeCount,
      commentId: comment._id
    });
  } catch (error) {
    console.error('Error toggling comment like:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get admin blogs (including drafts)
router.get('/admin', adminAuth, async (req, res) => {
  try {
    // Remove status filter to get all posts including drafts
    const blogs = await Blog.find()
      .populate('author', 'username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      blogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin blogs'
    });
  }
});

// Get single blog by ID (admin route)
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id })
      .populate('author', 'username');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.json({
      success: true,
      blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching blog'
    });
  }
});

// Enhanced view tracking
router.post('/:id/view', async (req, res) => {
  try {
    const { sessionId, timeSpent, scrollDepth, deviceType } = req.body;
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const today = new Date().setHours(0, 0, 0, 0);
    let dayStats = blog.views.history.find(
      v => new Date(v.date).setHours(0, 0, 0, 0) === today
    );

    if (!dayStats) {
      dayStats = {
        date: new Date(today),
        count: 0,
        uniqueCount: 0,
        deviceTypes: { desktop: 0, mobile: 0, tablet: 0 }
      };
      blog.views.history.push(dayStats);
    }

    // Update total views
    blog.views.total += 1;
    dayStats.count += 1;
    dayStats.deviceTypes[deviceType] += 1;

    // Track unique views
    if (!blog.views.visitors.includes(sessionId)) {
      blog.views.visitors.push(sessionId);
      blog.views.unique += 1;
      dayStats.uniqueCount += 1;
    }

    // Update engagement metrics
    if (timeSpent && scrollDepth) {
      const totalEngagements = blog.views.total;
      blog.engagement.averageTimeSpent = 
        (blog.engagement.averageTimeSpent * (totalEngagements - 1) + timeSpent) / totalEngagements;
      blog.engagement.scrollDepth = 
        (blog.engagement.scrollDepth * (totalEngagements - 1) + scrollDepth) / totalEngagements;
    }

    await blog.save();
    res.json({ success: true, views: blog.views });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating views' });
  }
});

// Enhanced analytics endpoint
router.get('/analytics/views', adminAuth, async (req, res) => {
  try {
    const [totalStats, deviceStats, timeRangeStats] = await Promise.all([
      Blog.aggregate([
        { $group: {
          _id: null,
          totalViews: { $sum: '$views.total' },
          uniqueViews: { $sum: '$views.unique' },
          totalPosts: { $sum: 1 }
        }}
      ]),
      Blog.aggregate([
        { $unwind: '$views.history' },
        { $group: {
          _id: null,
          desktop: { $sum: '$views.history.deviceTypes.desktop' },
          mobile: { $sum: '$views.history.deviceTypes.mobile' },
          tablet: { $sum: '$views.history.deviceTypes.tablet' }
        }}
      ]),
      Blog.aggregate([
        { $unwind: '$views.history' },
        { $match: {
          'views.history.date': {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }},
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$views.history.date' }},
          views: { $sum: '$views.history.count' },
          uniqueViews: { $sum: '$views.history.uniqueCount' }
        }},
        { $sort: { '_id': 1 }}
      ])
    ]);

    res.json({
      success: true,
      stats: {
        total: totalStats[0],
        devices: deviceStats[0],
        timeRange: timeRangeStats,
        engagementRate: ((totalStats[0]?.uniqueViews || 0) / (totalStats[0]?.totalViews || 1) * 100).toFixed(1)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching analytics' });
  }
});

// Toggle bookmark
router.post('/:id/bookmark', auth, async (req, res) => {
  try {
    const blogId = req.params.id;
    const userId = req.user.userId;

    // Use findByIdAndUpdate instead of findById to avoid validation
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const bookmarkIndex = user.bookmarks.indexOf(blogId);
    const isCurrentlyBookmarked = bookmarkIndex !== -1;

    // Update bookmarks array
    if (isCurrentlyBookmarked) {
      // Remove bookmark
      await User.findByIdAndUpdate(
        userId,
        { $pull: { bookmarks: blogId } },
        { new: true, runValidators: false }
      );
    } else {
      // Add bookmark
      await User.findByIdAndUpdate(
        userId,
        { $addToSet: { bookmarks: blogId } },
        { new: true, runValidators: false }
      );
    }

    res.json({
      success: true,
      isBookmarked: !isCurrentlyBookmarked,
      message: isCurrentlyBookmarked 
        ? 'Blog removed from bookmarks'
        : 'Blog added to bookmarks'
    });

  } catch (error) {
    console.error('Bookmark error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating bookmark',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get bookmark status
router.get('/:id/bookmark-status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const isBookmarked = user.bookmarks.includes(req.params.id);
    
    res.json({
      success: true,
      isBookmarked
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking bookmark status'
    });
  }
});

// Get bookmark status for multiple blogs
router.post('/bookmarks-status', auth, async (req, res) => {
  try {
    const { blogIds } = req.body;
    const user = await User.findById(req.user.userId);
    
    const bookmarkStatuses = {};
    blogIds.forEach(blogId => {
      bookmarkStatuses[blogId] = user.bookmarks.includes(blogId);
    });
    
    res.json({
      success: true,
      bookmarkStatuses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking bookmark statuses'
    });
  }
});

// Get user's bookmarked blogs
router.get('/bookmarks', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('bookmarks')
      .select('bookmarks');

    res.json({
      success: true,
      bookmarks: user.bookmarks
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching bookmarks' 
    });
  }
});

// Toggle like
router.post('/:id/like', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    // Fix: Change req.user.id to req.user.userId
    const existingLike = await Like.findOne({
      user: req.user.userId,
      blog: blog._id
    });

    if (existingLike) {
      await Like.deleteOne({ _id: existingLike._id });
      blog.stats.likeCount = Math.max(0, blog.stats.likeCount - 1);
      await blog.save();
      return res.json({ 
        success: true, 
        message: 'Blog unliked',
        isLiked: false,
        likeCount: blog.stats.likeCount
      });
    }

    const newLike = new Like({
      user: req.user.userId, // Fix: Change req.user.id to req.user.userId
      blog: blog._id
    });
    await newLike.save();
    blog.stats.likeCount += 1;
    await blog.save();

    res.json({ 
      success: true, 
      message: 'Blog liked',
      isLiked: true,
      likeCount: blog.stats.likeCount
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get blog likes status for multiple blogs
router.post('/likes-status', auth, async (req, res) => {
  try {
    const { blogIds } = req.body;
    const likes = await Like.find({
      user: req.user.userId, // Fix: Change req.user.id to req.user.userId
      blog: { $in: blogIds }
    });
    
    const likeStatuses = {};
    blogIds.forEach(blogId => {
      likeStatuses[blogId] = likes.some(like => like.blog.toString() === blogId);
    });
    
    res.json({
      success: true,
      likeStatuses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking like statuses'
    });
  }
});

// Get recently viewed blogs
router.post('/recently-viewed', async (req, res) => {
  try {
    const { blogIds, page = 1, limit = 3 } = req.body;
    
    if (!blogIds || !Array.isArray(blogIds)) {
      return res.status(400).json({
        success: false,
        message: 'Blog IDs array is required'
      });
    }

    const skip = (page - 1) * limit;
    const selectedBlogIds = blogIds.slice(skip, skip + limit);

    const blogs = await Blog.find({
      _id: { $in: selectedBlogIds },
      status: 'published'
    })
    .populate('author', 'username profileImage')
    .select('title content category stats featuredImage createdAt author')
    .lean();

    // Sort blogs in the same order as the input blogIds
    const sortedBlogs = selectedBlogIds.map(id => 
      blogs.find(blog => blog._id.toString() === id)
    ).filter(Boolean);

    res.json({
      success: true,
      blogs: sortedBlogs,
      hasMore: skip + limit < blogIds.length
    });
  } catch (error) {
    console.error('Error fetching recently viewed blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recently viewed blogs'
    });
  }
});

// Helper function to calculate growth percentage
function calculateGrowth(previous, current) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

module.exports = router;
