const express = require('express');
const Blog = require('../models/Blog');
const adminAuth = require('../middleware/adminAuth');
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const User = require('../models/User');
const Like = require('../models/Like');
const Admin = require('../models/Admin'); // Add this line
const Comment = require('../models/Comment'); // Add this line
const router = express.Router();

// Use optional auth for public routes
router.get('/', auth.optional, async (req, res) => {
  try {
    const blogs = await Blog.find({ status: 'published' })
      .sort({ createdAt: -1 })
      .populate('author', 'name profileImage');
      
    // Add personalization if user is authenticated
    if (req.user) {
      // Add user-specific data like isLiked, isBookmarked
      blogs = await addUserInteractions(blogs, req.user.userId);
    }

    res.json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});



// Add this new endpoint before other routes
router.get('/featured', auth.optional, async (req, res) => {
  try {
    const featuredBlogs = await Blog.find({ 
      status: 'published',
      isFeatured: true 
    })
    .populate('author', 'username profileImage')
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

    // Add personalization if user is authenticated
    if (req.user) {
      featuredBlogs = await addUserInteractions(featuredBlogs, req.user.userId);
    }

    const formattedBlogs = featuredBlogs.map(blog => ({
      _id: blog._id,
      title: blog.title,
      content: blog.content,
      category: blog.category,
      featuredImage: blog.featuredImage,
      createdAt: blog.createdAt,
      author: {
        _id: blog.author?._id,
        username: blog.author?.username || 'Anonymous',
        profileImage: blog.author?.profileImage
      },
      stats: blog.stats || { likeCount: 0, commentCount: 0 }
    }));

    res.json({
      success: true,
      featuredBlogs: formattedBlogs
    });
  } catch (error) {
    console.error('Error fetching featured blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured blogs'
    });
  }
});

// Get user's bookmarked blogs with full blog details
router.get('/bookmarks', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Add error handling for empty bookmarks array
    if (!user.bookmarks || user.bookmarks.length === 0) {
      return res.json({
        success: true,
        bookmarks: []
      });
    }
    
    const bookmarkedBlogs = await Blog.find({
      _id: { $in: user.bookmarks },
      status: 'published'
    })
    .populate('author', 'username')
    .select('title content category featuredImage createdAt stats author')
    .sort({ createdAt: -1 })
    .lean();

    // Map blogs maintaining the order from user.bookmarks
    const formattedBlogs = user.bookmarks
      .map(bookmarkId => {
        const blog = bookmarkedBlogs.find(b => b._id.toString() === bookmarkId.toString());
        if (!blog) return null;
        
        return {
          _id: blog._id,
          title: blog.title,
          content: blog.content,
          category: blog.category,
          featuredImage: blog.featuredImage,
          createdAt: blog.createdAt,
          stats: blog.stats || { likeCount: 0, commentCount: 0 },
          author: {
            _id: blog.author?._id,
            username: blog.author?.username || 'GDG Admin'
          }
        };
      })
      .filter(Boolean); // Remove any null values

    res.json({
      success: true,
      bookmarks: formattedBlogs
    });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching bookmarks',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

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
router.get('/', adminAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const blogs = await Blog.find()
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({
      success: true,
      blogs: blogs.map(blog => ({
        ...blog,
        status: blog.status || 'draft',
        views: blog.views || { total: 0 },
        isFeatured: blog.isFeatured || false
      }))
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
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
    const formattedComments = blog.comments.map(comment => {
      const isCommentLiked = req.user ? comment.likes?.includes(req.user.userId) : false;
      
      return {
        ...comment,
        user: comment.user ? {
          _id: comment.user._id,
          username: comment.user.name,
          profileImage: comment.user.profileImage?.url || DEFAULT_PROFILE_IMAGE
        } : null,
        isLiked: isCommentLiked,
        likeCount: comment.likes?.length || 0
      };
    });

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

// Update the patch route
router.patch('/:id', adminAuth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['title', 'content', 'category', 'tags', 'featuredImage', 'status', 'isFeatured'];
    
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    
    if (!isValidOperation) {
      return res.status(400).json({
        success: false,
        message: 'Invalid updates'
      });
    }

    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    updates.forEach(update => {
      blog[update] = req.body[update];
    });

    await blog.save();

    res.json({
      success: true,
      blog
    });
  } catch (error) {
    console.error('Blog update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating blog'
    });
  }
});

// Update the delete route
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    console.log('Delete request for blog:', req.params.id);
    console.log('Admin ID:', req.admin._id);

    const blog = await Blog.findOne({ _id: req.params.id });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Delete the blog
    await Blog.deleteOne({ _id: req.params.id });

    // Clean up related data (optional)
    await Promise.all([
      // Delete all likes for this blog
      Like.deleteMany({ blog: req.params.id }),
      // Remove blog from user bookmarks
      User.updateMany(
        { bookmarks: req.params.id },
        { $pull: { bookmarks: req.params.id } }
      )
    ]);

    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    console.error('Blog delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting blog',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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

    // Create new comment object
    const newComment = {
      user: req.user.userId,
      content: req.body.content,
      createdAt: new Date(),
      likes: []
    };

    // Add comment to blog
    blog.comments.push(newComment);
    blog.stats.commentCount = (blog.stats.commentCount || 0) + 1;
    await blog.save();

    // Add comment to user's comments
    const user = await User.findById(req.user.userId);
    user.comments.push({
      blog: blog._id,
      content: req.body.content,
      createdAt: newComment.createdAt,
      likes: []
    });
    await user.save();

    // Get user details for response
    const currentUser = await User.findById(req.user.userId)
      .select('name profileImage');

    // Return formatted comment
    res.json({
      success: true,
      comment: {
        _id: blog.comments[blog.comments.length - 1]._id,
        content: newComment.content,
        createdAt: newComment.createdAt,
        likes: [],
        likeCount: 0,
        user: {
          _id: currentUser._id,
          username: currentUser.name,
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

// Simplify the comment like route to only handle blog comments
router.post('/comments/:commentId/like', auth, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;

    const blog = await Blog.findOne({ 'comments._id': commentId });
    if (!blog) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const comment = blog.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const likeIndex = comment.likes.indexOf(userId);
    const newIsLiked = likeIndex === -1;

    if (newIsLiked) {
      comment.likes.push(userId);
    } else {
      comment.likes.splice(likeIndex, 1);
    }

    await blog.save();

    res.json({
      success: true,
      commentId: comment._id,
      isLiked: newIsLiked,
      likeCount: comment.likes.length
    });
  } catch (error) {
    console.error('Error toggling comment like:', error);
    res.status(500).json({ message: 'Failed to toggle like' });
  }
});

// Get admin blogs (including drafts)
router.get('/admin', adminAuth, async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .lean();

    if (!blogs) {
      return res.json({
        success: true,
        blogs: []
      });
    }

    res.json({
      success: true,
      blogs
    });
  } catch (error) {
    console.error('Error fetching admin blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin blogs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get single blog by ID (admin route)
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'username')
      .lean();  // Add lean() for better performance

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.json({
      success: true,
      blog: {
        ...blog,
        tags: blog.tags || [],
        status: blog.status || 'draft'
      }
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
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
    const [totalStats, timeRangeStats] = await Promise.all([
      // Get total stats
      Blog.aggregate([
        {
          $group: {
            _id: null,
            totalViews: { $sum: '$views.total' },
            uniqueViews: { $sum: '$views.unique' },
            totalPosts: { $sum: 1 },
            totalLikes: { $sum: '$stats.likeCount' },
            totalComments: { $sum: '$stats.commentCount' }
          }
        }
      ]),

      // Get time range stats (last 30 days)
      Blog.aggregate([
        { $unwind: '$views.history' },
        {
          $match: {
            'views.history.date': {
              $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$views.history.date' }},
            views: { $sum: '$views.history.count' },
            uniqueViews: { $sum: '$views.history.uniqueCount' }
          }
        },
        { $sort: { '_id': 1 } }
      ])
    ]);

    // Calculate engagement rate
    const total = totalStats[0] || { 
      totalViews: 0, 
      uniqueViews: 0, 
      totalPosts: 0,
      totalLikes: 0,
      totalComments: 0
    };

    const engagementRate = total.totalViews > 0
      ? (((total.uniqueViews + total.totalLikes + total.totalComments) / 
          (total.totalViews * 3)) * 100).toFixed(1)
      : '0';

    res.json({
      success: true,
      stats: {
        total,
        timeRange: timeRangeStats,
        engagementRate
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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

// Create new blog
router.post('/create', adminAuth, async (req, res) => {
  try {
    const { title, content, category, tags, featuredImage, status } = req.body;

    const blog = new Blog({
      title,
      content,
      category,
      tags,
      featuredImage,
      status,
      author: req.admin._id,
      stats: {
        likeCount: 0,
        commentCount: 0
      },
      views: {
        total: 0,
        unique: 0,
        visitors: [],
        history: []
      }
    });

    await blog.save();

    res.status(201).json({
      success: true,
      message: status === 'published' ? 'Blog published successfully' : 'Blog saved as draft',
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

// Update existing blog
router.put('/update/:id', adminAuth, async (req, res) => {
  try {
    const { title, content, category, tags, featuredImage, status } = req.body;
    
    const blog = await Blog.findOne({ _id: req.params.id });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Update fields
    blog.title = title;
    blog.content = content;
    blog.category = category;
    blog.tags = tags;
    blog.featuredImage = featuredImage;
    blog.status = status;
    blog.updatedAt = new Date();

    await blog.save();

    res.json({
      success: true,
      message: status === 'published' ? 'Blog published successfully' : 'Blog saved as draft',
      blog
    });
  } catch (error) {
    console.error('Blog update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating blog post'
    });
  }
});

// Get draft blogs for admin
router.get('/drafts', adminAuth, async (req, res) => {
  try {
    const drafts = await Blog.find({ 
      status: 'draft',
      author: req.admin._id
    })
    .sort({ updatedAt: -1 })
    .lean();

    res.json({
      success: true,
      drafts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching drafts'
    });
  }
});

// Move these specific routes BEFORE the general '/:id' route
router.get('/admin/blogs', adminAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // Default to 10 if no limit specified
    
    const blogs = await Blog.find()
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({
      success: true,
      blogs
    });
  } catch (error) {
    console.error('Error fetching admin blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin blogs'
    });
  }
});

// Add this new route for fetching single blog for editing
router.get('/admin/blogs/:id', adminAuth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'username')
      .lean();

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.json({
      success: true,
      blog: {
        ...blog,
        tags: blog.tags || [],
        status: blog.status || 'draft'
      }
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blog'
    });
  }
});

module.exports = router;