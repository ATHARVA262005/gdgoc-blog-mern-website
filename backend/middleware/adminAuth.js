const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const adminAuth = async (req, res, next) => {
  try {
    // Get token and check if it exists
    const authHeader = req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization header missing or invalid' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token found' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findOne({ 
      _id: decoded._id,
      role: 'admin'
    });

    if (!admin) {
      throw new Error('Admin not found');
    }

    req.admin = admin;
    req.token = token;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(401).json({ message: 'Not authorized as admin' });
  }
};

module.exports = adminAuth;
