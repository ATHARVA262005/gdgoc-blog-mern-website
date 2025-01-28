const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: function() {
      // Only require username for new documents
      return this.isNew;
    },
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  otp: {
    code: String,
    expiresAt: Date
  },
  onboarded: {
    type: Boolean,
    default: false
  },
  bio: String,
  profileImage: {
    name: String,
    url: String,
    description: String,
    publicId: String
  },
  socialLinks: {
    website: String,
    github: String,
    linkedin: String,
    twitter: String
  },
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog'
  }],
  comments: [{
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog'
    },
    content: String,
    createdAt: { type: Date, default: Date.now },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }],
  preferences: {
    categories: [{
      type: String,
      trim: true
    }],
    recentInteractions: [{
      blog: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog'
      },
      interactionType: {
        type: String,
        enum: ['like', 'bookmark', 'comment', 'view']
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  banReason: {
    type: String,
    default: null
  },
  banDate: {
    type: Date,
    default: null
  }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Add method to verify OTP
userSchema.methods.verifyOTP = function(code) {
  return this.otp && 
         this.otp.code === code && 
         this.otp.expiresAt > Date.now();
};

// Update the login response to include onboarding status
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  return {
    id: obj._id,
    name: obj.name,
    email: obj.email,
    onboarded: obj.onboarded,
    bio: obj.bio,
    profileImage: obj.profileImage,
    socialLinks: obj.socialLinks
  };
};

// Add method to update user preferences
userSchema.methods.updatePreferences = async function(blogId, interactionType) {
  const blog = await mongoose.model('Blog').findById(blogId);
  if (blog?.category) {
    this.preferences.recentInteractions.push({
      blog: blogId,
      interactionType,
      timestamp: new Date()
    });

    // Keep only last 20 interactions
    if (this.preferences.recentInteractions.length > 20) {
      this.preferences.recentInteractions.shift();
    }

    // Update preferred categories
    if (!this.preferences.categories.includes(blog.category)) {
      this.preferences.categories.push(blog.category);
    }

    await this.save();
  }
};

module.exports = mongoose.model('User', userSchema);
