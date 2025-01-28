const jwt = require('jsonwebtoken');

const userOrAdminAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    try {
      // Try to verify as user token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { userId: decoded.userId };
      return next();
    } catch (userError) {
      try {
        // If user token fails, try to verify as admin token
        const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
        req.user = { userId: decoded.adminId, isAdmin: true };
        return next();
      } catch (adminError) {
        return res.status(401).json({ message: 'Invalid token' });
      }
    }
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

module.exports = userOrAdminAuth;
