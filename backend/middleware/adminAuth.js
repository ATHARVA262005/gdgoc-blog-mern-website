const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findOne({ _id: decoded.adminId });

    if (!admin) {
      throw new Error('Admin not found');
    }

    req.admin = admin;
    req.token = token;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(401).json({
      success: false,
      message: 'Please authenticate as admin'
    });
  }
};

module.exports = adminAuth;
