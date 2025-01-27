const jwt = require('jsonwebtoken');

const optionalAuth = (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { userId: decoded.userId };
    }
    next();
  } catch (error) {
    next(); // Continue even if token is invalid
  }
};

module.exports = optionalAuth;
