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
  },
  seo: {
    metaTitle: {
      type: String,
      trim: true
    },
    metaDescription: {
      type: String,
      trim: true
    },
    focusKeywords: [{
      type: String,
      trim: true
    }],
    canonicalUrl: {
      type: String,
      trim: true
    },
    slug: {
      type: String,
      unique: true,
      required: true
    },
    focusKeyword: {
      type: String,
      trim: true
    },
    metaTags: [{
      type: String,
      trim: true
    }],
    structuredData: {
      type: Map,
      of: String
    },
    readingTime: {
      type: Number,
      default: 0
    },
    alternativeHeadline: String,
    articleBody: String,
    articleSection: String
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

// Generate SEO-friendly slug
blogSchema.pre('save', function(next) {
  if (!this.isModified('title')) return next();
  
  this.seo.slug = this.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  next();
});

// Auto-generate meta title and description if not provided
blogSchema.pre('save', function(next) {
  if (!this.seo.metaTitle) {
    this.seo.metaTitle = this.title;
  }
  
  if (!this.seo.metaDescription) {
    this.seo.metaDescription = this.content
      .substr(0, 157)
      .trim() + '...';
  }
  
  next();
});

// Add pre-save middleware to generate SEO fields
blogSchema.pre('save', function(next) {
  if (!this.isModified('content') && !this.isModified('title')) return next();

  // Calculate reading time
  const wordsPerMinute = 200;
  const wordCount = this.content.trim().split(/\s+/).length;
  this.seo.readingTime = Math.ceil(wordCount / wordsPerMinute);

  // Generate meta tags from content and tags
  this.seo.metaTags = [
    ...new Set([
      ...this.tags,
      this.category,
      ...this.content.match(/(?<=#)\w+/g) || [], // Extract hashtags
      ...this.title.split(' '),
    ].map(tag => tag.toLowerCase()))
  ];

  // Generate article body (clean version for search engines)
  this.seo.articleBody = this.content.replace(/<[^>]*>/g, ' ').trim();

  next();
});

module.exports = mongoose.model('Blog', blogSchema);
