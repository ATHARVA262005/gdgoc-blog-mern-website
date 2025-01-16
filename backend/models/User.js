const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
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
    description: String
  },
  socialLinks: {
    website: String,
    github: String,
    linkedin: String,
    twitter: String
  }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
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

module.exports = mongoose.model('User', userSchema);
