const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
// Update the import path to correctly point to the User model
const User = require('../models/User.js');
const { sendVerificationOTP, sendPasswordResetOTP } = require('../utils/emailService');
const router = express.Router();

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register route
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Input validation
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Name validation
    if (name.length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters long' });
    }

    // Check existing email
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.create({
      name,
      email,
      password,
      otp: {
        code: otp,
        expiresAt: otpExpiresAt
      }
    });

    try {
      await sendVerificationOTP(email, name, otp);
      res.status(201).json({
        message: 'Registration successful. Please check your email for verification code.',
        userId: user._id
      });
    } catch (emailError) {
      res.status(201).json({
        message: 'Account created but verification email failed. Request a new code.',
        userId: user._id,
        requiresEmailVerification: true
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    if (!user.verifyOTP(otp)) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Clear OTP and mark as verified
    user.otp = undefined;
    user.isVerified = true;
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      message: 'Email verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    const newOTP = generateOTP();
    user.otp = {
      code: newOTP,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    };
    await user.save();

    await sendVerificationOTP(user.email, user.name, newOTP);
    res.json({ message: 'New verification code sent' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login with verification check
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });

    // User not found
    if (!user) {
      return res.status(401).json({ message: 'Email is not registered' });
    }

    // Password check
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // Email verification check
    if (!user.isVerified) {
      return res.status(403).json({ 
        message: 'Please verify your email before logging in',
        isVerified: false,
        requiresVerification: true
      });
    }

    // Account disabled check (if you have such functionality)
    if (user.isDisabled) {
      return res.status(403).json({ 
        message: 'Your account has been disabled. Please contact support.',
        isDisabled: true
      });
    }

    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }  // Explicitly set 24 hour expiration
    );

    // Login successful
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        onboarded: user.onboarded,
        bio: user.bio,
        profileImage: user.profileImage,
        socialLinks: user.socialLinks
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = generateOTP();
    user.otp = {
      code: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    };
    await user.save();

    await sendPasswordResetOTP(email, user.name, otp);
    res.json({ message: 'Password reset code sent to your email' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset Password with OTP
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.verifyOTP(otp)) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    // Update password and clear OTP
    user.password = newPassword;
    user.otp = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Complete Onboarding
router.post('/complete-onboarding', async (req, res) => {
  try {
    const { userId, name, bio, profileImage, socialLinks } = req.body;

    // Validate required fields
    if (!userId || !name || !bio) {
      return res.status(400).json({ 
        message: 'User ID, name, and bio are required' 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.onboarded) {
      return res.status(400).json({ message: 'User already onboarded' });
    }

    // Update user profile
    user.name = name;
    user.bio = bio;
    user.profileImage = profileImage;
    user.socialLinks = socialLinks;
    user.onboarded = true;

    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      message: 'Onboarding completed successfully',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({ message: 'Server error during onboarding' });
  }
});

module.exports = router;
