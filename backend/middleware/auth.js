const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    if (req.publicRoute) return next();

    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authorization required' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fix: Changed decoded._id to decoded.userId
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: 'Account banned',
        isBanned: true,
        banReason: user.banReason
      });
    }

    req.token = token;
    req.user = { 
      userId: user._id,
      email: user.email,
      isVerified: user.isVerified,
      onboarded: user.onboarded
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    res.status(401).json({ 
      success: false, 
      message: 'Please authenticate' 
    });
  }
};

// Add optional auth middleware
auth.optional = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({ _id: decoded._id });
      
      if (user) {
        req.user = { userId: user._id, email: user.email };
      }
    }
    
    // Mark route as public
    req.publicRoute = true;
    next();
  } catch (error) {
    // Continue as public user even if token is invalid
    req.publicRoute = true;
    next();
  }
};

module.exports = auth;
