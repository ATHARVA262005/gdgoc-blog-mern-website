const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  likes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  likeCount: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  featuredImage: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  slug: {
    type: String,
    unique: true
  },
  views: {
    total: { type: Number, default: 0 },
    unique: { type: Number, default: 0 },
    history: [{
      date: { type: Date, default: Date.now },
      count: { type: Number, default: 0 },
      uniqueCount: { type: Number, default: 0 },
      deviceTypes: {
        desktop: { type: Number, default: 0 },
        mobile: { type: Number, default: 0 },
        tablet: { type: Number, default: 0 }
      }
    }],
    visitors: [{ 
      type: String  // Store hashed IPs or session IDs
    }]
  },
  engagement: {
    averageTimeSpent: { type: Number, default: 0 }, // in seconds
    scrollDepth: { type: Number, default: 0 }, // percentage
    bounceRate: { type: Number, default: 0 } // percentage
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Like'
  }],
  comments: [commentSchema],
  stats: {
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Add virtual for isLiked
blogSchema.virtual('isLiked').get(function() {
  return this._isLiked || false;
});

// Generate slug from title before saving
blogSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-');
  }
  next();
});

module.exports = mongoose.model('Blog', blogSchema);
