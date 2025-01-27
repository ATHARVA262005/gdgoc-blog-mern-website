const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Admin Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    const isMatch = await admin.comparePassword(password);

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
      { expiresIn: '24h' }
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
      { expiresIn: '24h' }
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

module.exports = router;
